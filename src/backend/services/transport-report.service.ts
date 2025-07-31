import { prisma } from '@/lib/prisma'
import type { TransportReport, CreateTransportReportDto } from '@/types'

export interface ITransportReportService {
	createReport(data: CreateTransportReportDto): Promise<TransportReport>
	getReports(eventId: number, userId?: number): Promise<TransportReport[]>
	getReport(reportId: number): Promise<TransportReport>
	updateReportStatus(reportId: number, status: string): Promise<TransportReport>
}

class TransportReportService implements ITransportReportService {
	async createReport(data: CreateTransportReportDto): Promise<TransportReport> {
		const report = await prisma.transportReport.create({
			data: {
				event_id: data.eventId,
				user_id: data.userId,
				name: data.name,
				surname: data.surname,
				email: data.email,
				report_date: data.reportDate,
				tasks_completed: data.tasksCompleted || null,
				meetings_attended: data.meetingsAttended || null,
				issues_encountered: data.issuesEncountered || null,
				pending_tasks: data.pendingTasks || null,
				support_notes: data.supportNotes || null,
				status: 'pending',
			},
			include: {
				User: {
					select: {
						username: true,
					},
				},
				Event: {
					select: {
						name: true,
					},
				},
			},
		})

		return this.mapToTransportReport(report)
	}

	async getReports(eventId: number, userId?: number): Promise<TransportReport[]> {
		const where: any = { event_id: eventId }
		if (userId) {
			where.user_id = userId
		}

		const reports = await prisma.transportReport.findMany({
			where,
			include: {
				User: {
					select: {
						username: true,
					},
				},
				Event: {
					select: {
						name: true,
					},
				},
			},
			orderBy: {
				submitted_at: 'desc',
			},
		})

		return reports.map(report => this.mapToTransportReport(report))
	}

	async getReport(reportId: number): Promise<TransportReport> {
		const report = await prisma.transportReport.findUnique({
			where: { report_id: reportId },
			include: {
				User: {
					select: {
						username: true,
					},
				},
				Event: {
					select: {
						name: true,
					},
				},
			},
		})

		if (!report) {
			throw new Error('Transport report not found')
		}

		return this.mapToTransportReport(report)
	}

	async updateReportStatus(reportId: number, status: string): Promise<TransportReport> {
		const report = await prisma.transportReport.update({
			where: { report_id: reportId },
			data: { status },
			include: {
				User: {
					select: {
						username: true,
					},
				},
				Event: {
					select: {
						name: true,
					},
				},
			},
		})

		return this.mapToTransportReport(report)
	}

	private mapToTransportReport(report: any): TransportReport {
		return {
			report_id: report.report_id,
			event_id: report.event_id,
			user_id: report.user_id,
			name: report.name,
			surname: report.surname,
			email: report.email,
			report_date: report.report_date,
			tasks_completed: report.tasks_completed,
			meetings_attended: report.meetings_attended,
			issues_encountered: report.issues_encountered,
			pending_tasks: report.pending_tasks,
			support_notes: report.support_notes,
			status: report.status,
			submitted_at: report.submitted_at,
			user: report.user,
			event: report.event,
		}
	}
}

export const transportReportService = new TransportReportService() 