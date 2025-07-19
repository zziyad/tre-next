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
      return schedules; // Return as-is since they're already Date objects
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get flight schedules';
      throw new Error(`FlightScheduleService.getFlightSchedulesByEventId: ${errorMessage}`);
    }
  }

  async getFlightScheduleById(flightId: number): Promise<FlightSchedule | null> {
    try {
      const schedule = await this.flightScheduleRepository.findById(flightId);
      return schedule; // Return as-is since it's already a Date object
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get flight schedule';
      throw new Error(`FlightScheduleService.getFlightScheduleById: ${errorMessage}`);
    }
  }

  async updateFlightSchedule(flightId: number, data: Partial<FlightScheduleCreate>): Promise<FlightSchedule> {
    try {
      const updatedSchedule = await this.flightScheduleRepository.update(flightId, data);
      return updatedSchedule; // Return as-is since it's already a Date object
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update flight schedule';
      throw new Error(`FlightScheduleService.updateFlightSchedule: ${errorMessage}`);
    }
  }

  async deleteFlightSchedule(flightId: number): Promise<FlightSchedule> {
    try {
      const deletedSchedule = await this.flightScheduleRepository.delete(flightId);
      return deletedSchedule; // Return as-is since it's already a Date object
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
          schedules: savedSchedules, // Return as-is since they're already Date objects
        },
        message: `Successfully processed ${processedSchedules.length} records. ${failedRecords.length} records failed.`,
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload flight schedules';
      throw new Error(`FlightScheduleService.uploadFlightSchedules: ${errorMessage}`);
    }
  }

  private formatTime(value: any): string {
    if (!value) return '';
    
    if (typeof value === 'string') {
      // Try to parse string as time (e.g., "3:20", "03:20", "1:00 AM", "3.20")
      const timePatterns = [
        /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/, // HH:mm or H:mm
        /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i, // H:mm AM/PM
        /^(\d{1,2})\.(\d{2})$/, // H.mm
        /^(\d{1,2}):(\d{2}):(\d{2})$/, // HH:mm:ss
      ];

      for (const pattern of timePatterns) {
        const match = value.toString().match(pattern);
        if (match) {
          let hours = parseInt(match[1]);
          const minutes = parseInt(match[2]);
          
          // Handle AM/PM
          if (match[3] && match[3].toUpperCase() === 'PM' && hours !== 12) {
            hours += 12;
          } else if (match[3] && match[3].toUpperCase() === 'AM' && hours === 12) {
            hours = 0;
          }
          
          return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        }
      }
      return '';
    }
    
    if (typeof value === 'number') {
      // Excel decimal time (e.g., 0.138888888888889 for 3:20)
      const totalHours = value * 24;
      const hours = Math.floor(totalHours);
      const minutes = Math.round((totalHours - hours) * 60);
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }
    
    return '';
  }

  private parseDateTime(date: any, time: any): Date | null {
    try {
      let dateStr = '';
      let timeStr = '';

      // Handle date parsing
      if (date instanceof Date) {
        dateStr = date.toISOString().split('T')[0];
      } else if (typeof date === 'number') {
        // Excel date number
        if (date > 1000) {
          const excelDate = new Date((date - 25569) * 86400 * 1000);
          dateStr = excelDate.toISOString().split('T')[0];
        } else {
          return null;
        }
      } else if (typeof date === 'string') {
        // Try to parse various date formats
        const datePatterns = [
          /^\d{1,2}\/\d{1,2}\/\d{4}$/, // M/D/YYYY
          /^\d{4}-\d{2}-\d{2}$/, // YYYY-MM-DD
          /^\d{1,2}-\d{1,2}-\d{4}$/, // D-M-YYYY
        ];

        let parsedDate: Date | null = null;
        for (const pattern of datePatterns) {
          if (pattern.test(date)) {
            parsedDate = new Date(date);
            if (!isNaN(parsedDate.getTime())) {
              dateStr = parsedDate.toISOString().split('T')[0];
              break;
            }
          }
        }

        if (!dateStr) {
          // Try direct parsing
          const directDate = new Date(date);
          if (!isNaN(directDate.getTime())) {
            dateStr = directDate.toISOString().split('T')[0];
          }
        }
      }

      if (!dateStr) {
        return null;
      }

      // Handle time parsing
      timeStr = this.formatTime(time);
      if (!timeStr) {
        return null;
      }

      // Combine date and time
      const dateTimeStr = `${dateStr}T${timeStr}`;
      const parsedDateTime = new Date(dateTimeStr);

      if (isNaN(parsedDateTime.getTime())) {
        return null;
      }

      return parsedDateTime;
    } catch (error) {
      console.error('Error parsing date/time:', error);
      return null;
    }
  }
} 