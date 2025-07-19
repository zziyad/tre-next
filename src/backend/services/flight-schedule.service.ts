import { IFlightScheduleRepository } from '@/backend/repositories/flight-schedule.repository';
import { FlightScheduleCreate, FlightSchedule, FlightScheduleUploadResponse } from '@/types';
import * as XLSX from 'xlsx';

export interface IFlightScheduleService {
  createFlightSchedule(data: FlightScheduleCreate): Promise<FlightSchedule>;
  getFlightSchedulesByEventId(eventId: number): Promise<FlightSchedule[]>;
  getFlightScheduleById(flightId: number): Promise<FlightSchedule | null>;
  updateFlightSchedule(flightId: number, data: Partial<FlightScheduleCreate>): Promise<FlightSchedule>;
  deleteFlightSchedule(flightId: number): Promise<FlightSchedule>;
  uploadFlightSchedules(eventId: number, fileBuffer: Buffer): Promise<FlightScheduleUploadResponse>;
}

export class FlightScheduleService implements IFlightScheduleService {
  constructor(private flightScheduleRepository: IFlightScheduleRepository) {}

  async createFlightSchedule(data: FlightScheduleCreate): Promise<FlightSchedule> {
    try {
      return await this.flightScheduleRepository.create(data);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create flight schedule';
      throw new Error(`FlightScheduleService.createFlightSchedule: ${errorMessage}`);
    }
  }

  async getFlightSchedulesByEventId(eventId: number): Promise<FlightSchedule[]> {
    try {
      const schedules = await this.flightScheduleRepository.findByEventId(eventId);
      return schedules.map(schedule => ({
        ...schedule,
        arrival_time: schedule.arrival_time.toISOString(),
        vehicle_standby_arrival_time: schedule.vehicle_standby_arrival_time.toISOString(),
        departure_time: schedule.departure_time.toISOString(),
        vehicle_standby_departure_time: schedule.vehicle_standby_departure_time.toISOString(),
        created_at: schedule.created_at.toISOString(),
      }));
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get flight schedules';
      throw new Error(`FlightScheduleService.getFlightSchedulesByEventId: ${errorMessage}`);
    }
  }

