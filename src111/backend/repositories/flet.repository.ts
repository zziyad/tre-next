// Flet repository implementation
import type { Flet } from '@/types'
import type { IFletRepository } from '@/backend/interfaces/repositories'
import { prisma } from '@/lib/prisma'

export class FletRepository implements IFletRepository {
	async findById(id: number): Promise<Flet | null> {
		const flet = await prisma.flet.findUnique({
			where: { flet_id: id }
		})
		return flet
	}

	async create(data: { name: string; description?: string; event_id: number }): Promise<Flet> {
		const flet = await prisma.flet.create({
			data: {
				name: data.name,
				description: data.description,
				event_id: data.event_id,
				created_at: new Date()
			}
		})
		return flet
	}

	async createMany(eventId: number, flets: Array<{ name: string; description?: string }>): Promise<Flet[]> {
		const createdFlets = await Promise.all(
			flets.map(flet => this.create({
				...flet,
				event_id: eventId
			}))
		)
		return createdFlets
	}

	async update(id: number, data: Partial<{ name: string; description?: string; event_id: number }>): Promise<Flet | null> {
		try {
			const flet = await prisma.flet.update({
				where: { flet_id: id },
				data: {
					...(data.name && { name: data.name }),
					...(data.description !== undefined && { description: data.description })
				}
			})
			return flet
		} catch {
			return null
		}
	}

	async delete(id: number): Promise<boolean> {
		try {
			await prisma.flet.delete({
				where: { flet_id: id }
			})
			return true
		} catch {
			return false
		}
	}

	async findAll(): Promise<Flet[]> {
		const flets = await prisma.flet.findMany({
			orderBy: { created_at: 'desc' }
		})
		return flets
	}

	async findByEventId(eventId: number): Promise<Flet[]> {
		const flets = await prisma.flet.findMany({
			where: { event_id: eventId },
			orderBy: { created_at: 'desc' }
		})
		return flets
	}
} 