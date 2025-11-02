export const PAGE_TITLE = "Dashboard";

export const MESSAGES = {
  LOADING: "Ładowanie danych...",
  ERROR_TITLE: "Wystąpił błąd podczas ładowania danych",
  NO_DATA: "Brak danych do wyświetlenia",
  API_KEY_REQUIRED: {
    TITLE: "Skonfiguruj klucz API",
    DESCRIPTION: "Aby korzystać z aplikacji, musisz wprowadzić klucz API Shopify",
  },
  ERROR_TOAST: {
    TITLE: "Błąd podczas ładowania danych",
  },
} as const;

export const BUTTON_LABELS = {
  REFRESH: "Odśwież",
  RETRY: "Spróbuj ponownie",
} as const;

export const BUTTON_ARIA_LABELS = {
  REFRESH: "Odśwież dane",
} as const;

export const STYLES = {
  CONTAINER: "container mx-auto p-6",
  HEADER: "flex items-center justify-between mb-6",
  TITLE: "text-3xl font-bold",
  REFRESH_BUTTON: "px-4 py-2 text-sm border rounded-md hover:bg-muted",
  RETRY_BUTTON: "px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90",
  GRID: "grid gap-6 md:grid-cols-2 mb-6",
  LOADING_CONTAINER: "flex items-center justify-center min-h-[400px]",
  LOADING_SPINNER:
    "inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]",
  ERROR_CONTAINER: "flex items-center justify-center min-h-[400px]",
  ERROR_CONTENT: "text-center max-w-md",
  ERROR_ICON: "text-red-500 text-5xl mb-4",
  ERROR_TITLE: "text-xl font-semibold mb-2",
  ERROR_MESSAGE: "text-muted-foreground mb-4",
} as const;
