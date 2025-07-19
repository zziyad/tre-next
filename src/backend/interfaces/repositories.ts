// Repository interfaces for data access layer
import type { 
	User, 
	CreateUserDto, 
	Event, 
	CreateEventDto,
	EventWithDetails,
	Flet,
	Hotel,
	Destination,
	FlightSchedule,
	TransportReport,
	RealTimeStatus
} from '@/types'

// Base repository interface
export interface IBaseRepository<T, TCreate> {
	findById(id: number): Promise<T | null>
	create(data: TCreate): Promise<T>
	update(id: number, data: Partial<TCreate>): Promise<T | null>
	delete(id: number): Promise<boolean>
	findAll(): Promise<T[]>
}

// User repository interface
export interface IUserRepository extends IBaseRepository<User, CreateUserDto> {
	findByUsername(username: string): Promise<User | null>
	findUserEvents(userId: number): Promise<Event[]>
}

// Event repository interface
export interface IEventRepository extends IBaseRepository<Event, CreateEventDto> {
	findEventWithDetails(eventId: number): Promise<EventWithDetails | null>
	findUserEvents(userId: number): Promise<Event[]>
	addUserToEvent(eventId: number, userId: number): Promise<boolean>
	removeUserFromEvent(eventId: number, userId: number): Promise<boolean>
}

// Fleet marker repository interface
export interface IFletRepository extends IBaseRepository<Flet, { name: string; description?: string; event_id: number }> {
	findByEventId(eventId: number): Promise<Flet[]>
	createMany(eventId: number, flets: Array<{ name: string; description?: string }>): Promise<Flet[]>
}

// Hotel repository interface
export interface IHotelRepository extends IBaseRepository<Hotel, { name: string; description?: string; event_id: number }> {
	findByEventId(eventId: number): Promise<Hotel[]>
	createMany(eventId: number, hotels: Array<{ name: string; description?: string }>): Promise<Hotel[]>
}

// Destination repository interface
export interface IDestinationRepository extends IBaseRepository<Destination, { name: string; description?: string; event_id: number }> {
	findByEventId(eventId: number): Promise<Destination[]>
	createMany(eventId: number, destinations: Array<{ name: string; description?: string }>): Promise<Destination[]>
}

// Flight schedule repository interface
export interface IFlightScheduleRepository extends IBaseRepository<FlightSchedule, Omit<FlightSchedule, 'flight_id' | 'created_at'>> {
	findByEventId(eventId: number): Promise<FlightSchedule[]>
	findByStatus(status: string): Promise<FlightSchedule[]>
	updateStatus(flightId: number, status: string): Promise<FlightSchedule | null>
}

// Transport report repository interface
export interface ITransportReportRepository extends IBaseRepository<TransportReport, Omit<TransportReport, 'report_id' | 'submitted_at'>> {
	findByEventId(eventId: number): Promise<TransportReport[]>
	findByUserId(userId: number): Promise<TransportReport[]>
	findByStatus(status: string): Promise<TransportReport[]>
}

// Real-time status repository interface
export interface IRealTimeStatusRepository extends IBaseRepository<RealTimeStatus, Omit<RealTimeStatus, 'status_id' | 'updated_at'>> {
	findByEventId(eventId: number): Promise<RealTimeStatus[]>
	findByStatus(status: string): Promise<RealTimeStatus[]>
	updateStatus(statusId: number, status: string): Promise<RealTimeStatus | null>
} 