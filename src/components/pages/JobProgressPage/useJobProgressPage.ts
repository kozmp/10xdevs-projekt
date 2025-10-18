import { useMemo, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { useJobProgress } from '@/components/hooks/useJobProgress';
import { DATE_FORMAT_OPTIONS, TOAST_MESSAGES, ROUTES } from './constants';
import type { UseJobProgressPageReturn } from './types';

export function useJobProgressPage(jobId: string): UseJobProgressPageReturn {
  const { job, products, loading, error, cancel } = useJobProgress(jobId);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const completedProducts = useMemo(() => {
    if (!products) return 0;
    return products.filter((p) => p.status === 'completed').length;
  }, [products]);

  const totalCost = useMemo(() => {
    if (!products) return 0;
    return products.reduce((sum, p) => sum + (p.cost || 0), 0);
  }, [products]);

  const formattedDate = useMemo(() => {
    if (!job?.createdAt) return '-';
    return new Intl.DateTimeFormat('pl-PL', DATE_FORMAT_OPTIONS)
      .format(new Date(job.createdAt));
  }, [job]);

  const handleCancelClick = useCallback(() => {
    setShowCancelModal(true);
  }, []);

  const handleConfirmCancel = useCallback(async () => {
    const success = await cancel();
    if (success) {
      toast.success(TOAST_MESSAGES.CANCEL_SUCCESS);
    } else {
      toast.error(TOAST_MESSAGES.CANCEL_ERROR);
    }
    setShowCancelModal(false);
  }, [cancel]);

  const handleBackClick = useCallback(() => {
    window.location.href = ROUTES.JOBS_LIST;
  }, []);

  const canCancel = job?.status === 'processing';

  return {
    job,
    products,
    loading,
    error,
    completedProducts,
    totalCost,
    formattedDate,
    canCancel,
    showCancelModal,
    handleCancelClick,
    handleConfirmCancel,
    handleBackClick,
    setShowCancelModal,
  };
}
