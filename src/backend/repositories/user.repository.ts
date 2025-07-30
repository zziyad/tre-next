// User repository implementation
import type { 
	User, 
	CreateUserDto, 
	Event,
	Permission,
	UserRole,
	PermissionEntity,
	Role,
	UserPermission,
	RolePermission
} from '@/types'
import type { IUserRepository } from '@/backend/interfaces/repositories'
import { prisma } from '@/lib/prisma'

export class UserRepository implements IUserRepository {
	async findById(id: number): Promise<User | null> {
		const user = await prisma.user.findUnique({
			where: { user_id: id }
		})
		return user
	}

	async findByEmail(email: string): Promise<User | null> {
		const user = await prisma.user.findUnique({
			where: { email }
		})
		return user
	}

	async create(data: CreateUserDto): Promise<User> {
		const user = await prisma.user.create({
			data: {
				email: data.email,
				password_hash: data.password, // This will be hashed by the service layer
				name: data.name,
				surname: data.surname,
				role: data.role || UserRole.USER,
				is_active: true,
				created_at: new Date(),
				updated_at: new Date()
			}
		})
		return user
	}

	async update(id: number, data: Partial<CreateUserDto>): Promise<User | null> {
		try {
			const user = await prisma.user.update({
				where: { user_id: id },
				data: {
					...(data.email && { email: data.email }),
					...(data.password && { password_hash: data.password }),
					...(data.name && { name: data.name }),
					...(data.surname && { surname: data.surname }),
					...(data.role && { role: data.role }),
					updated_at: new Date()
				}
			})
			return user
		} catch {
			return null
		}
	}

	async delete(id: number): Promise<boolean> {
		try {
			await prisma.user.delete({
				where: { user_id: id }
			})
			return true
		} catch {
			return false
		}
	}

	async findAll(): Promise<User[]> {
		const users = await prisma.user.findMany({
			orderBy: { created_at: 'desc' }
		})
		return users
	}

	async findUserEvents(userId: number): Promise<Event[]> {
		const eventUsers = await prisma.eventUser.findMany({
			where: { user_id: userId },
			include: { event: true }
		})
		return eventUsers.map((eu) => eu.event)
	}

	// RBAC methods
	async getUserPermissions(userId: number): Promise<UserPermission[]> {
		const userPermissions = await prisma.userPermission.findMany({
			where: { user_id: userId },
			include: {
				permission: true
			}
		})
		return userPermissions
	}

	async getRolePermissions(role: UserRole): Promise<RolePermission[]> {
		const rolePermissions = await prisma.rolePermission.findMany({
			where: {
				role: {
					name: role
				}
			},
			include: {
				permission: true
			}
		})
		return rolePermissions
	}

	async getRoles(): Promise<Role[]> {
		const roles = await prisma.role.findMany({
			orderBy: { created_at: 'asc' }
		})
		return roles
	}

	async getPermissions(): Promise<PermissionEntity[]> {
		const permissions = await prisma.permission.findMany({
			orderBy: { created_at: 'asc' }
		})
		return permissions
	}

	async assignPermissionToUser(userId: number, permissionId: number): Promise<void> {
		await prisma.userPermission.create({
			data: {
				user_id: userId,
				permission_id: permissionId
			}
		})
	}

	async removePermissionFromUser(userId: number, permissionId: number): Promise<void> {
		await prisma.userPermission.delete({
			where: {
				user_id_permission_id: {
					user_id: userId,
					permission_id: permissionId
				}
			}
		})
	}

	async assignPermissionToRole(roleId: number, permissionId: number): Promise<void> {
		await prisma.rolePermission.create({
			data: {
				role_id: roleId,
				permission_id: permissionId
			}
		})
	}

	async removePermissionFromRole(roleId: number, permissionId: number): Promise<void> {
		await prisma.rolePermission.delete({
			where: {
				role_id_permission_id: {
					role_id: roleId,
					permission_id: permissionId
				}
			}
		})
	}

	async initializeDefaultRolesAndPermissions(): Promise<void> {
		// Create default roles
		const adminRole = await prisma.role.upsert({
			where: { name: 'ADMIN' },
			update: {},
			create: {
				name: 'ADMIN',
				description: 'Administrator with full access'
			}
		})

		const supervisorRole = await prisma.role.upsert({
			where: { name: 'SUPERVISOR' },
			update: {},
			create: {
				name: 'SUPERVISOR',
				description: 'Supervisor with elevated access'
			}
		})

		const userRole = await prisma.role.upsert({
			where: { name: 'USER' },
			update: {},
			create: {
				name: 'USER',
				description: 'Regular user with basic access'
			}
		})

		// Create all permissions
		const permissions = await Promise.all(
			Object.values(Permission).map(async (permissionName) => {
				return await prisma.permission.upsert({
					where: { name: permissionName },
					update: {},
					create: {
						name: permissionName,
						description: `Permission to ${permissionName.toLowerCase().replace(/_/g, ' ')}`
					}
				})
			})
		)

		// Assign all permissions to admin role
		for (const permission of permissions) {
			await prisma.rolePermission.upsert({
				where: {
					role_id_permission_id: {
						role_id: adminRole.role_id,
						permission_id: permission.permission_id
					}
				},
				update: {},
				create: {
					role_id: adminRole.role_id,
					permission_id: permission.permission_id
				}
			})
		}

		// Assign supervisor permissions
		const supervisorPermissions = [
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

		for (const permissionName of supervisorPermissions) {
			const permission = permissions.find(p => p.name === permissionName)
			if (permission) {
				await prisma.rolePermission.upsert({
					where: {
						role_id_permission_id: {
							role_id: supervisorRole.role_id,
							permission_id: permission.permission_id
						}
					},
					update: {},
					create: {
						role_id: supervisorRole.role_id,
						permission_id: permission.permission_id
					}
				})
			}
		}

		// Assign user permissions
		const userPermissions = [
			Permission.READ_EVENT,
			Permission.READ_FLIGHT_SCHEDULE,
			Permission.CREATE_TRANSPORT_REPORT,
			Permission.READ_TRANSPORT_REPORT,
			Permission.UPDATE_TRANSPORT_REPORT,
			Permission.READ_REAL_TIME_STATUS,
			Permission.CREATE_REAL_TIME_STATUS,
			Permission.READ_DOCUMENT
		]

		for (const permissionName of userPermissions) {
			const permission = permissions.find(p => p.name === permissionName)
			if (permission) {
				await prisma.rolePermission.upsert({
					where: {
						role_id_permission_id: {
							role_id: userRole.role_id,
							permission_id: permission.permission_id
						}
					},
					update: {},
					create: {
						role_id: userRole.role_id,
						permission_id: permission.permission_id
					}
				})
			}
		}
	}
} 