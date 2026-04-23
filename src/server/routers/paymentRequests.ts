import { z } from 'zod'
import { router, protectedProcedure, superAdminProcedure } from '../trpc'
import { supabaseAdmin as supabase } from '@/infra/supabase/server'
import { createAuditLog } from '@/lib/audit'
import { TRPCError } from '@trpc/server'
import { sendPlanUpgradeEmail } from '@/lib/email'
import {
  CRYPTO_PRICES_USD, generateUniqueAmount, fetchSolPriceUsd,
  getRecentTransfers, getRecentSolTransfers, matchTransferToAmount,
} from '@/lib/solana'
import { logger } from '@/lib/logger'

export const paymentRequestsRouter = router({
  previewCryptoAmount: protectedProcedure
    .input(z.object({
      plan: z.enum(['warung', 'starter', 'professional', 'business', 'enterprise']),
      token: z.enum(['usdc', 'usdt', 'sol']),
    }))
    .mutation(async ({ input }) => {
      const basePriceUsd = CRYPTO_PRICES_USD[input.plan]
      if (!basePriceUsd) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Plan tidak tersedia untuk crypto.' })
      }

      let basePrice = basePriceUsd
      if (input.token === 'sol') {
        const solPrice = await fetchSolPriceUsd()
        if (!solPrice) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Gagal mengambil harga SOL.' })
        basePrice = parseFloat((basePriceUsd / solPrice).toFixed(4))
      }

      const cryptoAmount = generateUniqueAmount(basePrice)
      return { cryptoAmount, token: input.token }
    }),

  create: protectedProcedure
    .input(z.object({
      plan: z.enum(['warung', 'starter', 'professional', 'business', 'enterprise']),
      amount: z.number().int().min(0),
      paymentMethod: z.enum(['bank_transfer', 'qris', 'crypto_usdc', 'crypto_usdt', 'crypto_sol']).default('bank_transfer'),
      cryptoAmount: z.number().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { data: existing } = await supabase
        .from('payment_requests')
        .select('id')
        .eq('user_id', ctx.userId)
        .eq('status', 'pending')
        .single()

      if (existing) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Anda sudah memiliki permintaan upgrade yang menunggu verifikasi.',
        })
      }

      const isCrypto = input.paymentMethod.startsWith('crypto_')
      let cryptoAmount: number | null = null
      let cryptoToken: string | null = null

      if (isCrypto) {
        cryptoToken = input.paymentMethod.replace('crypto_', '')

        if (input.cryptoAmount) {
          cryptoAmount = input.cryptoAmount
        } else {
          const basePriceUsd = CRYPTO_PRICES_USD[input.plan]
          if (!basePriceUsd) {
            throw new TRPCError({ code: 'BAD_REQUEST', message: 'Plan ini tidak tersedia untuk pembayaran crypto.' })
          }
          let basePrice = basePriceUsd
          if (cryptoToken === 'sol') {
            const solPrice = await fetchSolPriceUsd()
            if (!solPrice) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Gagal mengambil harga SOL.' })
            basePrice = parseFloat((basePriceUsd / solPrice).toFixed(4))
          }
          cryptoAmount = generateUniqueAmount(basePrice)
        }
      }

      const { data, error } = await supabase
        .from('payment_requests')
        .insert({
          user_id: ctx.userId,
          plan: input.plan,
          amount: input.amount,
          payment_method: input.paymentMethod,
          status: 'pending',
          crypto_amount: cryptoAmount,
          crypto_token: cryptoToken,
        })
        .select()
        .single()

      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })

      await createAuditLog({
        userId: ctx.userId,
        userEmail: ctx.session?.email || 'unknown',
        action: 'CREATE',
        entityType: 'payment_request',
        entityId: data.id,
        changes: { plan: input.plan, amount: input.amount, method: input.paymentMethod, cryptoAmount, cryptoToken },
      })

      return data
    }),

  uploadProof: protectedProcedure
    .input(z.object({
      requestId: z.string().uuid(),
      proofBase64: z.string(),
      fileName: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      // Verify ownership
      const { data: req } = await supabase
        .from('payment_requests')
        .select('id, user_id, status')
        .eq('id', input.requestId)
        .single()

      if (!req || req.user_id !== ctx.userId) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Request not found' })
      }
      if (req.status !== 'pending') {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Request sudah diproses' })
      }

      // Upload to Supabase Storage
      const ext = input.fileName.split('.').pop() || 'jpg'
      const filePath = `payment-proofs/${ctx.userId}/${input.requestId}.${ext}`

      const buffer = Buffer.from(input.proofBase64, 'base64')
      const { error: uploadError } = await supabase.storage
        .from('payment-proofs')
        .upload(filePath, buffer, {
          contentType: `image/${ext === 'png' ? 'png' : 'jpeg'}`,
          upsert: true,
        })

      if (uploadError) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: `Upload gagal: ${uploadError.message}` })
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('payment-proofs')
        .getPublicUrl(filePath)

      const { error: updateError } = await supabase
        .from('payment_requests')
        .update({ proof_url: urlData.publicUrl })
        .eq('id', input.requestId)

      if (updateError) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: updateError.message })

      return { url: urlData.publicUrl }
    }),

  myRequests: protectedProcedure.query(async ({ ctx }) => {
    const { data, error } = await supabase
      .from('payment_requests')
      .select('id, plan, amount, payment_method, proof_url, status, admin_note, created_at, reviewed_at, crypto_amount, crypto_token, crypto_tx_hash')
      .eq('user_id', ctx.userId)
      .order('created_at', { ascending: false })
      .limit(20)

    if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
    return data ?? []
  }),

  checkMyPayment: protectedProcedure.mutation(async ({ ctx }) => {
    const { data: pending } = await supabase
      .from('payment_requests')
      .select('id, user_id, plan, amount, crypto_amount, crypto_token, created_at')
      .eq('user_id', ctx.userId)
      .eq('status', 'pending')
      .not('crypto_token', 'is', null)
      .single()

    if (!pending || !pending.crypto_amount || !pending.crypto_token) {
      return { checked: false, matched: false }
    }

    const sinceTimestamp = Math.floor(new Date(pending.created_at).getTime() / 1000) - 300

    try {
      let transfers
      if (pending.crypto_token === 'sol') {
        transfers = await getRecentSolTransfers(sinceTimestamp)
      } else {
        transfers = await getRecentTransfers(pending.crypto_token as 'usdc' | 'usdt', sinceTimestamp)
      }

      const tolerance = pending.crypto_token === 'sol' ? 0.000001 : 0.0001
      const match = transfers.find(t =>
        matchTransferToAmount(t.amount, parseFloat(pending.crypto_amount!), tolerance)
      )

      if (!match) return { checked: true, matched: false }

      const { error: updateError } = await supabase
        .from('payment_requests')
        .update({
          status: 'approved',
          crypto_tx_hash: match.signature,
          admin_note: `Auto-verified on-chain. TX: ${match.signature.slice(0, 16)}...`,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', pending.id)
        .eq('status', 'pending')

      if (updateError) {
        logger.error('checkMyPayment: update failed', updateError)
        return { checked: true, matched: false }
      }

      const { data: user } = await supabase
        .from('users')
        .select('plan, email, name')
        .eq('id', pending.user_id)
        .single()

      await supabase
        .from('users')
        .update({ plan: pending.plan, is_trial: false })
        .eq('id', pending.user_id)

      await supabase.from('billing_history').insert({
        user_id: pending.user_id,
        plan: pending.plan,
        previous_plan: user?.plan ?? 'free',
        amount: pending.amount,
        note: `Crypto payment (${pending.crypto_token.toUpperCase()}) auto-verified. TX: ${match.signature.slice(0, 16)}...`,
        is_trial: false,
        changed_by: pending.user_id,
      })

      await createAuditLog({
        userId: pending.user_id,
        userEmail: user?.email || 'unknown',
        action: 'UPDATE',
        entityType: 'payment_request',
        entityId: pending.id,
        changes: { status: 'approved', crypto_tx_hash: match.signature },
        metadata: { token: pending.crypto_token, auto_verified: true },
      })

      if (user?.email && user?.name) {
        await sendPlanUpgradeEmail({
          to: user.email,
          name: user.name,
          oldPlan: user.plan ?? 'free',
          newPlan: pending.plan,
        })
      }

      logger.info(`checkMyPayment: auto-approved ${pending.id} via TX ${match.signature.slice(0, 16)}`)
      return { checked: true, matched: true }
    } catch (err) {
      logger.error('checkMyPayment: error checking on-chain', err)
      return { checked: true, matched: false }
    }
  }),

  paymentConfig: protectedProcedure.query(async () => {
    const { data: settings } = await supabase
      .from('platform_settings')
      .select('key, value')

    const get = (key: string, envFallback?: string) => {
      const row = settings?.find(s => s.key === key)
      return row?.value || envFallback || ''
    }

    const walletAddress = get('solana_wallet_address', process.env.SOLANA_WALLET_ADDRESS)

    let solPrice = 0
    if (walletAddress) {
      try { solPrice = await fetchSolPriceUsd() } catch { /* fallback 0 */ }
    }

    return {
      crypto: {
        enabled: !!walletAddress,
        walletAddress,
        prices: CRYPTO_PRICES_USD,
        solPriceUsd: solPrice,
      },
      bank: {
        name: get('bank_name', process.env.NEXT_PUBLIC_BANK_NAME),
        account: get('bank_account', process.env.NEXT_PUBLIC_BANK_ACCOUNT),
        holder: get('bank_holder', process.env.NEXT_PUBLIC_BANK_HOLDER),
      },
      qrisImageUrl: get('qris_image_url'),
      supportWa: get('support_wa', process.env.NEXT_PUBLIC_SUPPORT_WA),
    }
  }),

  // Super admin: list all pending + recent
  listAll: superAdminProcedure
    .input(z.object({
      status: z.enum(['pending', 'approved', 'rejected']).optional(),
      limit: z.number().default(50),
      offset: z.number().default(0),
    }).optional())
    .query(async ({ input }) => {
      let query = supabase
        .from('payment_requests')
        .select('id, user_id, plan, amount, payment_method, proof_url, status, admin_note, created_at, reviewed_at, crypto_amount, crypto_token, crypto_tx_hash', { count: 'exact' })
        .order('created_at', { ascending: false })

      if (input?.status) query = query.eq('status', input.status)

      const limit = input?.limit ?? 50
      const offset = input?.offset ?? 0
      query = query.range(offset, offset + limit - 1)

      const { data, count, error } = await query
      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })

      // Fetch user info
      const userIds = [...new Set(data?.map(r => r.user_id) ?? [])]
      const { data: users } = userIds.length > 0
        ? await supabase.from('users').select('id, name, email, plan').in('id', userIds)
        : { data: [] }

      const userMap = Object.fromEntries((users ?? []).map(u => [u.id, u]))

      const requests = data?.map(r => ({
        ...r,
        user: userMap[r.user_id] ?? null,
      })) ?? []

      return { requests, total: count || 0 }
    }),

  // Super admin: approve
  approve: superAdminProcedure
    .input(z.object({
      requestId: z.string().uuid(),
      note: z.string().max(500).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { data: req, error: fetchError } = await supabase
        .from('payment_requests')
        .select('id, user_id, plan, amount, status')
        .eq('id', input.requestId)
        .single()

      if (fetchError || !req) throw new TRPCError({ code: 'NOT_FOUND', message: 'Request not found' })
      if (req.status !== 'pending') throw new TRPCError({ code: 'BAD_REQUEST', message: 'Request sudah diproses' })

      // Get user's current plan
      const { data: user } = await supabase
        .from('users')
        .select('plan, email, name')
        .eq('id', req.user_id)
        .single()

      // Update request status
      const { error: updateReqError } = await supabase
        .from('payment_requests')
        .update({
          status: 'approved',
          admin_note: input.note || null,
          reviewed_by: ctx.userId,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', input.requestId)

      if (updateReqError) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: updateReqError.message })

      // Activate plan
      const { error: updateUserError } = await supabase
        .from('users')
        .update({ plan: req.plan, is_trial: false })
        .eq('id', req.user_id)

      if (updateUserError) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: updateUserError.message })

      // Record billing history
      await supabase.from('billing_history').insert({
        user_id: req.user_id,
        plan: req.plan,
        previous_plan: user?.plan ?? 'free',
        amount: req.amount,
        note: input.note || 'Manual payment approved',
        is_trial: false,
        changed_by: ctx.userId,
      })

      await createAuditLog({
        userId: ctx.userId,
        userEmail: ctx.session?.email || 'unknown',
        action: 'UPDATE',
        entityType: 'payment_request',
        entityId: input.requestId,
        changes: { status: 'approved', plan: req.plan },
        metadata: { tenantEmail: user?.email, amount: req.amount },
      })

      // Notify user
      if (user?.email && user?.name) {
        await sendPlanUpgradeEmail({
          to: user.email,
          name: user.name,
          oldPlan: user.plan ?? 'free',
          newPlan: req.plan,
        })
      }

      return { success: true }
    }),

  // Super admin: reject
  reject: superAdminProcedure
    .input(z.object({
      requestId: z.string().uuid(),
      note: z.string().min(1).max(500),
    }))
    .mutation(async ({ input, ctx }) => {
      const { data: req } = await supabase
        .from('payment_requests')
        .select('id, user_id, status')
        .eq('id', input.requestId)
        .single()

      if (!req) throw new TRPCError({ code: 'NOT_FOUND', message: 'Request not found' })
      if (req.status !== 'pending') throw new TRPCError({ code: 'BAD_REQUEST', message: 'Request sudah diproses' })

      const { error } = await supabase
        .from('payment_requests')
        .update({
          status: 'rejected',
          admin_note: input.note,
          reviewed_by: ctx.userId,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', input.requestId)

      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })

      await createAuditLog({
        userId: ctx.userId,
        userEmail: ctx.session?.email || 'unknown',
        action: 'UPDATE',
        entityType: 'payment_request',
        entityId: input.requestId,
        changes: { status: 'rejected', reason: input.note },
      })

      return { success: true }
    }),
})
