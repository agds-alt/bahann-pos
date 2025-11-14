/**
 * Stock Alerts Router
 * Handles inventory alerts and notifications
 */

import { z } from 'zod'
import { router, protectedProcedure, adminProcedure } from '../trpc'
import { supabase } from '@/infra/supabase/client'
import { createAuditLog } from '@/lib/audit'
import { TRPCError } from '@trpc/server'

export const stockAlertsRouter = router({
  /**
   * Get active alerts for an outlet
   */
  getActive: protectedProcedure
    .input(
      z.object({
        outletId: z.string().uuid().optional(),
      })
    )
    .query(async ({ input }) => {
      let query = supabase
        .from('stock_alerts')
        .select(
          `
          *,
          product:products (id, name, sku, category),
          outlet:outlets (id, name, address)
        `
        )
        .eq('is_acknowledged', false)
        .order('created_at', { ascending: false })

      if (input.outletId) {
        query = query.eq('outlet_id', input.outletId)
      }

      const { data, error } = await query

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to fetch stock alerts: ${error.message}`,
        })
      }

      return data || []
    }),

  /**
   * Generate alerts (run periodically or on-demand)
   */
  generate: adminProcedure.mutation(async ({ ctx }) => {
    try {
      // Call the database function to generate alerts
      const { data, error } = await supabase.rpc('generate_stock_alerts')

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to generate alerts: ${error.message}`,
        })
      }

      const alertsGenerated = data || 0

      await createAuditLog({
        userId: ctx.userId,
        userEmail: ctx.session?.email || 'unknown',
        action: 'CREATE',
        entityType: 'stock_alert',
        metadata: { alertsGenerated },
      })

      return { alertsGenerated }
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error
      }
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to generate stock alerts',
      })
    }
  }),

  /**
   * Acknowledge alert
   */
  acknowledge: protectedProcedure
    .input(z.object({ alertId: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      const { error } = await supabase
        .from('stock_alerts')
        .update({
          is_acknowledged: true,
          acknowledged_by: ctx.userId,
          acknowledged_at: new Date().toISOString(),
        })
        .eq('id', input.alertId)

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to acknowledge alert: ${error.message}`,
        })
      }

      await createAuditLog({
        userId: ctx.userId,
        userEmail: ctx.session?.email || 'unknown',
        action: 'UPDATE',
        entityType: 'stock_alert',
        entityId: input.alertId,
        metadata: { action: 'acknowledge' },
      })

      return { success: true }
    }),

  /**
   * Acknowledge all alerts for a product
   */
  acknowledgeByProduct: protectedProcedure
    .input(
      z.object({
        productId: z.string().uuid(),
        outletId: z.string().uuid().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      let query = supabase
        .from('stock_alerts')
        .update({
          is_acknowledged: true,
          acknowledged_by: ctx.userId,
          acknowledged_at: new Date().toISOString(),
        })
        .eq('product_id', input.productId)
        .eq('is_acknowledged', false)

      if (input.outletId) {
        query = query.eq('outlet_id', input.outletId)
      }

      const { error } = await query

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to acknowledge alerts: ${error.message}`,
        })
      }

      return { success: true }
    }),

  /**
   * Get alert history
   */
  getHistory: protectedProcedure
    .input(
      z.object({
        outletId: z.string().uuid().optional(),
        productId: z.string().uuid().optional(),
        dateFrom: z.string().optional(),
        dateTo: z.string().optional(),
        limit: z.number().default(50),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input }) => {
      let query = supabase
        .from('stock_alerts')
        .select(
          `
          *,
          product:products (id, name, sku),
          outlet:outlets (id, name),
          acknowledged_by_user:users!acknowledged_by (id, name)
        `,
          { count: 'exact' }
        )
        .order('created_at', { ascending: false })

      if (input.outletId) query = query.eq('outlet_id', input.outletId)
      if (input.productId) query = query.eq('product_id', input.productId)
      if (input.dateFrom) query = query.gte('created_at', input.dateFrom)
      if (input.dateTo) query = query.lte('created_at', input.dateTo)

      query = query.range(input.offset, input.offset + input.limit - 1)

      const { data, count, error } = await query

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to fetch alert history: ${error.message}`,
        })
      }

      return {
        alerts: data || [],
        total: count || 0,
      }
    }),

  /**
   * Get alert summary by type
   */
  getSummary: protectedProcedure
    .input(
      z.object({
        outletId: z.string().uuid().optional(),
      })
    )
    .query(async ({ input }) => {
      let query = supabase
        .from('stock_alerts')
        .select('alert_type, is_acknowledged')
        .eq('is_acknowledged', false)

      if (input.outletId) {
        query = query.eq('outlet_id', input.outletId)
      }

      const { data, error } = await query

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to fetch alert summary: ${error.message}`,
        })
      }

      const summary = {
        total: data?.length || 0,
        outOfStock: data?.filter((a) => a.alert_type === 'out_of_stock').length || 0,
        lowStock: data?.filter((a) => a.alert_type === 'low_stock').length || 0,
        reorderSuggested:
          data?.filter((a) => a.alert_type === 'reorder_suggested').length || 0,
      }

      return summary
    }),

  /**
   * Update product reorder settings
   */
  updateReorderSettings: protectedProcedure
    .input(
      z.object({
        productId: z.string().uuid(),
        reorderPoint: z.number().min(0).optional(),
        reorderQuantity: z.number().min(1).optional(),
        leadTimeDays: z.number().min(0).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { productId, ...updates } = input

      const { error } = await supabase
        .from('products')
        .update({
          reorder_point: updates.reorderPoint,
          reorder_quantity: updates.reorderQuantity,
          lead_time_days: updates.leadTimeDays,
        })
        .eq('id', productId)

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to update reorder settings: ${error.message}`,
        })
      }

      await createAuditLog({
        userId: ctx.userId,
        userEmail: ctx.session?.email || 'unknown',
        action: 'UPDATE',
        entityType: 'product',
        entityId: productId,
        changes: { reorderSettings: updates },
      })

      return { success: true }
    }),
})
