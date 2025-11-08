import { z } from 'zod'
import { router, protectedProcedure, adminProcedure } from '../trpc'
import { supabase } from '@/infra/supabase/client'

export const productsRouter = router({
  /**
   * Get all products with pagination
   */
  getAll: protectedProcedure
    .input(
      z.object({
        search: z.string().optional(),
        category: z.string().optional(),
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(50),
      }).optional()
    )
    .query(async ({ input }) => {
      const page = input?.page || 1
      const limit = input?.limit || 50
      const offset = (page - 1) * limit

      // Build count query
      let countQuery = supabase
        .from('products')
        .select('*', { count: 'exact', head: true })

      // Build data query
      let dataQuery = supabase
        .from('products')
        .select('*')
        .order('name', { ascending: true })
        .range(offset, offset + limit - 1)

      // Apply filters to both queries
      if (input?.search) {
        const searchFilter = `name.ilike.%${input.search}%,sku.ilike.%${input.search}%`
        countQuery = countQuery.or(searchFilter)
        dataQuery = dataQuery.or(searchFilter)
      }

      if (input?.category) {
        countQuery = countQuery.eq('category', input.category)
        dataQuery = dataQuery.eq('category', input.category)
      }

      // Execute both queries
      const [{ count, error: countError }, { data, error: dataError }] = await Promise.all([
        countQuery,
        dataQuery,
      ])

      if (countError) {
        throw new Error(`Failed to count products: ${countError.message}`)
      }

      if (dataError) {
        throw new Error(`Failed to fetch products: ${dataError.message}`)
      }

      return {
        products: data || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit),
        },
      }
    }),

  /**
   * Get product by ID
   */
  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input }) => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', input.id)
        .single()

      if (error) {
        throw new Error(`Failed to fetch product: ${error.message}`)
      }

      return data
    }),

  /**
   * Create new product - ADMIN ONLY
   */
  create: adminProcedure
    .input(
      z.object({
        sku: z.string().min(1),
        name: z.string().min(1),
        category: z.string().optional(),
        price: z.number().positive().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { data, error } = await supabase
        .from('products')
        .insert({
          sku: input.sku,
          name: input.name,
          category: input.category || null,
          price: input.price || null,
        })
        .select()
        .single()

      if (error) {
        throw new Error(`Failed to create product: ${error.message}`)
      }

      return data
    }),

  /**
   * Update product - ADMIN ONLY
   */
  update: adminProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        sku: z.string().min(1),
        name: z.string().min(1),
        category: z.string().optional(),
        price: z.number().positive().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { data, error } = await supabase
        .from('products')
        .update({
          sku: input.sku,
          name: input.name,
          category: input.category || null,
          price: input.price || null,
        })
        .eq('id', input.id)
        .select()
        .single()

      if (error) {
        throw new Error(`Failed to update product: ${error.message}`)
      }

      return data
    }),

  /**
   * Delete product - ADMIN ONLY
   */
  delete: adminProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input }) => {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', input.id)

      if (error) {
        throw new Error(`Failed to delete product: ${error.message}`)
      }

      return { success: true }
    }),

  /**
   * Get categories
   */
  getCategories: protectedProcedure.query(async () => {
    const { data, error } = await supabase
      .from('products')
      .select('category')
      .not('category', 'is', null)

    if (error) {
      throw new Error(`Failed to fetch categories: ${error.message}`)
    }

    // Get unique categories
    const categories = [...new Set(data.map((p) => p.category).filter(Boolean))]
    return categories as string[]
  }),
})
