import type { StatusOption } from "./types";

export const STATUS_OPTIONS: StatusOption[] = [
  { value: "all", label: "Wszystkie" },
  { value: "pending", label: "Oczekujące" },
  { value: "processing", label: "W trakcie" },
  { value: "completed", label: "Zakończone" },
  { value: "failed", label: "Błąd" },
  { value: "cancelled", label: "Anulowane" },
];

export const DEFAULT_LABEL = "Status zlecenia";
export const DEFAULT_PLACEHOLDER = "Wybierz status";
