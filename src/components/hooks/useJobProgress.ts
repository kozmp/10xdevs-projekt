import { useState, useEffect, useCallback, useRef } from 'react';
import type { JobDetailDTO, JobProductDTO } from '@/types';

interface UseJobProgressReturn {
  job?: JobDetailDTO;
  products?: JobProductDTO[];
  loading: boolean;
  error?: Error;
  cancel: () => Promise<boolean>;
  refetch: () => void;
}

const POLLING_INTERVAL = 2000; // 2 seconds

export function useJobProgress(jobId: string | null): UseJobProgressReturn {
  const [job, setJob] = useState<JobDetailDTO>();
  const [products, setProducts] = useState<JobProductDTO[]>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error>();
  const intervalRef = useRef<number>();

  const fetchJobData = useCallback(async () => {
    if (!jobId) {
      setLoading(false);
      return;
    }

    try {
      // Fetch job details
      const jobResponse = await fetch(`/api/jobs/${jobId}`);
      if (!jobResponse.ok) {
        throw new Error(`Failed to fetch job: ${jobResponse.statusText}`);
      }
      const jobData: JobDetailDTO = await jobResponse.json();
      setJob(jobData);

      // Fetch job products
      const productsResponse = await fetch(`/api/jobs/${jobId}/products`);
      if (!productsResponse.ok) {
        throw new Error(
          `Failed to fetch job products: ${productsResponse.statusText}`
        );
      }
      const productsData = await productsResponse.json();
      setProducts(productsData.data || []);

      setError(undefined);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error('Unknown error occurred')
      );
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  const cancel = useCallback(async (): Promise<boolean> => {
    if (!jobId) return false;

    try {
      const response = await fetch(`/api/jobs/${jobId}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        throw new Error('Failed to cancel job');
      }

      // Refetch to get updated status
      await fetchJobData();
      return true;
    } catch (err) {
      console.error('Failed to cancel job:', err);
      return false;
    }
  }, [jobId, fetchJobData]);

  // Initial fetch
  useEffect(() => {
    fetchJobData();
  }, [fetchJobData]);

  // Setup polling
  useEffect(() => {
    if (!job || !jobId) return;

    // Stop polling if job is in final state
    const finalStates = ['completed', 'failed', 'cancelled'];
    if (finalStates.includes(job.status)) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = undefined;
      }
      return;
    }

    // Start polling for active jobs
    intervalRef.current = window.setInterval(() => {
      fetchJobData();
    }, POLLING_INTERVAL);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = undefined;
      }
    };
  }, [job, jobId, fetchJobData]);

  return {
    job,
    products,
    loading,
    error,
    cancel,
    refetch: fetchJobData,
  };
}
