import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SearchClearButton } from "./SearchClearButton";
import { SearchCharacterCount } from "./SearchCharacterCount";
import { useSearchInput } from "./useSearchInput";
import { DEFAULT_VALUES, STYLES } from "./constants";
import type { SearchInputProps } from "./types";

export function SearchInput({
  value,
  onChange,
  placeholder = DEFAULT_VALUES.PLACEHOLDER,
  debounceMs = DEFAULT_VALUES.DEBOUNCE_MS,
  maxLength = DEFAULT_VALUES.MAX_LENGTH,
  className = STYLES.CONTAINER,
  label = DEFAULT_VALUES.LABEL,
  ariaLabel = DEFAULT_VALUES.ARIA_LABEL,
}: SearchInputProps) {
  const { inputId, localValue, handleChange, handleClear, characterCount, showClearButton } = useSearchInput(
    value,
    onChange,
    maxLength,
    debounceMs
  );

  return (
    <div className={className}>
      <Label htmlFor={inputId} className="sr-only">
        {label}
      </Label>
      <div className="relative">
        <Input
          id={inputId}
          type="search"
          placeholder={placeholder}
          value={localValue}
          onChange={handleChange}
          maxLength={maxLength}
          className={STYLES.INPUT}
          aria-label={ariaLabel}
        />
        {showClearButton && <SearchClearButton onClick={handleClear} />}
      </div>
      <SearchCharacterCount count={characterCount} />
    </div>
  );
}
