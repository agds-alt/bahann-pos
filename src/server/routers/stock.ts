import { z } from 'zod'
import { router, protectedProcedure } from '../trpc'
import { RecordDailyStockUseCase } from '@/use-cases/stock/RecordDailyStockUseCase'
import { SupabaseDailyStockRepository } from '@/infra/repositories/SupabaseDailyStockRepository'

const stockRepository = new SupabaseDailyStockRepository()

export const stockRouter = router({
  /**
   * Record daily stock movement
   */
  record: protectedProcedure
    .input(
      z.object({
        productId: z.string().uuid(),
        outletId: z.string().uuid(),
        stockDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        stockAwal: z.number(),
        stockIn: z.number(),
        stockOut: z.number(),
        stockAkhir: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      const useCase = new RecordDailyStockUseCase(stockRepository)
      await useCase.execute(input)
      return { success: true }
    }),

  /**
   * Get latest stock for a product
   */
  getLatest: protectedProcedure
    .input(
      z.object({
        productId: z.string().uuid(),
        outletId: z.string().uuid(),
      })
    )
    .query(async ({ input }) => {
      const stock = await stockRepository.getLatestByProduct(
        input.productId,
        input.outletId
      )
      return stock
    }),

  /**
   * Get stock by date
   */
  getByDate: protectedProcedure
    .input(
      z.object({
        outletId: z.string().uuid(),
        stockDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      })
    )
    .query(async ({ input }) => {
      const stocks = await stockRepository.getByDate(input.outletId, input.stockDate)
      return stocks
    }),
})
