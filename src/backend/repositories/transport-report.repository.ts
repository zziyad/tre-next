// Transport report repository implementation
import type { TransportReport, CreateTransportReportDto } from '@/types'
import type { ITransportReportRepository } from '@/backend/interfaces/repositories'
import { prisma } from '@/lib/prisma'

// Helper function to transform database result to TransportReport type
function transformTransportReport(dbReport: any): TransportReport {
	return {
		...dbReport,
		tasks_completed: dbReport.tasks_completed || undefined,
		meetings_attended: dbReport.meetings_attended || undefined,
		issues_encountered: dbReport.issues_encountered || undefined,
		pending_tasks: dbReport.pending_tasks || undefined,
		support_notes: dbReport.support_notes || undefined
	}
}

export class TransportReportRepository implements ITransportReportRepository {
	async findById(id: number): Promise<TransportReport | null> {
		const report = await prisma.transportReport.findUnique({
			where: { report_id: id },
			include: {
				user: {
					select: {
						user_id: true,
						email: true,
						name: true,
						surname: true,
						role: true
					}
				},
				event: {
					select: {
						event_id: true,
						name: true
					}
				}
			}
		})
		return report ? transformTransportReport(report) : null
	}

	async create(data: CreateTransportReportDto): Promise<TransportReport> {
		const report = await prisma.transportReport.create({
			data: {
				event_id: data.eventId,
				user_id: data.userId,
				name: data.name,
				surname: data.surname,
				email: data.email,
				report_date: data.reportDate,
				tasks_completed: data.tasksCompleted,
				meetings_attended: data.meetingsAttended,
				issues_encountered: data.issuesEncountered,
				pending_tasks: data.pendingTasks,
				support_notes: data.supportNotes,
				status: 'pending',
				submitted_at: new Date()
			},
			include: {
				user: {
					select: {
						user_id: true,
						email: true,
						name: true,
						surname: true,
						role: true
					}
				},
				event: {
					select: {
						event_id: true,
						name: true
					}
				}
			}
		})
		return transformTransportReport(report)
	}

	async update(id: number, data: Partial<CreateTransportReportDto>): Promise<TransportReport | null> {
		try {
			const report = await prisma.transportReport.update({
				where: { report_id: id },
				data: {
					...(data.name && { name: data.name }),
					...(data.surname && { surname: data.surname }),
					...(data.email && { email: data.email }),
					...(data.reportDate && { report_date: data.reportDate }),
					...(data.tasksCompleted && { tasks_completed: data.tasksCompleted }),
					...(data.meetingsAttended && { meetings_attended: data.meetingsAttended }),
					...(data.issuesEncountered && { issues_encountered: data.issuesEncountered }),
					...(data.pendingTasks && { pending_tasks: data.pendingTasks }),
					...(data.supportNotes && { support_notes: data.supportNotes })
				},
				include: {
					user: {
						select: {
							user_id: true,
							email: true,
							name: true,
							surname: true,
							role: true
						}
					},
					event: {
						select: {
							event_id: true,
							name: true
						}
					}
				}
			})
			return transformTransportReport(report)
		} catch {
			return null
		}
	}

	async delete(id: number): Promise<boolean> {
		try {
			await prisma.transportReport.delete({
				where: { report_id: id }
			})
			return true
		} catch {
			return false
		}
	}

	async findByEventId(eventId: number): Promise<TransportReport[]> {
		const reports = await prisma.transportReport.findMany({
			where: { event_id: eventId },
			include: {
				user: {
					select: {
						user_id: true,
						email: true,
						name: true,
						surname: true,
						role: true
					}
				},
				event: {
					select: {
						event_id: true,
						name: true
					}
				}
			},
			orderBy: { submitted_at: 'desc' }
		})
		return reports.map(transformTransportReport)
	}

	async findByUserId(userId: number): Promise<TransportReport[]> {
		const reports = await prisma.transportReport.findMany({
			where: { user_id: userId },
			include: {
				user: {
					select: {
						user_id: true,
						email: true,
						name: true,
						surname: true,
						role: true
					}
				},
				event: {
					select: {
						event_id: true,
						name: true
					}
				}
			},
			orderBy: { submitted_at: 'desc' }
		})
		return reports.map(transformTransportReport)
	}

	async findAll(): Promise<TransportReport[]> {
		const reports = await prisma.transportReport.findMany({
			include: {
				user: {
					select: {
						user_id: true,
						email: true,
						name: true,
						surname: true,
						role: true
					}
				},
				event: {
					select: {
						event_id: true,
						name: true
					}
				}
			},
			orderBy: { submitted_at: 'desc' }
		})
		return reports.map(transformTransportReport)
	}

	async findByStatus(status: string): Promise<TransportReport[]> {
		const reports = await prisma.transportReport.findMany({
			where: { status },
			include: {
				user: {
					select: {
						user_id: true,
						email: true,
						name: true,
						surname: true,
						role: true
					}
				},
				event: {
					select: {
						event_id: true,
						name: true
					}
				}
			},
			orderBy: { submitted_at: 'desc' }
		})
		return reports.map(transformTransportReport)
	}
} 