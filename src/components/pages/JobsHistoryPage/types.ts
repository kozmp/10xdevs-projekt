import type { JobStatus, JobListDTO } from "@/types";

export interface JobsHistoryPageProps {
  initialPage?: number;
  initialStatus?: JobStatus | "all";
}

export interface JobsHistoryMeta {
  total: number;
  totalPages: number;
  currentPage: number;
  limit: number;
}

export interface UseJobsHistoryPageReturn {
  page: number;
  statusFilter: JobStatus | "all";
  jobs: JobListDTO[];
  meta: JobsHistoryMeta | null;
  loading: boolean;
  error: Error | null;
  handlePageChange: (newPage: number) => void;
  handleFilterChange: (value: JobStatus | "all") => void;
  handleRefresh: () => void;
}
