'use client'

// Custom hook for events state management
import { useState, useEffect, useCallback } from 'react'
import { frontendEventService } from '@/frontend/services/event.service'
import type { Event, CreateEventDto, EventWithDetails } from '@/types'

interface EventsState {
	events: Event[]
	isLoading: boolean
	error: string | null
}

interface UseEventsReturn extends EventsState {
	createEvent: (eventData: CreateEventDto) => Promise<boolean>
	refreshEvents: () => Promise<void>
	clearError: () => void
}

export function useEvents(): UseEventsReturn {
	const [state, setState] = useState<EventsState>({
		events: [],
		isLoading: true,
		error: null
	})

	const fetchEvents = useCallback(async () => {
		setState(prev => ({ ...prev, isLoading: true, error: null }))
		
		try {
			const result = await frontendEventService.getUserEvents()
			
			if (result.success && result.data) {
				setState(prev => ({
					...prev,
					events: result.data!.events,
					isLoading: false
				}))
			} else {
				setState(prev => ({
					...prev,
					error: result.error || 'Failed to fetch events',
					isLoading: false
				}))
			}
		} catch (error) {
			setState(prev => ({
				...prev,
				error: 'Network error',
				isLoading: false
			}))
		}
	}, [])

	// Fetch events on mount
	useEffect(() => {
		fetchEvents()
	}, [fetchEvents])

	const createEvent = useCallback(async (eventData: CreateEventDto): Promise<boolean> => {
		setState(prev => ({ ...prev, isLoading: true, error: null }))
		
		try {
			const result = await frontendEventService.createEvent(eventData)
			
			if (result.success && result.data) {
				// Refresh events list
				await fetchEvents()
				return true
			} else {
				setState(prev => ({
					...prev,
					error: result.error || 'Failed to create event',
					isLoading: false
				}))
				return false
			}
		} catch (error) {
			setState(prev => ({
				...prev,
				error: 'Network error',
				isLoading: false
			}))
			return false
		}
	}, [fetchEvents])

	const refreshEvents = useCallback(async (): Promise<void> => {
		await fetchEvents()
	}, [fetchEvents])

	const clearError = useCallback(() => {
		setState(prev => ({ ...prev, error: null }))
	}, [])

	return {
		...state,
		createEvent,
		refreshEvents,
		clearError
	}
}

// Hook for individual event details
interface UseEventReturn {
	event: EventWithDetails | null
	isLoading: boolean
	error: string | null
	refreshEvent: () => Promise<void>
	clearError: () => void
}

export function useEvent(eventId: number): UseEventReturn {
	const [event, setEvent] = useState<EventWithDetails | null>(null)
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	const fetchEvent = useCallback(async () => {
		setIsLoading(true)
		setError(null)
		
		try {
			const result = await frontendEventService.getEventWithDetails(eventId)
			
			if (result.success && result.data) {
				setEvent(result.data)
			} else {
				setError(result.error || 'Failed to fetch event')
			}
		} catch (error) {
			setError('Network error')
		} finally {
			setIsLoading(false)
		}
	}, [eventId])

	// Fetch event on mount or when eventId changes
	useEffect(() => {
		fetchEvent()
	}, [fetchEvent])

	const refreshEvent = useCallback(async (): Promise<void> => {
		await fetchEvent()
	}, [fetchEvent])

	const clearError = useCallback(() => {
		setError(null)
	}, [])

	return {
		event,
		isLoading,
		error,
		refreshEvent,
		clearError
	}
} 