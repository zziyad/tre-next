// User repository implementation
import type { User, CreateUserDto, Event } from '@/types'
import type { IUserRepository } from '@/backend/interfaces/repositories'
import { prisma } from '@/lib/prisma'

export class UserRepository implements IUserRepository {
	async findById(id: number): Promise<User | null> {
		const user = await prisma.user.findUnique({
			where: { user_id: id }
		})
		return user as User | null
	}

	async findByUsername(username: string): Promise<User | null> {
		const user = await prisma.user.findUnique({
			where: { username }
		})
		return user as User | null
	}

	async findByEmail(email: string): Promise<User | null> {
		const user = await prisma.user.findUnique({
			where: { email }
		})
		return user as User | null
	}

	async create(data: CreateUserDto): Promise<User> {
		const user = await prisma.user.create({
			data: {
				username: data.username,
				email: data.email,
				password_hash: data.password, // This will be hashed by the service layer
				role: data.role,
				created_at: new Date()
			}
		})
		return user as User
	}

	async update(id: number, data: Partial<CreateUserDto>): Promise<User | null> {
		try {
			const user = await prisma.user.update({
				where: { user_id: id },
				data: {
					...(data.username && { username: data.username }),
					...(data.email && { email: data.email }),
					...(data.password && { password_hash: data.password }),
					...(data.role && { role: data.role })
				}
			})
			return user as User
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
		return users as User[]
	}

	async findUserEvents(userId: number): Promise<Event[]> {
		const eventUsers = await prisma.eventUser.findMany({
			where: { user_id: userId },
			include: { event: true }
		})
		return eventUsers.map((eu) => eu.event)
	}
} 