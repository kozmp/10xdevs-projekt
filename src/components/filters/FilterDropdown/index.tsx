import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useFilterDropdown } from "./useFilterDropdown";
import { DEFAULT_LABEL, DEFAULT_PLACEHOLDER, STYLES } from "./constants";
import type { FilterDropdownProps } from "./types";

export function FilterDropdown({
  value,
  onChange,
  label = DEFAULT_LABEL,
  placeholder = DEFAULT_PLACEHOLDER,
  className = STYLES.CONTAINER,
  disabled,
}: FilterDropdownProps) {
  const { selectId, options, getOptionLabel } = useFilterDropdown(value);

  return (
    <div className={className}>
      <Label htmlFor={selectId}>{label}</Label>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger id={selectId} className={STYLES.TRIGGER}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
