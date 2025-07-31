// Authentication service implementation
import { hashPassword, verifyPassword } from '@/lib/auth'
import type { 
	User, 
	CreateUserDto, 
	LoginDto,
	UserSession,
	ApiResponse
} from '@/types'
import type { IAuthService, ISessionService } from '@/backend/interfaces/services'
import type { IUserRepository } from '@/backend/interfaces/repositories'

export class AuthService implements IAuthService {
	constructor(
		private userRepository: IUserRepository,
		private sessionService: ISessionService
	) {}

	async register(userData: CreateUserDto): Promise<ApiResponse<UserSession>> {
		try {
			// Hash password
			const hashedPassword = await this.hashPassword(userData.password)
			
			// Create user
			const user = await this.userRepository.create({
				...userData,
				password: hashedPassword
			})

			// Create session
			const { token, permissions } = await this.sessionService.createSession(user.user_id)

			return {
				success: true,
				data: {
					user: {
						user_id: user.user_id,
						username: user.username,
						email: user.email,
						is_active: user.is_active
					},
					token,
					permissions
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

			// Verify password
			const isValidPassword = await this.verifyPassword(credentials.password, user.password_hash)
			if (!isValidPassword) {
				return {
					success: false,
					error: 'Invalid credentials'
				}
			}

			// Create session
			const { token, permissions } = await this.sessionService.createSession(user.user_id)

			return {
				success: true,
				data: {
					user: {
						user_id: user.user_id,
						username: user.username,
						email: user.email,
						is_active: user.is_active
					},
					token,
					permissions
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