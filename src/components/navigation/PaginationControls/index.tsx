import React from "react";
import { PaginationButton } from "./PaginationButton";
import { PaginationInfo } from "./PaginationInfo";
import { usePaginationControls } from "./usePaginationControls";
import { BUTTON_LABELS, BUTTON_ARIA_LABELS } from "./constants";
import type { PaginationControlsProps } from "./types";

export function PaginationControls({
  currentPage,
  totalPages,
  onPageChange,
  isLoading = false,
  className = "flex items-center justify-between",
  showPageInfo = true,
}: PaginationControlsProps) {
  const { canGoPrev, canGoNext, handlePrevClick, handleNextClick, pageInfo, shouldRender } = usePaginationControls(
    currentPage,
    totalPages,
    onPageChange
  );

  if (!shouldRender) {
    return null;
  }

  return (
    <div className={className}>
      {showPageInfo && <PaginationInfo pageInfo={pageInfo} />}

      <div className="flex gap-2">
        <PaginationButton
          onClick={handlePrevClick}
          disabled={!canGoPrev || isLoading}
          ariaLabel={BUTTON_ARIA_LABELS.PREV}
        >
          {BUTTON_LABELS.PREV}
        </PaginationButton>

        <PaginationButton
          onClick={handleNextClick}
          disabled={!canGoNext || isLoading}
          ariaLabel={BUTTON_ARIA_LABELS.NEXT}
        >
          {BUTTON_LABELS.NEXT}
        </PaginationButton>
      </div>
    </div>
  );
}
