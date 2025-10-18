import React from "react";
import { BUTTON_LABELS, STYLES, ICONS } from "./constants";

interface SearchClearButtonProps {
  onClick: () => void;
}

export function SearchClearButton({ onClick }: SearchClearButtonProps) {
  return (
    <button type="button" onClick={onClick} className={STYLES.CLEAR_BUTTON} aria-label={BUTTON_LABELS.CLEAR}>
      {ICONS.CLEAR}
    </button>
  );
}
