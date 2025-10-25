import { useState, useEffect, useCallback } from "react";

/**
 * Custom hook do pollingu kosztów joba
 *
 * Pobiera job co X sekund aż koszty się załadują.
 * Użyteczny dla asynchronicznej kalkulacji kosztów (ETAP 1).
 *
 * @param jobId - ID joba do monitorowania
 * @param initialData - Początkowe dane joba (opcjonalne, żeby uniknąć pierwszego fetcha)
 * @param pollInterval - Interwał pollingu w ms (domyślnie 2000ms = 2s)
 * @param maxAttempts - Maksymalna liczba prób (domyślnie 30 = 1 minuta przy 2s interwale)
 * @returns Stan z danymi joba, loading, error
 *
 * @example
 * ```tsx
 * const { job, isLoading, error } = useJobCostEstimate(jobId, initialJobData);
 *
 * return (
 *   <JobCostEstimateCard
 *     totalCostEstimate={job?.totalCostEstimate}
 *     estimatedTokensTotal={job?.estimatedTokensTotal}
 *     isLoading={isLoading}
 *   />
 * );
 * ```
 */

interface JobData {
  id: string;
  totalCostEstimate?: number | null;
  estimatedTokensTotal?: number | null;
  status: string;
  [key: string]: any;
}

interface UseJobCostEstimateOptions {
  /** Interwał pollingu w milisekundach (domyślnie 2000ms) */
  pollInterval?: number;
  /** Maksymalna liczba prób pollingu (domyślnie 30) */
  maxAttempts?: number;
  /** Czy włączyć polling (domyślnie true) */
  enabled?: boolean;
}

interface UseJobCostEstimateResult {
  /** Dane joba */
  job: JobData | null;
  /** Czy trwa ładowanie */
  isLoading: boolean;
  /** Błąd (jeśli wystąpił) */
  error: Error | null;
  /** Czy polling jest aktywny */
  isPolling: boolean;
  /** Liczba prób pollingu */
  attempts: number;
  /** Ręczne odświeżenie danych */
  refetch: () => Promise<void>;
}

export function useJobCostEstimate(
  jobId: string,
  initialData?: JobData | null,
  options: UseJobCostEstimateOptions = {}
): UseJobCostEstimateResult {
  const { pollInterval = 2000, maxAttempts = 30, enabled = true } = options;

  const [job, setJob] = useState<JobData | null>(initialData || null);
  const [isLoading, setIsLoading] = useState<boolean>(!initialData);
  const [error, setError] = useState<Error | null>(null);
  const [isPolling, setIsPolling] = useState<boolean>(false);
  const [attempts, setAttempts] = useState<number>(0);

  /**
   * Funkcja do pobierania danych joba z API
   */
  const fetchJob = useCallback(async (): Promise<JobData | null> => {
    try {
      const response = await fetch(`/api/jobs/${jobId}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch job: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      throw err instanceof Error ? err : new Error("Unknown error fetching job");
    }
  }, [jobId]);

  /**
   * Ręczne odświeżenie danych
   */
  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchJob();
      setJob(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [fetchJob]);

  /**
   * Sprawdza czy koszty są już dostępne
   */
  const hasCostEstimate = useCallback((jobData: JobData | null): boolean => {
    if (!jobData) return false;
    return (
      jobData.totalCostEstimate !== null &&
      jobData.totalCostEstimate !== undefined &&
      jobData.estimatedTokensTotal !== null &&
      jobData.estimatedTokensTotal !== undefined
    );
  }, []);

  /**
   * Effect do pollingu
   */
  useEffect(() => {
    if (!enabled) return;

    // Jeśli mamy już koszty, nie ma potrzeby pollingu
    if (hasCostEstimate(job)) {
      setIsPolling(false);
      setIsLoading(false);
      return;
    }

    // Jeśli przekroczono maksymalną liczbę prób
    if (attempts >= maxAttempts) {
      setIsPolling(false);
      setIsLoading(false);
      setError(new Error(`Max polling attempts reached (${maxAttempts})`));
      return;
    }

    setIsPolling(true);

    const poll = async () => {
      try {
        const data = await fetchJob();
        setJob(data);
        setAttempts((prev) => prev + 1);

        // Jeśli koszty są dostępne, zatrzymaj polling
        if (hasCostEstimate(data)) {
          setIsPolling(false);
          setIsLoading(false);
        }
      } catch (err) {
        setError(err as Error);
        setIsPolling(false);
        setIsLoading(false);
      }
    };

    // Pierwszy fetch natychmiast (jeśli nie ma initialData)
    if (!job && attempts === 0) {
      poll();
    }

    // Następne fetche co pollInterval
    const intervalId = setInterval(poll, pollInterval);

    // Cleanup
    return () => {
      clearInterval(intervalId);
    };
  }, [enabled, job, attempts, maxAttempts, pollInterval, fetchJob, hasCostEstimate]);

  return {
    job,
    isLoading,
    error,
    isPolling,
    attempts,
    refetch,
  };
}
