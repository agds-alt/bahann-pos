import { z } from 'zod'
import { router, protectedProcedure } from '../trpc'
import { supabase } from '@/infra/supabase/client'

export const productsRouter = router({
  /**
   * Get all products
   */
  getAll: protectedProcedure
    .input(
      z.object({
        search: z.string().optional(),
        category: z.string().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      let query = supabase
        .from('products')
        .select('*')
        .order('name', { ascending: true })

      if (input?.search) {
        query = query.or(`name.ilike.%${input.search}%,sku.ilike.%${input.search}%`)
      }

      if (input?.category) {
        query = query.eq('category', input.category)
      }

      const { data, error } = await query

      if (error) {
        throw new Error(`Failed to fetch products: ${error.message}`)
      }

      return data || []
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
   * Create new product
   */
  create: protectedProcedure
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
   * Update product
   */
  update: protectedProcedure
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
   * Delete product
   */
  delete: protectedProcedure
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
