import { useMemo } from 'react';
import { STATUS_LABELS, STATUS_COLORS, STATUS_MESSAGES } from './constants';
import type { JobStatus, UseJobProgressBarReturn } from './types';

export function useJobProgressBar(
  progress: number,
  status: JobStatus
): UseJobProgressBarReturn {
  const progressPercentage = useMemo(() => {
    return Math.min(Math.max(progress, 0), 100);
  }, [progress]);

  const statusLabel = useMemo(() => {
    return STATUS_LABELS[status] || status;
  }, [status]);

  const statusColor = useMemo(() => {
    return STATUS_COLORS[status] || 'text-gray-600';
  }, [status]);

  const statusMessage = useMemo(() => {
    return STATUS_MESSAGES[status] || null;
  }, [status]);

  return {
    progressPercentage,
    statusLabel,
    statusColor,
    statusMessage,
  };
}
