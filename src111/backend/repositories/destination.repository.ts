// Destination repository implementation
import type { Destination } from '@/types'
import type { IDestinationRepository } from '@/backend/interfaces/repositories'
import { prisma } from '@/lib/prisma'

export class DestinationRepository implements IDestinationRepository {
	async findById(id: number): Promise<Destination | null> {
		const destination = await prisma.destination.findUnique({
			where: { destination_id: id }
		})
		return destination
	}

	async create(data: { name: string; description?: string; event_id: number }): Promise<Destination> {
		const destination = await prisma.destination.create({
			data: {
				name: data.name,
				description: data.description,
				event_id: data.event_id,
				created_at: new Date()
			}
		})
		return destination
	}

	async createMany(eventId: number, destinations: Array<{ name: string; description?: string }>): Promise<Destination[]> {
		const createdDestinations = await Promise.all(
			destinations.map(destination => this.create({
				...destination,
				event_id: eventId
			}))
		)
		return createdDestinations
	}

	async update(id: number, data: Partial<{ name: string; description?: string; event_id: number }>): Promise<Destination | null> {
		try {
			const destination = await prisma.destination.update({
				where: { destination_id: id },
				data: {
					...(data.name && { name: data.name }),
					...(data.description !== undefined && { description: data.description })
				}
			})
			return destination
		} catch {
			return null
		}
	}

	async delete(id: number): Promise<boolean> {
		try {
			await prisma.destination.delete({
				where: { destination_id: id }
			})
			return true
		} catch {
			return false
		}
	}

	async findAll(): Promise<Destination[]> {
		const destinations = await prisma.destination.findMany({
			orderBy: { created_at: 'desc' }
		})
		return destinations
	}

	async findByEventId(eventId: number): Promise<Destination[]> {
		const destinations = await prisma.destination.findMany({
			where: { event_id: eventId },
			orderBy: { created_at: 'desc' }
		})
		return destinations
	}
} 