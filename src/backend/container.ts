// Dependency injection container
import { UserRepository } from './repositories/user.repository'
import { EventRepository } from './repositories/event.repository'
import { FletRepository } from './repositories/flet.repository'
import { HotelRepository } from './repositories/hotel.repository'
import { DestinationRepository } from './repositories/destination.repository'
import { FlightScheduleRepository } from './repositories/flight-schedule.repository'

import { AuthService } from './services/auth.service'
import { EventService } from './services/event.service'
import { SessionService } from './services/session.service'
import { FlightScheduleService } from './services/flight-schedule.service'

// Repository instances
const userRepository = new UserRepository()
const eventRepository = new EventRepository()
const fletRepository = new FletRepository()
const hotelRepository = new HotelRepository()
const destinationRepository = new DestinationRepository()
const flightScheduleRepository = new FlightScheduleRepository()

// Service instances
const sessionService = new SessionService()
const authService = new AuthService(userRepository, sessionService)
const eventService = new EventService(
	eventRepository,
	fletRepository,
	hotelRepository,
	destinationRepository
)
const flightScheduleService = new FlightScheduleService(flightScheduleRepository)

// Export container with all services
export const container = {
	// Repositories
	userRepository,
	eventRepository,
	fletRepository,
	hotelRepository,
	destinationRepository,
	flightScheduleRepository,

	// Services
	authService,
	eventService,
	sessionService,
	flightScheduleService
} as const

// Type for the container
export type Container = typeof container 