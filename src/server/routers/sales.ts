import { z } from 'zod'
import { router, protectedProcedure } from '../trpc'
import { RecordDailySaleUseCase } from '@/use-cases/sale/RecordDailySaleUseCase'
import { SupabaseDailySaleRepository } from '@/infra/repositories/SupabaseDailySaleRepository'

const salesRepository = new SupabaseDailySaleRepository()

export const salesRouter = router({
  /**
   * Record daily sale
   */
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
    .mutation(async ({ input }) => {
      const useCase = new RecordDailySaleUseCase(salesRepository)
      await useCase.execute(input)
      return { success: true }
    }),

  /**
   * Get sales by date range
   */
  getByDateRange: protectedProcedure
    .input(
      z.object({
        outletId: z.string().uuid(),
        startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      })
    )
    .query(async ({ input }) => {
      const sales = await salesRepository.getByDateRange(
        input.outletId,
        new Date(input.startDate),
        new Date(input.endDate)
      )
      return sales
    }),
})
