import type { JobListDTO } from '@/types';

export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';

export interface RecentJobsTableProps {
  jobs: JobListDTO[];
  className?: string;
  maxItems?: number;
  onJobClick?: (jobId: string) => void;
}

export interface UseRecentJobsReturn {
  formatDate: (dateString: string | null) => string;
  handleRowClick: (jobId: string) => void;
  getStatusLabel: (status: JobStatus) => string;
  getStatusColor: (status: JobStatus) => string;
  shouldShowEmptyState: boolean;
}
