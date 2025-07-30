// Authentication service implementation
import { hashPassword, verifyPassword } from '@/lib/auth'
import type { 
	User, 
	CreateUserDto, 
	LoginDto,
	UserSession,
	ApiResponse
} from '@/types'
import { UserRole } from '@/types'
import type { IAuthService, ISessionService } from '@/backend/interfaces/services'
import type { IUserRepository } from '@/backend/interfaces/repositories'

export class AuthService implements IAuthService {
	constructor(
		private userRepository: IUserRepository,
		private sessionService: ISessionService
	) {}

	async register(userData: CreateUserDto): Promise<ApiResponse<UserSession>> {
		try {
			// Check if user already exists
			const existingUser = await this.userRepository.findByEmail(userData.email)
			if (existingUser) {
				return {
					success: false,
					error: 'Email already exists'
				}
			}

			// Hash password
			const hashedPassword = await this.hashPassword(userData.password)
			
			// Create user with default role if not specified
			const user = await this.userRepository.create({
				...userData,
				password: hashedPassword,
				role: userData.role || UserRole.USER
			})

			// Create session
			const { token } = await this.sessionService.createSession(user.user_id)

			return {
				success: true,
				data: {
					user: {
						user_id: user.user_id,
						email: user.email,
						name: user.name,
						surname: user.surname,
						role: user.role,
						is_active: user.is_active,
						last_login: user.last_login,
						created_at: user.created_at,
						updated_at: user.updated_at
					},
					token
				}
			}
		} catch (error) {
			return {
				success: false,
				error: 'Failed to register user'
			}
		}
	}

	async login(credentials: LoginDto): Promise<ApiResponse<UserSession>> {
		try {
			// Find user by email
			const user = await this.userRepository.findByEmail(credentials.email)
			if (!user) {
				return {
					success: false,
					error: 'Invalid credentials'
				}
			}

			// Check if user is active
			if (!user.is_active) {
				return {
					success: false,
					error: 'Account is deactivated'
				}
			}

			// Verify password
			const isValidPassword = await this.verifyPassword(credentials.password, user.password_hash)
			if (!isValidPassword) {
				return {
					success: false,
					error: 'Invalid credentials'
				}
			}

			// Update last login
			await this.userRepository.update(user.user_id, {
				last_login: new Date()
			} as any) // Type assertion needed due to repository interface limitation

			// Create session
			const { token } = await this.sessionService.createSession(user.user_id)

			return {
				success: true,
				data: {
					user: {
						user_id: user.user_id,
						email: user.email,
						name: user.name,
						surname: user.surname,
						role: user.role,
						is_active: user.is_active,
						last_login: user.last_login,
						created_at: user.created_at,
						updated_at: user.updated_at
					},
					token
				}
			}
		} catch (error) {
			return {
				success: false,
				error: 'Login failed'
			}
		}
	}

	async validateSession(token: string): Promise<User | null> {
		return this.sessionService.validateSession(token)
	}

	async logout(): Promise<ApiResponse<void>> {
		try {
			await this.sessionService.deleteSession()
			return {
				success: true,
				message: 'Logged out successfully'
			}
		} catch (error) {
			return {
				success: false,
				error: 'Logout failed'
			}
		}
	}

	async hashPassword(password: string): Promise<string> {
		return hashPassword(password)
	}

	async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
		return verifyPassword(password, hashedPassword)
	}
} 