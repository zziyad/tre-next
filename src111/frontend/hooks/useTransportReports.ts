import { useState, useEffect } from 'react'
import { transportReportService, type CreateTransportReportData } from '@/frontend/services/transport-report.service'
import type { TransportReport } from '@/types'

export function useTransportReports(eventId: number, userId?: number) {
	const [reports, setReports] = useState<TransportReport[]>([])
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const fetchReports = async () => {
		setIsLoading(true)
		setError(null)
		try {
			const data = await transportReportService.getReports(eventId, userId)
			setReports(data)
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to fetch reports')
		} finally {
			setIsLoading(false)
		}
	}

	const createReport = async (data: CreateTransportReportData) => {
		setIsLoading(true)
		setError(null)
		try {
			const newReport = await transportReportService.createReport(data)
			setReports(prev => [newReport, ...prev])
			return newReport
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to create report')
			throw err
		} finally {
			setIsLoading(false)
		}
	}

	const updateReportStatus = async (reportId: number, status: string) => {
		setIsLoading(true)
		setError(null)
		try {
			const updatedReport = await transportReportService.updateReportStatus(reportId, status)
			setReports(prev => 
				prev.map(report => 
					report.report_id === reportId ? updatedReport : report
				)
			)
			return updatedReport
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to update report status')
			throw err
		} finally {
			setIsLoading(false)
		}
	}

	useEffect(() => {
		fetchReports()
	}, [eventId, userId])

	return {
		reports,
		isLoading,
		error,
		createReport,
		updateReportStatus,
		refetch: fetchReports,
	}
} 