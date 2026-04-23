import { z } from 'zod'
import { router, protectedProcedure } from '../trpc'
import { RecordDailySaleUseCase } from '@/use-cases/sale/RecordDailySaleUseCase'
import { SupabaseDailySaleRepository } from '@/infra/repositories/SupabaseDailySaleRepository'
import { assertOutletBelongsToTenant } from '@/server/lib/tenant'
import { getTenantOwnerId } from '@/server/lib/tenant'

const salesRepository = new SupabaseDailySaleRepository()

export const salesRouter = router({
  record: protectedProcedure
    .input(
      z.object({
        productId: z.string().uuid(),
        outletId: z.string().uuid(),
        saleDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        quantitySold: z.number().min(1),
        unitPrice: z.number().positive(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const ownerId = await getTenantOwnerId(ctx.userId, ctx.session.role, ctx.session.outletId)
      if (ownerId) await assertOutletBelongsToTenant(input.outletId, ownerId)

      const useCase = new RecordDailySaleUseCase(salesRepository)
      await useCase.execute(input)
      return { success: true }
    }),

  getByDateRange: protectedProcedure
    .input(
      z.object({
        outletId: z.string().uuid(),
        startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      })
    )
    .query(async ({ input, ctx }) => {
      const ownerId = await getTenantOwnerId(ctx.userId, ctx.session.role, ctx.session.outletId)
      if (ownerId) await assertOutletBelongsToTenant(input.outletId, ownerId)

      const sales = await salesRepository.getByDateRange(
        input.outletId,
        new Date(input.startDate),
        new Date(input.endDate)
      )
      return sales
    }),
})
