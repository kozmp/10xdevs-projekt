import React from "react";
import { STYLES } from "./constants";

interface StatusIndicatorProps {
  color: string;
  label: string;
  ariaLabel: string;
  onClick?: () => void;
  isClickable: boolean;
}

export function StatusIndicator({ color, label, ariaLabel, onClick, isClickable }: StatusIndicatorProps) {
  const indicatorClassName = `${STYLES.INDICATOR} ${color} ${isClickable ? STYLES.INDICATOR_CLICKABLE : ""}`;

  return (
    <div className={STYLES.CONTENT}>
      <div
        className={indicatorClassName}
        aria-label={ariaLabel}
        onClick={isClickable ? onClick : undefined}
        role={isClickable ? "button" : undefined}
        tabIndex={isClickable ? 0 : undefined}
      />
      <span className={STYLES.STATUS_TEXT}>{label}</span>
    </div>
  );
}
