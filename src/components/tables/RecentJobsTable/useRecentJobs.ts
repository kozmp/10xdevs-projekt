import { useCallback, useMemo } from 'react';
import { STATUS_LABELS, STATUS_COLORS, DATE_FORMAT_OPTIONS } from './constants';
import type { JobStatus, UseRecentJobsReturn } from './types';
import type { JobListDTO } from '@/types';

export function useRecentJobs(
  jobs: JobListDTO[],
  onJobClick?: (jobId: string) => void
): UseRecentJobsReturn {
  const formatDate = useCallback((dateString: string | null) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pl-PL', DATE_FORMAT_OPTIONS).format(date);
  }, []);

  const handleRowClick = useCallback(
    (jobId: string) => {
      if (onJobClick) {
        onJobClick(jobId);
      } else {
        window.location.href = `/jobs/${jobId}`;
      }
    },
    [onJobClick]
  );

  const getStatusLabel = useCallback((status: JobStatus) => {
    return STATUS_LABELS[status] || status;
  }, []);

  const getStatusColor = useCallback((status: JobStatus) => {
    return STATUS_COLORS[status] || 'text-gray-600';
  }, []);

  const shouldShowEmptyState = useMemo(() => jobs.length === 0, [jobs]);

  return {
    formatDate,
    handleRowClick,
    getStatusLabel,
    getStatusColor,
    shouldShowEmptyState,
  };
}
