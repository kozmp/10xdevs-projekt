import { featuresConfig, DEFAULT_FEATURE_CONFIG } from './config';
import { isUserInRollout } from './hash';
import type {
  Environment,
  FeatureName,
  FeatureCheckResult,
  FeatureCheckOptions,
  FeatureConfig,
} from './types';

/**
 * Feature Flags Manager
 *
 * Główny moduł do sprawdzania statusu feature flags w aplikacji.
 * Działa zarówno na frontendzie (Astro pages) jak i backendzie (API endpoints).
 */

/**
 * Pobiera aktualne środowisko z ENV_NAME
 */
function getCurrentEnvironment(): Environment {
  const envName = import.meta.env.ENV_NAME as string | undefined;

  // Walidacja i fallback
  if (envName === 'local' || envName === 'integration' || envName === 'production') {
    return envName;
  }

  // Fallback na podstawie NODE_ENV
  if (import.meta.env.PROD) {
    return 'production';
  }

  if (import.meta.env.DEV) {
    return 'local';
  }

  // Default fallback
  console.warn(
    `[FeatureFlags] Unknown ENV_NAME: "${envName}". Falling back to "local". Set ENV_NAME to one of: local, integration, production`
  );
  return 'local';
}

/**
 * Pobiera konfigurację dla danej flagi i środowiska
 */
function getFeatureConfig(
  featureName: FeatureName,
  environment: Environment
): FeatureConfig {
  const feature = featuresConfig[featureName];

  if (!feature) {
    console.warn(
      `[FeatureFlags] Feature "${featureName}" not found in config. Using default (disabled).`
    );
    return DEFAULT_FEATURE_CONFIG;
  }

  return feature[environment];
}

/**
 * Sprawdza czy feature jest włączony dla użytkownika
 *
 * Algorytm decyzyjny (w kolejności priorytetu):
 * 1. Jeśli flaga globalnie wyłączona → false
 * 2. Jeśli user na blacklist → false
 * 3. Jeśli user na whitelist → true
 * 4. Jeśli brak userId (anonimowy) → false
 * 5. Sprawdź czy user w zakresie rolloutPercentage (consistent hashing)
 *
 * @param featureName - Nazwa feature flag do sprawdzenia
 * @param options - Opcje sprawdzenia (userId, environment)
 * @returns Obiekt z wynikiem i powodem decyzji
 *
 * @example
 * ```ts
 * // Backend (API route)
 * const result = isFeatureEnabled('auth', {
 *   userId: context.locals.user?.id
 * });
 *
 * if (!result.enabled) {
 *   return new Response(JSON.stringify({ error: 'Feature disabled' }), {
 *     status: 503
 *   });
 * }
 * ```
 *
 * @example
 * ```ts
 * // Frontend (Astro page)
 * const result = isFeatureEnabled('collections', {
 *   userId: Astro.locals.user?.id
 * });
 *
 * if (!result.enabled) {
 *   return Astro.redirect('/404');
 * }
 * ```
 */
export function isFeatureEnabled(
  featureName: FeatureName,
  options: FeatureCheckOptions = {}
): FeatureCheckResult {
  const { userId, environment = getCurrentEnvironment(), allowAnonymous = false } = options;

  // Pobierz konfigurację dla środowiska
  const config = getFeatureConfig(featureName, environment);

  // 1. Sprawdź czy flaga globalnie włączona
  if (!config.enabled) {
    return {
      enabled: false,
      reason: 'feature_disabled',
    };
  }

  // 2. Sprawdź blacklist (najwyższy priorytet) - tylko dla zalogowanych
  if (userId && config.blacklist && config.blacklist.includes(userId)) {
    return {
      enabled: false,
      reason: 'user_blacklisted',
    };
  }

  // 3. Sprawdź whitelist (drugi priorytet) - tylko dla zalogowanych
  if (userId && config.whitelist && config.whitelist.includes(userId)) {
    return {
      enabled: true,
      reason: 'user_whitelisted',
    };
  }

  // 4. Brak userId - sprawdź czy allowAnonymous
  if (!userId) {
    if (allowAnonymous) {
      return {
        enabled: true,
        reason: 'anonymous_allowed',
      };
    }
    return {
      enabled: false,
      reason: 'no_user_id',
    };
  }

  // 5. Sprawdź rollout percentage (consistent hashing)
  const isInRollout = isUserInRollout(userId, featureName, config.rolloutPercentage);

  return {
    enabled: isInRollout,
    reason: isInRollout ? 'rollout_included' : 'rollout_excluded',
  };
}

/**
 * Uproszczona funkcja - zwraca tylko boolean
 *
 * @param featureName - Nazwa feature flag
 * @param options - Opcje sprawdzenia
 * @returns true jeśli feature włączony
 *
 * @example
 * ```ts
 * if (isEnabled('auth', { userId: user.id })) {
 *   // Feature dostępny
 * }
 * ```
 */
export function isEnabled(
  featureName: FeatureName,
  options: FeatureCheckOptions = {}
): boolean {
  return isFeatureEnabled(featureName, options).enabled;
}

/**
 * Sprawdza wszystkie flagi dla użytkownika (przydatne do debugowania)
 *
 * @param userId - ID użytkownika
 * @param environment - Środowisko (opcjonalne)
 * @returns Mapa featureName → FeatureCheckResult
 *
 * @example
 * ```ts
 * const features = getAllFeatures('user-123');
 * console.log(features);
 * // {
 * //   auth: { enabled: true, reason: 'rollout_included' },
 * //   collections: { enabled: false, reason: 'feature_disabled' }
 * // }
 * ```
 */
export function getAllFeatures(
  userId?: string,
  environment?: Environment
): Record<FeatureName, FeatureCheckResult> {
  const features: FeatureName[] = ['auth', 'collections'];

  return features.reduce(
    (acc, featureName) => {
      acc[featureName] = isFeatureEnabled(featureName, { userId, environment });
      return acc;
    },
    {} as Record<FeatureName, FeatureCheckResult>
  );
}

/**
 * Pobiera aktualną konfigurację dla wszystkich flag (do admin dashboard)
 *
 * @param environment - Środowisko
 * @returns Kompletna konfiguracja
 */
export function getFeaturesConfig(environment?: Environment) {
  const env = environment || getCurrentEnvironment();

  return {
    environment: env,
    features: Object.entries(featuresConfig).reduce(
      (acc, [name, config]) => {
        acc[name as FeatureName] = config[env];
        return acc;
      },
      {} as Record<FeatureName, FeatureConfig>
    ),
  };
}
