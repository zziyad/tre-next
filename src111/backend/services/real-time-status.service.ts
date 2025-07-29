import { prisma } from '@/lib/prisma'
import type { RealTimeStatus } from '@/types'

export interface CreateRealTimeStatusDto {
	eventId: number
	vehicleCode: string
	hotelName: string
	destination: string
	status: string
}

export interface UpdateRealTimeStatusDto {
	vehicleCode?: string
	hotelName?: string
	destination?: string
	status?: string
}

class RealTimeStatusService {
	async createStatus(data: CreateRealTimeStatusDto): Promise<RealTimeStatus> {
		console.log('Backend service - Creating status with data:', data)
		
		const status = await prisma.realTimeStatus.create({
			data: {
				event_id: data.eventId,
				vehicle_code: data.vehicleCode,
				hotel_name: data.hotelName,
				destination: data.destination,
				status: data.status,
			},
			include: {
				event: {
					select: {
						name: true,
					},
				},
			},
		})

		console.log('Backend service - Successfully created status in database:', status)
		return this.mapToRealTimeStatus(status)
	}

	async getStatuses(eventId: number): Promise<RealTimeStatus[]> {
		const statuses = await prisma.realTimeStatus.findMany({
			where: {
				event_id: eventId,
			},
			include: {
				event: {
					select: {
						name: true,
					},
				},
			},
			orderBy: {
				updated_at: 'desc',
			},
		})

		return statuses.map(this.mapToRealTimeStatus)
	}

	async getStatus(statusId: number): Promise<RealTimeStatus | null> {
		const status = await prisma.realTimeStatus.findUnique({
			where: { status_id: statusId },
			include: {
				event: {
					select: {
						name: true,
					},
				},
			},
		})

		return status ? this.mapToRealTimeStatus(status) : null
	}

	async updateStatus(statusId: number, data: UpdateRealTimeStatusDto): Promise<RealTimeStatus> {
		const status = await prisma.realTimeStatus.update({
			where: { status_id: statusId },
			data: {
				vehicle_code: data.vehicleCode,
				hotel_name: data.hotelName,
				destination: data.destination,
				status: data.status,
				updated_at: new Date(),
			},
			include: {
				event: {
					select: {
						name: true,
					},
				},
			},
		})

		return this.mapToRealTimeStatus(status)
	}

	async deleteStatus(statusId: number): Promise<void> {
		await prisma.realTimeStatus.delete({
			where: { status_id: statusId },
		})
	}

	async getEventData(eventId: number) {
		const [flets, hotels, destinations] = await Promise.all([
			prisma.flet.findMany({
				where: { event_id: eventId },
				select: { flet_id: true, name: true },
			}),
			prisma.hotel.findMany({
				where: { event_id: eventId },
				select: { hotel_id: true, name: true },
			}),
			prisma.destination.findMany({
				where: { event_id: eventId },
				select: { destination_id: true, name: true },
			}),
		])

		return {
			flets,
			hotels,
			destinations,
		}
	}

	private mapToRealTimeStatus(status: Record<string, unknown>): RealTimeStatus {
		return {
			status_id: status.status_id as number,
			event_id: status.event_id as number,
			vehicle_code: status.vehicle_code as string,
			hotel_name: status.hotel_name as string,
			destination: status.destination as string,
			status: status.status as string,
			updated_at: status.updated_at as Date,
		}
	}
}

export const realTimeStatusService = new RealTimeStatusService() 