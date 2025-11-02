export type JobStatus = "pending" | "processing" | "completed" | "failed" | "cancelled";
export type PublicationMode = "draft" | "publish";

export interface Job {
  jobId: string;
  status: JobStatus;
  style: string;
  language: string;
  publicationMode: PublicationMode;
  createdAt: string | null;
  totalCostEstimate: number | null;
}

export interface JobsTableProps {
  jobs: Job[];
}

export interface UseJobsTableReturn {
  formatDate: (dateString: string | null) => string;
  handleRowClick: (jobId: string) => void;
  getStatusLabel: (status: JobStatus) => string;
  getStatusColor: (status: JobStatus) => string;
  getPublicationModeLabel: (mode: PublicationMode) => string;
}
