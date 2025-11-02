import bcrypt from 'bcryptjs'
import { UserRepository } from '@/domain/repositories/UserRepository'
import { User } from '@/domain/entities/User'
import { AppError } from '@/shared/exceptions/AppError'

export interface RegisterUserInput {
  email: string
  password: string
  name: string
  outletId?: string
  role?: string
}

export interface RegisterUserOutput {
  userId: string
  email: string
  name: string
}

export class RegisterUserUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(input: RegisterUserInput): Promise<RegisterUserOutput> {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(input.email)) {
      throw new AppError('Invalid email format', 400)
    }

    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(input.email)
    if (existingUser) {
      throw new AppError('User with this email already exists', 409)
    }

    // Validate password strength (min 8 characters)
    if (input.password.length < 8) {
      throw new AppError('Password must be at least 8 characters long', 400)
    }

    // Hash password
    const passwordHash = await bcrypt.hash(input.password, 10)

    // Create user
    const user = User.create({
      email: input.email.toLowerCase(),
      name: input.name,
      passwordHash,
      outletId: input.outletId,
      role: input.role || 'user',
    })

    // Save to database
    await this.userRepository.save(user)

    return {
      userId: user.id,
      email: user.email,
      name: user.name,
    }
  }
}
