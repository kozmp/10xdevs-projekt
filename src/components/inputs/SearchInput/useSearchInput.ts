import { useState, useEffect, useCallback, useId } from 'react';
import type { UseSearchInputReturn } from './types';

export function useSearchInput(
  value: string,
  onChange: (value: string) => void,
  maxLength: number,
  debounceMs: number
): UseSearchInputReturn {
  const [localValue, setLocalValue] = useState(value);
  const inputId = useId();

  // Debounced update to parent
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localValue !== value) {
        onChange(localValue);
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [localValue, debounceMs, onChange, value]);

  // Sync with external value changes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      if (newValue.length <= maxLength) {
        setLocalValue(newValue);
      }
    },
    [maxLength]
  );

  const handleClear = useCallback(() => {
    setLocalValue('');
    onChange('');
  }, [onChange]);

  const characterCount = `${localValue.length}/${maxLength} znaków`;
  const showClearButton = Boolean(localValue);

  return {
    inputId,
    localValue,
    handleChange,
    handleClear,
    characterCount,
    showClearButton,
  };
}
