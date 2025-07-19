import { apiService } from './api.service';
import { FlightSchedule, FlightScheduleResponse, FlightScheduleUploadResponse } from '@/types';

class FlightScheduleService {
  private baseUrl = '/api/events';

  async getFlightSchedules(eventId: number): Promise<FlightScheduleResponse> {
    try {
      const response = await apiService.get(`${this.baseUrl}/${eventId}/flight-schedules`);
      return response;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch flight schedules';
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  async uploadFlightSchedules(eventId: number, file: File): Promise<FlightScheduleUploadResponse> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await apiService.post(`${this.baseUrl}/${eventId}/flight-schedules/upload`, formData, {
        headers: {
          // Don't set Content-Type for FormData, let the browser set it with boundary
        },
      });

      return response;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload flight schedules';
      return {
        success: false,
        error: errorMessage,
      };
    }
  }
}

export const frontendFlightScheduleService = new FlightScheduleService(); 