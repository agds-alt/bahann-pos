import { z } from 'zod'
import { router, publicProcedure, protectedProcedure } from '../trpc'
import { LoginUserUseCase } from '@/use-cases/auth/LoginUserUseCase'
import { RegisterUserUseCase } from '@/use-cases/auth/RegisterUserUseCase'
import { LogoutUserUseCase } from '@/use-cases/auth/LogoutUserUseCase'
import { SupabaseUserRepository } from '@/infra/repositories/SupabaseUserRepository'

const userRepository = new SupabaseUserRepository()

export const authRouter = router({
  /**
   * Register new user
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
      return result
    }),

  /**
   * Login user
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
      return result
    }),

  /**
   * Logout user
   */
  logout: protectedProcedure.mutation(async ({ ctx }) => {
    const useCase = new LogoutUserUseCase()
    await useCase.execute({ userId: ctx.userId })
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
})
