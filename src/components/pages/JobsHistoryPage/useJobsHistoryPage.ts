import { useState, useCallback } from 'react';
import { useJobsHistory } from '@/components/hooks/useJobsHistory';
import { JOBS_PER_PAGE, SCROLL_OPTIONS } from './constants';
import type { JobStatus } from '@/types';
import type { UseJobsHistoryPageReturn } from './types';

export function useJobsHistoryPage(
  initialPage = 1,
  initialStatus: JobStatus | 'all' = 'all'
): UseJobsHistoryPageReturn {
  const [page, setPage] = useState(initialPage);
  const [statusFilter, setStatusFilter] = useState<JobStatus | 'all'>(initialStatus);

  const { jobs, meta, loading, error, refetch } = useJobsHistory({
    page,
    limit: JOBS_PER_PAGE,
    status: statusFilter === 'all' ? undefined : statusFilter,
  });

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
    window.scrollTo(SCROLL_OPTIONS);
  }, []);

  const handleFilterChange = useCallback((value: JobStatus | 'all') => {
    setStatusFilter(value);
    setPage(1); // Reset to first page on filter change
  }, []);

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  return {
    page,
    statusFilter,
    jobs,
    meta,
    loading,
    error,
    handlePageChange,
    handleFilterChange,
    handleRefresh,
  };
}
