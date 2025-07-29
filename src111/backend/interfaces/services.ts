// Service layer interfaces
import type { 
	User, 
	CreateUserDto, 
	LoginDto,
	UserSession,
	Event, 
	CreateEventDto,
	EventWithDetails,
	ApiResponse
} from '@/types'

// Authentication service interface
export interface IAuthService {
	register(userData: CreateUserDto): Promise<ApiResponse<UserSession>>
	login(credentials: LoginDto): Promise<ApiResponse<UserSession>>
	validateSession(token: string): Promise<User | null>
	logout(): Promise<ApiResponse<void>>
	hashPassword(password: string): Promise<string>
	verifyPassword(password: string, hashedPassword: string): Promise<boolean>
}

// User service interface
export interface IUserService {
	getUserById(id: number): Promise<ApiResponse<User>>
	getUserByUsername(username: string): Promise<ApiResponse<User>>
	updateUser(id: number, data: Partial<CreateUserDto>): Promise<ApiResponse<User>>
	deleteUser(id: number): Promise<ApiResponse<void>>
	getUserEvents(userId: number): Promise<ApiResponse<Event[]>>
}

// Event service interface
export interface IEventService {
	createEvent(eventData: CreateEventDto, userId: number): Promise<ApiResponse<Event>>
	getEventById(id: number): Promise<ApiResponse<Event>>
	getEventWithDetails(id: number): Promise<ApiResponse<EventWithDetails>>
	updateEvent(id: number, data: Partial<CreateEventDto>): Promise<ApiResponse<Event>>
	deleteEvent(id: number): Promise<ApiResponse<void>>
	getUserEvents(userId: number): Promise<ApiResponse<Event[]>>
	addUserToEvent(eventId: number, userId: number): Promise<ApiResponse<void>>
	removeUserFromEvent(eventId: number, userId: number): Promise<ApiResponse<void>>
}

// Session service interface
export interface ISessionService {
	createSession(userId: number): Promise<{ token: string; response: Response }>
	validateSession(token: string): Promise<User | null>
	deleteSession(): Promise<Response>
} 