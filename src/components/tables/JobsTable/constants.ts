import type { JobStatus } from './types';

export const STATUS_LABELS: Record<JobStatus, string> = {
  pending: 'Oczekujący',
  processing: 'W trakcie',
  completed: 'Zakończony',
  failed: 'Błąd',
  cancelled: 'Anulowany',
};

export const STATUS_COLORS: Record<JobStatus, string> = {
  pending: 'text-yellow-600',
  processing: 'text-blue-600',
  completed: 'text-green-600',
  failed: 'text-red-600',
  cancelled: 'text-gray-600',
};

export const DATE_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  dateStyle: 'short',
  timeStyle: 'short',
};
