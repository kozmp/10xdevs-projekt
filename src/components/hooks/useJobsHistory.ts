import { useState, useEffect, useCallback } from 'react';
import type { JobListDTO, JobStatus } from '@/types';

interface UseJobsHistoryParams {
  page?: number;
  limit?: number;
  status?: JobStatus;
  dateFrom?: string;
  dateTo?: string;
}

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface UseJobsHistoryReturn {
  jobs: JobListDTO[];
  meta?: PaginationMeta;
  loading: boolean;
  error?: Error;
  refetch: () => void;
}

export function useJobsHistory({
  page = 1,
  limit = 20,
  status,
  dateFrom,
  dateTo,
}: UseJobsHistoryParams): UseJobsHistoryReturn {
  const [jobs, setJobs] = useState<JobListDTO[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error>();

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError(undefined);

    try {
      // Build query params
      const params = new URLSearchParams();
      params.set('page', page.toString());
      params.set('limit', limit.toString());
      if (status) params.set('status', status);
      if (dateFrom) params.set('dateFrom', dateFrom);
      if (dateTo) params.set('dateTo', dateTo);

      const response = await fetch(`/api/jobs?${params.toString()}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch jobs: ${response.statusText}`);
      }

      const data = await response.json();
      setJobs(data.data || []);
      setMeta(data.meta);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error('Unknown error occurred')
      );
    } finally {
      setLoading(false);
    }
  }, [page, limit, status, dateFrom, dateTo]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  return {
    jobs,
    meta,
    loading,
    error,
    refetch: fetchJobs,
  };
}
