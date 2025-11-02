import type { JobProduct } from "./types";

export const STATUS_LABELS: Record<JobProduct["status"], string> = {
  pending: "Oczekujący",
  processing: "W trakcie",
  completed: "Zakończony",
  failed: "Błąd",
};

export const STATUS_COLORS: Record<JobProduct["status"], string> = {
  pending: "text-yellow-600",
  processing: "text-blue-600",
  completed: "text-green-600",
  failed: "text-red-600",
};
