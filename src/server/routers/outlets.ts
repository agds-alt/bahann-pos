import { z } from 'zod'
import { router, protectedProcedure, adminProcedure } from '../trpc'
import { supabase } from '@/infra/supabase/client'

export const outletsRouter = router({
  /**
   * Get all outlets with pagination
   */
  getAll: protectedProcedure
    .input(
      z.object({
        search: z.string().optional(),
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
        .from('outlets')
        .select('*', { count: 'exact', head: true })

      // Build data query
      let dataQuery = supabase
        .from('outlets')
        .select('*')
        .order('name', { ascending: true })
        .range(offset, offset + limit - 1)

      // Apply search filter
      if (input?.search) {
        const searchFilter = `name.ilike.%${input.search}%,address.ilike.%${input.search}%`
        countQuery = countQuery.or(searchFilter)
        dataQuery = dataQuery.or(searchFilter)
      }

      // Execute both queries
      const [{ count, error: countError }, { data, error: dataError }] = await Promise.all([
        countQuery,
        dataQuery,
      ])

      if (countError) {
        throw new Error(`Failed to count outlets: ${countError.message}`)
      }

      if (dataError) {
        throw new Error(`Failed to fetch outlets: ${dataError.message}`)
      }

      return {
        outlets: data || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit),
        },
      }
    }),

  /**
   * Get outlet by ID
   */
  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input }) => {
      const { data, error } = await supabase
        .from('outlets')
        .select('*')
        .eq('id', input.id)
        .single()

      if (error) {
        throw new Error(`Failed to fetch outlet: ${error.message}`)
      }

      return data
    }),

  /**
   * Create new outlet - ADMIN ONLY
   */
  create: adminProcedure
    .input(
      z.object({
        name: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      const { data, error } = await supabase
        .from('outlets')
        .insert({
          name: input.name,
        })
        .select()
        .single()

      if (error) {
        throw new Error(`Failed to create outlet: ${error.message}`)
      }

      return data
    }),

  /**
   * Update outlet - ADMIN ONLY
   */
  update: adminProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        name: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      const { data, error } = await supabase
        .from('outlets')
        .update({
          name: input.name,
        })
        .eq('id', input.id)
        .select()
        .single()

      if (error) {
        throw new Error(`Failed to update outlet: ${error.message}`)
      }

      return data
    }),

  /**
   * Delete outlet - ADMIN ONLY
   */
  delete: adminProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input }) => {
      const { error } = await supabase
        .from('outlets')
        .delete()
        .eq('id', input.id)

      if (error) {
        throw new Error(`Failed to delete outlet: ${error.message}`)
      }

      return { success: true }
    }),
})
