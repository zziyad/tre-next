import type { RealTimeStatus } from '@/types'
import type { IRealTimeStatusRepository } from '@/backend/interfaces/repositories'
import type { IAuthService } from '@/backend/interfaces/services'

export interface CreateRealTimeStatusDto {
	eventId: number
	vehicleCode: string
	hotelName: string
	destination: string
	status: string
	color: string
}

export interface UpdateRealTimeStatusDto {
	vehicleCode: string
	hotelName: string
	destination: string
	status: string
	color: string
}

export interface ApiResponse<T> {
	success: boolean
	data?: T
	error?: string
}

class RealTimeStatusService {
	constructor(
		private realTimeStatusRepository: IRealTimeStatusRepository,
		private authService: IAuthService
	) {}

	async createStatus(data: CreateRealTimeStatusDto): Promise<ApiResponse<RealTimeStatus>> {
		try {
			// Validate status values
			if (!['dispatched', 'arrived'].includes(data.status)) {
				return {
					success: false,
					error: 'Invalid status. Must be "dispatched" or "arrived"'
				}
			}

			// Validate color values
			if (!['red', 'green'].includes(data.color)) {
				return {
					success: false,
					error: 'Invalid color. Must be "red" or "green"'
				}
			}

			// Ensure color matches status
			const expectedColor = data.status === 'arrived' ? 'red' : 'green'
			if (data.color !== expectedColor) {
				return {
					success: false,
					error: `Color must be "${expectedColor}" for status "${data.status}"`
				}
			}

			const status = await this.realTimeStatusRepository.create({
				event_id: data.eventId,
				vehicle_code: data.vehicleCode,
				hotel_name: data.hotelName,
				destination: data.destination,
				status: data.status,
				color: data.color,
			})

			return {
				success: true,
				data: status
			}
		} catch (error) {
			console.error('Error creating real-time status:', error)
			return {
				success: false,
				error: 'Failed to create real-time status'
			}
		}
	}

	async getStatuses(eventId: number): Promise<ApiResponse<RealTimeStatus[]>> {
		try {
			const statuses = await this.realTimeStatusRepository.findByEventId(eventId)
			return {
				success: true,
				data: statuses
			}
		} catch (error) {
			console.error('Error fetching real-time statuses:', error)
			return {
				success: false,
				error: 'Failed to fetch real-time statuses'
			}
		}
	}

	async updateStatus(statusId: number, data: UpdateRealTimeStatusDto): Promise<ApiResponse<RealTimeStatus>> {
		try {
			// Validate status values
			if (!['dispatched', 'arrived'].includes(data.status)) {
				return {
					success: false,
					error: 'Invalid status. Must be "dispatched" or "arrived"'
				}
			}

			// Validate color values
			if (!['red', 'green'].includes(data.color)) {
				return {
					success: false,
					error: 'Invalid color. Must be "red" or "green"'
				}
			}

			// Ensure color matches status
			const expectedColor = data.status === 'arrived' ? 'red' : 'green'
			if (data.color !== expectedColor) {
				return {
					success: false,
					error: `Color must be "${expectedColor}" for status "${data.status}"`
				}
			}

			const status = await this.realTimeStatusRepository.update(statusId, {
				vehicle_code: data.vehicleCode,
				hotel_name: data.hotelName,
				destination: data.destination,
				status: data.status,
				color: data.color,
			})

			if (!status) {
				return {
					success: false,
					error: 'Status not found'
				}
			}

			return {
				success: true,
				data: status
			}
		} catch (error) {
			console.error('Error updating real-time status:', error)
			return {
				success: false,
				error: 'Failed to update real-time status'
			}
		}
	}

	async deleteStatus(statusId: number): Promise<ApiResponse<void>> {
		try {
			const success = await this.realTimeStatusRepository.delete(statusId)
			if (!success) {
				return {
					success: false,
					error: 'Status not found'
				}
			}

			return {
				success: true
			}
		} catch (error) {
			console.error('Error deleting real-time status:', error)
			return {
				success: false,
				error: 'Failed to delete real-time status'
			}
		}
	}

	async getStatusById(statusId: number): Promise<ApiResponse<RealTimeStatus>> {
		try {
			const status = await this.realTimeStatusRepository.findById(statusId)
			if (!status) {
				return {
					success: false,
					error: 'Status not found'
				}
			}

			return {
				success: true,
				data: status
			}
		} catch (error) {
			console.error('Error fetching real-time status:', error)
			return {
				success: false,
				error: 'Failed to fetch real-time status'
			}
		}
	}
}

export { RealTimeStatusService } 