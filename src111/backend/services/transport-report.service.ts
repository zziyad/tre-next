import { prisma } from '@/lib/prisma'
import type { TransportReport } from '@/types'

export interface CreateTransportReportDto {
	name: string
	email: string
	reportDate: Date
	tasksCompleted?: string
	meetingsAttended?: string
	issuesEncountered?: string
	pendingTasks?: string
	supportNotes?: string
	eventId: number
	userId: number
}

export interface UpdateTransportReportDto {
	status?: string
}

class TransportReportService {
	async createReport(data: CreateTransportReportDto): Promise<TransportReport> {
		const report = await prisma.transportReport.create({
			data: {
				event_id: data.eventId,
				user_id: data.userId,
				name: data.name,
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
				user: {
					select: {
						username: true,
					},
				},
				event: {
					select: {
						name: true,
					},
				},
			},
		})

		return this.mapToTransportReport(report)
	}

	async getReports(eventId: number, userId?: number): Promise<TransportReport[]> {
		const where: Record<string, unknown> = {
			event_id: eventId,
		}

		if (userId) {
			where.user_id = userId
		}

		const reports = await prisma.transportReport.findMany({
			where,
			include: {
				user: {
					select: {
						username: true,
					},
				},
				event: {
					select: {
						name: true,
					},
				},
			},
			orderBy: {
				submitted_at: 'desc',
			},
		})

		return reports.map(this.mapToTransportReport)
	}

	async getReport(reportId: number): Promise<TransportReport | null> {
		const report = await prisma.transportReport.findUnique({
			where: { report_id: reportId },
			include: {
				user: {
					select: {
						username: true,
					},
				},
				event: {
					select: {
						name: true,
					},
				},
			},
		})

		return report ? this.mapToTransportReport(report) : null
	}

	async updateReport(reportId: number, data: UpdateTransportReportDto): Promise<TransportReport> {
		const report = await prisma.transportReport.update({
			where: { report_id: reportId },
			data: {
				status: data.status,
			},
			include: {
				user: {
					select: {
						username: true,
					},
				},
				event: {
					select: {
						name: true,
					},
				},
			},
		})

		return this.mapToTransportReport(report)
	}

	async deleteReport(reportId: number): Promise<void> {
		await prisma.transportReport.delete({
			where: { report_id: reportId },
		})
	}

	private mapToTransportReport(report: Record<string, unknown>): TransportReport {
		return {
			report_id: report.report_id as number,
			event_id: report.event_id as number,
			user_id: report.user_id as number,
			name: report.name as string,
			email: report.email as string,
			report_date: report.report_date as Date,
			tasks_completed: report.tasks_completed as string | undefined,
			meetings_attended: report.meetings_attended as string | undefined,
			issues_encountered: report.issues_encountered as string | undefined,
			pending_tasks: report.pending_tasks as string | undefined,
			support_notes: report.support_notes as string | undefined,
			status: report.status as string,
			submitted_at: report.submitted_at as Date,
			user: report.user as { username: string } | undefined,
			event: report.event as { name: string } | undefined,
		}
	}
}

export const transportReportService = new TransportReportService() 