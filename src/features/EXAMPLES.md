# Feature Flags - Przykłady Integracji

Ten plik zawiera konkretne przykłady integracji systemu feature flags w różnych częściach aplikacji.

## Spis Treści

- [Przykład 1: Ochrona API Endpoint (Auth)](#przykład-1-ochrona-api-endpoint-auth)
- [Przykład 2: Ochrona Astro Page](#przykład-2-ochrona-astro-page)
- [Przykład 3: Conditional Rendering w React](#przykład-3-conditional-rendering-w-react)
- [Przykład 4: Progressive Rollout Strategy](#przykład-4-progressive-rollout-strategy)
- [Przykład 5: Admin Dashboard z Feature Status](#przykład-5-admin-dashboard-z-feature-status)

---

## Przykład 1: Ochrona API Endpoint (Auth)

### Plik: `src/pages/api/auth/login.ts`

```ts
import type { APIContext } from 'astro';
import { guardApiFeature } from '@/features/api-helpers';
import { z } from 'zod';

export const prerender = false;

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export async function POST(context: APIContext) {
  // 1. Sprawdź czy auth feature włączony
  const guardResponse = guardApiFeature(context, 'auth', {
    disabledStatus: 503,
    disabledMessage: 'Authentication service is temporarily unavailable. Please try again later.',
  });

  if (guardResponse) {
    return guardResponse; // Zwróć 503 jeśli wyłączone
  }

  // 2. Feature włączony - kontynuuj normalnie
  try {
    const body = await context.request.json();
    const { email, password } = loginSchema.parse(body);

    // ... reszta logiki login
    const { data, error } = await context.locals.supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 401,
      });
    }

    return new Response(
      JSON.stringify({
        message: 'Login successful',
        user: { id: data.user.id, email: data.user.email },
      }),
      { status: 200 }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Invalid request' }), {
      status: 400,
    });
  }
}
```

### Plik: `src/pages/api/auth/signup.ts`

```ts
import type { APIContext } from 'astro';
import { guardApiFeature } from '@/features/api-helpers';

export const prerender = false;

export async function POST(context: APIContext) {
  // Używamy tego samego guarda dla signup
  const guardResponse = guardApiFeature(context, 'auth');
  if (guardResponse) return guardResponse;

  // ... signup logic
}
```

---

## Przykład 2: Ochrona Astro Page

### Plik: `src/pages/login.astro`

```astro
---
import { guardAstroFeature } from '@/features/astro-helpers';
import Layout from '@/layouts/Layout.astro';

// Sprawdź czy auth feature włączony
const guardResponse = guardAstroFeature(Astro, 'auth', {
  redirectTo: '/404',
});

if (guardResponse) return guardResponse;

// Feature włączony - renderuj normalnie
const { searchParams } = Astro.url;
const errorMessage = searchParams.get('error');
---

<Layout title="Login">
  <div class="container">
    <h1>Login to Your Account</h1>

    {errorMessage && (
      <div class="error-banner">
        {errorMessage}
      </div>
    )}

    <form action="/api/auth/login" method="POST">
      <input type="email" name="email" placeholder="Email" required />
      <input type="password" name="password" placeholder="Password" required />
      <button type="submit">Login</button>
    </form>

    <p>
      Don't have an account? <a href="/signup">Sign up</a>
    </p>
  </div>
</Layout>
```

### Plik: `src/pages/signup.astro`

```astro
---
import { guardAstroFeature } from '@/features/astro-helpers';
import Layout from '@/layouts/Layout.astro';

const guardResponse = guardAstroFeature(Astro, 'auth');
if (guardResponse) return guardResponse;
---

<Layout title="Sign Up">
  <!-- signup form -->
</Layout>
```

### Plik: `src/pages/reset-password.astro`

```astro
---
import { guardAstroFeature } from '@/features/astro-helpers';
import Layout from '@/layouts/Layout.astro';

const guardResponse = guardAstroFeature(Astro, 'auth');
if (guardResponse) return guardResponse;
---

<Layout title="Reset Password">
  <!-- reset password form -->
</Layout>
```

---

## Przykład 3: Conditional Rendering w React

### Plik: `src/components/Navigation.astro`

```astro
---
import { isAstroFeatureEnabled } from '@/features/astro-helpers';

const showCollections = isAstroFeatureEnabled(Astro, 'collections');
const showAuth = isAstroFeatureEnabled(Astro, 'auth');
---

<nav class="main-nav">
  <a href="/dashboard">Dashboard</a>

  {showCollections && (
    <a href="/collections">Collections</a>
  )}

  <a href="/products">Products</a>

  {showAuth ? (
    <div class="auth-section">
      {Astro.locals.user ? (
        <a href="/api/auth/logout">Logout</a>
      ) : (
        <>
          <a href="/login">Login</a>
          <a href="/signup">Sign Up</a>
        </>
      )}
    </div>
  ) : (
    <div class="auth-disabled">
      <span class="badge">Coming Soon</span>
    </div>
  )}
</nav>
```

### Plik: `src/components/DashboardPage.tsx` (React)

```tsx
import { useEffect, useState } from 'react';
import { isEnabled } from '@/features';

interface Props {
  userId?: string;
}

export function DashboardPage({ userId }: Props) {
  const [features, setFeatures] = useState({
    collections: false,
    auth: false,
  });

  useEffect(() => {
    // Sprawdź feature flags po stronie klienta
    setFeatures({
      collections: isEnabled('collections', { userId }),
      auth: isEnabled('auth', { userId }),
    });
  }, [userId]);

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>

      {/* Collections Widget - pokazuj tylko jeśli feature włączony */}
      {features.collections && (
        <section className="collections-widget">
          <h2>My Collections</h2>
          <p>Manage your product collections</p>
          <a href="/collections">View Collections →</a>
        </section>
      )}

      {/* Products Widget - zawsze widoczny */}
      <section className="products-widget">
        <h2>My Products</h2>
        <a href="/products">View Products →</a>
      </section>

      {/* Auth Status */}
      {features.auth ? (
        <section className="auth-status">
          {userId ? (
            <p>Logged in as: {userId}</p>
          ) : (
            <a href="/login">Login to continue</a>
          )}
        </section>
      ) : (
        <section className="auth-unavailable">
          <p className="badge">Authentication coming soon</p>
        </section>
      )}
    </div>
  );
}
```

---

## Przykład 4: Progressive Rollout Strategy

### Scenario: Wdrażanie nowego feature "Collections"

#### Krok 1: Development (Local)

```ts
// src/features/config.ts
collections: {
  local: {
    enabled: true,
    rolloutPercentage: 100,  // Wszystko włączone lokalnie
    whitelist: [],
    blacklist: [],
  },
  // ...
}
```

#### Krok 2: Internal Testing (Integration)

```ts
collections: {
  // ...
  integration: {
    enabled: true,
    rolloutPercentage: 0,  // Wyłączone dla wszystkich
    whitelist: [
      'user-qa-001',      // QA team
      'user-dev-001',     // Dev team
      'user-pm-001',      // Product Manager
    ],
    blacklist: [],
  },
  // ...
}
```

**Test przez 2-3 dni, zbieraj feedback od internal team.**

#### Krok 3: Dark Launch (Production - 1% Beta)

```ts
collections: {
  // ...
  production: {
    enabled: true,        // Feature deployed ale...
    rolloutPercentage: 1, // ...tylko 1% users
    whitelist: [
      'user-early-001',   // Early adopters
    ],
    blacklist: [],
  },
}
```

**Monitoruj przez 24h:**
- Error rate
- Performance metrics
- User feedback

#### Krok 4: Progressive Rollout (5% → 10% → 25%)

```ts
// Po 24h bez błędów → 5%
rolloutPercentage: 5,

// Po kolejnych 48h → 10%
rolloutPercentage: 10,

// Po tygodniu → 25%
rolloutPercentage: 25,
```

#### Krok 5: Wider Release (50% → 100%)

```ts
// Po 2 tygodniach stabilności → 50%
rolloutPercentage: 50,

// Po 3 tygodniach → 100%
rolloutPercentage: 100,
```

#### Krok 6: Cleanup (po 2 tygodniach 100% rollout)

```ts
// Usuń feature flag całkowicie z kodu
// Collections jest teraz stałą częścią aplikacji
```

---

## Przykład 5: Admin Dashboard z Feature Status

### Plik: `src/pages/admin/features.astro`

```astro
---
import { getAllFeatures, getFeaturesConfig } from '@/features';
import Layout from '@/layouts/Layout.astro';

// Sprawdź czy user jest adminem
const userId = Astro.locals.user?.id;
if (!userId || !userId.startsWith('admin-')) {
  return Astro.redirect('/404');
}

// Pobierz status wszystkich flag dla różnych środowisk
const currentEnv = import.meta.env.ENV_NAME || 'local';
const config = getFeaturesConfig();
const userFeatures = getAllFeatures(userId);

// Przykładowe sprawdzenie dla test usera
const testUserFeatures = getAllFeatures('user-test-123');
---

<Layout title="Feature Flags Dashboard">
  <div class="admin-container">
    <h1>Feature Flags Status</h1>
    <p class="env-badge">Environment: {currentEnv}</p>

    <section class="current-config">
      <h2>Current Configuration</h2>

      {Object.entries(config.features).map(([featureName, featureConfig]) => (
        <div class="feature-card">
          <h3>{featureName}</h3>

          <div class="config-details">
            <p>
              Status:
              <span class={featureConfig.enabled ? 'enabled' : 'disabled'}>
                {featureConfig.enabled ? '✅ Enabled' : '❌ Disabled'}
              </span>
            </p>

            <p>Rollout: {featureConfig.rolloutPercentage}%</p>

            {featureConfig.whitelist && featureConfig.whitelist.length > 0 && (
              <p>
                Whitelist: {featureConfig.whitelist.length} user(s)
                <br />
                <small>{featureConfig.whitelist.join(', ')}</small>
              </p>
            )}

            {featureConfig.blacklist && featureConfig.blacklist.length > 0 && (
              <p>
                Blacklist: {featureConfig.blacklist.length} user(s)
              </p>
            )}
          </div>
        </div>
      ))}
    </section>

    <section class="user-simulation">
      <h2>Test User Simulation</h2>

      <div class="simulation-card">
        <h3>Admin User (You)</h3>
        {Object.entries(userFeatures).map(([feature, result]) => (
          <div class="feature-result">
            <strong>{feature}:</strong>
            <span class={result.enabled ? 'enabled' : 'disabled'}>
              {result.enabled ? '✅' : '❌'}
            </span>
            <small>({result.reason})</small>
          </div>
        ))}
      </div>

      <div class="simulation-card">
        <h3>Test User (user-test-123)</h3>
        {Object.entries(testUserFeatures).map(([feature, result]) => (
          <div class="feature-result">
            <strong>{feature}:</strong>
            <span class={result.enabled ? 'enabled' : 'disabled'}>
              {result.enabled ? '✅' : '❌'}
            </span>
            <small>({result.reason})</small>
          </div>
        ))}
      </div>
    </section>

    <section class="rollout-calculator">
      <h2>Rollout Impact Calculator</h2>
      <p>
        With <strong>collections</strong> at{' '}
        <strong>{config.features.collections.rolloutPercentage}%</strong> rollout:
      </p>
      <ul>
        <li>
          Estimated users with access: ~
          {Math.round(1000 * (config.features.collections.rolloutPercentage / 100))}
          out of 1000 total users
        </li>
      </ul>
    </section>
  </div>
</Layout>

<style>
  .admin-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
  }

  .env-badge {
    display: inline-block;
    background: #e0e7ff;
    color: #4338ca;
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
    font-weight: 600;
  }

  .feature-card {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
    padding: 1.5rem;
    margin-bottom: 1rem;
  }

  .enabled {
    color: #059669;
    font-weight: 600;
  }

  .disabled {
    color: #dc2626;
    font-weight: 600;
  }

  .simulation-card {
    background: #f9fafb;
    padding: 1rem;
    border-radius: 0.5rem;
    margin-bottom: 1rem;
  }

  .feature-result {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    padding: 0.5rem 0;
  }
</style>
```

### React Component Version: `src/components/admin/FeatureFlagsPanel.tsx`

```tsx
import { useState, useEffect } from 'react';
import { getAllFeatures, getFeaturesConfig } from '@/features';

interface Props {
  adminUserId: string;
}

export function FeatureFlagsPanel({ adminUserId }: Props) {
  const [config, setConfig] = useState<any>(null);
  const [testResults, setTestResults] = useState<any>({});

  useEffect(() => {
    const loadConfig = () => {
      const cfg = getFeaturesConfig();
      setConfig(cfg);

      // Test dla różnych userIds
      const results = {
        admin: getAllFeatures(adminUserId),
        testUser: getAllFeatures('user-test-123'),
        anonymous: getAllFeatures(undefined),
      };
      setTestResults(results);
    };

    loadConfig();
  }, [adminUserId]);

  if (!config) {
    return <div>Loading...</div>;
  }

  return (
    <div className="feature-flags-panel">
      <h2>Feature Flags Dashboard</h2>
      <p className="env-indicator">Environment: {config.environment}</p>

      <div className="features-grid">
        {Object.entries(config.features).map(([name, cfg]: [string, any]) => (
          <div key={name} className="feature-card">
            <h3>{name}</h3>
            <div className="status-badge" data-enabled={cfg.enabled}>
              {cfg.enabled ? '✅ Enabled' : '❌ Disabled'}
            </div>
            <div className="rollout-meter">
              <div
                className="rollout-fill"
                style={{ width: `${cfg.rolloutPercentage}%` }}
              />
              <span>{cfg.rolloutPercentage}%</span>
            </div>
          </div>
        ))}
      </div>

      <div className="test-results">
        <h3>User Simulation</h3>

        <div className="user-test">
          <h4>Admin</h4>
          {Object.entries(testResults.admin || {}).map(
            ([feature, result]: [string, any]) => (
              <div key={feature}>
                {feature}: {result.enabled ? '✅' : '❌'} ({result.reason})
              </div>
            )
          )}
        </div>

        <div className="user-test">
          <h4>Test User</h4>
          {Object.entries(testResults.testUser || {}).map(
            ([feature, result]: [string, any]) => (
              <div key={feature}>
                {feature}: {result.enabled ? '✅' : '❌'} ({result.reason})
              </div>
            )
          )}
        </div>

        <div className="user-test">
          <h4>Anonymous</h4>
          {Object.entries(testResults.anonymous || {}).map(
            ([feature, result]: [string, any]) => (
              <div key={feature}>
                {feature}: {result.enabled ? '✅' : '❌'} ({result.reason})
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
```

---

## Przykład 6: Testing Feature Flags

### Unit Test dla Custom Logic

```ts
// src/lib/services/__tests__/collections.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { isEnabled } from '@/features';

describe('Collections Service', () => {
  it('should only process collections when feature enabled', () => {
    const userId = 'user-123';

    // Mock feature flag
    const enabled = isEnabled('collections', { userId, environment: 'local' });

    if (!enabled) {
      expect(enabled).toBe(false);
      // Service nie powinien być wywołany
      return;
    }

    // Feature enabled - test normalnej logiki
    expect(enabled).toBe(true);
  });
});
```

### E2E Test z Feature Flags

```ts
// tests/e2e/collections.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Collections Feature (when enabled)', () => {
  test('should show collections page for enabled users', async ({ page }) => {
    // Login as user w whitelist lub z odpowiednim bucket
    await page.goto('/login');
    await page.fill('input[name="email"]', 'user-whitelisted@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Próba dostępu do /collections
    await page.goto('/collections');

    // Jeśli feature enabled, powinna się załadować strona
    await expect(page.locator('h1')).toContainText('Collections');
  });

  test('should redirect to 404 for disabled users', async ({ page }) => {
    // Login as user poza rollout
    await page.goto('/login');
    await page.fill('input[name="email"]', 'user-excluded@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Próba dostępu do /collections
    await page.goto('/collections');

    // Jeśli feature disabled, redirect do 404
    expect(page.url()).toContain('/404');
  });
});
```

---

## Przykład 7: Kill Switch (Emergency Disable)

### Scenario: Critical Bug w Production

```ts
// src/features/config.ts

// BEFORE (feature live)
collections: {
  production: {
    enabled: true,
    rolloutPercentage: 100,
  }
}

// AFTER (emergency disable)
collections: {
  production: {
    enabled: false,  // ← Instant kill switch
    rolloutPercentage: 0,
  }
}
```

**Co się stanie:**
1. Rebuild aplikacji (`npm run build`)
2. Deploy nowej wersji
3. Wszyscy użytkownicy tracą dostęp do collections
4. API zwraca 503 Service Unavailable
5. Strony /collections redirect do /404
6. Zero downtime dla reszty aplikacji

**Po fixie buga:**

```ts
collections: {
  production: {
    enabled: true,
    rolloutPercentage: 5,  // Ostrożny restart z 5%
  }
}
```

---

Gotowe! Wszystkie przykłady pokazują real-world usage systemu feature flags.
