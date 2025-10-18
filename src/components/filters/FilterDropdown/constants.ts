import type { FilterOption } from './types';

export const FILTER_OPTIONS: FilterOption[] = [
  { value: 'all', label: 'Wszystkie' },
  { value: 'published', label: 'Opublikowane' },
  { value: 'draft', label: 'Szkice' },
];

export const DEFAULT_LABEL = 'Status produktu';
export const DEFAULT_PLACEHOLDER = 'Wybierz status';

export const STYLES = {
  CONTAINER: 'space-y-2',
  TRIGGER: 'w-[200px]',
} as const;
