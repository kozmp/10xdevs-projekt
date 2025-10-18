import React from "react";
import { PAGE_TITLE, BUTTON_LABELS, BUTTON_ARIA_LABELS, STYLES } from "./constants";

interface DashboardHeaderProps {
  onRefresh: () => void;
}

export function DashboardHeader({ onRefresh }: DashboardHeaderProps) {
  return (
    <div className={STYLES.HEADER}>
      <h1 className={STYLES.TITLE}>{PAGE_TITLE}</h1>
      <button onClick={onRefresh} className={STYLES.REFRESH_BUTTON} aria-label={BUTTON_ARIA_LABELS.REFRESH}>
        {BUTTON_LABELS.REFRESH}
      </button>
    </div>
  );
}
