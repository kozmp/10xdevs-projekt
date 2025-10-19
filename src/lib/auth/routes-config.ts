/**
 * Konfiguracja ścieżek dla autoryzacji
 */

export const AUTH_ROUTES = {
  // Strony autoryzacji
  LOGIN: "/login",
  SIGNUP: "/signup",
  RESET_PASSWORD: "/reset-password",

  // Endpointy API
  API_LOGIN: "/api/auth/login",
  API_SIGNUP: "/api/auth/signup",
  API_LOGOUT: "/api/auth/logout",
  API_RESET_PASSWORD: "/api/auth/reset-password",
} as const;

/**
 * Ścieżki publiczne - dostępne bez autoryzacji
 */
export const PUBLIC_PATHS = [
  // Strony autoryzacji
  AUTH_ROUTES.LOGIN,
  AUTH_ROUTES.SIGNUP,
  AUTH_ROUTES.RESET_PASSWORD,
  "/forgot-password",
  "/reset-password",

  // Endpointy autoryzacji
  AUTH_ROUTES.API_LOGIN,
  AUTH_ROUTES.API_SIGNUP,
  AUTH_ROUTES.API_LOGOUT,
  AUTH_ROUTES.API_RESET_PASSWORD,
  "/api/auth/forgot-password",
  "/api/auth/reset-password",

  // Publiczne endpointy API
  "/api/test-openrouter",

  // Publiczne zasoby statyczne
  "/favicon.png",
  "/styles.css",
] as const;

/**
 * Ścieżki chronione - wymagające autoryzacji
 */
export const PROTECTED_PATHS = [
  // Strony aplikacji
  "/", // Dashboard (chroniony w MVP)
  "/generate",
  "/products",
  "/jobs",
  "/jobs/*", // Szczegóły jobów
  "/add-shop",

  // Chronione endpointy API
  "/api/products",
  "/api/products/*",
  "/api/jobs",
  "/api/jobs/*",
  "/api/shops",
  "/api/shops/*",
] as const;

/**
 * Sprawdza czy dana ścieżka jest publiczna
 */
/**
 * Sprawdza czy dana ścieżka jest publiczna
 *
 * @param path - Ścieżka do sprawdzenia
 * @returns true jeśli ścieżka jest publiczna, false jeśli wymaga autoryzacji
 */
export const isPublicPath = (path: string): boolean => {
  // 1. Dokładne dopasowanie
  if (PUBLIC_PATHS.includes(path as any)) {
    return true;
  }

  // 2. Sprawdzenie czy ścieżka zaczyna się od publicznej ścieżki
  // ale tylko dla endpointów API i zasobów statycznych
  const isApiOrStatic = path.startsWith("/api/") || path.endsWith(".css") || path.endsWith(".png");
  if (isApiOrStatic) {
    return PUBLIC_PATHS.some((publicPath) => path.startsWith(publicPath));
  }

  // 3. Dla pozostałych ścieżek wymagamy dokładnego dopasowania
  return false;
};
