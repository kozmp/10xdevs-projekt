import type { Job } from '@/types';

export interface DashboardData {
  shop: {
    shopifyDomain: string | null;
  };
  count: number;
  jobs: Job[];
}

export interface DashboardPageProps {
  className?: string;
}

export interface UseDashboardReturn {
  data: DashboardData | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
  hasShop: boolean;
  handleRefresh: () => void;
  handleModalClose: () => void;
  handleModalSuccess: () => void;
}
