import { useState, useEffect, useCallback } from 'react'
import { realTimeStatusService, type CreateRealTimeStatusData, type EventData } from '@/frontend/services/real-time-status.service'
import type { RealTimeStatus } from '@/types'

export function useRealTimeStatus(eventId: number) {
	const [statuses, setStatuses] = useState<RealTimeStatus[]>([])
	const [eventData, setEventData] = useState<EventData | null>(null)
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	const fetchStatuses = useCallback(async () => {
		try {
			setIsLoading(true)
			setError(null)
			console.log('Frontend hook - Fetching real statuses for eventId:', eventId)
			
			const data = await realTimeStatusService.getStatuses(eventId)
			console.log('Frontend hook - Successfully fetched real statuses:', data)
			setStatuses(data)
		} catch (err) {
			console.error('Frontend hook - Error fetching statuses:', err)
			setError(err instanceof Error ? err.message : 'Failed to fetch statuses')
		} finally {
			setIsLoading(false)
		}
	}, [eventId])

	const fetchEventData = useCallback(async () => {
		try {
			console.log('Frontend hook - Fetching real event data for eventId:', eventId)
			
			const data = await realTimeStatusService.getEventData(eventId)
			console.log('Frontend hook - Successfully fetched real event data:', data)
			setEventData(data)
		} catch (err) {
			console.error('Frontend hook - Error fetching event data:', err)
			setError('Failed to load form data. Please try again.')
		}
	}, [eventId])

	const createStatus = async (data: CreateRealTimeStatusData) => {
		try {
			console.log('Frontend hook - Creating status with data:', data)
			
			const newStatus = await realTimeStatusService.createStatus(data)
			console.log('Frontend hook - Successfully created status in database:', newStatus)
			
			setStatuses(prev => [newStatus, ...prev])
			return newStatus
		} catch (err) {
			console.error('Frontend hook - Error creating status:', err)
			throw err
		}
	}

	const updateStatus = async (statusId: number, data: Partial<CreateRealTimeStatusData>) => {
		try {
			console.log('Frontend hook - Updating status:', statusId, 'with data:', data)
			
			const updatedStatus = await realTimeStatusService.updateStatus(statusId, data)
			console.log('Frontend hook - Successfully updated status in database:', updatedStatus)
			
			setStatuses(prev => prev.map(status => 
				status.status_id === statusId ? updatedStatus : status
			))
			return updatedStatus
		} catch (err) {
			console.error('Frontend hook - Error updating status:', err)
			throw err
		}
	}

	const deleteStatus = async (statusId: number) => {
		try {
			console.log('Frontend hook - Deleting status:', statusId)
			
			await realTimeStatusService.deleteStatus(statusId)
			console.log('Frontend hook - Successfully deleted status from database:', statusId)
			
			setStatuses(prev => prev.filter(status => status.status_id !== statusId))
		} catch (err) {
			console.error('Frontend hook - Error deleting status:', err)
			throw err
		}
	}

	useEffect(() => {
		fetchStatuses()
		fetchEventData()
	}, [fetchStatuses, fetchEventData])

	return {
		statuses,
		eventData,
		isLoading,
		error,
		createStatus,
		updateStatus,
		deleteStatus,
		refetch: fetchStatuses,
	}
} 