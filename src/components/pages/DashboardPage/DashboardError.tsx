import React from "react";
import { PAGE_TITLE, MESSAGES, BUTTON_LABELS, STYLES } from "./constants";

interface DashboardErrorProps {
  error: Error;
  onRetry: () => void;
}

export function DashboardError({ error, onRetry }: DashboardErrorProps) {
  return (
    <main className={STYLES.CONTAINER}>
      <h1 className={`${STYLES.TITLE} mb-6`}>{PAGE_TITLE}</h1>
      <div className={STYLES.ERROR_CONTAINER}>
        <div className={STYLES.ERROR_CONTENT}>
          <div className={STYLES.ERROR_ICON}>⚠️</div>
          <h2 className={STYLES.ERROR_TITLE}>{MESSAGES.ERROR_TITLE}</h2>
          <p className={STYLES.ERROR_MESSAGE}>{error.message}</p>
          <button onClick={onRetry} className={STYLES.RETRY_BUTTON}>
            {BUTTON_LABELS.RETRY}
          </button>
        </div>
      </div>
    </main>
  );
}
