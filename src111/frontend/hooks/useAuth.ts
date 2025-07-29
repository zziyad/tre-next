'use client'

// Custom hook for authentication state management
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { frontendAuthService } from '@/frontend/services/auth.service'
import type { User, LoginDto, CreateUserDto } from '@/types'

interface AuthState {
	user: Omit<User, 'created_at' | 'password_hash'> | null
	isLoading: boolean
	error: string | null
}

interface UseAuthReturn extends AuthState {
	login: (credentials: LoginDto) => Promise<boolean>
	register: (userData: CreateUserDto) => Promise<boolean>
	logout: () => Promise<void>
	clearError: () => void
}

export function useAuth(): UseAuthReturn {
	const router = useRouter()
	const [state, setState] = useState<AuthState>({
		user: null,
		isLoading: true,
		error: null
	})

	// Check authentication status on mount
	useEffect(() => {
		const checkAuth = async () => {
			try {
				const result = await frontendAuthService.getCurrentUser()
				if (result.success && result.data) {
					setState(prev => ({
						...prev,
						user: result.data!.user,
						isLoading: false
					}))
				} else {
					setState(prev => ({
						...prev,
						user: null,
						isLoading: false
					}))
				}
			} catch (error) {
				setState(prev => ({
					...prev,
					user: null,
					isLoading: false
				}))
			}
		}

		checkAuth()
	}, [])

	const login = useCallback(async (credentials: LoginDto): Promise<boolean> => {
		setState(prev => ({ ...prev, isLoading: true, error: null }))
		
		try {
			const result = await frontendAuthService.login(credentials)
			
			if (result.success && result.data) {
				setState(prev => ({
					...prev,
					user: result.data!.user,
					isLoading: false
				}))
				router.push('/dashboard')
				return true
			} else {
				setState(prev => ({
					...prev,
					error: result.error || 'Login failed',
					isLoading: false
				}))
				return false
			}
		} catch (error) {
			setState(prev => ({
				...prev,
				error: 'Network error',
				isLoading: false
			}))
			return false
		}
	}, [router])

	const register = useCallback(async (userData: CreateUserDto): Promise<boolean> => {
		setState(prev => ({ ...prev, isLoading: true, error: null }))
		
		try {
			const result = await frontendAuthService.register(userData)
			
			if (result.success && result.data) {
				setState(prev => ({
					...prev,
					user: result.data!.user,
					isLoading: false
				}))
				router.push('/dashboard')
				return true
			} else {
				setState(prev => ({
					...prev,
					error: result.error || 'Registration failed',
					isLoading: false
				}))
				return false
			}
		} catch (error) {
			setState(prev => ({
				...prev,
				error: 'Network error',
				isLoading: false
			}))
			return false
		}
	}, [router])

	const logout = useCallback(async (): Promise<void> => {
		setState(prev => ({ ...prev, isLoading: true }))
		
		try {
			await frontendAuthService.logout()
			setState({
				user: null,
				isLoading: false,
				error: null
			})
			router.push('/login')
		} catch (error) {
			// Even if logout fails, clear local state
			setState({
				user: null,
				isLoading: false,
				error: null
			})
			router.push('/login')
		}
	}, [router])

	const clearError = useCallback(() => {
		setState(prev => ({ ...prev, error: null }))
	}, [])

	return {
		...state,
		login,
		register,
		logout,
		clearError
	}
} 