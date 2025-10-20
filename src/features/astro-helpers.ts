import type { AstroGlobal } from 'astro';
import { isFeatureEnabled } from './index';
import type { FeatureName } from './types';

/**
 * Astro Page Helpers for Feature Flags
 *
 * Helper functions do używania w Astro pages (src/pages/ *.astro)
 */

/**
 * Opcje dla Astro page feature guard
 */
export interface AstroFeatureGuardOptions {
  /**
   * URL do przekierowania gdy feature wyłączony
   * @default '/404'
   */
  redirectTo?: string;

  /**
   * Czy logować sprawdzenia flag do konsoli (debugging)
   */
  debug?: boolean;
}

/**
 * Guard dla Astro pages - sprawdza feature flag i przekierowuje jeśli wyłączony
 *
 * @param Astro - Astro global object
 * @param featureName - Nazwa feature flag
 * @param options - Opcje customizacji zachowania
 * @returns Response z redirect lub null jeśli feature włączony
 *
 * @example
 * ```astro
 * ---
 * // src/pages/login.astro
 * import { guardAstroFeature } from '@/features/astro-helpers';
 *
 * const guardResponse = guardAstroFeature(Astro, 'auth');
 * if (guardResponse) return guardResponse;
 *
 * // Feature włączony, renderuj stronę normalnie
 * ---
 * <html>
 *   <body>
 *     <h1>Login</h1>
 *   </body>
 * </html>
 * ```
 *
 * @example
 * ```astro
 * ---
 * // src/pages/collections.astro
 * import { guardAstroFeature } from '@/features/astro-helpers';
 *
 * // Custom redirect dla wyłączonego feature
 * const guardResponse = guardAstroFeature(Astro, 'collections', {
 *   redirectTo: '/dashboard?message=collections-unavailable'
 * });
 * if (guardResponse) return guardResponse;
 * ---
 * ```
 */
export function guardAstroFeature(
  Astro: AstroGlobal,
  featureName: FeatureName,
  options: AstroFeatureGuardOptions = {}
): Response | null {
  const { redirectTo = '/404', debug = import.meta.env.DEV } = options;

  // Pobierz userId z Astro.locals (jeśli user zalogowany)
  const userId = Astro.locals.user?.id;

  // Sprawdź feature flag
  const result = isFeatureEnabled(featureName, { userId });

  // Debug logging
  if (debug) {
    console.log(`[FeatureFlags Astro] ${featureName}:`, {
      enabled: result.enabled,
      reason: result.reason,
      userId: userId || 'anonymous',
      page: Astro.url.pathname,
    });
  }

  // Jeśli włączony, zwróć null (brak guarda)
  if (result.enabled) {
    return null;
  }

  // Feature wyłączony - przekieruj
  return Astro.redirect(redirectTo);
}

/**
 * Sprawdza czy feature włączony dla Astro page (tylko boolean)
 *
 * Użyj w warunkach when chcesz conditional rendering zamiast redirect
 *
 * @example
 * ```astro
 * ---
 * import { isAstroFeatureEnabled } from '@/features/astro-helpers';
 *
 * const showCollections = isAstroFeatureEnabled(Astro, 'collections');
 * ---
 * <div>
 *   {showCollections && (
 *     <section>
 *       <h2>My Collections</h2>
 *       <!-- Collections content -->
 *     </section>
 *   )}
 * </div>
 * ```
 */
export function isAstroFeatureEnabled(
  Astro: AstroGlobal,
  featureName: FeatureName
): boolean {
  const userId = Astro.locals.user?.id;
  return isFeatureEnabled(featureName, { userId }).enabled;
}

/**
 * Multi-feature guard - sprawdza wiele flag naraz (wymaga WSZYSTKICH)
 *
 * Użyj gdy strona wymaga kilku feature flags jednocześnie
 *
 * @example
 * ```astro
 * ---
 * import { guardAstroFeatures } from '@/features/astro-helpers';
 *
 * // Wymaga zarówno auth jak i collections
 * const guardResponse = guardAstroFeatures(Astro, ['auth', 'collections']);
 * if (guardResponse) return guardResponse;
 * ---
 * ```
 */
export function guardAstroFeatures(
  Astro: AstroGlobal,
  featureNames: FeatureName[],
  options: AstroFeatureGuardOptions = {}
): Response | null {
  // Sprawdź każdą flagę
  for (const featureName of featureNames) {
    const guardResponse = guardAstroFeature(Astro, featureName, options);

    // Jeśli jakakolwiek flaga wyłączona, zwróć redirect
    if (guardResponse) {
      return guardResponse;
    }
  }

  // Wszystkie flagi włączone
  return null;
}

/**
 * Conditional class helper - zwraca klasę CSS jeśli feature włączony
 *
 * Przydatne do conditional styling
 *
 * @example
 * ```astro
 * ---
 * import { featureClass } from '@/features/astro-helpers';
 * ---
 * <nav class={featureClass(Astro, 'collections', 'show-collections')}>
 *   <!-- Nav content -->
 * </nav>
 * ```
 */
export function featureClass(
  Astro: AstroGlobal,
  featureName: FeatureName,
  enabledClass: string,
  disabledClass = ''
): string {
  const isEnabled = isAstroFeatureEnabled(Astro, featureName);
  return isEnabled ? enabledClass : disabledClass;
}
