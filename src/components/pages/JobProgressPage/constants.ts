export const DATE_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  dateStyle: 'medium',
  timeStyle: 'short',
};

export const TOAST_MESSAGES = {
  CANCEL_SUCCESS: 'Zlecenie zostało anulowane',
  CANCEL_ERROR: 'Nie udało się anulować zlecenia',
} as const;

export const ROUTES = {
  JOBS_LIST: '/jobs',
} as const;
