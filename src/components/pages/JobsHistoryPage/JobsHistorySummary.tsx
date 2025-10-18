import React from "react";
import type { JobsHistoryMeta } from "./types";

interface JobsHistorySummaryProps {
  meta: JobsHistoryMeta | null;
}

export function JobsHistorySummary({ meta }: JobsHistorySummaryProps) {
  if (!meta) return null;

  return <div className="text-sm text-muted-foreground mb-4">Znaleziono {meta.total} zleceń</div>;
}