  async getFlightScheduleById(flightId: number): Promise<FlightSchedule | null> {
    try {
      const schedule = await this.flightScheduleRepository.findById(flightId);
      if (!schedule) return null;

      return {
        ...schedule,
        arrival_time: schedule.arrival_time.toISOString(),
        vehicle_standby_arrival_time: schedule.vehicle_standby_arrival_time.toISOString(),
        departure_time: schedule.departure_time.toISOString(),
        vehicle_standby_departure_time: schedule.vehicle_standby_departure_time.toISOString(),
        created_at: schedule.created_at.toISOString(),
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get flight schedule';
      throw new Error(`FlightScheduleService.getFlightScheduleById: ${errorMessage}`);
    }
  }

  async updateFlightSchedule(flightId: number, data: Partial<FlightScheduleCreate>): Promise<FlightSchedule> {
    try {
      const updatedSchedule = await this.flightScheduleRepository.update(flightId, data);
      return {
        ...updatedSchedule,
        arrival_time: updatedSchedule.arrival_time.toISOString(),
        vehicle_standby_arrival_time: updatedSchedule.vehicle_standby_arrival_time.toISOString(),
        departure_time: updatedSchedule.departure_time.toISOString(),
        vehicle_standby_departure_time: updatedSchedule.vehicle_standby_departure_time.toISOString(),
        created_at: updatedSchedule.created_at.toISOString(),
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update flight schedule';
      throw new Error(`FlightScheduleService.updateFlightSchedule: ${errorMessage}`);
    }
  }

  async deleteFlightSchedule(flightId: number): Promise<FlightSchedule> {
    try {
      const deletedSchedule = await this.flightScheduleRepository.delete(flightId);
      return {
        ...deletedSchedule,
        arrival_time: deletedSchedule.arrival_time.toISOString(),
        vehicle_standby_arrival_time: deletedSchedule.vehicle_standby_arrival_time.toISOString(),
        departure_time: deletedSchedule.departure_time.toISOString(),
        vehicle_standby_departure_time: deletedSchedule.vehicle_standby_departure_time.toISOString(),
        created_at: deletedSchedule.created_at.toISOString(),
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete flight schedule';
      throw new Error(`FlightScheduleService.deleteFlightSchedule: ${errorMessage}`);
    }
  }

  async uploadFlightSchedules(eventId: number, fileBuffer: Buffer): Promise<FlightScheduleUploadResponse> {
    try {
      // Parse Excel file
      const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      if (!jsonData || jsonData.length < 2) {
        throw new Error('Invalid Excel file format. File must contain at least a header row and one data row.');
      }

      const headers = jsonData[0] as string[];
      const dataRows = jsonData.slice(1) as any[][];

      // Validate headers
      const expectedHeaders = [
        'First Name', 'Last Name', 'Flight Number', 'Arrival Date', 'Arrival Time',
        'Property Name', 'Vehicle Standby', 'Departure Date', 'Departure Time', 'Vehicle Standby'
      ];

      const missingHeaders = expectedHeaders.filter(header => !headers.includes(header));
      if (missingHeaders.length > 0) {
        throw new Error(`Missing required headers: ${missingHeaders.join(', ')}`);
      }

      const processedSchedules: FlightScheduleCreate[] = [];
      const failedRecords: string[] = [];

      // Process each row
      dataRows.forEach((row, index) => {
        try {
          if (row.length < 10) {
            failedRecords.push(`Row ${index + 2}: Insufficient data`);
            return;
          }

          const [
            firstName, lastName, flightNumber, arrivalDate, arrivalTime,
            propertyName, vehicleStandbyArrival, departureDate, departureTime, vehicleStandbyDeparture
          ] = row;

          // Validate required fields
          if (!firstName || !lastName || !flightNumber || !arrivalDate || !arrivalTime ||
              !propertyName || !vehicleStandbyArrival || !departureDate || !departureTime || !vehicleStandbyDeparture) {
            failedRecords.push(`Row ${index + 2}: Missing required fields`);
            return;
          }

          // Parse dates and times
          const arrivalDateTime = this.parseDateTime(arrivalDate, arrivalTime);
          const departureDateTime = this.parseDateTime(departureDate, departureTime);
          const vehicleStandbyArrivalDateTime = this.parseDateTime(arrivalDate, vehicleStandbyArrival);
          const vehicleStandbyDepartureDateTime = this.parseDateTime(departureDate, vehicleStandbyDeparture);

          if (!arrivalDateTime || !departureDateTime || !vehicleStandbyArrivalDateTime || !vehicleStandbyDepartureDateTime) {
            failedRecords.push(`Row ${index + 2}: Invalid date/time format`);
            return;
          }

          processedSchedules.push({
            event_id: eventId,
            first_name: String(firstName).trim(),
            last_name: String(lastName).trim(),
            flight_number: String(flightNumber).trim(),
            arrival_time: arrivalDateTime.toISOString(),
            property_name: String(propertyName).trim(),
            vehicle_standby_arrival_time: vehicleStandbyArrivalDateTime.toISOString(),
            departure_time: departureDateTime.toISOString(),
            vehicle_standby_departure_time: vehicleStandbyDepartureDateTime.toISOString(),
          });
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          failedRecords.push(`Row ${index + 2}: ${errorMessage}`);
        }
      });

      // Save to database
      let savedSchedules: FlightSchedule[] = [];
      if (processedSchedules.length > 0) {
        savedSchedules = await this.flightScheduleRepository.createMany(processedSchedules);
      }

      return {
        success: true,
        data: {
          totalRecords: dataRows.length,
          processedRecords: processedSchedules.length,
          failedRecords: failedRecords.length,
          schedules: savedSchedules.map(schedule => ({
            ...schedule,
            arrival_time: schedule.arrival_time.toISOString(),
            vehicle_standby_arrival_time: schedule.vehicle_standby_arrival_time.toISOString(),
            departure_time: schedule.departure_time.toISOString(),
            vehicle_standby_departure_time: schedule.vehicle_standby_departure_time.toISOString(),
            created_at: schedule.created_at.toISOString(),
          })),
        },
        message: `Successfully processed ${processedSchedules.length} records. ${failedRecords.length} records failed.`,
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload flight schedules';
      throw new Error(`FlightScheduleService.uploadFlightSchedules: ${errorMessage}`);
    }
  }

  private parseDateTime(date: any, time: any): Date | null {
    try {
      // Handle different date formats
      let dateStr = String(date);
      let timeStr = String(time);

      // If date is already a Date object or timestamp
      if (date instanceof Date) {
        dateStr = date.toISOString().split('T')[0];
      } else if (typeof date === 'number') {
        dateStr = new Date(date).toISOString().split('T')[0];
      }

      // If time is already a Date object or timestamp
      if (time instanceof Date) {
        timeStr = time.toTimeString().split(' ')[0];
      } else if (typeof time === 'number') {
        timeStr = new Date(time).toTimeString().split(' ')[0];
      }

      // Handle Excel date numbers
      if (typeof date === 'number' && date > 1000) {
        const excelDate = new Date((date - 25569) * 86400 * 1000);
        dateStr = excelDate.toISOString().split('T')[0];
      }

      if (typeof time === 'number' && time < 1) {
        // Excel time is a fraction of a day
        const totalSeconds = time * 24 * 60 * 60;
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = Math.floor(totalSeconds % 60);
        timeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      }

      // Combine date and time
      const dateTimeStr = `${dateStr}T${timeStr}`;
      const parsedDate = new Date(dateTimeStr);

      if (isNaN(parsedDate.getTime())) {
        return null;
      }

      return parsedDate;
    } catch {
      return null;
    }
  }
} 