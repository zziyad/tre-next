import { apiService } from './api.service';
import { FlightSchedule, FlightScheduleResponse, FlightScheduleUploadResponse } from '@/types';

class FlightScheduleService {
  private baseUrl = '/events';

  async getFlightSchedules(eventId: number): Promise<FlightScheduleResponse> {
    try {
      console.log('📤 [FRONTEND] Fetching flight schedules for eventId:', eventId);
      const url = `${this.baseUrl}/${eventId}/flight-schedules`;
      console.log('🌐 [FRONTEND] Fetch URL:', url);
      
      const response = await apiService.get<FlightSchedule[]>(url);
      console.log('📥 [FRONTEND] Fetch response:', response);
      
      return response as FlightScheduleResponse;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch flight schedules';
      console.error('❌ [FRONTEND] Fetch error:', error);
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  async uploadFlightSchedules(eventId: number, file: File): Promise<FlightScheduleUploadResponse> {
    try {
      console.log('📤 [FRONTEND] Starting upload with eventId:', eventId);
      console.log('📁 [FRONTEND] File details:', {
        name: file.name,
        size: file.size,
        type: file.type
      });
      
      const formData = new FormData();
      formData.append('file', file);
      console.log('📦 [FRONTEND] FormData created');

      const url = `${this.baseUrl}/${eventId}/flight-schedules/upload`;
      console.log('🌐 [FRONTEND] Upload URL:', url);

      // Use fetch directly for FormData since apiService expects JSON
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      console.log('📥 [FRONTEND] Response status:', response.status);
      console.log('📥 [FRONTEND] Response headers:', Object.fromEntries(response.headers.entries()));

      const data = await response.json();
      console.log('📥 [FRONTEND] Response data:', data);
      
      if (!response.ok) {
        console.error('❌ [FRONTEND] Response not ok:', {
          status: response.status,
          statusText: response.statusText,
          data
        });
        return {
          success: false,
          error: data.error || `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      console.log('✅ [FRONTEND] Upload successful');
      return data as FlightScheduleUploadResponse;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload flight schedules';
      console.error('❌ [FRONTEND] Upload error:', error);
      console.error('❌ [FRONTEND] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      return {
        success: false,
        error: errorMessage,
      };
    }
  }
}

export const frontendFlightScheduleService = new FlightScheduleService(); 