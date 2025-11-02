/**
 * MurmurHash3 Implementation
 *
 * Deterministyczny algorytm hashowania używany przez systemy feature flags
 * (LaunchDarkly, Unleash) do consistent user assignment.
 *
 * @see https://en.wikipedia.org/wiki/MurmurHash
 * @see https://github.com/aappleby/smhasher/blob/master/src/MurmurHash3.cpp
 */

/**
 * MurmurHash3 32-bit implementation
 *
 * @param key - String do zahashowania
 * @param seed - Seed dla algorytmu (domyślnie 0)
 * @returns Hash jako 32-bit unsigned integer
 */
function murmurHash3(key: string, seed = 0): number {
  let h1 = seed;
  const c1 = 0xcc9e2d51;
  const c2 = 0x1b873593;

  // Process key in 4-byte chunks
  for (let i = 0; i < key.length; i++) {
    let k1 = key.charCodeAt(i);

    k1 = Math.imul(k1, c1);
    k1 = (k1 << 15) | (k1 >>> 17);
    k1 = Math.imul(k1, c2);

    h1 ^= k1;
    h1 = (h1 << 13) | (h1 >>> 19);
    h1 = Math.imul(h1, 5) + 0xe6546b64;
  }

  // Finalization
  h1 ^= key.length;
  h1 ^= h1 >>> 16;
  h1 = Math.imul(h1, 0x85ebca6b);
  h1 ^= h1 >>> 13;
  h1 = Math.imul(h1, 0xc2b2ae35);
  h1 ^= h1 >>> 16;

  // Convert to unsigned 32-bit integer
  return h1 >>> 0;
}

/**
 * Generuje deterministyczną wartość procentową (0-100) dla użytkownika i feature
 *
 * Ta funkcja zapewnia, że:
 * 1. Ten sam user + feature zawsze daje ten sam wynik (deterministic)
 * 2. Dystrybucja jest równomierna (uniform distribution)
 * 3. Różne features dają różne wyniki dla tego samego usera
 *
 * @param userId - Unikalny identyfikator użytkownika
 * @param featureName - Nazwa feature flag
 * @param salt - Opcjonalny salt (domyślnie 'feature-flags')
 * @returns Wartość 0-100 reprezentująca bucket użytkownika
 *
 * @example
 * ```ts
 * const bucket = getUserBucket('user-123', 'auth');
 * if (bucket < 50) {
 *   // User w pierwszych 50%
 * }
 * ```
 */
export function getUserBucket(userId: string, featureName: string, salt = "feature-flags"): number {
  // Combine userId + featureName + salt for unique hash per feature
  const key = `${salt}:${featureName}:${userId}`;

  // Generate hash
  const hash = murmurHash3(key);

  // Normalize to 0-100 range
  // Używamy modulo 100000 dla większej precyzji, potem dzielimy przez 1000
  // Daje to wartości z 3 miejscami po przecinku (0.000 - 100.000)
  const normalizedHash = hash % 100000;
  const percentage = normalizedHash / 1000;

  return percentage;
}

/**
 * Sprawdza czy userId jest w zakresie rollout percentage
 *
 * @param userId - Unikalny identyfikator użytkownika
 * @param featureName - Nazwa feature flag
 * @param rolloutPercentage - Procent użytkowników (0-100)
 * @returns true jeśli user jest w zakresie rollout
 *
 * @example
 * ```ts
 * // 20% rollout
 * if (isUserInRollout('user-123', 'auth', 20)) {
 *   // User ma dostęp do feature
 * }
 * ```
 */
export function isUserInRollout(userId: string, featureName: string, rolloutPercentage: number): boolean {
  const bucket = getUserBucket(userId, featureName);
  return bucket < rolloutPercentage;
}
