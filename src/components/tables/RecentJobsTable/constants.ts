export const STATUS_LABELS: Record<string, string> = {
  pending: 'Oczekujący',
  processing: 'W trakcie',
  completed: 'Zakończony',
  failed: 'Błąd',
  cancelled: 'Anulowany',
} as const;

export const STATUS_COLORS: Record<string, string> = {
  pending: 'text-yellow-600',
  processing: 'text-blue-600',
  completed: 'text-green-600',
  failed: 'text-red-600',
  cancelled: 'text-gray-600',
} as const;

export const TABLE_HEADERS = [
  { key: 'id', label: 'ID' },
  { key: 'status', label: 'Status' },
  { key: 'style', label: 'Styl' },
  { key: 'language', label: 'Język' },
  { key: 'createdAt', label: 'Data utworzenia' },
] as const;

export const CARD_TEXTS = {
  TITLE: 'Ostatnie zlecenia',
  DESCRIPTION: '5 ostatnich batch jobów',
  NO_JOBS: 'Brak zleceń',
} as const;

export const DATE_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  dateStyle: 'short',
  timeStyle: 'short',
} as const;

export const STYLES = {
  ROW: 'cursor-pointer hover:bg-muted/50',
  ID_CELL: 'font-medium',
} as const;
