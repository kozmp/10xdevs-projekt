import { useId, useMemo } from 'react';
import { FILTER_OPTIONS } from './constants';
import type { FilterValue, UseFilterDropdownReturn } from './types';

export function useFilterDropdown(value: FilterValue): UseFilterDropdownReturn {
  const selectId = useId();

  const selectedOption = useMemo(() => {
    return FILTER_OPTIONS.find((option) => option.value === value);
  }, [value]);

  const getOptionLabel = useMemo(() => {
    return (value: FilterValue) => {
      return FILTER_OPTIONS.find((option) => option.value === value)?.label || '';
    };
  }, []);

  return {
    selectId,
    options: FILTER_OPTIONS,
    selectedOption,
    getOptionLabel,
  };
}
