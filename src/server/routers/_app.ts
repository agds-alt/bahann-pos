import { router } from '../trpc'
import { authRouter } from './auth'
import { stockRouter } from './stock'
import { salesRouter } from './sales'

/**
 * Main tRPC app router
 * Combines all sub-routers
 */
export const appRouter = router({
  auth: authRouter,
  stock: stockRouter,
  sales: salesRouter,
})

export type AppRouter = typeof appRouter
