import { useState, useEffect, useCallback } from 'react'
import { realTimeStatusService, type CreateRealTimeStatusData, type EventData } from '@/frontend/services/real-time-status.service'
import type { RealTimeStatus } from '@/types'

interface UseRealTimeStatusReturn {
	statuses: RealTimeStatus[]
	eventData: EventData | null
	isLoading: boolean
	error: string | null
	createStatus: (data: CreateRealTimeStatusData) => Promise<void>
	updateStatus: (statusId: number, data: CreateRealTimeStatusData) => Promise<void>
	deleteStatus: (statusId: number) => Promise<void>
	refreshStatuses: () => Promise<void>
}

export function useRealTimeStatus(eventId: number): UseRealTimeStatusReturn {
	const [statuses, setStatuses] = useState<RealTimeStatus[]>([])
	const [eventData, setEventData] = useState<EventData | null>(null)
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [isEventDataLoading, setIsEventDataLoading] = useState(true)

	const fetchStatuses = useCallback(async () => {
		try {
			setError(null)
			const data = await realTimeStatusService.getStatuses(eventId)
			setStatuses(data)
		} catch (err) {
			console.error('Error fetching statuses:', err)
			setError(err instanceof Error ? err.message : 'Failed to fetch statuses')
		}
	}, [eventId])

	const fetchEventData = useCallback(async () => {
		try {
			setIsEventDataLoading(true)
			const data = await realTimeStatusService.getEventData(eventId)
			setEventData(data)
		} catch (err) {
			console.error('Failed to fetch event data:', err)
			// Don't set error for event data as it's not critical
		} finally {
			setIsEventDataLoading(false)
		}
	}, [eventId])

	useEffect(() => {
		const loadData = async () => {
			try {
				setIsLoading(true)
				console.log('Loading real-time status data for event:', eventId)
				await Promise.all([fetchStatuses(), fetchEventData()])
			} catch (error) {
				console.error('Error loading real-time status data:', error)
			} finally {
				setIsLoading(false)
			}
		}

		loadData()
	}, [fetchStatuses, fetchEventData])

	const createStatus = useCallback(async (data: CreateRealTimeStatusData) => {
		try {
			const newStatus = await realTimeStatusService.createStatus(data)
			setStatuses(prev => [newStatus, ...prev])
		} catch (err) {
			throw err
		}
	}, [])

	const updateStatus = useCallback(async (statusId: number, data: CreateRealTimeStatusData) => {
		try {
			const updatedStatus = await realTimeStatusService.updateStatus(statusId, data)
			setStatuses(prev => prev.map(status => 
				status.status_id === statusId ? updatedStatus : status
			))
		} catch (err) {
			throw err
		}
	}, [])

	const deleteStatus = useCallback(async (statusId: number) => {
		try {
			await realTimeStatusService.deleteStatus(statusId)
			setStatuses(prev => prev.filter(status => status.status_id !== statusId))
		} catch (err) {
			throw err
		}
	}, [])

	const refreshStatuses = useCallback(async () => {
		await fetchStatuses()
	}, [fetchStatuses])

	return {
		statuses,
		eventData,
		isLoading: isLoading || isEventDataLoading,
		error,
		createStatus,
		updateStatus,
		deleteStatus,
		refreshStatuses,
	}
} 