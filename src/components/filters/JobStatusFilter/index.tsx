import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useJobStatusFilter } from "./useJobStatusFilter";
import { DEFAULT_LABEL, DEFAULT_PLACEHOLDER } from "./constants";
import type { JobStatusFilterProps } from "./types";

export function JobStatusFilter({
  value,
  onChange,
  label = DEFAULT_LABEL,
  placeholder = DEFAULT_PLACEHOLDER,
  className = "w-[200px]",
}: JobStatusFilterProps) {
  const { selectId, statusOptions } = useJobStatusFilter();

  return (
    <div className="space-y-2">
      <Label htmlFor={selectId}>{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id={selectId} className={className}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {statusOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
