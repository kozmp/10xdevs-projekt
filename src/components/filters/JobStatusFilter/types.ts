export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
export type JobStatusValue = JobStatus | 'all';

export interface StatusOption {
  value: JobStatusValue;
  label: string;
}

export interface JobStatusFilterProps {
  value: JobStatusValue;
  onChange: (value: JobStatusValue) => void;
  label?: string;
  placeholder?: string;
  className?: string;
}

export interface UseJobStatusFilterReturn {
  selectId: string;
  statusOptions: StatusOption[];
}
