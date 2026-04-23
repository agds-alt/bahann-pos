import { z } from 'zod'
import { router, adminProcedure } from '../trpc'
import { supabaseAdmin as supabase } from '@/infra/supabase/server'
import { createAuditLog } from '@/lib/audit'
import { getTenantOwnerId } from '@/server/lib/tenant'

export const adminRouter = router({
  /**
   * Reset all operational data — for fresh customer setup.
   * Deletes in FK-safe order. Preserves users and outlets.
   */
  resetAllData: adminProcedure
    .input(
      z.object({
        confirmText: z.literal('RESET ALL DATA'),
        keepOutlets: z.boolean().default(true),
        keepUsers: z.boolean().default(true),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const ownerId = await getTenantOwnerId(ctx.userId, ctx.session.role, ctx.session.outletId)
      if (!ownerId) throw new Error('Cannot determine tenant')

      // Get tenant's outlets and products
      const { data: tenantOutlets } = await supabase.from('outlets').select('id').eq('owner_id', ownerId)
      const outletIds = tenantOutlets?.map(o => o.id) ?? []
      const { data: tenantProducts } = await supabase.from('products').select('id').eq('owner_id', ownerId)
      const productIds = tenantProducts?.map(p => p.id) ?? []

      const counts: Record<string, number> = {}

      // 1. Audit logs — scope by user
      const { data: tenantUsers } = await supabase.from('users').select('id').in('outlet_id', outletIds)
      const userIds = [...(tenantUsers?.map(u => u.id) ?? []), ownerId]
      if (userIds.length > 0) {
        const { count: auditCount } = await supabase.from('audit_logs').select('*', { count: 'exact', head: true }).in('user_id', userIds)
        await supabase.from('audit_logs').delete().in('user_id', userIds)
        counts.auditLogs = auditCount || 0
      }

      // 2. Stock alerts — scope by outlet
      if (outletIds.length > 0) {
        const { count: alertCount } = await supabase.from('stock_alerts').select('*', { count: 'exact', head: true }).in('outlet_id', outletIds)
        await supabase.from('stock_alerts').delete().in('outlet_id', outletIds)
        counts.stockAlerts = alertCount || 0

        // 3. Cash sessions
        const { count: cashCount } = await supabase.from('cash_sessions').select('*', { count: 'exact', head: true }).in('outlet_id', outletIds)
        await supabase.from('cash_sessions').delete().in('outlet_id', outletIds)
        counts.cashSessions = cashCount || 0

        // 4. Transaction items (must go before transactions)
        const { data: tenantTx } = await supabase.from('transactions').select('id').in('outlet_id', outletIds)
        const txIds = tenantTx?.map(t => t.id) ?? []
        if (txIds.length > 0) {
          const { count: txItemCount } = await supabase.from('transaction_items').select('*', { count: 'exact', head: true }).in('transaction_id', txIds)
          await supabase.from('transaction_items').delete().in('transaction_id', txIds)
          counts.transactionItems = txItemCount || 0
        }

        // 5. Transactions
        const { count: txCount } = await supabase.from('transactions').select('*', { count: 'exact', head: true }).in('outlet_id', outletIds)
        await supabase.from('transactions').delete().in('outlet_id', outletIds)
        counts.transactions = txCount || 0

        // 6. Daily sales
        try {
          const { count: salesCount } = await supabase.from('daily_sales').select('*', { count: 'exact', head: true }).in('outlet_id', outletIds)
          if (salesCount) {
            await supabase.from('daily_sales').delete().in('outlet_id', outletIds)
            counts.dailySales = salesCount
          }
        } catch { /* table may not exist */ }

        // 7. Daily stock
        const { count: stockCount } = await supabase.from('daily_stock').select('*', { count: 'exact', head: true }).in('outlet_id', outletIds)
        await supabase.from('daily_stock').delete().in('outlet_id', outletIds)
        counts.dailyStock = stockCount || 0
      }

      // 8. Promotions — scope by created_by
      const { count: promoCount } = await supabase.from('promotions').select('*', { count: 'exact', head: true }).eq('created_by', ownerId)
      await supabase.from('promotions').delete().eq('created_by', ownerId)
      counts.promotions = promoCount || 0

      // 9. Products — scope by owner_id
      if (productIds.length > 0) {
        const { error: productError } = await supabase.from('products').delete().eq('owner_id', ownerId)
        if (productError) throw new Error(`Failed to delete products: ${productError.message}`)
        counts.products = productIds.length
      }

      // 10. Outlets (optional)
      if (!input.keepOutlets && outletIds.length > 0) {
        await supabase.from('outlets').delete().eq('owner_id', ownerId)
        counts.outlets = outletIds.length
      }

      // Audit log the reset (written after clear so it's the first entry)
      await createAuditLog({
        userId: ctx.userId,
        userEmail: ctx.session?.email || 'unknown',
        action: 'DELETE',
        entityType: 'auth',
        entityId: 'reset',
        changes: { reset: counts },
        metadata: {
          keepOutlets: input.keepOutlets,
          keepUsers: input.keepUsers,
          performedBy: ctx.session?.email,
        },
      })

      return { success: true, counts }
    }),
})
