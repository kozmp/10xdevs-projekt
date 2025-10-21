/**
 * Feature Flags Types
 *
 * System do zarządzania feature flags z wsparciem dla:
 * - Progressive rollout (% użytkowników)
 * - Whitelist/blacklist override
 * - Multi-environment configuration
 */

/**
 * Dostępne środowiska
 */
export type Environment = 'local' | 'integration' | 'production';

/**
 * Nazwy feature flags w systemie
 */
export type FeatureName = 'auth' | 'collections';

/**
 * Konfiguracja pojedynczej flagi dla danego środowiska
 */
export interface FeatureConfig {
  /**
   * Czy feature jest w ogóle dostępny w tym środowisku
   */
  enabled: boolean;

  /**
   * Procent użytkowników, którzy mają dostęp do feature (0-100)
   * Używa consistent hashing - ten sam user zawsze dostaje ten sam wynik
   */
  rolloutPercentage: number;

  /**
   * Lista userIds, które ZAWSZE mają dostęp (pomija rolloutPercentage)
   * Przydatne dla testowania wewnętrznego
   */
  whitelist?: string[];

  /**
   * Lista userIds, które NIGDY nie mają dostępu (pomija rolloutPercentage i whitelist)
   * Przydatne dla problematycznych użytkowników
   */
  blacklist?: string[];
}

/**
 * Kompletna konfiguracja wszystkich środowisk dla jednej flagi
 */
export interface FeatureEnvironments {
  local: FeatureConfig;
  integration: FeatureConfig;
  production: FeatureConfig;
}

/**
 * Mapa wszystkich feature flags w systemie
 */
export type FeaturesConfig = {
  [K in FeatureName]: FeatureEnvironments;
};

/**
 * Wynik sprawdzenia feature flag
 */
export interface FeatureCheckResult {
  /**
   * Czy feature jest włączony dla danego użytkownika
   */
  enabled: boolean;

  /**
   * Powód decyzji (do debugowania)
   */
  reason:
    | 'feature_disabled'        // Flaga wyłączona globalnie
    | 'user_blacklisted'        // User na blacklist
    | 'user_whitelisted'        // User na whitelist
    | 'rollout_included'        // User w zakresie % rollout
    | 'rollout_excluded'        // User poza zakresem % rollout
    | 'no_user_id'              // Brak userId (anonimowy)
    | 'anonymous_allowed';      // Anonimowy dostęp dozwolony
}

/**
 * Opcje sprawdzania feature flag
 */
export interface FeatureCheckOptions {
  /**
   * ID użytkownika (opcjonalne dla anonimowych requestów)
   */
  userId?: string;

  /**
   * Override środowiska (domyślnie z ENV_NAME)
   */
  environment?: Environment;

  /**
   * Czy zezwolić na anonimowy dostęp (bez userId)
   * Użyj dla publicznych endpointów jak login, signup
   * @default false
   */
  allowAnonymous?: boolean;
}
