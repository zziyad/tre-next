import { apiService } from './api.service'
import type { RealTimeStatus } from '@/types'

export interface CreateRealTimeStatusData {
	eventId: number
	vehicleCode: string
	hotelName: string
	destination: string
	status: string
	color: string
}

export interface EventData {
	flets: Array<{ flet_id: number; name: string }>
	hotels: Array<{ hotel_id: number; name: string }>
	destinations: Array<{ destination_id: number; name: string }>
}

export interface UpdateRealTimeStatusData extends CreateRealTimeStatusData {}

class RealTimeStatusService {
	async createStatus(data: CreateRealTimeStatusData): Promise<RealTimeStatus> {
		const response = await apiService.post<RealTimeStatus>('/real-time-status', data)
		if (!response.success || !response.data) {
			throw new Error(response.error || 'Failed to create status')
		}
		return response.data
	}

	async getStatuses(eventId: number): Promise<RealTimeStatus[]> {
		const response = await apiService.get<RealTimeStatus[]>(`/real-time-status?eventId=${eventId}`)
		if (!response.success || !response.data) {
			throw new Error(response.error || 'Failed to fetch statuses')
		}
		return response.data
	}

	async updateStatus(statusId: number, data: UpdateRealTimeStatusData): Promise<RealTimeStatus> {
		const response = await apiService.put<RealTimeStatus>(`/real-time-status/${statusId}`, data)
		if (!response.success || !response.data) {
			throw new Error(response.error || 'Failed to update status')
		}
		return response.data
	}

	async deleteStatus(statusId: number): Promise<void> {
		const response = await apiService.delete(`/real-time-status/${statusId}`)
		if (!response.success) {
			throw new Error(response.error || 'Failed to delete status')
		}
	}

	async getEventData(eventId: number): Promise<EventData> {
		const response = await apiService.get<EventData>(`/events/${eventId}/details`)
		if (!response.success || !response.data) {
			throw new Error(response.error || 'Failed to fetch event data')
		}
		return response.data
	}
}

export const realTimeStatusService = new RealTimeStatusService() 