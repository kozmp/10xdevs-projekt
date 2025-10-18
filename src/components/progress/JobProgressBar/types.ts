export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';

export interface JobProgressBarProps {
  progress: number;
  status: JobStatus;
  totalProducts: number;
  completedProducts: number;
}

export interface UseJobProgressBarReturn {
  progressPercentage: number;
  statusLabel: string;
  statusColor: string;
  statusMessage: string | null;
}
