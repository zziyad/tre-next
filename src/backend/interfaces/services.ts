// Service interfaces for business logic layer
import type { 
	User, 
	CreateUserDto, 
	LoginDto,
	UserSession,
	Permission,
	UserRole,
	PermissionEntity,
	Role,
	UserPermission,
	RolePermission,
	TransportReport,
	CreateTransportReportDto,
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

// Session service interface
export interface ISessionService {
	createSession(userId: number): Promise<{ token: string }>
	validateSession(token: string): Promise<User | null>
	deleteSession(): Promise<void>
}

// Transport Report service interface
export interface ITransportReportService {
	createTransportReport(data: CreateTransportReportDto): Promise<ApiResponse<TransportReport>>
	getTransportReports(eventId: number): Promise<ApiResponse<TransportReport[]>>
	getUserTransportReports(userId: number): Promise<ApiResponse<TransportReport[]>>
	updateTransportReport(reportId: number, data: Partial<CreateTransportReportDto>): Promise<ApiResponse<TransportReport>>
	deleteTransportReport(reportId: number): Promise<ApiResponse<void>>
}

// RBAC service interface
export interface IRbacService {
	hasPermission(userId: number, permission: Permission): Promise<boolean>
	hasAnyPermission(userId: number, permissions: Permission[]): Promise<boolean>
	hasAllPermissions(userId: number, permissions: Permission[]): Promise<boolean>
	getUserPermissions(userId: number): Promise<Permission[]>
	getRoles(): Promise<ApiResponse<Role[]>>
	getPermissions(): Promise<ApiResponse<PermissionEntity[]>>
	assignPermissionToUser(userId: number, permissionId: number): Promise<ApiResponse<void>>
	removePermissionFromUser(userId: number, permissionId: number): Promise<ApiResponse<void>>
	assignPermissionToRole(roleId: number, permissionId: number): Promise<ApiResponse<void>>
	removePermissionFromRole(roleId: number, permissionId: number): Promise<ApiResponse<void>>
	getDefaultPermissionsForRole(role: UserRole): Permission[]
	initializeDefaultRolesAndPermissions(): Promise<ApiResponse<void>>
} 