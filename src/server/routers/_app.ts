import { router } from '../trpc'
import { authRouter } from './auth'
import { stockRouter } from './stock'
import { salesRouter } from './sales'
import { productsRouter } from './products'
import { outletsRouter } from './outlets'
import { dashboardRouter } from './dashboard'

/**
 * Main tRPC app router
 * Combines all sub-routers
 */
export const appRouter = router({
  auth: authRouter,
  stock: stockRouter,
  sales: salesRouter,
  products: productsRouter,
  outlets: outletsRouter,
  dashboard: dashboardRouter,
})

export type AppRouter = typeof appRouter
