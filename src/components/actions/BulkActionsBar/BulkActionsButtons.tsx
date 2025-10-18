import React from "react";
import { Button } from "@/components/ui/button";
import { BUTTON_VARIANTS, BUTTON_SIZES, BUTTON_LABELS, BUTTON_ARIA_LABELS, STYLES } from "./constants";

interface BulkActionsButtonsProps {
  selectedCount: number;
  isDisabled: boolean;
  onClear: () => void;
  onGenerate: () => void;
  generateButtonLabel: string;
}

export function BulkActionsButtons({
  selectedCount,
  isDisabled,
  onClear,
  onGenerate,
  generateButtonLabel,
}: BulkActionsButtonsProps) {
  return (
    <div className={STYLES.BUTTONS}>
      <Button
        variant={BUTTON_VARIANTS.CLEAR}
        size={BUTTON_SIZES.DEFAULT}
        onClick={onClear}
        aria-label={BUTTON_ARIA_LABELS.CLEAR}
      >
        {BUTTON_LABELS.CLEAR}
      </Button>
      <Button size={BUTTON_SIZES.DEFAULT} onClick={onGenerate} disabled={isDisabled} aria-label={generateButtonLabel}>
        {BUTTON_LABELS.GENERATE} ({selectedCount})
      </Button>
    </div>
  );
}
