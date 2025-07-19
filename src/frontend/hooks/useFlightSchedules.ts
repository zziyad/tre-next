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
    setIsLoading(true);
    setError(null);

    try {
      const response = await frontendFlightScheduleService.getFlightSchedules(eventId);
      
      if (response.success && response.data) {
        setSchedules(response.data);
      } else {
        setError(response.error || 'Failed to fetch flight schedules');
        toast.error(response.error || 'Failed to fetch flight schedules');
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch flight schedules';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [eventId]);

  const uploadSchedules = useCallback(async (file: File): Promise<FlightScheduleUploadResponse> => {
    setIsUploading(true);
    setError(null);

    try {
      const response = await frontendFlightScheduleService.uploadFlightSchedules(eventId, file);
      
      if (response.success && response.data) {
        // Refresh the schedules list
        await fetchSchedules();
        
        const message = response.message || `Successfully uploaded ${response.data.processedRecords} flight schedules`;
        toast.success(message);
        
        if (response.data.failedRecords > 0) {
          toast.warning(`${response.data.failedRecords} records failed to process`);
        }
      } else {
        setError(response.error || 'Failed to upload flight schedules');
        toast.error(response.error || 'Failed to upload flight schedules');
      }
      
      return response;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload flight schedules';
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
  };
} 