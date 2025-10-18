export interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
  maxLength?: number;
  className?: string;
  label?: string;
  ariaLabel?: string;
}

export interface UseSearchInputReturn {
  inputId: string;
  localValue: string;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleClear: () => void;
  characterCount: string;
  showClearButton: boolean;
}
