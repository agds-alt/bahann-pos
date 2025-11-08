import { z } from 'zod'
import { router, protectedProcedure, adminProcedure } from '../trpc'
import { supabase } from '@/infra/supabase/client'

export const outletsRouter = router({
  /**
   * Get all outlets
   */
  getAll: protectedProcedure.query(async () => {
    const { data, error } = await supabase
      .from('outlets')
      .select('*')
      .order('name', { ascending: true })

    if (error) {
      throw new Error(`Failed to fetch outlets: ${error.message}`)
    }

    return data || []
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
