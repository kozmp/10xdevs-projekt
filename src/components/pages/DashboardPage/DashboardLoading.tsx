import React from "react";
import { PAGE_TITLE, MESSAGES, STYLES } from "./constants";

export function DashboardLoading() {
  return (
    <main className={STYLES.CONTAINER}>
      <h1 className={`${STYLES.TITLE} mb-6`}>{PAGE_TITLE}</h1>
      <div className={STYLES.LOADING_CONTAINER}>
        <div className="text-center">
          <div className={STYLES.LOADING_SPINNER} />
          <p className="mt-4 text-muted-foreground">{MESSAGES.LOADING}</p>
        </div>
      </div>
    </main>
  );
}
