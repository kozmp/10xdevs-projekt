# Funkcjonalność 3: Zarządzanie Połączeniem ze Sklepem Shopify - Dokumentacja Implementacji

## Przegląd

Implementacja pełnej funkcjonalności zarządzania połączeniem ze sklepem Shopify, zgodnie z wymaganiami MVP. Funkcjonalność obejmuje:

- ✅ **Backend API** (PUT/DELETE /api/shops)
- ✅ **Testy Jednostkowe** (15 testów, 100% success rate)
- ✅ **Frontend UI** (React + Shadcn/ui)
- ✅ **Testy E2E** (7 scenariuszy Playwright)

---

## Architektura

### Backend (ETAP 1 + 2)

#### API Endpoints

**`PUT /api/shops`** - Utworzenie/Aktualizacja połączenia

- **Request:** `UpdateShopCommand { shopifyDomain, apiKey }`
- **Walidacja:** Zod schema (`updateShopSchema`)
- **Weryfikacja:** Shopify Admin REST API (GET /admin/shop.json)
- **Response:** `ShopResponseDTO` (200 OK) lub błąd (400/401/500)
- **Funkcjonalność:**
  - Weryfikacja klucza API przez faktyczne wywołanie Shopify API
  - Upsert logic (INSERT dla nowych, UPDATE dla istniejących)
  - Szyfrowanie klucza API (AES-256-GCM)
  - RLS enforcement na `user_id`

**`GET /api/shops`** - Pobranie danych sklepu

- **Response:** `ShopResponseDTO` (200 OK) lub 404 (brak sklepu)
- **Graceful degradation:** Brak sklepu zwraca 404, nie crashuje

**`DELETE /api/shops`** - Usunięcie połączenia

- **Response:** 204 No Content (sukces) lub 404 (brak sklepu)
- **CASCADE:** Usuwa automatycznie produkty, joby i opisy powiązane ze sklepem

#### Service Layer

**`ShopService`** (`src/lib/services/shop.service.ts`)

- `verifyShopifyApiKey()` - Weryfikacja klucza przez Shopify API
- `createOrUpdateShop()` - Upsert logic z szyfrowaniem
- `getShopByUserId()` - Pobieranie danych sklepu
- `deleteShop()` - Usuwanie sklepu

#### Testy Jednostkowe (ETAP 2)

**Lokalizacja:** `src/lib/services/__tests__/shop.service.test.ts`

**Pokrycie:** 15 testów, 100% success rate

- ✅ **Weryfikacja Shopify API:**
  - T1: Sukces weryfikacji (200 OK)
  - T2-T4: Obsługa błędów HTTP (401, 403, 500)
  - T5: Obsługa błędów sieciowych
- ✅ **Upsert Logic:**
  - T6: INSERT dla nowego sklepu
  - T7: UPDATE dla istniejącego sklepu
  - T8: Duplikat domeny zwraca błąd
- ✅ **Pobieranie danych:**
  - T9: Sukces pobrania
  - T10: Graceful degradation (null dla braku sklepu)
  - T11: Obsługa błędów DB
- ✅ **Usuwanie:**
  - T12: Sukces usunięcia
  - T13: Graceful degradation (false dla braku sklepu)
  - T14: Obsługa błędów DB
- ✅ **Encryption:**
  - T15: Mockowanie encryption w testach (bez ENCRYPTION_KEY)

**Uruchomienie testów:**

```bash
npm run test src/lib/services/__tests__/shop.service.test.ts
```

---

### Frontend (ETAP 3)

#### Komponenty

**1. `ShopConnectionModal.tsx`** (`src/components/`)

- **Typ:** React Modal (Shadcn Dialog)
- **Funkcjonalność:**
  - Formularz dodania/aktualizacji klucza API
  - Walidacja po stronie klienta (Zod)
  - Wyświetlanie błędów walidacji i API
  - Przycisk rozłączenia z potwierdzeniem
  - Pełna dostępność (A11y):
    - ARIA labels i descriptions
    - Unique IDs (useId())
    - Semantic HTML
    - Error announcements (role="alert")
- **Props:**
  - `open`, `onOpenChange` - Kontrola otwarcia
  - `onConnect`, `onDisconnect` - Callbacks API
  - `currentShop` - Obecne dane sklepu
  - `isLoading`, `apiError` - Stan i błędy

**2. `useShopConnection` Hook** (`src/components/hooks/`)

