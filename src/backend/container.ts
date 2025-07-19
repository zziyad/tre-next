// Dependency injection container
import { UserRepository } from './repositories/user.repository'
import { EventRepository } from './repositories/event.repository'
import { FletRepository } from './repositories/flet.repository'
import { HotelRepository } from './repositories/hotel.repository'
import { DestinationRepository } from './repositories/destination.repository'

import { AuthService } from './services/auth.service'
import { EventService } from './services/event.service'
import { SessionService } from './services/session.service'

// Repository instances
const userRepository = new UserRepository()
const eventRepository = new EventRepository()
const fletRepository = new FletRepository()
const hotelRepository = new HotelRepository()
const destinationRepository = new DestinationRepository()

// Service instances
const sessionService = new SessionService()
const authService = new AuthService(userRepository, sessionService)
const eventService = new EventService(
	eventRepository,
	fletRepository,
	hotelRepository,
	destinationRepository
)

// Export container with all services
export const container = {
	// Repositories
	userRepository,
	eventRepository,
	fletRepository,
	hotelRepository,
	destinationRepository,

	// Services
	authService,
	eventService,
	sessionService
} as const

// Type for the container
export type Container = typeof container 