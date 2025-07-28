import { useState, useEffect, useCallback } from 'react';
import { FlightSchedule, FlightScheduleUploadResponse } from '@/types';
import { frontendFlightScheduleService } from '@/frontend/services/flight-schedule.service';
import { toast } from 'sonner';

interface UseFlightSchedulesProps {
  eventId: number;
}

export function useFlightSchedules({ eventId }: UseFlightSchedulesProps) {
  const [schedules, setSchedules] = useState<FlightSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSchedules = useCallback(async () => {
    console.log('🚀 [HOOK] Starting fetchSchedules for eventId:', eventId);
    setIsLoading(true);
    setError(null);

    try {
      console.log('📤 [HOOK] Calling getFlightSchedules...');
      const response = await frontendFlightScheduleService.getFlightSchedules(eventId);
      console.log('📥 [HOOK] getFlightSchedules response:', response);
      
      if (response.success && response.data) {
        console.log('✅ [HOOK] Setting schedules:', response.data);
        setSchedules(response.data);
      } else {
        console.error('❌ [HOOK] Fetch failed:', response.error);
        setError(response.error || 'Failed to fetch flight schedules');
        toast.error(response.error || 'Failed to fetch flight schedules');
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch flight schedules';
      console.error('❌ [HOOK] Fetch error:', err);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [eventId]);

  const uploadSchedules = useCallback(async (file: File): Promise<FlightScheduleUploadResponse> => {
    console.log('🚀 [HOOK] Starting upload with file:', {
      name: file.name,
      size: file.size,
      type: file.type
    });
    
    setIsUploading(true);
    setError(null);

    try {
      console.log('📤 [HOOK] Calling frontend service...');
      const response = await frontendFlightScheduleService.uploadFlightSchedules(eventId, file);
      console.log('📥 [HOOK] Service response:', response);
      
      if (response.success && response.data) {
        console.log('✅ [HOOK] Upload successful, refreshing schedules...');
        // Refresh the schedules list
        await fetchSchedules();
        
        const message = response.message || `Successfully uploaded ${response.data.processedRecords} flight schedules`;
        toast.success(message);
        
        if (response.data.failedRecords > 0) {
          toast.warning(`${response.data.failedRecords} records failed to process`);
        }
      } else {
        console.error('❌ [HOOK] Upload failed:', response.error);
        setError(response.error || 'Failed to upload flight schedules');
        toast.error(response.error || 'Failed to upload flight schedules');
      }
      
      return response;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload flight schedules';
      console.error('❌ [HOOK] Upload error:', err);
      setError(errorMessage);
      toast.error(errorMessage);
      
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setIsUploading(false);
    }
  }, [eventId, fetchSchedules]);

  const downloadSchedules = useCallback(async () => {
    console.log('🚀 [HOOK] Starting download for eventId:', eventId);
    
    try {
      console.log('📤 [HOOK] Calling download API...');
      const response = await fetch(`/api/events/${eventId}/flight-schedules/download`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to download flight schedules');
      }

      // Get the filename from the response headers
      const contentDisposition = response.headers.get('content-disposition');
      let filename = 'flight-schedules.xlsx';
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      console.log('✅ [HOOK] Download successful');
      toast.success('Flight schedules downloaded successfully');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to download flight schedules';
      console.error('❌ [HOOK] Download error:', err);
      toast.error(errorMessage);
    }
  }, [eventId]);

  useEffect(() => {
    if (eventId) {
      fetchSchedules();
    }
  }, [eventId, fetchSchedules]);

  return {
    schedules,
    isLoading,
    isUploading,
    error,
    fetchSchedules,
    uploadSchedules,
    downloadSchedules,
  };
} 