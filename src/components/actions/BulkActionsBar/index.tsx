import React from "react";
import { Card } from "@/components/ui/card";
import { BulkActionsCounter } from "./BulkActionsCounter";
import { BulkActionsButtons } from "./BulkActionsButtons";
import { useBulkActionsBar } from "./useBulkActionsBar";
import { TEXT_LABELS, STYLES } from "./constants";
import type { BulkActionsBarProps } from "./types";

export function BulkActionsBar({
  selectedCount,
  maxLimit,
  onGenerate,
  onClear,
  className = STYLES.CONTAINER,
}: BulkActionsBarProps) {
  const { isDisabled, isMaxReached, handleGenerate, shouldRender, selectedCountClass, generateButtonLabel } =
    useBulkActionsBar(selectedCount, maxLimit, onGenerate);

  if (!shouldRender) {
    return null;
  }

  return (
    <Card className={className}>
      <div className={STYLES.CONTENT}>
        <BulkActionsCounter selectedCount={selectedCount} maxLimit={maxLimit} selectedCountClass={selectedCountClass} />

        {isMaxReached && (
          <span className={STYLES.MAX_LIMIT_ALERT} role="alert">
            {TEXT_LABELS.MAX_LIMIT_REACHED}
          </span>
        )}

        <BulkActionsButtons
          selectedCount={selectedCount}
          isDisabled={isDisabled}
          onClear={onClear}
          onGenerate={handleGenerate}
          generateButtonLabel={generateButtonLabel}
        />
      </div>
    </Card>
  );
}
