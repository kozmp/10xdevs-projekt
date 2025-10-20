import type { FeaturesConfig } from './types';

/**
 * Feature Flags Configuration
 *
 * Konfiguracja wszystkich feature flags dla środowisk: local, integration, production
 *
 * WAŻNE:
 * - Zmiany w tym pliku wymagają przebudowania aplikacji
 * - W produkcji zawsze testuj najpierw z niskim rolloutPercentage (np. 1-5%)
 * - Stopniowo zwiększaj rollout: 5% → 10% → 25% → 50% → 100%
 * - Używaj whitelist dla wewnętrznych testerów
 * - Używaj blacklist dla problematycznych użytkowników
 */
export const featuresConfig: FeaturesConfig = {
  /**
   * AUTH Feature
   *
   * Kontroluje dostęp do funkcjonalności autoryzacji:
   * - Strony: /login, /signup, /reset-password
   * - API: /api/auth/login, /api/auth/signup, /api/auth/logout
   */
  auth: {
    local: {
      enabled: true,
      rolloutPercentage: 100, // Wszystko włączone lokalnie
      whitelist: [],
      blacklist: [],
    },
    integration: {
      enabled: true,
      rolloutPercentage: 100, // Pełny rollout na integration
      whitelist: [
        // Przykładowi wewnętrzni testerzy - zawsze mają dostęp
        // 'user-test-001',
        // 'user-test-002',
      ],
      blacklist: [
        // Użytkownicy wykluczeni z testowania
      ],
    },
    production: {
      enabled: true,
      rolloutPercentage: 100, // Auth dostępny dla wszystkich w produkcji
      whitelist: [
        // Early access users
      ],
      blacklist: [
        // Zbanowani użytkownicy
      ],
    },
  },

  /**
   * COLLECTIONS Feature
   *
   * Kontroluje dostęp do funkcjonalności kolekcji produktów:
   * - Strony: /collections, /collections/[id]
   * - API: /api/collections/*
   */
  collections: {
    local: {
      enabled: true,
      rolloutPercentage: 100, // Wszystko włączone lokalnie
      whitelist: [],
      blacklist: [],
    },
    integration: {
      enabled: true,
      rolloutPercentage: 50, // 50% użytkowników na integration
      whitelist: [
        // Beta testerzy - zawsze mają dostęp
        // 'user-beta-001',
      ],
      blacklist: [],
    },
    production: {
      enabled: false, // Collections wyłączone w produkcji (feature w development)
      rolloutPercentage: 0, // Start z 0% - deploy bez release
      whitelist: [
        // Tylko dla specific early adopters
        // 'user-early-001',
      ],
      blacklist: [],
    },
  },
};

/**
 * Domyślna konfiguracja dla niezdefiniowanych flag
 *
 * Zgodnie z best practices: fail-safe = false (conservative approach)
 */
export const DEFAULT_FEATURE_CONFIG = {
  enabled: false,
  rolloutPercentage: 0,
  whitelist: [],
  blacklist: [],
} as const;
