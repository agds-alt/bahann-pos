import { z } from 'zod'
import { router, publicProcedure, protectedProcedure, adminProcedure } from '../trpc'
import { LoginUserUseCase } from '@/use-cases/auth/LoginUserUseCase'
import { RegisterUserUseCase } from '@/use-cases/auth/RegisterUserUseCase'
import { LogoutUserUseCase } from '@/use-cases/auth/LogoutUserUseCase'
import { SupabaseUserRepository } from '@/infra/repositories/SupabaseUserRepository'
import { setAuthCookie, deleteAuthCookie } from '@/lib/cookies'
import { createAuditLog } from '@/lib/audit'

const userRepository = new SupabaseUserRepository()

export const authRouter = router({
  /**
   * Register new user (with Audit Logging)
   */
  register: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(8),
        name: z.string().min(1),
        outletId: z.string().uuid().optional(),
        role: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const useCase = new RegisterUserUseCase(userRepository)
      const result = await useCase.execute(input)

      // Set httpOnly cookie with JWT token
      await setAuthCookie(result.token)

      // Audit log for registration
      await createAuditLog({
        userId: result.user.id,
        userEmail: result.user.email,
        action: 'REGISTER',
        entityType: 'auth',
        metadata: {
          name: result.user.name,
          role: result.user.role,
          outletId: result.user.outletId,
        },
      })

      return result
    }),

  /**
   * Login user (with Audit Logging)
   */
  login: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      const useCase = new LoginUserUseCase(userRepository)
      const result = await useCase.execute(input)

      // Set httpOnly cookie with JWT token
      await setAuthCookie(result.token)

      // Audit log for login
      await createAuditLog({
        userId: result.user.id,
        userEmail: result.user.email,
        action: 'LOGIN',
        entityType: 'auth',
        metadata: {
          name: result.user.name,
          role: result.user.role,
        },
      })

      return result
    }),

  /**
   * Logout user (with Audit Logging)
   */
  logout: protectedProcedure.mutation(async ({ ctx }) => {
    const useCase = new LogoutUserUseCase()
    await useCase.execute({ userId: ctx.userId })

    // Audit log for logout
    await createAuditLog({
      userId: ctx.userId,
      userEmail: ctx.session?.email || 'unknown',
      action: 'LOGOUT',
      entityType: 'auth',
      metadata: {
        name: ctx.session?.name,
        role: ctx.session?.role,
      },
    })

    // Delete httpOnly cookie
    await deleteAuthCookie()

    return { success: true }
  }),

  /**
   * Get current user session
   */
  me: protectedProcedure.query(({ ctx }) => {
    return {
      userId: ctx.userId,
      session: ctx.session,
    }
  }),

  /**
   * Get all users - ADMIN ONLY with pagination
   * SECURE: Now requires admin role and supports pagination
   */
  getAllUsers: adminProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(20),
        search: z.string().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      const { supabase } = await import('@/infra/supabase/client')
      const page = input?.page || 1
      const limit = input?.limit || 20
      const search = input?.search
      const offset = (page - 1) * limit

      // Build query
      let query = supabase
        .from('users')
        .select('id, email, name, outlet_id, role, created_at', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      // Add search if provided
      if (search) {
        query = query.or(`email.ilike.%${search}%,name.ilike.%${search}%`)
      }

      const { data, error, count } = await query

      if (error) {
        throw new Error(`Failed to fetch users: ${error.message}`)
      }

      return {
        users: data || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit),
        },
      }
    }),
})