- **Typ:** Custom React Hook
- **Funkcjonalność:**
  - Zarządzanie stanem połączenia
  - Fetch, Connect, Disconnect, Update
  - Toast notifications (Sonner)
  - Error handling
- **Return:**
  - State: `shop`, `isLoading`, `error`, `isDialogOpen`
  - Actions: `connectShop()`, `disconnectShop()`, `fetchShop()`, `openDialog()`, `closeDialog()`

**3. `ShopSettingsPage.tsx`** (`src/components/`)

- **Typ:** React Page Component (Astro Island)
- **Funkcjonalność:**
  - Wyświetlanie statusu połączenia (Badge)
  - Card z danymi sklepu (domain, createdAt, updatedAt)
  - Przyciski akcji (Connect/Update/Refresh)
  - Instrukcje połączenia
  - Integracja z `ShopConnectionModal` i `useShopConnection`

**4. `shop-settings.astro`** (`src/pages/`)

- **Typ:** Astro Page (SSR)
- **Funkcjonalność:**
  - Autoryzacja (redirect jeśli nie zalogowany)
  - Renderowanie `ShopSettingsPage` jako Client Island

#### Routing

- **URL:** `/shop-settings`
- **Dostęp:** Tylko dla zalogowanych użytkowników
- **SSR:** `export const prerender = false`

---

### E2E Tests (ETAP 4)

#### Page Object Pattern

**`ShopSettingsPage.ts`** (`tests/e2e/page-objects/`)

- Reprezentacja elementów UI strony `/shop-settings`
- Metody pomocnicze:
  - `goto()`, `isShopConnected()`
  - `connectShop()`, `updateApiKey()`, `disconnectShop()`
  - `getApiError()`, `getValidationError()`, `waitForToast()`

#### Test Suite

**Lokalizacja:** `tests/e2e/shop-connection.spec.ts`

**Scenariusze:** 7 testów E2E

- ✅ **E2E-F3-01:** Pomyślne dodanie klucza Shopify
  - Weryfikacja pełnego przepływu: otwórz modal → wypełnij → submit → toast → status update
- ✅ **E2E-F3-02:** Walidacja nieprawidłowego formatu domeny
  - Sprawdzenie Zod schema na froncie
- ✅ **E2E-F3-03:** Walidacja nieprawidłowego formatu klucza API
  - Sprawdzenie regex `shpat_*`
- ✅ **E2E-F3-04:** Obsługa błędu weryfikacji API
  - Mockowanie Shopify API (401 Unauthorized)
  - Wyświetlanie błędu w modalu i toast
- ✅ **E2E-F3-05:** Aktualizacja istniejącego klucza
  - Domena disabled, nowy klucz weryfikowany
- ✅ **E2E-F3-06:** Usunięcie połączenia
  - Potwierdzenie → toast → status update
- ✅ **E2E-F3-07:** Anulowanie rozłączenia
  - Cancel flow, sklep pozostaje połączony

**Mockowanie:**

- Shopify Admin REST API jest mockowany na poziomie `page.route()`
- Backend API (`/api/shops`) jest prawdziwe (integracja z Supabase)

**Uruchomienie testów:**

```bash
npm run test:e2e tests/e2e/shop-connection.spec.ts
```

---

## Nowe Pliki

### Backend

- ✅ `src/pages/api/shops/index.ts` - API endpoints (PUT/GET/DELETE)
- ✅ `src/lib/services/shop.service.ts` - Business logic
- ✅ `src/lib/services/__tests__/shop.service.test.ts` - Testy jednostkowe
- ✅ `src/lib/schemas/shop.ts` - Zod schemas
- ✅ `src/types.ts` - UpdateShopCommand, ShopResponseDTO

### Frontend

- ✅ `src/components/ShopConnectionModal.tsx` - Modal komponent
- ✅ `src/components/hooks/useShopConnection.ts` - Custom hook
- ✅ `src/components/ShopSettingsPage.tsx` - Strona ustawień
- ✅ `src/pages/shop-settings.astro` - Astro page

### Tests

- ✅ `tests/e2e/page-objects/ShopSettingsPage.ts` - Page Object
- ✅ `tests/e2e/shop-connection.spec.ts` - E2E testy

### Documentation

- ✅ `docs/F3-SHOP-CONNECTION-IMPLEMENTATION.md` - Ten dokument

---

## Wykorzystane Technologie

