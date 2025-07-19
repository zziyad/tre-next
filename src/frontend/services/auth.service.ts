// Frontend authentication service
import { apiService } from './api.service'
import type { 
	User, 
	LoginDto, 
	CreateUserDto, 
	UserSession,
	ApiResponse 
} from '@/types'

export class FrontendAuthService {
	async login(credentials: LoginDto): Promise<ApiResponse<{ user: Omit<User, 'created_at' | 'password_hash'> }>> {
		return apiService.post('/auth/login', credentials)
	}

	async register(userData: CreateUserDto): Promise<ApiResponse<{ user: Omit<User, 'created_at' | 'password_hash'> }>> {
		return apiService.post('/auth/register', userData)
	}

	async logout(): Promise<ApiResponse<void>> {
		return apiService.post('/auth/logout')
	}

	async getCurrentUser(): Promise<ApiResponse<{ user: Omit<User, 'created_at' | 'password_hash'> }>> {
		return apiService.get('/auth/me')
	}
}

// Export singleton instance
export const frontendAuthService = new FrontendAuthService() 