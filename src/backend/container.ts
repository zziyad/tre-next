// Dependency injection container
import { UserRepository } from './repositories/user.repository'
import { EventRepository } from './repositories/event.repository'
import { FletRepository } from './repositories/flet.repository'
import { HotelRepository } from './repositories/hotel.repository'
import { DestinationRepository } from './repositories/destination.repository'
import { FlightScheduleRepository } from './repositories/flight-schedule.repository'
import { DocumentRepository } from './repositories/document.repository'
import { RealTimeStatusRepository } from './repositories/real-time-status.repository'
import { TransportReportRepository } from './repositories/transport-report.repository'

import { AuthService } from './services/auth.service'
import { EventService } from './services/event.service'
import { SessionService } from './services/session.service'
import { FlightScheduleService } from './services/flight-schedule.service'
import { DocumentService } from './services/document.service'
import { RealTimeStatusService } from './services/real-time-status.service'
import { RbacService } from './services/rbac.service'
import { TransportReportService } from './services/transport-report.service'

// Repository instances
const userRepository = new UserRepository()
const eventRepository = new EventRepository()
const fletRepository = new FletRepository()
const hotelRepository = new HotelRepository()
const destinationRepository = new DestinationRepository()
const flightScheduleRepository = new FlightScheduleRepository()
const documentRepository = new DocumentRepository()
const realTimeStatusRepository = new RealTimeStatusRepository()
const transportReportRepository = new TransportReportRepository()

// Service instances
const sessionService = new SessionService()
const authService = new AuthService(userRepository, sessionService)
const rbacService = new RbacService(userRepository)
const eventService = new EventService(
	eventRepository,
	fletRepository,
	hotelRepository,
	destinationRepository
)
const flightScheduleService = new FlightScheduleService(flightScheduleRepository)
const documentService = new DocumentService(documentRepository)
const realTimeStatusService = new RealTimeStatusService(realTimeStatusRepository, authService)
const transportReportService = new TransportReportService(transportReportRepository)

// Export container with all services
export const container = {
	// Repositories
	userRepository,
	eventRepository,
	fletRepository,
	hotelRepository,
	destinationRepository,
	flightScheduleRepository,
	documentRepository,
	realTimeStatusRepository,
	transportReportRepository,

	// Services
	authService,
	rbacService,
	eventService,
	sessionService,
	flightScheduleService,
	documentService,
	realTimeStatusService,
	transportReportService
} as const

// Type for the container
export type Container = typeof container 