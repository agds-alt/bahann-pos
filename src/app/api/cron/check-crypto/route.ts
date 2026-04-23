import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/infra/supabase/server'
import { getRecentTransfers, matchTransferToAmount } from '@/lib/solana'
import { createAuditLog } from '@/lib/audit'
import { sendPlanUpgradeEmail } from '@/lib/email'
import { logger } from '@/lib/logger'

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!process.env.SOLANA_WALLET_ADDRESS) {
    return NextResponse.json({ error: 'SOLANA_WALLET_ADDRESS not configured' }, { status: 500 })
  }

  const { data: pendingRequests, error } = await supabaseAdmin
    .from('payment_requests')
    .select('id, user_id, plan, amount, crypto_amount, crypto_token, created_at')
    .eq('status', 'pending')
    .not('crypto_token', 'is', null)

  if (error) {
    logger.error('check-crypto: fetch pending requests failed', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!pendingRequests || pendingRequests.length === 0) {
    return NextResponse.json({ checked: 0, matched: 0 })
  }

  const sinceTimestamp = Math.floor(Date.now() / 1000) - 86400

  const usdcRequests = pendingRequests.filter(r => r.crypto_token === 'usdc')
  const usdtRequests = pendingRequests.filter(r => r.crypto_token === 'usdt')

  let matched = 0

  for (const [token, requests] of [['usdc', usdcRequests], ['usdt', usdtRequests]] as const) {
    if (requests.length === 0) continue

    try {
      const transfers = await getRecentTransfers(token, sinceTimestamp)

      for (const transfer of transfers) {
        const matchedReq = requests.find(r =>
          r.crypto_amount && matchTransferToAmount(transfer.amount, parseFloat(r.crypto_amount))
        )

        if (!matchedReq) continue

        const { error: updateError } = await supabaseAdmin
          .from('payment_requests')
          .update({
            status: 'approved',
            crypto_tx_hash: transfer.signature,
            admin_note: `Auto-verified on-chain. TX: ${transfer.signature.slice(0, 16)}...`,
            reviewed_at: new Date().toISOString(),
          })
          .eq('id', matchedReq.id)
          .eq('status', 'pending')

        if (updateError) {
          logger.error(`check-crypto: update request ${matchedReq.id} failed`, updateError)
          continue
        }

        const { data: user } = await supabaseAdmin
          .from('users')
          .select('plan, email, name')
          .eq('id', matchedReq.user_id)
          .single()

        await supabaseAdmin
          .from('users')
          .update({ plan: matchedReq.plan, is_trial: false })
          .eq('id', matchedReq.user_id)

        await supabaseAdmin.from('billing_history').insert({
          user_id: matchedReq.user_id,
          plan: matchedReq.plan,
          previous_plan: user?.plan ?? 'free',
          amount: matchedReq.amount,
          note: `Crypto payment (${token.toUpperCase()}) auto-verified. TX: ${transfer.signature.slice(0, 16)}...`,
          is_trial: false,
          changed_by: matchedReq.user_id,
        })

        await createAuditLog({
          userId: matchedReq.user_id,
          userEmail: user?.email || 'unknown',
          action: 'UPDATE',
          entityType: 'payment_request',
          entityId: matchedReq.id,
          changes: { status: 'approved', crypto_tx_hash: transfer.signature },
          metadata: { token, amount_usd: matchedReq.crypto_amount, auto_verified: true },
        })

        if (user?.email && user?.name) {
          await sendPlanUpgradeEmail({
            to: user.email,
            name: user.name,
            oldPlan: user.plan ?? 'free',
            newPlan: matchedReq.plan,
          })
        }

        matched++
        logger.info(`check-crypto: auto-approved request ${matchedReq.id} via TX ${transfer.signature.slice(0, 16)}`)
      }
    } catch (err) {
      logger.error(`check-crypto: error checking ${token} transfers`, err)
    }
  }

  return NextResponse.json({ checked: pendingRequests.length, matched })
}
