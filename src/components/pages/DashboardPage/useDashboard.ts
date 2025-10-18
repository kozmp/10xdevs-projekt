import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { useDashboardData } from '@/components/hooks/useDashboardData';
import { MESSAGES } from './constants';
import type { UseDashboardReturn } from './types';

export function useDashboard(): UseDashboardReturn {
  const { data, loading, error, refetch } = useDashboardData();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Check if shop is not configured and open modal
  useEffect(() => {
    if (data && !data.shop.shopifyDomain) {
      setIsModalOpen(true);
      toast.info(MESSAGES.API_KEY_REQUIRED.TITLE, {
        description: MESSAGES.API_KEY_REQUIRED.DESCRIPTION,
      });
    }
  }, [data]);

  // Show toast on error
  useEffect(() => {
    if (error) {
      toast.error(MESSAGES.ERROR_TOAST.TITLE, {
        description: error.message,
      });
    }
  }, [error]);

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const handleModalSuccess = useCallback(() => {
    refetch();
  }, [refetch]);

  const hasShop = Boolean(data?.shop && data.shop.shopifyDomain);

  return {
    data,
    loading,
    error,
    refetch,
    isModalOpen,
    setIsModalOpen,
    hasShop,
    handleRefresh,
    handleModalClose,
    handleModalSuccess,
  };
}