### Backend

- **Astro 5** - SSR API routes
- **TypeScript 5** - Type safety
- **Zod** - Schema validation
- **Supabase** - PostgreSQL database + RLS
- **Vitest** - Unit testing
- **Shopify Admin REST API** - Weryfikacja kluczy

### Frontend

- **React 19** - UI komponenty (Islands)
- **Shadcn/ui** - Component library (Dialog, Button, Input, Card, Badge)
- **Sonner** - Toast notifications
- **Zod** - Client-side validation

### Testing

- **Playwright** - E2E testing
- **Vitest** - Unit testing
- **Mockowanie** - Supabase mocki, Shopify API mocki

---

## Bezpieczeństwo

### Backend

- ✅ **RLS (Row Level Security)** - `shop_id` policy enforcement
- ✅ **Szyfrowanie** - Klucze API szyfrowane w bazie (AES-256-GCM)
- ✅ **Walidacja** - Zod schemas na wszystkich inputach
- ✅ **Weryfikacja** - Faktyczne wywołanie Shopify API przed zapisem
- ✅ **Error Handling** - Graceful degradation, nie leakuje szczegółów

### Frontend

- ✅ **Walidacja** - Klient-side Zod przed wysłaniem
- ✅ **Autoryzacja** - Redirect jeśli nie zalogowany
- ✅ **Type Safety** - TypeScript strict mode
- ✅ **XSS Protection** - React auto-escaping

---

## Best Practices

### Clean Architecture

- ✅ Separation of Concerns: API → Service → Database
- ✅ Single Responsibility: Każda funkcja ma jedno zadanie
- ✅ Dependency Injection: Supabase client w konstruktorze
- ✅ Error Handling: Early returns, guard clauses

### Testing (TDD)

- ✅ Unit Tests przed implementacją (RED → GREEN → REFACTOR)
- ✅ E2E Tests pokrywają krytyczne ścieżki użytkownika
- ✅ Page Object Pattern - reusable, maintainable
- ✅ Mockowanie zewnętrznych API (Shopify)

### Dostępność (A11y)

- ✅ Semantic HTML (`<form>`, `<button>`, labels)
- ✅ ARIA attributes (`aria-invalid`, `aria-describedby`, `role="alert"`)
- ✅ Unique IDs (React `useId()`)
- ✅ Keyboard navigation (Radix UI Dialog)
- ✅ Screen reader friendly

### UX/UI

- ✅ Loading states (`isLoading`, disabled buttons)
- ✅ Error feedback (inline errors + toasts)
- ✅ Success feedback (toasts)
- ✅ Confirmation dialogs (Disconnect)
- ✅ Responsive design (Tailwind breakpoints)

---

## Uruchomienie

### Development

```bash
# Uruchom dev server
npm run dev

# Przejdź do /shop-settings (wymaga logowania)
# Użytkownik testowy: kozmp.dev@gmail.com / Test1test1
```

### Testing

```bash
# Testy jednostkowe (backend)
npm run test src/lib/services/__tests__/shop.service.test.ts

# Testy E2E (full stack)
npm run test:e2e tests/e2e/shop-connection.spec.ts

# Wszystkie testy
npm run test
```

### Production Build

```bash
# Build
npm run build

# Preview
npm run preview
```

---

## Znane Ograniczenia

1. **Shopify API Rate Limiting** - Backend nie implementuje rate limiting (może być dodane w przyszłości)
2. **Encryption Key Rotation** - Brak automatycznej rotacji kluczy szyfrujących
3. **Multi-shop Support** - Obecnie jeden sklep na użytkownika (ograniczenie MVP)

---

## Następne Kroki (Post-MVP)

- [ ] Integracja `ShopConnectionModal` z istniejącym `DashboardPage` (zastąpienie `ApiKeyModal`)
- [ ] Dodanie wskaźnika statusu połączenia w Navbar
- [ ] Automatyczne pobieranie produktów po połączeniu sklepu
- [ ] Webhook Shopify dla synchronizacji produktów
- [ ] Multi-shop support (wiele sklepów na użytkownika)
- [ ] Rate limiting protection

---

## Autor

Implementacja wykonana przez Claude Code zgodnie z wymaganiami MVP i best practices (TDD, Clean Architecture, A11y).

**Data ukończenia:** 2025-10-24
**Wersja:** 1.0.0
**Status:** ✅ Gotowe do Code Review
