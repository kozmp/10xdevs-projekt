# Migration Guide - Integracja Feature Flags

Ten przewodnik pomoże Ci zintegrować system feature flags z istniejącymi endpointami API i stronami Astro.

## Spis Treści

- [Szybki Start](#szybki-start)
- [Migracja API Endpoints](#migracja-api-endpoints)
- [Migracja Astro Pages](#migracja-astro-pages)
- [Migracja React Components](#migracja-react-components)
- [Testing](#testing)
- [Rollout Plan](#rollout-plan)

---

## Szybki Start

### 1. Skonfiguruj Environment

Dodaj do swojego `.env`:

```env
ENV_NAME=local
```

Opcje: `local`, `integration`, `production`

### 2. Zweryfikuj Konfigurację

Sprawdź `src/features/config.ts` i dostosuj flagi dla swoich środowisk.

### 3. Wybierz Features do Migracji

Aktualnie dostępne:

- ✅ `auth` - System autoryzacji
- ✅ `collections` - Kolekcje produktów

---

## Migracja API Endpoints

### Auth Endpoints

#### Przed:

```ts
// src/pages/api/auth/login.ts
import type { APIContext } from "astro";

export const prerender = false;

export async function POST(context: APIContext) {
  // Bezpośrednia logika login
  const body = await context.request.json();
  // ... rest of login logic
}
```

#### Po:

```ts
// src/pages/api/auth/login.ts
import type { APIContext } from "astro";
import { guardApiFeature } from "@/features/api-helpers"; // ← DODANE

export const prerender = false;

export async function POST(context: APIContext) {
  // ← DODANE: Sprawdź feature flag
  const guardResponse = guardApiFeature(context, "auth", {
    disabledStatus: 503,
    disabledMessage: "Authentication temporarily unavailable",
  });
  if (guardResponse) return guardResponse;

  // Oryginalna logika login
  const body = await context.request.json();
  // ... rest of login logic
}
```

### Lista Endpointów do Migracji (Auth)

- [ ] `src/pages/api/auth/login.ts` - POST
- [ ] `src/pages/api/auth/signup.ts` - POST
- [ ] `src/pages/api/auth/logout.ts` - POST
- [ ] `src/pages/api/auth/reset-password.ts` - POST (jeśli istnieje)

### Przykładowa Migracja - Login Endpoint

**Plik: `src/pages/api/auth/login.ts`**

```diff
import type { APIContext } from 'astro';
+import { guardApiFeature } from '@/features/api-helpers';
import { z } from 'zod';

export const prerender = false;

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export async function POST(context: APIContext) {
+  // Guard feature flag
+  const guardResponse = guardApiFeature(context, 'auth', {
+    disabledStatus: 503,
+    disabledMessage: 'Authentication service is temporarily unavailable'
+  });
+  if (guardResponse) return guardResponse;
+
  // Existing logic
  try {
    const body = await context.request.json();
    const { email, password } = loginSchema.parse(body);

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

### Przykładowa Migracja - Signup Endpoint

**Plik: `src/pages/api/auth/signup.ts`**

```diff
import type { APIContext } from 'astro';
+import { guardApiFeature } from '@/features/api-helpers';

export const prerender = false;

export async function POST(context: APIContext) {
+  const guardResponse = guardApiFeature(context, 'auth');
+  if (guardResponse) return guardResponse;
+
  // Existing signup logic
  // ...
}
```

### Przykładowa Migracja - Logout Endpoint

**Plik: `src/pages/api/auth/logout.ts`**

```diff
import type { APIContext } from 'astro';
+import { guardApiFeature } from '@/features/api-helpers';

export const prerender = false;

export async function POST(context: APIContext) {
+  const guardResponse = guardApiFeature(context, 'auth');
+  if (guardResponse) return guardResponse;
+
  // Existing logout logic
  await context.locals.supabase.auth.signOut();
  // ...
}
```

---

## Migracja Astro Pages

### Auth Pages

#### Przed:

```astro
---
// src/pages/login.astro
import Layout from "@/layouts/Layout.astro";
---

<Layout title="Login">
  <h1>Login</h1>
  <!-- form -->
</Layout>
```

#### Po:

```astro
---
// src/pages/login.astro
import { guardAstroFeature } from "@/features/astro-helpers"; // ← DODANE
import Layout from "@/layouts/Layout.astro";

// ← DODANE: Sprawdź feature flag
const guardResponse = guardAstroFeature(Astro, "auth");
if (guardResponse) return guardResponse;
---

<Layout title="Login">
  <h1>Login</h1>
  <!-- form -->
</Layout>
```

### Lista Stron do Migracji (Auth)

- [ ] `src/pages/login.astro`
- [ ] `src/pages/signup.astro`
- [ ] `src/pages/reset-password.astro` (jeśli istnieje)

### Przykładowa Migracja - Login Page

**Plik: `src/pages/login.astro`**

```diff
---
+import { guardAstroFeature } from '@/features/astro-helpers';
import Layout from '@/layouts/Layout.astro';

+// Guard auth feature
+const guardResponse = guardAstroFeature(Astro, 'auth', {
+  redirectTo: '/404'
+});
+if (guardResponse) return guardResponse;

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

### Przykładowa Migracja - Signup Page

**Plik: `src/pages/signup.astro`**

```diff
---
+import { guardAstroFeature } from '@/features/astro-helpers';
import Layout from '@/layouts/Layout.astro';

+const guardResponse = guardAstroFeature(Astro, 'auth');
+if (guardResponse) return guardResponse;
---

<Layout title="Sign Up">
  <!-- signup form -->
</Layout>
```

---

## Migracja React Components

### Conditional Rendering w Navigation

**Plik: `src/components/Navigation.astro`**

```diff
---
+import { isAstroFeatureEnabled } from '@/features/astro-helpers';
+
+const showAuth = isAstroFeatureEnabled(Astro, 'auth');
+const showCollections = isAstroFeatureEnabled(Astro, 'collections');
---

<nav class="main-nav">
  <a href="/dashboard">Dashboard</a>
  <a href="/products">Products</a>

+  {showCollections && (
    <a href="/collections">Collections</a>
+  )}

+  {showAuth ? (
    <div class="auth-links">
      {Astro.locals.user ? (
        <a href="/api/auth/logout">Logout</a>
      ) : (
        <>
          <a href="/login">Login</a>
          <a href="/signup">Sign Up</a>
        </>
      )}
    </div>
+  ) : (
+    <div class="coming-soon">
+      <span class="badge">Auth Coming Soon</span>
+    </div>
+  )}
</nav>
```

### React Component z Feature Check

**Plik: `src/components/DashboardPage.tsx`**

```diff
import { useState, useEffect } from 'react';
+import { isEnabled } from '@/features';

interface Props {
  userId?: string;
}

export function DashboardPage({ userId }: Props) {
+  const [features, setFeatures] = useState({
+    auth: false,
+    collections: false,
+  });
+
+  useEffect(() => {
+    setFeatures({
+      auth: isEnabled('auth', { userId }),
+      collections: isEnabled('collections', { userId }),
+    });
+  }, [userId]);

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>

+      {features.collections && (
        <section className="collections-widget">
          <h2>My Collections</h2>
          <a href="/collections">View Collections →</a>
        </section>
+      )}

      <section className="products-widget">
        <h2>My Products</h2>
        <a href="/products">View Products →</a>
      </section>
    </div>
  );
}
```

---

## Testing

### 1. Test Lokalny (Local Environment)

```bash
# .env
ENV_NAME=local
```

Sprawdź:

- ✅ Wszystkie features powinny być włączone (rollout 100%)
- ✅ Login/signup działa normalnie
- ✅ Collections dostępne

### 2. Test Integration Environment

```bash
# .env
ENV_NAME=integration
```

Sprawdź według config.ts:

- ✅ Auth: 100% rollout
- ✅ Collections: 50% rollout (niektórzy users mają dostęp)

### 3. Test Production Environment

```bash
# .env
ENV_NAME=production
```

Sprawdź według config.ts:

- ✅ Auth: 100% rollout (wszystkie features auth dostępne)
- ❌ Collections: disabled (feature_disabled, redirect do 404)

### 4. Test Rollout Percentage

```ts
// src/features/config.ts - zmień na test
collections: {
  integration: {
    enabled: true,
    rolloutPercentage: 10,  // Tylko 10% users
  }
}
```

Test z różnymi userIds:

```ts
import { getUserBucket } from "@/features/hash";

// Sprawdź bucket dla różnych users
console.log("User A bucket:", getUserBucket("user-A", "collections"));
// Output: User A bucket: 42.385

console.log("User B bucket:", getUserBucket("user-B", "collections"));
// Output: User B bucket: 87.123

// Jeśli rollout = 10%:
// User A (bucket 42) → excluded (42 > 10)
// User B (bucket 87) → excluded (87 > 10)
```

### 5. Test Whitelist

```ts
// config.ts
collections: {
  integration: {
    enabled: true,
    rolloutPercentage: 0,  // Wyłączone dla wszystkich
    whitelist: ['user-qa-001'],  // Tylko dla QA
  }
}
```

Test:

- ✅ `user-qa-001` → dostęp (whitelist override)
- ❌ `user-other` → brak dostępu (rollout 0%)

---

## Rollout Plan

### Faza 1: Development (Tydzień 1)

```ts
// config.ts
auth: {
  local: { enabled: true, rolloutPercentage: 100 },
  integration: { enabled: true, rolloutPercentage: 100 },
  production: { enabled: false },  // Jeszcze nie w prod
}
```

**Zadania:**

- [x] Zaimplementować feature flags system
- [ ] Dodać guards do wszystkich auth endpoints
- [ ] Dodać guards do wszystkich auth pages
- [ ] Napisać testy

### Faza 2: Internal Testing (Tydzień 2)

```ts
production: {
  enabled: true,
  rolloutPercentage: 0,
  whitelist: ['admin-001', 'qa-001', 'dev-001'],  // Internal team
}
```

**Zadania:**

- [ ] Deploy do production
- [ ] Internal team testuje funkcjonalność
- [ ] Zbieranie feedback
- [ ] Fix bugów jeśli znajdą

### Faza 3: Beta Launch (Tydzień 3)

```ts
production: {
  enabled: true,
  rolloutPercentage: 1,  // 1% użytkowników
  whitelist: ['early-adopter-001', 'early-adopter-002'],
}
```

**Zadania:**

- [ ] Monitoruj error rate w Sentry
- [ ] Sprawdź performance metrics
- [ ] Zbieraj user feedback
- [ ] Jeśli OK przez 24h → zwiększ do 5%

### Faza 4: Progressive Rollout (Tydzień 4-6)

```ts
// Dzień 1-2: 5%
rolloutPercentage: 5,

// Dzień 3-5: 10%
rolloutPercentage: 10,

// Tydzień 2: 25%
rolloutPercentage: 25,

// Tydzień 3: 50%
rolloutPercentage: 50,

// Tydzień 4: 100%
rolloutPercentage: 100,
```

**Kryterium zwiększenia rollout:**

- Error rate < 1%
- Performance degradation < 5%
- Brak critical bugs
- Positive user feedback

### Faza 5: Cleanup (2 tygodnie po 100% rollout)

**Zadania:**

- [ ] Usuń guards z kodu (feature jest teraz standard)
- [ ] Usuń flagę z config.ts
- [ ] Update dokumentacji
- [ ] Archiwizuj monitoring data

---

## Checklist Migracji

### API Endpoints

Auth:

- [ ] `/api/auth/login` - POST
- [ ] `/api/auth/signup` - POST
- [ ] `/api/auth/logout` - POST
- [ ] `/api/auth/reset-password` - POST

Collections (future):

- [ ] `/api/collections` - GET
- [ ] `/api/collections/[id]` - GET
- [ ] `/api/collections` - POST
- [ ] `/api/collections/[id]` - PUT
- [ ] `/api/collections/[id]` - DELETE

### Astro Pages

Auth:

- [ ] `/login.astro`
- [ ] `/signup.astro`
- [ ] `/reset-password.astro`

Collections (future):

- [ ] `/collections.astro`
- [ ] `/collections/[id].astro`

### Components

- [ ] Navigation component (conditional auth/collections links)
- [ ] Dashboard component (conditional widgets)
- [ ] User menu (conditional based on auth)

### Tests

- [ ] Unit tests dla hash functions ✅
- [ ] Unit tests dla core logic ✅
- [ ] Integration tests dla API endpoints
- [ ] E2E tests dla pages
- [ ] Visual regression tests

### Documentation

- [ ] README.md ✅
- [ ] EXAMPLES.md ✅
- [ ] MIGRATION-GUIDE.md ✅
- [ ] Update main project README

---

## Troubleshooting

### Problem: Feature flags nie działają

**Check:**

```bash
# 1. Sprawdź ENV_NAME
echo $ENV_NAME

# 2. Sprawdź czy testy przechodzą
npm test -- src/features/__tests__

# 3. Włącz debug mode
# W kodzie:
guardApiFeature(context, 'auth', { debug: true });
```

### Problem: User czasem ma dostęp, czasem nie

**To NIE powinno się zdarzyć** - consistent hashing zapewnia stabilność.

**Możliwe przyczyny:**

- userId się zmienia (np. session issue)
- Zmiana config.ts między requestami
- Cache issue (restart serwera)

### Problem: Testy failują

```bash
# Upewnij się że ENV_NAME jest ustawione
export ENV_NAME=local  # Linux/Mac
set ENV_NAME=local     # Windows

# Uruchom testy z env
ENV_NAME=local npm test
```

---

## Next Steps

Po zakończeniu migracji:

1. **Monitor & Measure**
   - Ustaw alerty w Sentry dla feature-specific errors
   - Track usage metrics per feature
   - Monitor rollout impact

2. **Iterate**
   - Zbieraj feedback od użytkowników
   - Optymalizuj rollout strategy
   - A/B test różnych wersji

3. **Scale**
   - Dodaj kolejne features do systemu
   - Rozważ external config (np. LaunchDarkly) dla większej skali
   - Zbuduj admin dashboard do zarządzania flagami

---

Powodzenia z migracją! 🚀
