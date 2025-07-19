// Hotel repository implementation
import type { Hotel } from '@/types'
import type { IHotelRepository } from '@/backend/interfaces/repositories'
import { prisma } from '@/lib/prisma'

export class HotelRepository implements IHotelRepository {
	async findById(id: number): Promise<Hotel | null> {
		const hotel = await prisma.hotel.findUnique({
			where: { hotel_id: id }
		})
		return hotel
	}

	async create(data: { name: string; description?: string; event_id: number }): Promise<Hotel> {
		const hotel = await prisma.hotel.create({
			data: {
				name: data.name,
				description: data.description,
				event_id: data.event_id,
				created_at: new Date()
			}
		})
		return hotel
	}

	async createMany(eventId: number, hotels: Array<{ name: string; description?: string }>): Promise<Hotel[]> {
		const createdHotels = await Promise.all(
			hotels.map(hotel => this.create({
				...hotel,
				event_id: eventId
			}))
		)
		return createdHotels
	}

	async update(id: number, data: Partial<{ name: string; description?: string; event_id: number }>): Promise<Hotel | null> {
		try {
			const hotel = await prisma.hotel.update({
				where: { hotel_id: id },
				data: {
					...(data.name && { name: data.name }),
					...(data.description !== undefined && { description: data.description })
				}
			})
			return hotel
		} catch {
			return null
		}
	}

	async delete(id: number): Promise<boolean> {
		try {
			await prisma.hotel.delete({
				where: { hotel_id: id }
			})
			return true
		} catch {
			return false
		}
	}

	async findAll(): Promise<Hotel[]> {
		const hotels = await prisma.hotel.findMany({
			orderBy: { created_at: 'desc' }
		})
		return hotels
	}

	async findByEventId(eventId: number): Promise<Hotel[]> {
		const hotels = await prisma.hotel.findMany({
			where: { event_id: eventId },
			orderBy: { created_at: 'desc' }
		})
		return hotels
	}
} 