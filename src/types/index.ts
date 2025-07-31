// Shared types for the TRS application

// User types
export interface User {
	user_id: number
	username: string
	email: string
	password_hash: string
	is_active: boolean
	created_at: Date
	permissions?: Permission[]
}

export interface CreateUserDto {
	username: string
	email: string
	password: string
}

export interface LoginDto {
	email: string
	password: string
}

export interface UserSession {
	user: Omit<User, 'created_at' | 'password_hash'>
	token: string
	permissions: string[]
}

// Permission types
export interface Permission {
	permission_id: number
	name: string
	description?: string | null
	created_at: Date
}

export interface UserPermission {
	user_id: number
	permission_id: number
	granted_by?: number | null
	granted_at: Date
	permission: Permission
	granted_by_user?: User | null
}

export interface DefaultPermission {
	default_permission_id: number
	permission_id: number
	created_at: Date
	permission: Permission
}

// Activity log types
export interface ActivityLog {
	log_id: number
	user_id: number
	action: string
	target_user_id?: number | null
	details?: string | null
	created_at: Date
	user: User
}

// Permission management types
export interface GrantPermissionDto {
	user_id: number
	permission_id: number
}

export interface RevokePermissionDto {
	user_id: number
	permission_id: number
}

export interface UserWithPermissions extends User {
	user_permissions: UserPermission[]
}

// Event types
export interface Event {
	event_id: number
	name: string
	start_date?: Date | null
	end_date?: Date | null
	description?: string | null
	created_at: Date
}

export interface CreateEventDto {
	name: string
	start_date?: string
	end_date?: string
	description?: string
	flets: CreateFletDto[]
	hotels: CreateHotelDto[]
	destinations: CreateDestinationDto[]
}

// Fleet marker types
export interface Flet {
	flet_id: number
	event_id: number
	name: string
	description?: string | null
	created_at: Date
}

export interface CreateFletDto {
	name: string
	description?: string
}

// Hotel types
export interface Hotel {
	hotel_id: number
	event_id: number
	name: string
	description?: string | null
	created_at: Date
}

export interface CreateHotelDto {
	name: string
	description?: string
}

// Destination types
export interface Destination {
	destination_id: number
	event_id: number
	name: string
	description?: string | null
	created_at: Date
}

export interface CreateDestinationDto {
	name: string
	description?: string
}

// Flight schedule types
export interface FlightSchedule {
	flight_id: number
	event_id: number
	first_name: string
	last_name: string
	flight_number: string
	arrival_time: Date
	property_name: string
	vehicle_standby_arrival_time: Date
	departure_time: Date
	vehicle_standby_departure_time: Date
	status: string
	created_at: Date
}

export interface FlightScheduleCreate {
	event_id: number;
	first_name: string;
	last_name: string;
	flight_number: string;
	arrival_time: string;
	property_name: string;
	vehicle_standby_arrival_time: string;
	departure_time: string;
	vehicle_standby_departure_time: string;
}

export interface FlightScheduleUpload {
	event_id: number;
	file: File;
}

export interface FlightScheduleResponse {
	success: boolean;
	data?: FlightSchedule[];
	error?: string;
	message?: string;
}

export interface FlightScheduleUploadResponse {
	success: boolean;
	data?: {
		totalRecords: number;
		processedRecords: number;
		failedRecords: number;
		schedules: FlightSchedule[];
	};
	error?: string;
	message?: string;
}

// Transport report types
export interface TransportReport {
	report_id: number
	event_id: number
	user_id: number
	name: string
	surname: string
	email: string
	report_date: Date
	tasks_completed?: string
	meetings_attended?: string
	issues_encountered?: string
	pending_tasks?: string
	support_notes?: string
	status: string
	submitted_at: Date
	user?: {
		username: string
	}
	event?: {
		name: string
	}
}

export interface CreateTransportReportDto {
	eventId: number
	userId: number
	name: string
	surname: string
	email: string
	reportDate: Date
	tasksCompleted?: string
	meetingsAttended?: string
	issuesEncountered?: string
	pendingTasks?: string
	supportNotes?: string
}

// Real-time status types
export interface RealTimeStatus {
	status_id: number
	event_id: number
	vehicle_code: string
	hotel_name: string
	destination: string
	guest_name?: string
	status: string
	color: string
	updated_at: Date
}

// Document types
export interface Document {
	document_id: number
	event_id: number
	name: string
	original_name: string
	file_path: string
	file_size: number
	mime_type: string
	uploaded_by: number
	created_at: Date
	user: {
		username: string
	}
}

export interface CreateDocumentDto {
	file: File
	name?: string
}

// API Response types
export interface ApiResponse<T = unknown> {
	success: boolean
	data?: T
	error?: string
	message?: string
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
	pagination: {
		page: number
		limit: number
		total: number
		totalPages: number
	}
}

// Event with related data
export interface EventWithDetails extends Event {
	flets: Flet[]
	hotels: Hotel[]
	destinations: Destination[]
	flight_schedules?: FlightSchedule[]
	transport_reports?: TransportReport[]
	realtime_statuses?: RealTimeStatus[]
} 