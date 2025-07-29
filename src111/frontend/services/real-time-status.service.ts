import { apiService } from './api.service'
import type { RealTimeStatus } from '@/types'

export interface CreateRealTimeStatusData {
	eventId: number
	vehicleCode: string
	hotelName: string
	destination: string
	status: string
}

export interface EventData {
	flets: Array<{ flet_id: number; name: string }>
	hotels: Array<{ hotel_id: number; name: string }>
	destinations: Array<{ destination_id: number; name: string }>
}

class RealTimeStatusService {
	async createStatus(data: CreateRealTimeStatusData): Promise<RealTimeStatus> {
		const response = await apiService.post<{ data: RealTimeStatus }>('/real-time-status', data)
		if (!response.success || !response.data) {
			throw new Error(response.error || 'Failed to create status')
		}
		return response.data.data
	}

	async getStatuses(eventId: number): Promise<RealTimeStatus[]> {
		const params = new URLSearchParams()
		params.append('eventId', eventId.toString())
		
		const response = await apiService.get<{ statuses: RealTimeStatus[] }>(`/real-time-status?${params.toString()}`)
		if (!response.success || !response.data) {
			throw new Error(response.error || 'Failed to fetch statuses')
		}
		return response.data.statuses
	}

	async getStatus(statusId: number): Promise<RealTimeStatus> {
		const response = await apiService.get<RealTimeStatus>(`/real-time-status/${statusId}`)
		if (!response.success || !response.data) {
			throw new Error(response.error || 'Failed to fetch status')
		}
		return response.data
	}

	async updateStatus(statusId: number, data: Partial<CreateRealTimeStatusData>): Promise<RealTimeStatus> {
		const response = await apiService.put<{ data: RealTimeStatus }>(`/real-time-status/${statusId}`, data)
		if (!response.success || !response.data) {
			throw new Error(response.error || 'Failed to update status')
		}
		return response.data.data
	}

	async deleteStatus(statusId: number): Promise<void> {
		const response = await apiService.delete(`/real-time-status/${statusId}`)
		if (!response.success) {
			throw new Error(response.error || 'Failed to delete status')
		}
	}

	async getEventData(eventId: number): Promise<EventData> {
		const response = await apiService.get<{ data: EventData }>(`/real-time-status/event-data/${eventId}`)
		if (!response.success || !response.data) {
			throw new Error(response.error || 'Failed to fetch event data')
		}
		return response.data.data
	}
}

export const realTimeStatusService = new RealTimeStatusService() 