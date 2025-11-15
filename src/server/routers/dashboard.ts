import { z } from 'zod'
import { router, protectedProcedure } from '../trpc'
import { supabase } from '@/infra/supabase/client'

export const dashboardRouter = router({
  /**
   * Get dashboard statistics
   */
  getStats: protectedProcedure
    .input(
      z.object({
        outletId: z.string().uuid().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      const today = new Date().toISOString().split('T')[0]
      const startDate = input?.startDate || today
      const endDate = input?.endDate || today

      // Get total products
      const { count: totalProducts } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })

      // Get total outlets
      const { count: totalOutlets } = await supabase
        .from('outlets')
        .select('*', { count: 'exact', head: true })

      // Get today's sales
      let salesQuery = supabase
        .from('daily_sales')
        .select('quantity_sold, revenue')
        .gte('sale_date', startDate)
        .lte('sale_date', endDate)

      if (input?.outletId) {
        salesQuery = salesQuery.eq('outlet_id', input.outletId)
      }

      const { data: salesData } = await salesQuery

      const totalRevenue = salesData?.reduce((sum, sale) => sum + (sale.revenue || 0), 0) || 0
      const totalItemsSold = salesData?.reduce((sum, sale) => sum + (sale.quantity_sold || 0), 0) || 0

      // Get low stock items (stock < 10)
      let stockQuery = supabase
        .from('daily_stock')
        .select('product_id, stock_akhir, stock_date')
        .eq('stock_date', today)
        .lt('stock_akhir', 10)

      if (input?.outletId) {
        stockQuery = stockQuery.eq('outlet_id', input.outletId)
      }

      const { data: lowStockData, count: lowStockCount } = await stockQuery

      return {
        totalProducts: totalProducts || 0,
        totalOutlets: totalOutlets || 0,
        totalRevenue,
        totalItemsSold,
        lowStockCount: lowStockCount || 0,
        transactionCount: salesData?.length || 0,
      }
    }),

  /**
   * Get sales trend (last 7 days)
   */
  getSalesTrend: protectedProcedure
    .input(
      z.object({
        outletId: z.string().uuid().optional(),
        days: z.number().default(7),
      }).optional()
    )
    .query(async ({ input }) => {
      const days = input?.days || 7
      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - (days - 1))

      let query = supabase
        .from('daily_sales')
        .select('sale_date, quantity_sold, revenue')
        .gte('sale_date', startDate.toISOString().split('T')[0])
        .lte('sale_date', endDate.toISOString().split('T')[0])
        .order('sale_date', { ascending: true })

      if (input?.outletId) {
        query = query.eq('outlet_id', input.outletId)
      }

      const { data } = await query

      // Group by date
      const trendMap: Record<string, { date: string; revenue: number; itemsSold: number }> = {}

      // Initialize all dates
      for (let i = 0; i < days; i++) {
        const date = new Date(startDate)
        date.setDate(date.getDate() + i)
        const dateStr = date.toISOString().split('T')[0]
        trendMap[dateStr] = { date: dateStr, revenue: 0, itemsSold: 0 }
      }

      // Fill with actual data
      data?.forEach((sale) => {
        if (trendMap[sale.sale_date]) {
          trendMap[sale.sale_date].revenue += sale.revenue || 0
          trendMap[sale.sale_date].itemsSold += sale.quantity_sold || 0
        }
      })

      return Object.values(trendMap)
    }),

  /**
   * Get top selling products (OPTIMIZED - using JOIN to avoid N+1)
   */
  getTopProducts: protectedProcedure
    .input(
      z.object({
        outletId: z.string().uuid().optional(),
        limit: z.number().default(5),
        days: z.number().default(7),
      }).optional()
    )
    .query(async ({ input }) => {
      const days = input?.days || 7
      const limit = input?.limit || 5

      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - (days - 1))

      // OPTIMIZED: Use JOIN to fetch all data in a single query
      let query = supabase
        .from('daily_sales')
        .select(`
          product_id,
          quantity_sold,
          revenue,
          products!inner(id, name, sku)
        `)
        .gte('sale_date', startDate.toISOString().split('T')[0])
        .lte('sale_date', endDate.toISOString().split('T')[0])

      if (input?.outletId) {
        query = query.eq('outlet_id', input.outletId)
      }

      const { data: salesData } = await query

      // Group by product (data already includes product details from JOIN)
      const productMap: Record<string, {
        productId: string
        productName: string
        productSku: string
        totalQuantity: number
        totalRevenue: number
      }> = {}

      salesData?.forEach((sale: any) => {
        if (!productMap[sale.product_id]) {
          productMap[sale.product_id] = {
            productId: sale.product_id,
            productName: sale.products?.name || 'Unknown',
            productSku: sale.products?.sku || 'N/A',
            totalQuantity: 0,
            totalRevenue: 0,
          }
        }
        productMap[sale.product_id].totalQuantity += sale.quantity_sold || 0
        productMap[sale.product_id].totalRevenue += sale.revenue || 0
      })

      // Sort and limit
      const topProducts = Object.values(productMap)
        .sort((a, b) => b.totalQuantity - a.totalQuantity)
        .slice(0, limit)

      return topProducts
    }),

  /**
   * Get low stock products (OPTIMIZED - using JOIN to avoid N+1)
   */
  getLowStock: protectedProcedure
    .input(
      z.object({
        outletId: z.string().uuid().optional(),
        threshold: z.number().default(10),
      }).optional()
    )
    .query(async ({ input }) => {
      const today = new Date().toISOString().split('T')[0]
      const threshold = input?.threshold || 10

      // OPTIMIZED: Use JOIN to fetch all data in a single query
      let query = supabase
        .from('daily_stock')
        .select(`
          product_id,
          outlet_id,
          stock_akhir,
          stock_date,
          products!inner(id, name, sku, category),
          outlets!inner(id, name)
        `)
        .eq('stock_date', today)
        .lt('stock_akhir', threshold)
        .order('stock_akhir', { ascending: true })

      if (input?.outletId) {
        query = query.eq('outlet_id', input.outletId)
      }

      const { data: stockData } = await query

      if (!stockData || stockData.length === 0) return []

      // Map the joined data
      return stockData.map((stock: any) => ({
        productId: stock.product_id,
        productName: stock.products?.name || 'Unknown',
        productSku: stock.products?.sku || 'N/A',
        productCategory: stock.products?.category || null,
        outletId: stock.outlet_id,
        outletName: stock.outlets?.name || 'Unknown',
        currentStock: stock.stock_akhir,
        date: stock.stock_date,
      }))
    }),

  /**
   * Get recent transactions (MIGRATED - using transactions table for reliability)
   */
  getRecentTransactions: protectedProcedure
    .input(
      z.object({
        outletId: z.string().uuid().optional(),
        limit: z.number().default(10),
      }).optional()
    )
    .query(async ({ input }) => {
      const limit = input?.limit || 10

      // Query from transactions table with JOIN to get all related data
      let query = supabase
        .from('transactions')
        .select(`
          id,
          transaction_id,
          outlet_id,
          status,
          total_amount,
          created_at,
          transaction_items (
            product_id,
            product_name,
            product_sku,
            quantity,
            unit_price,
            line_total
          ),
          outlets!inner(id, name),
          cashier:users!cashier_id(id, name, email)
        `)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (input?.outletId) {
        query = query.eq('outlet_id', input.outletId)
      }

      const { data: transactions } = await query

      if (!transactions || transactions.length === 0) return []

      // Map transactions to flat format for compatibility with existing UI
      // Each transaction item becomes a separate row
      const flatTransactions: any[] = []

      transactions.forEach((tx: any) => {
        if (tx.transaction_items && tx.transaction_items.length > 0) {
          tx.transaction_items.forEach((item: any) => {
            flatTransactions.push({
              id: `${tx.id}-${item.product_id}`,
              transactionId: tx.transaction_id,
              productName: item.product_name,
              productSku: item.product_sku || 'N/A',
              outletName: tx.outlets?.name || 'Unknown',
              cashierName: tx.cashier?.name || 'Unknown',
              date: tx.created_at,
              quantity: item.quantity,
              revenue: item.line_total,
              status: tx.status,
              totalAmount: tx.total_amount,
              createdAt: tx.created_at,
            })
          })
        } else {
          // Transaction without items (shouldn't happen, but handle gracefully)
          flatTransactions.push({
            id: tx.id,
            transactionId: tx.transaction_id,
            productName: 'No items',
            productSku: 'N/A',
            outletName: tx.outlets?.name || 'Unknown',
            cashierName: tx.cashier?.name || 'Unknown',
            date: tx.created_at,
            quantity: 0,
            revenue: 0,
            status: tx.status,
            totalAmount: tx.total_amount,
            createdAt: tx.created_at,
          })
        }
      })

      return flatTransactions
    }),
})
