export const CARD_TEXTS = {
  TITLE: "Status połączenia",
  DESCRIPTION_WITH_SHOP: "Sklep: {shopName}",
  DESCRIPTION_DEFAULT: "Sprawdź połączenie z API",
  STATUS_ACTIVE: "Aktywne",
  STATUS_ERROR: "Błąd połączenia",
} as const;

export const STATUS_COLORS = {
  ACTIVE: "bg-green-500",
  ERROR: "bg-red-500",
} as const;

export const STATUS_ARIA_LABELS = {
  ACTIVE: "Połączono",
  ERROR: "Błąd połączenia",
} as const;

export const STYLES = {
  CONTENT: "flex items-center gap-2",
  INDICATOR: "h-3 w-3 rounded-full",
  INDICATOR_CLICKABLE: "cursor-pointer hover:opacity-80 transition-opacity",
  STATUS_TEXT: "text-sm font-medium",
} as const;
