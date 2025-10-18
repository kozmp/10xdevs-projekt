import React from "react";
import { TEXT_LABELS, STYLES } from "./constants";

interface BulkActionsCounterProps {
  selectedCount: number;
  maxLimit: number;
  selectedCountClass: string;
}

export function BulkActionsCounter({ selectedCount, maxLimit, selectedCountClass }: BulkActionsCounterProps) {
  return (
    <div className={STYLES.COUNTER}>
      <span className={STYLES.COUNTER_LABEL}>{TEXT_LABELS.SELECTED}</span>
      <span className={`${STYLES.COUNTER_VALUE} ${selectedCountClass}`}>{selectedCount}</span>
      <span className={STYLES.COUNTER_MAX}>/ {maxLimit}</span>
    </div>
  );
}
