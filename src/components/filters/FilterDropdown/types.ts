export type ProductStatus = 'published' | 'draft';
export type FilterValue = ProductStatus | 'all';

export interface FilterOption {
  value: FilterValue;
  label: string;
}

export interface FilterDropdownProps {
  value: FilterValue;
  onChange: (value: FilterValue) => void;
  label?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export interface UseFilterDropdownReturn {
  selectId: string;
  options: FilterOption[];
  selectedOption: FilterOption | undefined;
  getOptionLabel: (value: FilterValue) => string;
}
