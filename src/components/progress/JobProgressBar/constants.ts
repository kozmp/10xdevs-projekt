import type { JobStatus } from "./types";

export const STATUS_LABELS: Record<JobStatus, string> = {
  pending: "Oczekujący",
  processing: "W trakcie",
  completed: "Zakończony",
  failed: "Błąd",
  cancelled: "Anulowany",
};

export const STATUS_COLORS: Record<JobStatus, string> = {
  pending: "text-yellow-600",
  processing: "text-blue-600",
  completed: "text-green-600",
  failed: "text-red-600",
  cancelled: "text-gray-600",
};

export const STATUS_MESSAGES: Partial<Record<JobStatus, string>> = {
  processing: "Generowanie opisów może potrwać kilka minut...",
  completed: "✓ Wszystkie opisy zostały wygenerowane",
  failed: "⚠ Wystąpił błąd podczas generowania",
  cancelled: "Zlecenie zostało anulowane",
};
