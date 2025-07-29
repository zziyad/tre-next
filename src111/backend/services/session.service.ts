// Session service implementation
import { createSession, validateSession as validateToken, deleteSession } from '@/lib/auth'
import type { User } from '@/types'
import type { ISessionService } from '@/backend/interfaces/services'

export class SessionService implements ISessionService {
	async createSession(userId: number): Promise<{ token: string; response: Response }> {
		return createSession(userId)
	}

	async validateSession(token: string): Promise<User | null> {
		const result = await validateToken(token)
		if (!result) return null
		
		// Transform the result to match our User interface
		return {
			user_id: result.user_id,
			username: result.username,
			password_hash: '', // We don't return the password hash from session validation
			role: result.role,
			created_at: new Date() // This is not available from the token, but required by interface
		} as User
	}

	async deleteSession(): Promise<Response> {
		return deleteSession('')
	}
} 