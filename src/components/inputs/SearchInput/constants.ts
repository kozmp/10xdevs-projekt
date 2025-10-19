export const DEFAULT_VALUES = {
  PLACEHOLDER: "Szukaj produktów...",
  DEBOUNCE_MS: 300,
  MAX_LENGTH: 50,
  LABEL: "Wyszukiwanie",
  ARIA_LABEL: "Wyszukaj produkty",
} as const;

export const BUTTON_LABELS = {
  CLEAR: "Wyczyść wyszukiwanie",
} as const;

export const STYLES = {
  CONTAINER: "space-y-2",
  INPUT: "pr-8",
  CLEAR_BUTTON: "absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground",
  CHARACTER_COUNT: "text-xs text-muted-foreground",
} as const;

export const ICONS = {
  CLEAR: "✕",
} as const;
