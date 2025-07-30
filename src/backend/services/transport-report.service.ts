// Transport report service implementation
import type { 
	TransportReport, 
	CreateTransportReportDto, 
	ApiResponse,
	PaginatedResponse 
} from '@/types'
import type { ITransportReportService } from '@/backend/interfaces/services'
import type { ITransportReportRepository } from '@/backend/interfaces/repositories'

export class TransportReportService implements ITransportReportService {
	constructor(
		private transportReportRepository: ITransportReportRepository
	) {}

	async createTransportReport(data: CreateTransportReportDto): Promise<ApiResponse<TransportReport>> {
		try {
			const report = await this.transportReportRepository.create(data)

			return {
				success: true,
				data: report
			}
		} catch (error) {
			console.error('TransportReportService: Error creating transport report:', error)
			return {
				success: false,
				error: 'Failed to create transport report'
			}
		}
	}

	async getTransportReports(eventId: number): Promise<ApiResponse<TransportReport[]>> {
		try {
			const reports = await this.transportReportRepository.findByEventId(eventId)
			return {
				success: true,
				data: reports
			}
		} catch (error) {
			return {
				success: false,
				error: 'Failed to fetch transport reports'
			}
		}
	}

	async getUserTransportReports(userId: number): Promise<ApiResponse<TransportReport[]>> {
		try {
			const reports = await this.transportReportRepository.findByUserId(userId)
			return {
				success: true,
				data: reports
			}
		} catch (error) {
			return {
				success: false,
				error: 'Failed to fetch user transport reports'
			}
		}
	}

	async updateTransportReport(reportId: number, data: Partial<CreateTransportReportDto>): Promise<ApiResponse<TransportReport>> {
		try {
			const report = await this.transportReportRepository.update(reportId, {
				...(data.name && { name: data.name }),
				...(data.surname && { surname: data.surname }),
				...(data.email && { email: data.email }),
				...(data.reportDate && { report_date: data.reportDate }),
				...(data.tasksCompleted && { tasks_completed: data.tasksCompleted }),
				...(data.meetingsAttended && { meetings_attended: data.meetingsAttended }),
				...(data.issuesEncountered && { issues_encountered: data.issuesEncountered }),
				...(data.pendingTasks && { pending_tasks: data.pendingTasks }),
				...(data.supportNotes && { support_notes: data.supportNotes })
		})

		if (!report) {
				return {
					success: false,
					error: 'Transport report not found'
				}
			}

			return {
				success: true,
				data: report
			}
		} catch (error) {
			return {
				success: false,
				error: 'Failed to update transport report'
			}
		}
	}

	async deleteTransportReport(reportId: number): Promise<ApiResponse<void>> {
		try {
			const success = await this.transportReportRepository.delete(reportId)
			if (!success) {
				return {
					success: false,
					error: 'Transport report not found'
				}
			}

			return {
				success: true,
				message: 'Transport report deleted successfully'
			}
		} catch (error) {
		return {
				success: false,
				error: 'Failed to delete transport report'
			}
		}
	}
} 