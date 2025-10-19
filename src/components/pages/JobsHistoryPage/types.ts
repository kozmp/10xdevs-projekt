import type { JobStatus } from "@/types";

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
  jobs: any[]; // TODO: Replace with proper Job type
  meta: JobsHistoryMeta | null;
  loading: boolean;
  error: Error | null;
  handlePageChange: (newPage: number) => void;
  handleFilterChange: (value: JobStatus | "all") => void;
  handleRefresh: () => void;
}
