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
   * Get top selling products
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

      let query = supabase
        .from('daily_sales')
        .select('product_id, quantity_sold, revenue')
        .gte('sale_date', startDate.toISOString().split('T')[0])
        .lte('sale_date', endDate.toISOString().split('T')[0])

      if (input?.outletId) {
        query = query.eq('outlet_id', input.outletId)
      }

      const { data: salesData } = await query

      // Group by product
      const productMap: Record<string, { productId: string; totalQuantity: number; totalRevenue: number }> = {}

      salesData?.forEach((sale) => {
        if (!productMap[sale.product_id]) {
          productMap[sale.product_id] = {
            productId: sale.product_id,
            totalQuantity: 0,
            totalRevenue: 0,
          }
        }
        productMap[sale.product_id].totalQuantity += sale.quantity_sold || 0
        productMap[sale.product_id].totalRevenue += sale.revenue || 0
      })

      // Get product details
      const productIds = Object.keys(productMap)
      const { data: products } = await supabase
        .from('products')
        .select('id, name, sku')
        .in('id', productIds)

      // Combine data
      const topProducts = Object.values(productMap)
        .map((item) => {
          const product = products?.find((p) => p.id === item.productId)
          return {
            ...item,
            productName: product?.name || 'Unknown',
            productSku: product?.sku || 'N/A',
          }
        })
        .sort((a, b) => b.totalQuantity - a.totalQuantity)
        .slice(0, limit)

      return topProducts
    }),

  /**
   * Get low stock products
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

      let query = supabase
        .from('daily_stock')
        .select('product_id, outlet_id, stock_akhir, stock_date')
        .eq('stock_date', today)
        .lt('stock_akhir', threshold)
        .order('stock_akhir', { ascending: true })

      if (input?.outletId) {
        query = query.eq('outlet_id', input.outletId)
      }

      const { data: stockData } = await query

      if (!stockData || stockData.length === 0) return []

      // Get product and outlet details
      const productIds = [...new Set(stockData.map((s) => s.product_id))]
      const outletIds = [...new Set(stockData.map((s) => s.outlet_id))]

      const { data: products } = await supabase
        .from('products')
        .select('id, name, sku, category')
        .in('id', productIds)

      const { data: outlets } = await supabase
        .from('outlets')
        .select('id, name')
        .in('id', outletIds)

      // Combine data
      return stockData.map((stock) => {
        const product = products?.find((p) => p.id === stock.product_id)
        const outlet = outlets?.find((o) => o.id === stock.outlet_id)
        return {
          productId: stock.product_id,
          productName: product?.name || 'Unknown',
          productSku: product?.sku || 'N/A',
          productCategory: product?.category || null,
          outletId: stock.outlet_id,
          outletName: outlet?.name || 'Unknown',
          currentStock: stock.stock_akhir,
          date: stock.stock_date,
        }
      })
    }),

  /**
   * Get recent transactions
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

      let query = supabase
        .from('daily_sales')
        .select('id, product_id, outlet_id, sale_date, quantity_sold, revenue, created_at')
        .order('created_at', { ascending: false })
        .limit(limit)

      if (input?.outletId) {
        query = query.eq('outlet_id', input.outletId)
      }

      const { data: sales } = await query

      if (!sales || sales.length === 0) return []

      // Get product and outlet details
      const productIds = [...new Set(sales.map((s) => s.product_id))]
      const outletIds = [...new Set(sales.map((s) => s.outlet_id))]

      const { data: products } = await supabase
        .from('products')
        .select('id, name, sku')
        .in('id', productIds)

      const { data: outlets } = await supabase
        .from('outlets')
        .select('id, name')
        .in('id', outletIds)

      return sales.map((sale) => {
        const product = products?.find((p) => p.id === sale.product_id)
        const outlet = outlets?.find((o) => o.id === sale.outlet_id)
        return {
          id: sale.id,
          productName: product?.name || 'Unknown',
          productSku: product?.sku || 'N/A',
          outletName: outlet?.name || 'Unknown',
          date: sale.sale_date,
          quantity: sale.quantity_sold,
          revenue: sale.revenue,
          createdAt: sale.created_at,
        }
      })
    }),
})
