import { useId } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import type { JobStatus } from "@/types";

interface JobStatusFilterProps {
  value: JobStatus | "all";
  onChange: (value: JobStatus | "all") => void;
}

const statusOptions: { value: JobStatus | "all"; label: string }[] = [
  { value: "all", label: "Wszystkie" },
  { value: "pending", label: "Oczekujące" },
  { value: "processing", label: "W trakcie" },
  { value: "completed", label: "Zakończone" },
  { value: "failed", label: "Błąd" },
  { value: "cancelled", label: "Anulowane" },
];

export function JobStatusFilter({ value, onChange }: JobStatusFilterProps) {
  const selectId = useId();

  return (
    <div className="space-y-2">
      <Label htmlFor={selectId}>Status zlecenia</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id={selectId} className="w-[200px]">
          <SelectValue placeholder="Wybierz status" />
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
