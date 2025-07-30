// RBAC (Role-Based Access Control) service
import type { 
	User, 
	Permission, 
	UserRole,
	PermissionEntity,
	Role,
	UserPermission,
	RolePermission,
	ApiResponse 
} from '@/types'
import type { IRbacService } from '@/backend/interfaces/services'
import type { IUserRepository } from '@/backend/interfaces/repositories'

export class RbacService implements IRbacService {
	constructor(
		private userRepository: IUserRepository
	) {}

	/**
	 * Check if user has a specific permission
	 */
	async hasPermission(userId: number, permission: Permission): Promise<boolean> {
		try {
			const user = await this.userRepository.findById(userId)
			if (!user || !user.is_active) {
				return false
			}

			// Admin has all permissions
			if (user.role === UserRole.ADMIN) {
				return true
			}

			// Check user-specific permissions first
			const userPermissions = await this.userRepository.getUserPermissions(userId)
			const hasUserPermission = userPermissions.some(up => up.permission.name === permission)
			if (hasUserPermission) {
				return true
			}

			// Check role-based permissions
			const rolePermissions = await this.userRepository.getRolePermissions(user.role)
			return rolePermissions.some(rp => rp.permission.name === permission)
		} catch (error) {
			console.error('Error checking permission:', error)
			return false
		}
	}

	/**
	 * Check if user has any of the specified permissions
	 */
	async hasAnyPermission(userId: number, permissions: Permission[]): Promise<boolean> {
		for (const permission of permissions) {
			if (await this.hasPermission(userId, permission)) {
				return true
			}
		}
		return false
	}

	/**
	 * Check if user has all of the specified permissions
	 */
	async hasAllPermissions(userId: number, permissions: Permission[]): Promise<boolean> {
		for (const permission of permissions) {
			if (!(await this.hasPermission(userId, permission))) {
				return false
			}
		}
		return true
	}

	/**
	 * Get all permissions for a user
	 */
	async getUserPermissions(userId: number): Promise<Permission[]> {
		try {
			const user = await this.userRepository.findById(userId)
			if (!user || !user.is_active) {
				return []
			}

			const permissions = new Set<Permission>()

			// Admin has all permissions
			if (user.role === UserRole.ADMIN) {
				return Object.values(Permission)
			}

			// Get user-specific permissions
			const userPermissions = await this.userRepository.getUserPermissions(userId)
			userPermissions.forEach(up => permissions.add(up.permission.name))

			// Get role-based permissions
			const rolePermissions = await this.userRepository.getRolePermissions(user.role)
			rolePermissions.forEach(rp => permissions.add(rp.permission.name))

			return Array.from(permissions)
		} catch (error) {
			console.error('Error getting user permissions:', error)
			return []
		}
	}

	/**
	 * Get all roles
	 */
	async getRoles(): Promise<ApiResponse<Role[]>> {
		try {
			const roles = await this.userRepository.getRoles()
			return {
				success: true,
				data: roles
			}
		} catch (error) {
			return {
				success: false,
				error: 'Failed to fetch roles'
			}
		}
	}

	/**
	 * Get all permissions
	 */
	async getPermissions(): Promise<ApiResponse<PermissionEntity[]>> {
		try {
			const permissions = await this.userRepository.getPermissions()
			return {
				success: true,
				data: permissions
			}
		} catch (error) {
			return {
				success: false,
				error: 'Failed to fetch permissions'
			}
		}
	}

	/**
	 * Assign permission to user
	 */
	async assignPermissionToUser(userId: number, permissionId: number): Promise<ApiResponse<void>> {
		try {
			await this.userRepository.assignPermissionToUser(userId, permissionId)
			return {
				success: true,
				message: 'Permission assigned successfully'
			}
		} catch (error) {
			return {
				success: false,
				error: 'Failed to assign permission'
			}
		}
	}

	/**
	 * Remove permission from user
	 */
	async removePermissionFromUser(userId: number, permissionId: number): Promise<ApiResponse<void>> {
		try {
			await this.userRepository.removePermissionFromUser(userId, permissionId)
			return {
				success: true,
				message: 'Permission removed successfully'
			}
		} catch (error) {
			return {
				success: false,
				error: 'Failed to remove permission'
			}
		}
	}

	/**
	 * Assign permission to role
	 */
	async assignPermissionToRole(roleId: number, permissionId: number): Promise<ApiResponse<void>> {
		try {
			await this.userRepository.assignPermissionToRole(roleId, permissionId)
			return {
				success: true,
				message: 'Permission assigned to role successfully'
			}
		} catch (error) {
			return {
				success: false,
				error: 'Failed to assign permission to role'
			}
		}
	}

	/**
	 * Remove permission from role
	 */
	async removePermissionFromRole(roleId: number, permissionId: number): Promise<ApiResponse<void>> {
		try {
			await this.userRepository.removePermissionFromRole(roleId, permissionId)
			return {
				success: true,
				message: 'Permission removed from role successfully'
			}
		} catch (error) {
			return {
				success: false,
				error: 'Failed to remove permission from role'
			}
		}
	}

	/**
	 * Get default permissions for a role
	 */
	getDefaultPermissionsForRole(role: UserRole): Permission[] {
		switch (role) {
			case UserRole.ADMIN:
				return Object.values(Permission)
			
			case UserRole.SUPERVISOR:
				return [
					Permission.READ_USER,
					Permission.CREATE_EVENT,
					Permission.READ_EVENT,
					Permission.UPDATE_EVENT,
					Permission.CREATE_FLIGHT_SCHEDULE,
					Permission.READ_FLIGHT_SCHEDULE,
					Permission.UPDATE_FLIGHT_SCHEDULE,
					Permission.UPLOAD_FLIGHT_SCHEDULE,
					Permission.CREATE_TRANSPORT_REPORT,
					Permission.READ_TRANSPORT_REPORT,
					Permission.UPDATE_TRANSPORT_REPORT,
					Permission.CREATE_REAL_TIME_STATUS,
					Permission.READ_REAL_TIME_STATUS,
					Permission.UPDATE_REAL_TIME_STATUS,
					Permission.CREATE_DOCUMENT,
					Permission.READ_DOCUMENT,
					Permission.UPDATE_DOCUMENT,
					Permission.UPLOAD_DOCUMENT,
					Permission.VIEW_SYSTEM_STATS
				]
			
			case UserRole.USER:
				return [
					Permission.READ_EVENT,
					Permission.READ_FLIGHT_SCHEDULE,
					Permission.CREATE_TRANSPORT_REPORT,
					Permission.READ_TRANSPORT_REPORT,
					Permission.UPDATE_TRANSPORT_REPORT,
					Permission.READ_REAL_TIME_STATUS,
					Permission.CREATE_REAL_TIME_STATUS,
					Permission.READ_DOCUMENT
				]
			
			default:
				return []
		}
	}

	/**
	 * Initialize default roles and permissions
	 */
	async initializeDefaultRolesAndPermissions(): Promise<ApiResponse<void>> {
		try {
			await this.userRepository.initializeDefaultRolesAndPermissions()
			return {
				success: true,
				message: 'Default roles and permissions initialized successfully'
			}
		} catch (error) {
			return {
				success: false,
				error: 'Failed to initialize default roles and permissions'
			}
		}
	}
} 