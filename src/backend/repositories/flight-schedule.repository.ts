import { FlightSchedule } from '@prisma/client';
import { FlightScheduleCreate } from '@/types';
import { prisma } from '@/lib/prisma';

export interface IFlightScheduleRepository {
  create(data: FlightScheduleCreate): Promise<FlightSchedule>;
  createMany(data: FlightScheduleCreate[]): Promise<FlightSchedule[]>;
  findByEventId(eventId: number): Promise<FlightSchedule[]>;
  findById(flightId: number): Promise<FlightSchedule | null>;
  update(flightId: number, data: Partial<FlightScheduleCreate>): Promise<FlightSchedule>;
  delete(flightId: number): Promise<FlightSchedule>;
  deleteByEventId(eventId: number): Promise<{ count: number }>;
}

export class FlightScheduleRepository implements IFlightScheduleRepository {

  async create(data: FlightScheduleCreate): Promise<FlightSchedule> {
    try {
      return await prisma.flightSchedule.create({
        data: {
          event_id: data.event_id,
          first_name: data.first_name,
          last_name: data.last_name,
          flight_number: data.flight_number,
          arrival_time: new Date(data.arrival_time),
          property_name: data.property_name,
          vehicle_standby_arrival_time: new Date(data.vehicle_standby_arrival_time),
          departure_time: new Date(data.departure_time),
          vehicle_standby_departure_time: new Date(data.vehicle_standby_departure_time),
        },
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create flight schedule';
      throw new Error(`FlightScheduleRepository.create: ${errorMessage}`);
    }
  }

  async createMany(data: FlightScheduleCreate[]): Promise<FlightSchedule[]> {
    try {
      console.log('💾 [REPO] Starting createMany with data:', data);
      
      const mappedData = data.map(schedule => ({
        event_id: schedule.event_id,
        first_name: schedule.first_name,
        last_name: schedule.last_name,
        flight_number: schedule.flight_number,
        arrival_time: new Date(schedule.arrival_time),
        property_name: schedule.property_name,
        vehicle_standby_arrival_time: new Date(schedule.vehicle_standby_arrival_time),
        departure_time: new Date(schedule.departure_time),
        vehicle_standby_departure_time: new Date(schedule.vehicle_standby_departure_time),
      }));
      
      console.log('💾 [REPO] Mapped data for database:', mappedData);
      
      const flightSchedules = await prisma.flightSchedule.createMany({
        data: mappedData,
      });
      
      console.log('💾 [REPO] createMany result:', flightSchedules);

      // Return the created records
      const savedRecords = await prisma.flightSchedule.findMany({
        where: {
          event_id: data[0]?.event_id,
        },
        orderBy: {
          created_at: 'desc',
        },
        take: data.length,
      });
      
      console.log('💾 [REPO] Retrieved saved records:', savedRecords);
      return savedRecords;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create flight schedules';
      console.error('❌ [REPO] createMany error:', error);
      console.error('❌ [REPO] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      throw new Error(`FlightScheduleRepository.createMany: ${errorMessage}`);
    }
  }

  async findByEventId(eventId: number): Promise<FlightSchedule[]> {
    try {
      return await prisma.flightSchedule.findMany({
        where: {
          event_id: eventId,
        },
        orderBy: {
          created_at: 'desc',
        },
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to find flight schedules by event ID';
      throw new Error(`FlightScheduleRepository.findByEventId: ${errorMessage}`);
    }
  }

  async findById(flightId: number): Promise<FlightSchedule | null> {
    try {
      return await prisma.flightSchedule.findUnique({
        where: {
          flight_id: flightId,
        },
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to find flight schedule by ID';
      throw new Error(`FlightScheduleRepository.findById: ${errorMessage}`);
    }
  }

  async update(flightId: number, data: Partial<FlightScheduleCreate>): Promise<FlightSchedule> {
    try {
      const updateData: any = {};
      
      if (data.first_name) updateData.first_name = data.first_name;
      if (data.last_name) updateData.last_name = data.last_name;
      if (data.flight_number) updateData.flight_number = data.flight_number;
      if (data.arrival_time) updateData.arrival_time = new Date(data.arrival_time);
      if (data.property_name) updateData.property_name = data.property_name;
      if (data.vehicle_standby_arrival_time) updateData.vehicle_standby_arrival_time = new Date(data.vehicle_standby_arrival_time);
      if (data.departure_time) updateData.departure_time = new Date(data.departure_time);
      if (data.vehicle_standby_departure_time) updateData.vehicle_standby_departure_time = new Date(data.vehicle_standby_departure_time);

      return await prisma.flightSchedule.update({
        where: {
          flight_id: flightId,
        },
        data: updateData,
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update flight schedule';
      throw new Error(`FlightScheduleRepository.update: ${errorMessage}`);
    }
  }

  async delete(flightId: number): Promise<FlightSchedule> {
    try {
      return await prisma.flightSchedule.delete({
        where: {
          flight_id: flightId,
        },
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete flight schedule';
      throw new Error(`FlightScheduleRepository.delete: ${errorMessage}`);
    }
  }

  async deleteByEventId(eventId: number): Promise<{ count: number }> {
    try {
      const result = await prisma.flightSchedule.deleteMany({
        where: {
          event_id: eventId,
        },
      });
      return { count: result.count };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete flight schedules by event ID';
      throw new Error(`FlightScheduleRepository.deleteByEventId: ${errorMessage}`);
    }
  }
} 