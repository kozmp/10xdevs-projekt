import type { APIContext } from "astro";
import { isFeatureEnabled } from "./index";
import type { FeatureName } from "./types";
import { logger } from "@/lib/utils/logger";

/**
 * API Helpers for Feature Flags
 *
 * Helper functions do używania w API routes (src/pages/api/**)
 */

/**
 * Opcje dla API feature guard
 */
export interface ApiFeatureGuardOptions {
  /**
   * Status HTTP zwracany gdy feature wyłączony
   * - 404: Feature "nie istnieje" (recommended for hidden features)
   * - 503: Feature tymczasowo niedostępny (recommended for maintenance)
   */
  disabledStatus?: 404 | 503;

  /**
   * Custom message w response
   */
  disabledMessage?: string;

  /**
   * Czy logować sprawdzenia flag do konsoli (debugging)
   */
  debug?: boolean;

  /**
   * Czy zezwolić na anonimowy dostęp (bez userId)
   * Ustaw na true dla publicznych endpointów jak login, signup
   * @default false
   */
  allowAnonymous?: boolean;
}

/**
 * Guard dla API endpoints - sprawdza feature flag i zwraca error response jeśli wyłączony
 *
 * @param context - Astro APIContext
 * @param featureName - Nazwa feature flag
 * @param options - Opcje customizacji zachowania
 * @returns Response z błędem lub null jeśli feature włączony
 *
 * @example
 * ```ts
 * // src/pages/api/auth/login.ts
 * export const prerender = false;
 *
 * export async function POST(context: APIContext) {
 *   // Sprawdź czy auth feature włączony
 *   const guardResponse = guardApiFeature(context, 'auth', {
 *     disabledStatus: 503,
 *     disabledMessage: 'Authentication temporarily unavailable'
 *   });
 *
 *   if (guardResponse) {
 *     return guardResponse; // Feature wyłączony, zwróć error
 *   }
 *
 *   // Feature włączony, kontynuuj normalnie
 *   // ... login logic
 * }
 * ```
 *
 * @example
 * ```ts
 * // src/pages/api/collections/index.ts
 * export async function GET(context: APIContext) {
 *   // Collections jako hidden feature - użyj 404
 *   const guardResponse = guardApiFeature(context, 'collections', {
 *     disabledStatus: 404
 *   });
 *
 *   if (guardResponse) return guardResponse;
 *
 *   // ... fetch collections
 * }
 * ```
 */
export function guardApiFeature(
  context: APIContext,
  featureName: FeatureName,
  options: ApiFeatureGuardOptions = {}
): Response | null {
  const { disabledStatus = 503, disabledMessage, debug = import.meta.env.DEV, allowAnonymous = false } = options;

  // Pobierz userId z context (jeśli user zalogowany)
  const userId = context.locals.user?.id;

  // Sprawdź feature flag
  const result = isFeatureEnabled(featureName, { userId, allowAnonymous });

  // Debug logging (only in development via logger)
  if (debug) {
    logger.debug(`[FeatureFlags API] ${featureName}`, {
      enabled: result.enabled,
      reason: result.reason,
      userId: userId || "anonymous",
      endpoint: context.url.pathname,
    });
  }

  // Jeśli włączony, zwróć null (brak guarda)
  if (result.enabled) {
    return null;
  }

  // Feature wyłączony - przygotuj error response
  const defaultMessages = {
    404: "Not Found",
    503: "Service Temporarily Unavailable",
  };

  const message = disabledMessage || defaultMessages[disabledStatus];

  // Zwróć odpowiedni error response
  return new Response(
    JSON.stringify({
      error: message,
      feature: featureName,
      reason: result.reason,
    }),
    {
      status: disabledStatus,
      headers: {
        "Content-Type": "application/json",
        // Dla 503 dodaj Retry-After header (sugeruj sprawdzenie za 1h)
        ...(disabledStatus === 503 && { "Retry-After": "3600" }),
      },
    }
  );
}

/**
 * Middleware-style guard - rzuca błąd jeśli feature wyłączony
 *
 * Użyj gdy wolisz try/catch pattern zamiast if-null checking
 *
 * @throws Response z error gdy feature wyłączony
 *
 * @example
 * ```ts
 * export async function POST(context: APIContext) {
 *   try {
 *     requireApiFeature(context, 'auth');
 *
 *     // Feature włączony, kod poniżej się wykona
 *     return new Response(JSON.stringify({ success: true }));
 *   } catch (response) {
 *     // Feature wyłączony, zwróć error response
 *     return response as Response;
 *   }
 * }
 * ```
 */
export function requireApiFeature(
  context: APIContext,
  featureName: FeatureName,
  options: ApiFeatureGuardOptions = {}
): void {
  const guardResponse = guardApiFeature(context, featureName, options);

  if (guardResponse) {
    throw guardResponse;
  }
}

/**
 * Sprawdza czy feature włączony dla API endpoint (tylko boolean)
 *
 * Użyj gdy chcesz sam obsłużyć logikę error response
 *
 * @example
 * ```ts
 * export async function GET(context: APIContext) {
 *   if (!isApiFeatureEnabled(context, 'collections')) {
 *     return new Response('Collections not available', { status: 503 });
 *   }
 *
 *   // ... fetch collections
 * }
 * ```
 */
export function isApiFeatureEnabled(
  context: APIContext,
  featureName: FeatureName,
  options: { allowAnonymous?: boolean } = {}
): boolean {
  const userId = context.locals.user?.id;
  return isFeatureEnabled(featureName, { userId, allowAnonymous: options.allowAnonymous }).enabled;
}
