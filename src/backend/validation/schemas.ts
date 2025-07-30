// Validation schemas using Zod
import { z } from 'zod'
import { UserRole } from '@/types'

// User validation schemas
export const createUserSchema = z.object({
	email: z.string()
		.email('Invalid email format')
		.min(1, 'Email is required')
		.max(255, 'Email must be less than 255 characters'),
	password: z.string()
		.min(6, 'Password must be at least 6 characters')
		.max(100, 'Password must be less than 100 characters'),
	name: z.string()
		.min(1, 'Name is required')
		.max(100, 'Name must be less than 100 characters'),
	surname: z.string()
		.min(1, 'Surname is required')
		.max(100, 'Surname must be less than 100 characters'),
	role: z.nativeEnum(UserRole).optional().default(UserRole.USER)
})

export const loginSchema = z.object({
	email: z.string().email('Invalid email format').min(1, 'Email is required'),
	password: z.string().min(1, 'Password is required')
})

export const updateUserSchema = z.object({
	email: z.string().email('Invalid email format').optional(),
	name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters').optional(),
	surname: z.string().min(1, 'Surname is required').max(100, 'Surname must be less than 100 characters').optional(),
	role: z.nativeEnum(UserRole).optional(),
	is_active: z.boolean().optional()
})

// Event validation schemas
export const createEventSchema = z.object({
	name: z.string()
		.min(1, 'Event name is required')
		.max(255, 'Event name must be less than 255 characters'),
	start_date: z.string().optional(),
	end_date: z.string().optional(),
	description: z.string().optional(),
	flets: z.array(z.object({
		name: z.string().min(1, 'Fleet marker name is required'),
		description: z.string().optional()
	})).default([]),
	hotels: z.array(z.object({
		name: z.string().min(1, 'Hotel name is required'),
		description: z.string().optional()
	})).default([]),
	destinations: z.array(z.object({
		name: z.string().min(1, 'Destination name is required'),
		description: z.string().optional()
	})).default([])
})

export const updateEventSchema = createEventSchema.partial()

// Fleet marker validation schemas
export const createFletSchema = z.object({
	name: z.string()
		.min(1, 'Fleet marker name is required')
		.max(255, 'Fleet marker name must be less than 255 characters'),
	description: z.string().optional(),
	event_id: z.number().positive('Event ID must be positive')
})

// Hotel validation schemas
export const createHotelSchema = z.object({
	name: z.string()
		.min(1, 'Hotel name is required')
		.max(255, 'Hotel name must be less than 255 characters'),
	description: z.string().optional(),
	event_id: z.number().positive('Event ID must be positive')
})

// Destination validation schemas
export const createDestinationSchema = z.object({
	name: z.string()
		.min(1, 'Destination name is required')
		.max(255, 'Destination name must be less than 255 characters'),
	description: z.string().optional(),
	event_id: z.number().positive('Event ID must be positive')
})

// Flight schedule validation schemas
export const createFlightScheduleSchema = z.object({
	event_id: z.number().positive('Event ID must be positive'),
	first_name: z.string().min(1, 'First name is required'),
	last_name: z.string().min(1, 'Last name is required'),
	flight_number: z.string().min(1, 'Flight number is required'),
	arrival_time: z.string().datetime('Invalid arrival time format'),
	property_name: z.string().min(1, 'Property name is required'),
	vehicle_standby_arrival_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
	departure_time: z.string().datetime('Invalid departure time format'),
	vehicle_standby_departure_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
	status: z.string().default('pending')
})

// Transport report validation schemas
export const createTransportReportSchema = z.object({
	event_id: z.number().positive('Event ID must be positive'),
	user_id: z.number().positive('User ID must be positive'),
	question: z.string().min(1, 'Question is required'),
	answer: z.string().min(1, 'Answer is required'),
	status: z.string().default('pending')
})

// Real-time status validation schemas
export const createRealTimeStatusSchema = z.object({
	eventId: z.number().positive('Event ID must be positive'),
	vehicleCode: z.string().min(1, 'Vehicle code is required'),
	hotelName: z.string().min(1, 'Hotel name is required'),
	destination: z.string().min(1, 'Destination is required'),
	guestName: z.string().optional(),
	status: z.string().default('dispatched'),
	color: z.string().default('green')
})

// Document validation schemas
export const createDocumentSchema = z.object({
	name: z.string().min(1, 'Document name is required').max(255, 'Document name must be less than 255 characters')
})

// RBAC validation schemas
export const assignPermissionSchema = z.object({
	userId: z.number().positive('User ID must be positive'),
	permissionId: z.number().positive('Permission ID must be positive')
})

export const assignRolePermissionSchema = z.object({
	roleId: z.number().positive('Role ID must be positive'),
	permissionId: z.number().positive('Permission ID must be positive')
})

// Query parameter schemas
export const paginationSchema = z.object({
	page: z.string().transform(Number).pipe(z.number().min(1)).default(() => 1),
	limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).default(() => 10)
})

export const eventQuerySchema = z.object({
	status: z.string().optional(),
	search: z.string().optional()
}).merge(paginationSchema)

// Export types for TypeScript
export type CreateUserInput = z.infer<typeof createUserSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>
export type CreateEventInput = z.infer<typeof createEventSchema>
export type UpdateEventInput = z.infer<typeof updateEventSchema>
export type PaginationInput = z.infer<typeof paginationSchema>
export type EventQueryInput = z.infer<typeof eventQuerySchema> 