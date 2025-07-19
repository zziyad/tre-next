// Event service implementation
import type { 
	Event, 
	CreateEventDto,
	EventWithDetails,
	ApiResponse
} from '@/types'
import type { IEventService } from '@/backend/interfaces/services'
import type { 
	IEventRepository, 
	IFletRepository, 
	IHotelRepository, 
	IDestinationRepository 
} from '@/backend/interfaces/repositories'

export class EventService implements IEventService {
	constructor(
		private eventRepository: IEventRepository,
		private fletRepository: IFletRepository,
		private hotelRepository: IHotelRepository,
		private destinationRepository: IDestinationRepository
	) {}

	async createEvent(eventData: CreateEventDto, userId: number): Promise<ApiResponse<Event>> {
		try {
			// Create the event
			const event = await this.eventRepository.create(eventData)

			// Add user to event
			await this.eventRepository.addUserToEvent(event.event_id, userId)

			// Create related entities
			if (eventData.flets.length > 0) {
				await this.fletRepository.createMany(event.event_id, eventData.flets)
			}

			if (eventData.hotels.length > 0) {
				await this.hotelRepository.createMany(event.event_id, eventData.hotels)
			}

			if (eventData.destinations.length > 0) {
				await this.destinationRepository.createMany(event.event_id, eventData.destinations)
			}

			return {
				success: true,
				data: event,
				message: 'Event created successfully'
			}
		} catch (error) {
			return {
				success: false,
				error: 'Failed to create event'
			}
		}
	}

	async getEventById(id: number): Promise<ApiResponse<Event>> {
		try {
			const event = await this.eventRepository.findById(id)
			if (!event) {
				return {
					success: false,
					error: 'Event not found'
				}
			}

			return {
				success: true,
				data: event
			}
		} catch (error) {
			return {
				success: false,
				error: 'Failed to fetch event'
			}
		}
	}

	async getEventWithDetails(id: number): Promise<ApiResponse<EventWithDetails>> {
		try {
			const event = await this.eventRepository.findEventWithDetails(id)
			if (!event) {
				return {
					success: false,
					error: 'Event not found'
				}
			}

			return {
				success: true,
				data: event
			}
		} catch (error) {
			return {
				success: false,
				error: 'Failed to fetch event details'
			}
		}
	}

	async updateEvent(id: number, data: Partial<CreateEventDto>): Promise<ApiResponse<Event>> {
		try {
			const event = await this.eventRepository.update(id, data)
			if (!event) {
				return {
					success: false,
					error: 'Event not found or update failed'
				}
			}

			return {
				success: true,
				data: event,
				message: 'Event updated successfully'
			}
		} catch (error) {
			return {
				success: false,
				error: 'Failed to update event'
			}
		}
	}

	async deleteEvent(id: number): Promise<ApiResponse<void>> {
		try {
			const deleted = await this.eventRepository.delete(id)
			if (!deleted) {
				return {
					success: false,
					error: 'Event not found or delete failed'
				}
			}

			return {
				success: true,
				message: 'Event deleted successfully'
			}
		} catch (error) {
			return {
				success: false,
				error: 'Failed to delete event'
			}
		}
	}

	async getUserEvents(userId: number): Promise<ApiResponse<Event[]>> {
		try {
			const events = await this.eventRepository.findUserEvents(userId)
			return {
				success: true,
				data: events
			}
		} catch (error) {
			return {
				success: false,
				error: 'Failed to fetch user events'
			}
		}
	}

	async addUserToEvent(eventId: number, userId: number): Promise<ApiResponse<void>> {
		try {
			const added = await this.eventRepository.addUserToEvent(eventId, userId)
			if (!added) {
				return {
					success: false,
					error: 'Failed to add user to event'
				}
			}

			return {
				success: true,
				message: 'User added to event successfully'
			}
		} catch (error) {
			return {
				success: false,
				error: 'Failed to add user to event'
			}
		}
	}

	async removeUserFromEvent(eventId: number, userId: number): Promise<ApiResponse<void>> {
		try {
			const removed = await this.eventRepository.removeUserFromEvent(eventId, userId)
			if (!removed) {
				return {
					success: false,
					error: 'Failed to remove user from event'
				}
			}

			return {
				success: true,
				message: 'User removed from event successfully'
			}
		} catch (error) {
			return {
				success: false,
				error: 'Failed to remove user from event'
			}
		}
	}
} 