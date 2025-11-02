export const BUTTON_VARIANTS = {
  CLEAR: "outline",
  GENERATE: "default",
} as const;

export const BUTTON_SIZES = {
  DEFAULT: "sm",
} as const;

export const BUTTON_LABELS = {
  CLEAR: "Wyczyść",
  GENERATE: "Generuj opisy",
} as const;

export const BUTTON_ARIA_LABELS = {
  CLEAR: "Wyczyść zaznaczenie",
  GENERATE: "Generuj opisy dla {count} produktów",
} as const;

export const TEXT_LABELS = {
  SELECTED: "Zaznaczono:",
  MAX_LIMIT_REACHED: "Osiągnięto maksymalny limit",
} as const;

export const STYLES = {
  CONTAINER: "fixed bottom-4 left-1/2 -translate-x-1/2 p-4 shadow-lg z-50",
  CONTENT: "flex items-center gap-4",
  COUNTER: "flex items-center gap-2",
  COUNTER_LABEL: "text-sm font-medium",
  COUNTER_VALUE: "text-lg font-bold",
  COUNTER_MAX: "text-sm text-muted-foreground",
  MAX_LIMIT_ALERT: "text-xs text-red-500",
  BUTTONS: "flex gap-2 ml-4",
} as const;

export const COLORS = {
  PRIMARY: "text-primary",
  ERROR: "text-red-500",
} as const;
