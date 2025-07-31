// Session service implementation
import { createSession, validateSession as validateToken, deleteSession } from '@/lib/auth'
import type { User } from '@/types'
import type { ISessionService } from '@/backend/interfaces/services'

export class SessionService implements ISessionService {
	async createSession(userId: number): Promise<{ token: string; response: Response; permissions: string[] }> {
		const result = await createSession(userId)
		return {
			token: result.token,
			response: result.response,
			permissions: result.permissions
		}
	}

	async validateSession(token: string): Promise<User | null> {
		const result = await validateToken(token)
		if (!result) return null
		
		// Transform the result to match our User interface
		return {
			user_id: result.user_id,
			username: result.username,
			email: result.email,
			password_hash: '', // We don't return the password hash from session validation
			is_active: result.is_active,
			created_at: new Date() // This is not available from the token, but required by interface
		}
	}

	async deleteSession(): Promise<Response> {
		return deleteSession('')
	}
} 