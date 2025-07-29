// Frontend API service for HTTP communication
import type { ApiResponse } from '@/types'

export class ApiService {
	private baseUrl: string

	constructor(baseUrl = '') {
		this.baseUrl = baseUrl
	}

	private async request<T>(
		endpoint: string,
		options: RequestInit = {}
	): Promise<ApiResponse<T>> {
		try {
			const url = `${this.baseUrl}${endpoint}`
			console.log('ApiService - Making request to:', url);
			console.log('ApiService - Request options:', { method: options.method, body: options.body });
			
			const config: RequestInit = {
				headers: {
					'Content-Type': 'application/json',
					...options.headers
				},
				...options
			}

			const response = await fetch(url, config)
			console.log('ApiService - Response status:', response.status);
			const data = await response.json()
			console.log('ApiService - Response data:', data);

			if (!response.ok) {
				console.log('ApiService - Request failed:', response.status, data);
				return {
					success: false,
					error: data.error || `HTTP ${response.status}: ${response.statusText}`
				}
			}

			return data
		} catch (error) {
			console.error('ApiService - Network error:', error);
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Network error'
			}
		}
	}

	async get<T>(endpoint: string): Promise<ApiResponse<T>> {
		return this.request<T>(endpoint, { method: 'GET' })
	}

	async post<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
		return this.request<T>(endpoint, {
			method: 'POST',
			body: data ? JSON.stringify(data) : undefined
		})
	}

	async put<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
		return this.request<T>(endpoint, {
			method: 'PUT',
			body: data ? JSON.stringify(data) : undefined
		})
	}

	async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
		return this.request<T>(endpoint, { method: 'DELETE' })
	}
}

// Export singleton instance
export const apiService = new ApiService('/api') 