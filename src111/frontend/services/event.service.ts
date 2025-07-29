// Frontend event service
import { apiService } from './api.service'
import type { 
	Event, 
	CreateEventDto, 
	EventWithDetails,
	ApiResponse 
} from '@/types'

export class FrontendEventService {
	async getUserEvents(): Promise<ApiResponse<{ events: Event[] }>> {
		return apiService.get('/events')
	}

	async createEvent(eventData: CreateEventDto): Promise<ApiResponse<Event>> {
		return apiService.post('/events/create', eventData)
	}

	async getEvent(eventId: number): Promise<ApiResponse<Event>> {
		return apiService.get(`/events/${eventId}`)
	}

	async getEventWithDetails(eventId: number): Promise<ApiResponse<EventWithDetails>> {
		return apiService.get(`/events/${eventId}/details`)
	}

	async updateEvent(eventId: number, data: Partial<CreateEventDto>): Promise<ApiResponse<Event>> {
		return apiService.put(`/events/${eventId}`, data)
	}

	async deleteEvent(eventId: number): Promise<ApiResponse<void>> {
		return apiService.delete(`/events/${eventId}`)
	}

	async getEventStats(eventId: number): Promise<ApiResponse<unknown>> {
		return apiService.get(`/events/${eventId}/stats`)
	}
}

// Export singleton instance
export const frontendEventService = new FrontendEventService() 