import type { RealTimeStatus } from '@/types'
import type { IRealTimeStatusRepository } from '@/backend/interfaces/repositories'
import { prisma } from '@/lib/prisma'

export class RealTimeStatusRepository implements IRealTimeStatusRepository {
	async findById(id: number): Promise<RealTimeStatus | null> {
		const status = await prisma.realTimeStatus.findUnique({
			where: { status_id: id }
		})
		return status ? {
			...status,
			guest_name: status.guest_name || undefined
		} : null
	}

	async create(data: Omit<RealTimeStatus, 'status_id' | 'updated_at'>): Promise<RealTimeStatus> {
		const status = await prisma.realTimeStatus.create({
			data: {
				event_id: data.event_id,
				vehicle_code: data.vehicle_code,
				hotel_name: data.hotel_name,
				destination: data.destination,
				guest_name: data.guest_name,
				status: data.status,
				color: data.color,
				updated_at: new Date()
			}
		})
		return {
			...status,
			guest_name: status.guest_name || undefined
		}
	}

	async update(id: number, data: Partial<Omit<RealTimeStatus, 'status_id' | 'updated_at'>>): Promise<RealTimeStatus | null> {
		try {
			const status = await prisma.realTimeStatus.update({
				where: { status_id: id },
				data: {
					...(data.vehicle_code && { vehicle_code: data.vehicle_code }),
					...(data.hotel_name && { hotel_name: data.hotel_name }),
					...(data.destination && { destination: data.destination }),
					...(data.guest_name !== undefined && { guest_name: data.guest_name }),
					...(data.status && { status: data.status }),
					...(data.color && { color: data.color }),
					updated_at: new Date()
				}
			})
			return {
				...status,
				guest_name: status.guest_name || undefined
			}
		} catch {
			return null
		}
	}

	async delete(id: number): Promise<boolean> {
		try {
			await prisma.realTimeStatus.delete({
				where: { status_id: id }
			})
			return true
		} catch {
			return false
		}
	}

	async findAll(): Promise<RealTimeStatus[]> {
		const statuses = await prisma.realTimeStatus.findMany({
			orderBy: { updated_at: 'desc' }
		})
		return statuses.map(status => ({
			...status,
			guest_name: status.guest_name || undefined
		}))
	}

	async findByEventId(eventId: number): Promise<RealTimeStatus[]> {
		const statuses = await prisma.realTimeStatus.findMany({
			where: { event_id: eventId },
			orderBy: { updated_at: 'desc' }
		})
		return statuses.map(status => ({
			...status,
			guest_name: status.guest_name || undefined
		}))
	}

	async findByStatus(status: string): Promise<RealTimeStatus[]> {
		const statuses = await prisma.realTimeStatus.findMany({
			where: { status },
			orderBy: { updated_at: 'desc' }
		})
		return statuses.map(status => ({
			...status,
			guest_name: status.guest_name || undefined
		}))
	}

	async updateStatus(statusId: number, status: string): Promise<RealTimeStatus | null> {
		try {
			const updatedStatus = await prisma.realTimeStatus.update({
				where: { status_id: statusId },
				data: {
					status,
					color: status === 'arrived' ? 'red' : 'green',
					updated_at: new Date()
				}
			})
			return {
				...updatedStatus,
				guest_name: updatedStatus.guest_name || undefined
			}
		} catch {
			return null
		}
	}
} 