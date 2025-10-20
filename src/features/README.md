# Feature Flags System

System zarządzania feature flags dla aplikacji 10xDevs, umożliwiający rozdzielenie deploymentów od releasów.

## Spis Treści

- [Przegląd](#przegląd)
- [Quick Start](#quick-start)
- [Konfiguracja](#konfiguracja)
- [Użycie](#użycie)
  - [API Endpoints](#api-endpoints)
  - [Astro Pages](#astro-pages)
  - [React Components](#react-components)
- [Progressive Rollout](#progressive-rollout)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

---

## Przegląd

### Cechy Systemu

✅ **Consistent Hashing** - Ten sam użytkownik zawsze dostaje tę samą wersję feature
✅ **Progressive Rollout** - Stopniowe włączanie dla % użytkowników (1% → 100%)
✅ **Whitelist/Blacklist** - Override dla specific users
✅ **Multi-Environment** - Różne konfiguracje dla local/integration/production
✅ **TypeScript** - Pełne type safety
✅ **Universal** - Działa na frontendzie i backendzie

### Architektura

```
src/features/
├── index.ts              # Główny moduł (isFeatureEnabled, getAllFeatures)
├── types.ts              # TypeScript types
├── config.ts             # Konfiguracja flag per środowisko
├── hash.ts               # MurmurHash3 implementation
├── api-helpers.ts        # Helpers dla API routes
├── astro-helpers.ts      # Helpers dla Astro pages
└── README.md            # Ta dokumentacja
```

---

## Quick Start

### 1. Ustaw zmienną środowiskową

W pliku `.env`:

```env
ENV_NAME=local        # lub: integration, production
```

### 2. Użyj w API endpoint

```ts
// src/pages/api/auth/login.ts
import type { APIContext } from 'astro';
import { guardApiFeature } from '@/features/api-helpers';

export const prerender = false;

export async function POST(context: APIContext) {
  // Sprawdź czy auth feature włączony
  const guardResponse = guardApiFeature(context, 'auth');
  if (guardResponse) return guardResponse;

  // Feature włączony - kontynuuj normalnie
  // ... login logic
}
```

### 3. Użyj w Astro page

```astro
---
// src/pages/login.astro
import { guardAstroFeature } from '@/features/astro-helpers';

const guardResponse = guardAstroFeature(Astro, 'auth');
if (guardResponse) return guardResponse;
---

<html>
  <body>
    <h1>Login Page</h1>
  </body>
</html>
```

---

## Konfiguracja

### Dodawanie Nowej Flagi

**1. Dodaj typ w `types.ts`:**

```ts
export type FeatureName = 'auth' | 'collections' | 'your-feature';
```

**2. Dodaj konfigurację w `config.ts`:**

```ts
export const featuresConfig: FeaturesConfig = {
  // ... existing features
  'your-feature': {
    local: {
      enabled: true,
      rolloutPercentage: 100,
    },
    integration: {
      enabled: true,
      rolloutPercentage: 50,  // 50% users
      whitelist: ['user-test-001'],
    },
    production: {
      enabled: false,  // Deploy without release
      rolloutPercentage: 0,
    },
  },
};
```

### Struktura Konfiguracji

```ts
interface FeatureConfig {
  enabled: boolean;              // Globalna flaga on/off
  rolloutPercentage: number;     // 0-100 (% użytkowników)
  whitelist?: string[];          // Zawsze włączone (userIds)
  blacklist?: string[];          // Zawsze wyłączone (userIds)
}
```

### Algorytm Decyzyjny

```
1. enabled = false → ❌ wyłączone
2. user w blacklist → ❌ wyłączone
3. user w whitelist → ✅ włączone
4. brak userId → ❌ wyłączone (anonimowi)
5. hash(userId + feature) < rolloutPercentage → ✅ włączone
6. else → ❌ wyłączone
```

---

## Użycie

### API Endpoints

#### Pattern 1: Guard (Recommended)

```ts
// src/pages/api/collections/index.ts
import type { APIContext } from 'astro';
import { guardApiFeature } from '@/features/api-helpers';

export const prerender = false;

export async function GET(context: APIContext) {
  // Zwróć 503 jeśli wyłączone
  const guardResponse = guardApiFeature(context, 'collections', {
    disabledStatus: 503,
    disabledMessage: 'Collections temporarily unavailable'
  });

  if (guardResponse) return guardResponse;

  // Feature włączony
  const collections = await fetchCollections();
  return new Response(JSON.stringify(collections));
}
```

#### Pattern 2: Try-Catch

```ts
import { requireApiFeature } from '@/features/api-helpers';

export async function POST(context: APIContext) {
  try {
    requireApiFeature(context, 'auth');

    // Feature włączony
    return new Response(JSON.stringify({ success: true }));
  } catch (response) {
    return response as Response;
  }
}
```

#### Pattern 3: Boolean Check

```ts
import { isApiFeatureEnabled } from '@/features/api-helpers';

export async function GET(context: APIContext) {
  if (!isApiFeatureEnabled(context, 'collections')) {
    return new Response('Not available', { status: 503 });
  }

  // Feature włączony
  // ... your logic
}
```

#### Opcje `guardApiFeature`

```ts
interface ApiFeatureGuardOptions {
  disabledStatus?: 404 | 503;      // Default: 503
  disabledMessage?: string;         // Custom message
  debug?: boolean;                  // Console logging (default: DEV only)
}
```

**Kiedy użyć którego statusu:**
- **503** - Feature tymczasowo niedostępny (maintenance mode)
- **404** - Feature "nie istnieje" (hidden feature, nie chcesz ujawniać)

---

### Astro Pages

#### Pattern 1: Guard z Redirect

```astro
---
// src/pages/signup.astro
import { guardAstroFeature } from '@/features/astro-helpers';

const guardResponse = guardAstroFeature(Astro, 'auth');
if (guardResponse) return guardResponse;  // Redirect to /404
---

<html>
  <body>
    <h1>Sign Up</h1>
  </body>
</html>
```

#### Pattern 2: Custom Redirect

```astro
---
import { guardAstroFeature } from '@/features/astro-helpers';

const guardResponse = guardAstroFeature(Astro, 'collections', {
  redirectTo: '/dashboard?error=collections-unavailable'
});
if (guardResponse) return guardResponse;
---
```

#### Pattern 3: Conditional Rendering

```astro
---
import { isAstroFeatureEnabled } from '@/features/astro-helpers';

const showCollections = isAstroFeatureEnabled(Astro, 'collections');
---

<div>
  {showCollections ? (
    <section>
      <h2>My Collections</h2>
      <!-- Collections content -->
    </section>
  ) : (
    <p>Collections coming soon!</p>
  )}
</div>
```

#### Pattern 4: Multi-Feature Guard

```astro
---
import { guardAstroFeatures } from '@/features/astro-helpers';

// Wymaga auth AND collections
const guardResponse = guardAstroFeatures(Astro, ['auth', 'collections']);
if (guardResponse) return guardResponse;
---
```

#### Pattern 5: Conditional CSS Class

```astro
---
import { featureClass } from '@/features/astro-helpers';
---

<nav class={featureClass(Astro, 'collections', 'with-collections', 'without-collections')}>
  <a href="/dashboard">Dashboard</a>
  <!-- Nav items -->
</nav>
```

---

### React Components

#### Pattern 1: Hook w Component

```tsx
// src/components/CollectionsList.tsx
import { useState, useEffect } from 'react';
import { isEnabled } from '@/features';

interface Props {
  userId?: string;
}

export function CollectionsList({ userId }: Props) {
  const [canShowCollections, setCanShowCollections] = useState(false);

  useEffect(() => {
    const enabled = isEnabled('collections', { userId });
    setCanShowCollections(enabled);
  }, [userId]);

  if (!canShowCollections) {
    return <p>Collections not available</p>;
  }

  return (
    <div>
      <h2>My Collections</h2>
      {/* Collections UI */}
    </div>
  );
}
```

#### Pattern 2: Pass as Prop z Astro

```astro
---
// src/pages/dashboard.astro
import { isAstroFeatureEnabled } from '@/features/astro-helpers';
import { DashboardPage } from '@/components/DashboardPage';

const features = {
  collections: isAstroFeatureEnabled(Astro, 'collections'),
  auth: isAstroFeatureEnabled(Astro, 'auth'),
};
---

<DashboardPage features={features} client:load />
```

```tsx
// src/components/DashboardPage.tsx
interface Props {
  features: {
    collections: boolean;
    auth: boolean;
  };
}

export function DashboardPage({ features }: Props) {
  return (
    <div>
      {features.collections && <CollectionsWidget />}
      {features.auth && <UserProfile />}
    </div>
  );
}
```

---

## Progressive Rollout

### Strategia Rollout

```ts
// config.ts
production: {
  enabled: true,
  rolloutPercentage: 5,  // Start 🚀
}

// Po 24h bez błędów → zwiększ do 10%
rolloutPercentage: 10,

// Po 48h → zwiększ do 25%
rolloutPercentage: 25,

// Po 72h → zwiększ do 50%
rolloutPercentage: 50,

// Po tygodniu → pełny rollout
rolloutPercentage: 100,
```

### Whitelist dla Internal Testing

```ts
integration: {
  enabled: true,
  rolloutPercentage: 0,  // Wyłączone dla wszystkich
  whitelist: [
    'user-qa-001',      // QA team
    'user-dev-001',     // Dev team
    'user-product-001', // Product team
  ],
}
```

### Blacklist dla Problem Users

```ts
production: {
  enabled: true,
  rolloutPercentage: 100,
  blacklist: [
    'user-problematic-001',  // Zgłosił krytyczny bug
  ],
}
```

### Sprawdzenie Bucket Użytkownika

```ts
import { getUserBucket } from '@/features/hash';

// Sprawdź do jakiego bucketa należy user
const bucket = getUserBucket('user-123', 'collections');
console.log(`User bucket: ${bucket}%`);
// User bucket: 42.385%

// Jeśli rolloutPercentage = 50, user jest included (42 < 50)
// Jeśli rolloutPercentage = 40, user jest excluded (42 > 40)
```

---

## Best Practices

### ✅ DO

1. **Zawsze testuj z niskim rollout** w produkcji (1-5%)
2. **Używaj whitelist** dla internal testing przed production rollout
3. **Monitoruj metryki** podczas rollout (error rate, performance)
4. **Dokumentuj** dlaczego flaga istnieje i kiedy zostanie usunięta
5. **Usuwaj stare flagi** - feature flags to technical debt
6. **Używaj 503** dla temporary unavailability
7. **Używaj 404** dla hidden features (competitors nie widzą)

### ❌ DON'T

1. **Nie commituj wrażliwych userIds** do whitelist (użyj env vars)
2. **Nie pozostawiaj flag na zawsze** - ustaw deadline usunięcia
3. **Nie używaj rollout bez monitoringu** - musisz wiedzieć czy działa
4. **Nie zmieniaj hashing salt** - zmieni dystrybucję użytkowników
5. **Nie testuj 100% rollout** od razu w produkcji

### Lifecycle Feature Flag

```
1. Development
   ├─ local: enabled=true, rollout=100%
   └─ production: enabled=false

2. Internal Testing
   ├─ integration: enabled=true, rollout=0%, whitelist=[team]
   └─ production: enabled=false

3. Beta (Dark Launch)
   ├─ production: enabled=true, rollout=1-5%
   └─ Monitor metrics

4. Progressive Rollout
   ├─ production: 5% → 10% → 25% → 50% → 100%
   └─ Monitor at each step

5. Full Release
   └─ production: enabled=true, rollout=100%

6. Cleanup (po 2 tygodniach stabilności)
   ├─ Usuń flag z kodu
   └─ Usuń z config.ts
```

---

## Troubleshooting

### Problem: Feature nie działa mimo enabled=true

**Debug steps:**

```ts
import { isFeatureEnabled } from '@/features';

const result = isFeatureEnabled('auth', { userId: 'user-123' });
console.log(result);
// {
//   enabled: false,
//   reason: 'rollout_excluded'  ← User poza zakresem %
// }
```

**Powody:**
- `feature_disabled` - enabled=false w config
- `user_blacklisted` - User na blacklist
- `rollout_excluded` - User poza zakresem rolloutPercentage
- `no_user_id` - Brak userId (anonimowy request)

**Rozwiązania:**
- Zwiększ rolloutPercentage
- Dodaj userId do whitelist
- Sprawdź czy userId jest przekazywany

### Problem: ENV_NAME nie jest rozpoznawany

**Sprawdź:**

```bash
# W terminalu
echo $ENV_NAME  # lub %ENV_NAME% na Windows
```

**W kodzie:**

```ts
console.log('Current env:', import.meta.env.ENV_NAME);
```

**Fix:** Dodaj do `.env`:

```env
ENV_NAME=local
```

### Problem: User dostaje różne wyniki między requestami

**To nie powinno się zdarzyć** - consistent hashing zapewnia stabilność.

**Możliwe przyczyny:**
1. userId się zmienia między requestami
2. Zmieniono salt w `hash.ts`
3. Zmieniono featureName (typo)

**Debug:**

```ts
import { getUserBucket } from '@/features/hash';

const bucket1 = getUserBucket('user-123', 'auth');
const bucket2 = getUserBucket('user-123', 'auth');
console.log(bucket1 === bucket2); // MUSI być true
```

### Problem: Testy jednostkowe failują

**Mock environment w testach:**

```ts
// vitest.config.ts
export default defineConfig({
  test: {
    env: {
      ENV_NAME: 'local',
    },
  },
});
```

### Debug Mode

**Włącz debug logging:**

```ts
// API
guardApiFeature(context, 'auth', { debug: true });

// Astro
guardAstroFeature(Astro, 'auth', { debug: true });
```

**Output:**

```
[FeatureFlags API] auth: {
  enabled: true,
  reason: 'rollout_included',
  userId: 'user-123',
  endpoint: '/api/auth/login'
}
```

---

## API Reference

### Core Functions

```ts
// Sprawdź feature flag (z powodem)
isFeatureEnabled(featureName: FeatureName, options?: FeatureCheckOptions): FeatureCheckResult

// Sprawdź feature flag (boolean only)
isEnabled(featureName: FeatureName, options?: FeatureCheckOptions): boolean

// Pobierz wszystkie flagi dla użytkownika
getAllFeatures(userId?: string, environment?: Environment): Record<FeatureName, FeatureCheckResult>

// Pobierz config dla środowiska
getFeaturesConfig(environment?: Environment): { environment, features }
```

### API Helpers

```ts
// Guard pattern - zwraca Response lub null
guardApiFeature(context: APIContext, featureName: FeatureName, options?: ApiFeatureGuardOptions): Response | null

// Throw pattern - rzuca Response
requireApiFeature(context: APIContext, featureName: FeatureName, options?: ApiFeatureGuardOptions): void

// Boolean check
isApiFeatureEnabled(context: APIContext, featureName: FeatureName): boolean
```

### Astro Helpers

```ts
// Guard pattern - zwraca Response lub null
guardAstroFeature(Astro: AstroGlobal, featureName: FeatureName, options?: AstroFeatureGuardOptions): Response | null

// Boolean check
isAstroFeatureEnabled(Astro: AstroGlobal, featureName: FeatureName): boolean

// Multi-feature guard
guardAstroFeatures(Astro: AstroGlobal, featureNames: FeatureName[], options?: AstroFeatureGuardOptions): Response | null

// CSS class helper
featureClass(Astro: AstroGlobal, featureName: FeatureName, enabledClass: string, disabledClass?: string): string
```

### Hash Utilities

```ts
// Pobierz bucket użytkownika (0-100)
getUserBucket(userId: string, featureName: string, salt?: string): number

// Sprawdź czy user w rollout
isUserInRollout(userId: string, featureName: string, rolloutPercentage: number): boolean
```

---

## Examples Repository

### Przykład 1: Auth Feature z Progressive Rollout

```ts
// config.ts
auth: {
  production: {
    enabled: true,
    rolloutPercentage: 10,  // Ostrożny start
    whitelist: ['admin-001'], // Admin zawsze ma dostęp
  }
}
```

```ts
// src/pages/api/auth/login.ts
export async function POST(context: APIContext) {
  const guardResponse = guardApiFeature(context, 'auth', {
    disabledStatus: 503,
    disabledMessage: 'Authentication service under maintenance'
  });
  if (guardResponse) return guardResponse;

  // ... login logic
}
```

### Przykład 2: Collections Hidden Feature (Dark Launch)

```ts
// config.ts
collections: {
  production: {
    enabled: false,  // Deploy bez release
    rolloutPercentage: 0,
  }
}
```

```astro
---
// src/pages/collections.astro
const guardResponse = guardAstroFeature(Astro, 'collections', {
  redirectTo: '/404'  // Ukryj jako 404
});
if (guardResponse) return guardResponse;
---
```

### Przykład 3: A/B Testing (50/50 Split)

```ts
// config.ts
newDesign: {
  production: {
    enabled: true,
    rolloutPercentage: 50,  // 50% users dostaje nowy design
  }
}
```

```tsx
// src/components/Dashboard.tsx
const hasNewDesign = isEnabled('newDesign', { userId });

return hasNewDesign ? <NewDashboard /> : <OldDashboard />;
```

---

## Changelog

### v1.0.0 (2025-01-XX)
- ✨ Initial release
- ✅ Consistent hashing (MurmurHash3)
- ✅ Progressive rollout support
- ✅ Whitelist/blacklist override
- ✅ Multi-environment config
- ✅ API & Astro helpers
- ✅ Full TypeScript support

---

## Support

W razie problemów:
1. Sprawdź [Troubleshooting](#troubleshooting)
2. Włącz debug mode
3. Sprawdź logi console
4. Zweryfikuj ENV_NAME
5. Sprawdź config.ts

---

Made with ❤️ for 10xDevs
