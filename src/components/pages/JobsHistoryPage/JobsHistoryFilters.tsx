import React from "react";
import { JobStatusFilter } from "@/components/JobStatusFilter";
import type { JobStatus } from "@/types";

interface JobsHistoryFiltersProps {
  value: JobStatus | "all";
  onChange: (value: JobStatus | "all") => void;
}

export function JobsHistoryFilters({ value, onChange }: JobsHistoryFiltersProps) {
  return (
    <section className="flex flex-col md:flex-row gap-4 mb-6">
      <JobStatusFilter value={value} onChange={onChange} />
    </section>
  );
}
