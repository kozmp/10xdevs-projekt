import type { JobStatus } from "@/types";

export interface JobProgressPageProps {
  jobId: string;
}

export interface Job {
  jobId: string;
  status: JobStatus;
  progress: number;
  style: string;
  language: string;
  publicationMode: "draft" | "publish";
  createdAt: string;
  totalCostEstimate: number | null;
}

export interface Product {
  id: string;
  status: "pending" | "processing" | "completed" | "failed";
  cost: number | null;
}

export interface UseJobProgressPageReturn {
  job: Job | null;
  products: Product[] | null;
  loading: boolean;
  error: Error | null;
  completedProducts: number;
  totalCost: number;
  formattedDate: string;
  canCancel: boolean;
  showCancelModal: boolean;
  handleCancelClick: () => void;
  handleConfirmCancel: () => Promise<void>;
  handleBackClick: () => void;
  setShowCancelModal: (show: boolean) => void;
}
