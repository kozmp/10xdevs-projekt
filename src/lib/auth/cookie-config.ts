import type { CookieOptions } from "@supabase/ssr";

const isProduction = import.meta.env.PROD;
const isDevelopment = !isProduction;

/**
 * Konfiguracja cookies dla Supabase Auth
 *
 * Dla środowiska deweloperskiego (localhost):
 * - secure: false (bo używamy HTTP)
 * - sameSite: 'Lax' (dla bezpieczeństwa)
 * - domain: undefined (automatycznie używa domeny z żądania)
 * - path: '/' (dostęp z całej aplikacji)
 *
 * Dla produkcji:
 * - secure: true (wymagane HTTPS)
 * - sameSite: 'Strict' (maksymalne bezpieczeństwo)
 * - domain: undefined (automatycznie używa domeny z żądania)
 * - path: '/' (dostęp z całej aplikacji)
 */
export const cookieOptions: CookieOptions = {
  secure: isProduction,
  sameSite: isProduction ? "Strict" : "Lax",
  httpOnly: true,
  path: "/",
};

// Debug info dla deweloperów (automatically disabled in production by logger)
if (isDevelopment) {
  import("@/lib/utils/logger").then(({ logger }) => {
    logger.debug("[Auth Config] Cookie options", {
      ...cookieOptions,
      environment: isProduction ? "production" : "development",
    });
  });
}
