import { z } from 'zod'
import { router, publicProcedure, protectedProcedure, adminProcedure } from '../trpc'
import { LoginUserUseCase } from '@/use-cases/auth/LoginUserUseCase'
import { RegisterUserUseCase } from '@/use-cases/auth/RegisterUserUseCase'
import { LogoutUserUseCase } from '@/use-cases/auth/LogoutUserUseCase'
import { SupabaseUserRepository } from '@/infra/repositories/SupabaseUserRepository'
import { setAuthCookie, deleteAuthCookie, setRefreshCookie, deleteRefreshCookie, getRefreshCookie } from '@/lib/cookies'
import { createAuditLog } from '@/lib/audit'
import { createRefreshToken, rotateRefreshToken, revokeRefreshToken, revokeAllUserTokens } from '@/lib/refreshToken'

const userRepository = new SupabaseUserRepository()

export const authRouter = router({
  /**
   * Register new user (with Audit Logging and Refresh Tokens)
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

      // Create refresh token and new short-lived access token
      const { refreshToken, accessToken } = await createRefreshToken(result.user.id)

      // Set httpOnly cookies (access token = 30 min, refresh token = 30 days)
      await setAuthCookie(accessToken)
      await setRefreshCookie(refreshToken)

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

      return {
        ...result,
        token: accessToken, // Return new access token
      }
    }),

  /**
   * Login user (with Audit Logging and Refresh Tokens)
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

      // Create refresh token and new short-lived access token
      const { refreshToken, accessToken } = await createRefreshToken(result.user.id)

      // Set httpOnly cookies (access token = 30 min, refresh token = 30 days)
      await setAuthCookie(accessToken)
      await setRefreshCookie(refreshToken)

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

      return {
        ...result,
        token: accessToken, // Return new access token
      }
    }),

  /**
   * Logout user (with Audit Logging and Refresh Token Revocation)
   */
  logout: protectedProcedure.mutation(async ({ ctx }) => {
    const useCase = new LogoutUserUseCase()
    await useCase.execute({ userId: ctx.userId })

    // Revoke refresh token if exists
    const refreshToken = await getRefreshCookie()
    if (refreshToken) {
      try {
        await revokeRefreshToken(refreshToken)
      } catch (error) {
        // Token might already be invalid, continue with logout
      }
    }

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

    // Delete httpOnly cookies
    await deleteAuthCookie()
    await deleteRefreshCookie()

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
   * Refresh access token using refresh token
   * This implements token rotation for security
   */
  refresh: publicProcedure.mutation(async () => {
    // Get refresh token from cookie
    const refreshToken = await getRefreshCookie()

    if (!refreshToken) {
      throw new Error('No refresh token found')
    }

    try {
      // Rotate refresh token (generates new refresh + access tokens)
      const { refreshToken: newRefreshToken, accessToken: newAccessToken } =
        await rotateRefreshToken(refreshToken)

      // Set new cookies
      await setAuthCookie(newAccessToken)
      await setRefreshCookie(newRefreshToken)

      return {
        success: true,
        message: 'Tokens refreshed successfully',
      }
    } catch (error) {
      // Invalid/expired/revoked token - clear cookies
      await deleteAuthCookie()
      await deleteRefreshCookie()

      throw new Error('Failed to refresh token - please login again')
    }
  }),

  /**
   * Revoke all refresh tokens for current user (logout from all devices)
   */
  revokeAllSessions: protectedProcedure.mutation(async ({ ctx }) => {
    await revokeAllUserTokens(ctx.userId)

    // Audit log
    await createAuditLog({
      userId: ctx.userId,
      userEmail: ctx.session?.email || 'unknown',
      action: 'LOGOUT',
      entityType: 'auth',
      metadata: {
        type: 'all_sessions',
        name: ctx.session?.name,
        role: ctx.session?.role,
      },
    })

    // Delete current session cookies
    await deleteAuthCookie()
    await deleteRefreshCookie()

    return {
      success: true,
      message: 'All sessions revoked successfully',
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
