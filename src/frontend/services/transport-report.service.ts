import { apiService } from './api.service'
import type { TransportReport, CreateTransportReportDto } from '@/types'

export interface CreateTransportReportData {
	name: string
	surname: string
	email: string
	reportDate: string
	tasksCompleted?: string
	meetingsAttended?: string
	issuesEncountered?: string
	pendingTasks?: string
	supportNotes?: string
	eventId: number
	userId: number
}

class TransportReportService {
	async createReport(data: CreateTransportReportData): Promise<TransportReport> {
		const response = await apiService.post<TransportReport>('/transport-reports', data)
		if (!response.success || !response.data) {
			throw new Error(response.error || 'Failed to create report')
		}
		return response.data
	}

	async getReports(eventId: number, userId?: number): Promise<TransportReport[]> {
		const params = new URLSearchParams()
		params.append('eventId', eventId.toString())
		if (userId) {
			params.append('userId', userId.toString())
		}
		
		const response = await apiService.get<TransportReport[]>(`/transport-reports?${params.toString()}`)
		if (!response.success || !response.data) {
			throw new Error(response.error || 'Failed to fetch reports')
		}
		return response.data
	}

	async getReport(reportId: number): Promise<TransportReport> {
		const response = await apiService.get<TransportReport>(`/transport-reports/${reportId}`)
		if (!response.success || !response.data) {
			throw new Error(response.error || 'Failed to fetch report')
		}
		return response.data
	}

	async updateReportStatus(reportId: number, status: string): Promise<TransportReport> {
		const response = await apiService.put<TransportReport>(`/transport-reports/${reportId}`, { status })
		if (!response.success || !response.data) {
			throw new Error(response.error || 'Failed to update report status')
		}
		return response.data
	}
}

export const transportReportService = new TransportReportService() 