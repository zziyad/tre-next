// Event repository implementation
import type { Event, CreateEventDto, EventWithDetails } from '@/types'
import type { IEventRepository } from '@/backend/interfaces/repositories'
import { prisma } from '@/lib/prisma'

export class EventRepository implements IEventRepository {
	async findById(id: number): Promise<Event | null> {
		const event = await prisma.event.findUnique({
			where: { event_id: id }
		})
		return event
	}

	async findEventWithDetails(eventId: number): Promise<EventWithDetails | null> {
		const event = await prisma.event.findUnique({
			where: { event_id: eventId },
			include: {
				flets: true,
				hotels: true,
				destinations: true,
				flight_schedules: true,
				transport_reports: true,
				realtime_statuses: true
			}
		})
		return event as EventWithDetails | null
	}

	async create(data: CreateEventDto): Promise<Event> {
		const event = await prisma.event.create({
			data: {
				name: data.name,
				start_date: data.start_date ? new Date(data.start_date) : null,
				end_date: data.end_date ? new Date(data.end_date) : null,
				description: data.description,
				created_at: new Date()
			}
		})
		return event
	}

	async update(id: number, data: Partial<CreateEventDto>): Promise<Event | null> {
		try {
			const event = await prisma.event.update({
				where: { event_id: id },
				data: {
					...(data.name && { name: data.name }),
					...(data.start_date && { start_date: new Date(data.start_date) }),
					...(data.end_date && { end_date: new Date(data.end_date) }),
					...(data.description !== undefined && { description: data.description })
				}
			})
			return event
		} catch {
			return null
		}
	}

	async delete(id: number): Promise<boolean> {
		try {
			await prisma.event.delete({
				where: { event_id: id }
			})
			return true
		} catch {
			return false
		}
	}

	async findAll(): Promise<Event[]> {
		const events = await prisma.event.findMany({
			orderBy: { created_at: 'desc' }
		})
		return events
	}

	async findUserEvents(userId: number): Promise<Event[]> {
		const eventUsers = await prisma.eventUser.findMany({
			where: { user_id: userId },
			include: { event: true }
		})
		return eventUsers.map((eu) => eu.event)
	}

	async addUserToEvent(eventId: number, userId: number): Promise<boolean> {
		try {
			await prisma.eventUser.create({
				data: {
					event_id: eventId,
					user_id: userId
				}
			})
			return true
		} catch {
			return false
		}
	}

	async removeUserFromEvent(eventId: number, userId: number): Promise<boolean> {
		try {
			await prisma.eventUser.delete({
				where: {
					event_id_user_id: {
						event_id: eventId,
						user_id: userId
					}
				}
			})
			return true
		} catch {
			return false
		}
	}
} 