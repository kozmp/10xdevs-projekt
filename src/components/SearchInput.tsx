import { useState, useEffect, useCallback, useId } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
  maxLength?: number;
}

export function SearchInput({
  value,
  onChange,
  placeholder = "Szukaj produktów...",
  debounceMs = 300,
  maxLength = 50,
}: SearchInputProps) {
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
    setLocalValue("");
    onChange("");
  }, [onChange]);

  return (
    <div className="space-y-2">
      <Label htmlFor={inputId} className="sr-only">
        Wyszukiwanie
      </Label>
      <div className="relative">
        <Input
          id={inputId}
          type="search"
          placeholder={placeholder}
          value={localValue}
          onChange={handleChange}
          maxLength={maxLength}
          className="pr-8"
          aria-label="Wyszukaj produkty"
        />
        {localValue && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label="Wyczyść wyszukiwanie"
          >
            ✕
          </button>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        {localValue.length}/{maxLength} znaków
      </p>
    </div>
  );
}
