// Shared types for the TRS application

// User roles enum
export enum UserRole {
  ADMIN = 'ADMIN',
  SUPERVISOR = 'SUPERVISOR',
  USER = 'USER'
}

// Permissions enum
export enum Permission {
  // User management
  CREATE_USER = 'CREATE_USER',
  READ_USER = 'READ_USER',
  UPDATE_USER = 'UPDATE_USER',
  DELETE_USER = 'DELETE_USER',
  
  // Event management
  CREATE_EVENT = 'CREATE_EVENT',
  READ_EVENT = 'READ_EVENT',
  UPDATE_EVENT = 'UPDATE_EVENT',
  DELETE_EVENT = 'DELETE_EVENT',
  
  // Flight schedule management
  CREATE_FLIGHT_SCHEDULE = 'CREATE_FLIGHT_SCHEDULE',
  READ_FLIGHT_SCHEDULE = 'READ_FLIGHT_SCHEDULE',
  UPDATE_FLIGHT_SCHEDULE = 'UPDATE_FLIGHT_SCHEDULE',
  DELETE_FLIGHT_SCHEDULE = 'DELETE_FLIGHT_SCHEDULE',
  UPLOAD_FLIGHT_SCHEDULE = 'UPLOAD_FLIGHT_SCHEDULE',
  
  // Transport report management
  CREATE_TRANSPORT_REPORT = 'CREATE_TRANSPORT_REPORT',
  READ_TRANSPORT_REPORT = 'READ_TRANSPORT_REPORT',
  UPDATE_TRANSPORT_REPORT = 'UPDATE_TRANSPORT_REPORT',
  DELETE_TRANSPORT_REPORT = 'DELETE_TRANSPORT_REPORT',
  
  // Real-time status management
  CREATE_REAL_TIME_STATUS = 'CREATE_REAL_TIME_STATUS',
  READ_REAL_TIME_STATUS = 'READ_REAL_TIME_STATUS',
  UPDATE_REAL_TIME_STATUS = 'UPDATE_REAL_TIME_STATUS',
  DELETE_REAL_TIME_STATUS = 'DELETE_REAL_TIME_STATUS',
  
  // Document management
  CREATE_DOCUMENT = 'CREATE_DOCUMENT',
  READ_DOCUMENT = 'READ_DOCUMENT',
  UPDATE_DOCUMENT = 'UPDATE_DOCUMENT',
  DELETE_DOCUMENT = 'DELETE_DOCUMENT',
  UPLOAD_DOCUMENT = 'UPLOAD_DOCUMENT',
  
  // System administration
  MANAGE_ROLES = 'MANAGE_ROLES',
  MANAGE_PERMISSIONS = 'MANAGE_PERMISSIONS',
  VIEW_SYSTEM_STATS = 'VIEW_SYSTEM_STATS'
}

// User types
export interface User {
	user_id: number
	email: string
	password_hash: string
	name: string
	surname: string
	role: UserRole
	is_active: boolean
	last_login?: Date | null
	created_at: Date
	updated_at: Date
}

export interface CreateUserDto {
	email: string
	password: string
	name: string
	surname: string
	role?: UserRole
}

export interface LoginDto {
	email: string
	password: string
}

export interface UserSession {
	user: Omit<User, 'password_hash'>
	token: string
}

// RBAC types
export interface PermissionEntity {
	permission_id: number
	name: Permission
	description?: string | null
	created_at: Date
}

export interface Role {
	role_id: number
	name: string
	description?: string | null
	created_at: Date
}

export interface UserPermission {
	user_id: number
	permission_id: number
	permission: PermissionEntity
}

export interface RolePermission {
	role_id: number
	permission_id: number
	permission: PermissionEntity
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
		email: string
		name: string
		surname: string
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
		email: string
		name: string
		surname: string
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