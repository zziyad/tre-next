// Session service implementation
import { createSession, validateSession as validateToken, deleteSession } from '@/lib/auth'
import type { User } from '@/types'
import type { ISessionService } from '@/backend/interfaces/services'

export class SessionService implements ISessionService {
	async createSession(userId: number): Promise<{ token: string }> {
		const result = await createSession(userId)
		return { token: result.token }
	}

	async validateSession(token: string): Promise<User | null> {
		const result = await validateToken(token)
		if (!result) return null
		
		// Transform the result to match our User interface
		return {
			user_id: result.user_id,
			email: result.email,
			password_hash: '', // We don't return the password hash from session validation
			name: result.name,
			surname: result.surname,
			role: result.role,
			is_active: result.is_active,
			last_login: result.last_login,
			created_at: result.created_at,
			updated_at: result.updated_at
		}
	}

	async deleteSession(): Promise<void> {
		await deleteSession('')
	}
} 