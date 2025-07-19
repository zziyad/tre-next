import { apiService } from './api.service';
import { FlightSchedule, FlightScheduleResponse, FlightScheduleUploadResponse } from '@/types';

class FlightScheduleService {
  private baseUrl = '/events';

  async getFlightSchedules(eventId: number): Promise<FlightScheduleResponse> {
    try {
      const response = await apiService.get<FlightSchedule[]>(`${this.baseUrl}/${eventId}/flight-schedules`);
      return response as FlightScheduleResponse;
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

      // Use fetch directly for FormData since apiService expects JSON
      const response = await fetch(`${this.baseUrl}/${eventId}/flight-schedules/upload`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      const data = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          error: data.error || `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      return data as FlightScheduleUploadResponse;
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