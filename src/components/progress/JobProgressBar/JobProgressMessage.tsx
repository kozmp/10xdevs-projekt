import React from "react";
import type { JobStatus } from "./types";

interface JobProgressMessageProps {
  status: JobStatus;
  message: string | null;
}

export function JobProgressMessage({ status, message }: JobProgressMessageProps) {
  if (!message) return null;

  const messageClasses =
    {
      processing: "text-muted-foreground",
      completed: "text-green-600",
      failed: "text-red-600",
      cancelled: "text-gray-600",
    }[status] || "text-muted-foreground";

  return <p className={`text-sm ${messageClasses}`}>{message}</p>;
}
