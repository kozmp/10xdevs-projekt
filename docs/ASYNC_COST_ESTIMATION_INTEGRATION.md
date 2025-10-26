# Async Cost Estimation - Integration Guide

Dokumentacja integracji asynchronicznej kalkulacji kosztów (Funkcjonalność 2 - Nowa Wersja).

## 📋 Spis treści

1. [Architektura](#architektura)
2. [Backend Integration](#backend-integration)
3. [Frontend Integration](#frontend-integration)
4. [Testing](#testing)
5. [Deployment Checklist](#deployment-checklist)

---

## 🏗️ Architektura

### Przepływ danych (Data Flow)

```
┌─────────────────┐
│  User clicks    │
│  "Generuj Job"  │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────────────────┐
│  POST /api/jobs                                 │
│  ─────────────────────────────────────────────  │
│  1. Weryfikacja autoryzacji                    │
│  2. Utworzenie job w DB (status: "pending")    │
│  3. Utworzenie job_products                    │
│  4. Wywołanie JobService.calculateCost() w tle │ (nieblokujące)
│  5. Zwrócenie 201 Created NATYCHMIAST          │
└────────┬────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────┐
│  Response: { jobId, status: "pending" }        │
│  Location: /api/jobs/:id                       │
└────────┬────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────┐
│  Frontend: Przekierowanie do /jobs/:id         │
│  (natychmiastowe - 201 Created)                │
└────────┬────────────────────────────────────────┘
         │
         │  [W tle]
         │  JobService.calculateCost()
         │  ├─ Pobiera produkty
         │  ├─ Kalkuluje tokeny
         │  ├─ Zapisuje do DB:
         │  │  - total_cost_estimate
         │  │  - estimated_tokens_total
         │  └─ Czas: 1-2 sekundy
         │
         ▼
┌─────────────────────────────────────────────────┐
│  useJobCostEstimate Hook (Polling)             │
│  ─────────────────────────────────────────────  │
│  Interval: 2000ms (2 sekundy)                  │
│  Max attempts: 30 (1 minuta)                   │
│                                                 │
│  1. GET /api/jobs/:id                          │
│  2. Sprawdź czy totalCostEstimate != null      │
│  3. Jeśli TAK → zatrzymaj polling             │
│  4. Jeśli NIE → ponów po 2s                   │
└────────┬────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────┐
│  JobCostEstimateCard                           │
│  ─────────────────────────────────────────────  │
│  Stan 1: Loading (isLoading=true)             │
│    → Skeleton loaders                          │
│                                                 │
│  Stan 2: Pending (totalCostEstimate=null)      │
│    → "Szacowanie kosztów..." + spinner        │
│                                                 │
│  Stan 3: Success (totalCostEstimate > 0)       │
│    → Wyświetl koszt, tokeny, badge "Obliczono"│
└─────────────────────────────────────────────────┘
```

---

## 🔧 Backend Integration

### 1. Database Migration

Uruchom migrację dodającą kolumnę `estimated_tokens_total`:

```bash
# Supabase
supabase migration up

# Lub ręcznie w PostgreSQL
psql -U postgres -d your_database -f supabase/migrations/20251024000000_add_estimated_tokens_to_jobs.sql
```

Zweryfikuj:
```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'jobs'
  AND column_name IN ('total_cost_estimate', 'estimated_tokens_total');
```

Oczekiwany wynik:
```
column_name              | data_type | is_nullable
─────────────────────────┼───────────┼────────────
total_cost_estimate      | numeric   | YES
estimated_tokens_total   | integer   | YES
```

### 2. API Endpoints

#### POST /api/jobs
**Endpoint:** `src/pages/api/jobs/index.ts`

**Request:**
```json
{
  "productIds": ["uuid-1", "uuid-2"],
  "style": "professional",
  "language": "pl",
  "publicationMode": "draft",
  "model": "openai/gpt-4o-mini"
}
```

**Response (201 Created):**
```json
{
  "jobId": "job-uuid-123",
  "status": "pending"
}
```

**Headers:**
```
Location: /api/jobs/job-uuid-123
```

#### GET /api/jobs/:id
**Endpoint:** `src/pages/api/jobs/[id].ts`

**Response (200 OK):**
```json
{
  "id": "job-uuid-123",
  "shopId": "shop-uuid-456",
  "status": "pending",
  "style": "professional",
  "language": "pl",
  "totalCostEstimate": 0.002158,
  "estimatedTokensTotal": 5842,
  "publicationMode": "draft",
  "createdAt": "2025-01-24T10:00:00Z",
  "startedAt": null,
  "completedAt": null
}
```

### 3. JobService Methods

**Metoda:** `JobService.createJob(command, shopId)`
- Tworzy job w bazie danych
- Tworzy powiązania job_products
- Zwraca JobDTO

**Metoda:** `JobService.calculateInitialCostEstimate(jobId, model?)`
- **Asynchroniczna** - nie blokuje
- Wywołana w tle przez `.catch()`
- Loguje błędy do console.error
- Nie rzuca wyjątków

**Przykład użycia:**
```typescript
const job = await jobService.createJob(command, shopId);

// Asynchroniczne wywołanie (nie czekamy)
jobService.calculateInitialCostEstimate(job.id, command.model).catch((err) => {
  console.error(`Failed to calculate cost for job ${job.id}:`, err);
});

// Natychmiastowy zwrot do klienta
return { jobId: job.id, status: job.status };
```

---

## 💻 Frontend Integration

### 1. Hook: useJobCostEstimate

**Lokalizacja:** `src/components/hooks/useJobCostEstimate.ts`

**Użycie:**
```typescript
import { useJobCostEstimate } from "@/components/hooks/useJobCostEstimate";

function JobDetailsPage({ jobId }: { jobId: string }) {
  const { job, isLoading, error, isPolling, attempts } = useJobCostEstimate(jobId, null, {
    pollInterval: 2000,  // 2 sekundy
    maxAttempts: 30,     // 30 prób = 1 minuta
    enabled: true
  });

  if (isLoading) return <div>Ładowanie...</div>;
  if (error) return <div>Błąd: {error.message}</div>;

  return (
    <JobCostEstimateCard
      totalCostEstimate={job?.totalCostEstimate}
      estimatedTokensTotal={job?.estimatedTokensTotal}
      isLoading={isLoading}
      productCount={10}
    />
  );
}
```

**API:**
```typescript
interface UseJobCostEstimateResult {
  job: JobData | null;           // Dane joba
  isLoading: boolean;            // Czy trwa ładowanie
  error: Error | null;           // Błąd (jeśli wystąpił)
  isPolling: boolean;            // Czy polling jest aktywny
  attempts: number;              // Liczba prób pollingu
  refetch: () => Promise<void>;  // Ręczne odświeżenie
}
```

### 2. Komponent: JobCostEstimateCard

**Lokalizacja:** `src/components/JobCostEstimateCard.tsx`

**Props:**
```typescript
interface JobCostEstimateCardProps {
  totalCostEstimate?: number | null;      // USD
  estimatedTokensTotal?: number | null;   // Tokeny
  isLoading?: boolean;                    // Stan ładowania
  productCount?: number;                  // Liczba produktów
}
```

**3 Stany wizualne:**

1. **Loading** (isLoading = true)
   - Wyświetla Skeleton loaders
   - Krótkotrwały stan

2. **Pending** (totalCostEstimate = null)
   - Badge "Obliczanie..." (animacja pulse)
   - Spinner
   - Komunikat: "Szacowanie kosztów... Powinno być gotowe za chwilę (1-2s)"

3. **Success** (totalCostEstimate > 0)
   - Badge "Obliczono" (zielony)
   - Koszt w USD (formatowany)
   - Liczba tokenów
   - Koszt per produkt

**Przykład integracji w Astro:**
```astro
---
// src/pages/jobs/[id].astro
import JobDetailsPageWrapper from "@/components/JobDetailsPageWrapper";
const { id } = Astro.params;
---

<Layout title={`Job ${id}`}>
  <JobDetailsPageWrapper jobId={id} client:load />
</Layout>
```

---

## 🧪 Testing

### Unit Tests (Vitest)

**Plik:** `src/lib/services/__tests__/job.service.test.ts`

**Uruchomienie:**
```bash
npm test -- job.service.test.ts
```

**Coverage:**
- ✅ createJob() - sukces
- ✅ createJob() - produkty nie znalezione
- ✅ createJob() - rollback przy błędzie
- ✅ calculateInitialCostEstimate() - sukces (10 produktów)
- ✅ calculateInitialCostEstimate() - job bez produktów (graceful)
- ✅ calculateInitialCostEstimate() - błąd DB (graceful)
- ✅ calculateInitialCostEstimate() - błąd CostEstimateService
- ✅ getJob() - sukces
- ✅ getJob() - job nie znaleziony

**Wynik:** 9/9 tests passed ✅

### E2E Tests (Playwright)

**Plik:** `tests/e2e/async-cost-estimation.spec.ts`

**Uruchomienie:**
```bash
npm run test:e2e -- async-cost-estimation.spec.ts
```

**Scenariusze:**

1. **E2E-F2-01: Nieblokujący przepływ**
   - Natychmiastowe przekierowanie do /jobs/:id
   - Stan "Pending" (Szacowanie kosztów...)
   - Aktualizacja kosztów po 1-2s (polling)
   - Job w stanie "pending" lub "processing"

2. **E2E-F2-02: Resilience**
   - Job utworzony pomyślnie
   - Estymacja kosztów może się nie powieść
   - Job NADAL przechodzi do "processing"
   - Główna funkcjonalność (generowanie AI) działa

3. **E2E-F2-03: Polling optimization (BONUS)**
   - Polling zatrzymuje się po załadowaniu kosztów
   - Brak nadmiarowych API calls

---

## 🚀 Deployment Checklist

### Pre-deployment

- [ ] Uruchom migrację bazy danych
  ```bash
  supabase migration up
  ```

- [ ] Zweryfikuj że kolumna `estimated_tokens_total` istnieje
  ```sql
  SELECT * FROM jobs LIMIT 1;
  ```

- [ ] Uruchom unit testy
  ```bash
  npm test -- job.service.test.ts
  ```
  **Oczekiwany wynik:** 9/9 tests passed

- [ ] Uruchom E2E testy (opcjonalnie)
  ```bash
  npm run test:e2e -- async-cost-estimation.spec.ts
  ```

### Deployment

- [ ] Deploy backend (API routes + JobService)
- [ ] Deploy frontend (components + hooks)
- [ ] Zweryfikuj że endpoint POST /api/jobs zwraca 201 Created
- [ ] Zweryfikuj że endpoint GET /api/jobs/:id zwraca JobDTO z nowymi polami

### Post-deployment Verification

- [ ] Utwórz testowy job przez UI
- [ ] Zweryfikuj natychmiastowe przekierowanie do /jobs/:id
- [ ] Zweryfikuj stan "Pending" (Szacowanie kosztów...)
- [ ] Zweryfikuj aktualizację kosztów po 1-2s
- [ ] Sprawdź logi backendu:
  ```
  [JobService] Successfully calculated cost estimate for job <jobId>: $<cost>
  ```

### Monitoring

**Metryki do monitorowania:**
- Czas tworzenia joba (POST /api/jobs) - oczekiwany: < 500ms
- Czas kalkulacji kosztów (calculateInitialCostEstimate) - oczekiwany: 1-2s
- Liczba prób pollingu przed sukcesem - oczekiwany: 1-2 próby
- % jobów z pomyślną kalkulacją kosztów - oczekiwany: > 95%

**Błędy do monitorowania:**
```
[JobService] Failed to fetch job <jobId>
[JobService] Failed to fetch products for job <jobId>
[JobService] Error calculating cost estimate for job <jobId>
```

---

## 🔍 Troubleshooting

### Problem: Koszty nie ładują się (stan "Pending" nie zmienia się)

**Możliwe przyczyny:**
1. Asynchroniczna kalkulacja nie została wywołana
2. Błąd w CostEstimateService
3. Produkty nie istnieją w bazie

**Debugging:**
```bash
# Sprawdź logi backendu
tail -f logs/app.log | grep "JobService"

# Sprawdź czy job ma koszty
psql -U postgres -d your_db -c "SELECT id, total_cost_estimate, estimated_tokens_total FROM jobs WHERE id = '<jobId>';"
```

### Problem: Polling nie zatrzymuje się

**Możliwa przyczyna:** Koszty są zapisane jako `undefined` zamiast `null`

**Fix:**
```typescript
// W JobService.calculateInitialCostEstimate()
const { error: updateError } = await this.supabase
  .from("jobs")
  .update({
    total_cost_estimate: estimate.totalCost,
    estimated_tokens_total: estimate.totalTokens,
  })
  .eq("id", jobId);
```

Upewnij się że `estimate.totalCost` i `estimate.totalTokens` są liczbami, nie `undefined`.

---

## 📚 Dodatkowe Zasoby

- [JobService Source](../src/lib/services/job.service.ts)
- [JobCostEstimateCard Source](../src/components/JobCostEstimateCard.tsx)
- [useJobCostEstimate Hook](../src/components/hooks/useJobCostEstimate.ts)
- [Unit Tests](../src/lib/services/__tests__/job.service.test.ts)
- [E2E Tests](../tests/e2e/async-cost-estimation.spec.ts)
- [Demo Page](http://localhost:3000/job-cost-demo)

---

**Dokumentacja wygenerowana:** 2025-01-24
**Wersja:** 1.0.0
**Autor:** Claude Code (Anthropic)
