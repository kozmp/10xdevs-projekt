# Supabase Database Management

## Struktura

```
supabase/
├── migrations/          # Migracje schemy DB (DEV + PROD)
│   ├── 20251009120000_core_tables.sql
│   ├── 20251009121000_association_tables.sql
│   ├── 20251009122000_rls_policies.sql
│   ├── 20251024000000_add_estimated_tokens_to_jobs.sql
│   └── 20251025000000_fix_shops_user_id.sql  ← NOWA
├── seed.dev.sql         # Seed data dla DEV (mock produkty)
└── README.md            # Ten plik
```

## Środowiska

### **LOCAL / DEV** (Supabase CLI + Docker)

Używane do lokalnego developmentu z mock danymi.

```bash
# 1. Uruchom Supabase lokalnie (Docker)
npx supabase start

# 2. Zastosuj migracje
npx supabase db reset

# 3. Załaduj seed data DEV
npx supabase db execute --file supabase/seed.dev.sql
```

**Dane testowe**:

- User: `kozmp.dev@gmail.com` / Hasło: `Test1test1`
- Sklep: `test-shop-dev.myshopify.com`
- 3 produkty mock (ID: 11111111-..., 22222222-..., 33333333-...)

### **PRODUCTION** (Supabase Cloud)

**NIGDY** nie uruchamiaj `seed.dev.sql` na produkcji!

```bash
# 1. Link do projektu produkcyjnego
npx supabase link --project-ref YOUR_PROJECT_ID

# 2. Zastosuj TYLKO migracje (bez seed)
npx supabase db push

# 3. Zweryfikuj migracje
npx supabase db diff
```

**Dane produkcyjne**:

- Użytkownicy zakładają konta przez UI
- Sklepy są dodawane przez formularz (prawdziwe klucze API Shopify)
- Produkty są synchronizowane z Shopify API

## Migracje

### Utworzenie nowej migracji

```bash
npx supabase migration new nazwa_migracji
```

### Weryfikacja przed PUSH do produkcji

```bash
# 1. Sprawdź zmiany
npx supabase db diff

# 2. Testuj lokalnie
npx supabase db reset

# 3. Pushuj na PROD tylko gdy pewny
npx supabase db push
```

## Troubleshooting

### Problem: "Column user_id does not exist"

**Przyczyna**: Nie zastosowano migracji `20251025000000_fix_shops_user_id.sql`

**Rozwiązanie**:

```bash
# Local
npx supabase db reset

# Production
npx supabase db push
```

### Problem: "No products found" w CostEstimateService

**Przyczyna**: Brak seed data w środowisku DEV

**Rozwiązanie**:

```bash
npx supabase db execute --file supabase/seed.dev.sql
```

### Problem: RLS blokuje dostęp do produktów

**Przyczyna**: Stare RLS policies (przed migracją user_id)

**Rozwiązanie**: Migracja `20251025000000_fix_shops_user_id.sql` naprawia RLS policies automatycznie.

## Rollback

Jeśli migracja spowoduje problemy:

```bash
# Local - po prostu zresetuj
npx supabase db reset

# Production - rollback przez SQL
# (Supabase nie wspiera automatycznego rollback, trzeba ręcznie pisać migrację odwrotną)
```

## Kolejność Zastosowania (dla czystej bazy)

1. `20251009120000_core_tables.sql` - tabele podstawowe
2. `20251009121000_association_tables.sql` - tabele powiązań
3. `20251009122000_rls_policies.sql` - RLS (UWAGA: stare, nadpisane przez #5)
4. `20251009123000_add_api_key_iv.sql` - dodanie IV dla szyfrowania
5. `20251019000000_fix_rls_gaps.sql` - dodatkowe poprawki RLS
6. `20251024000000_add_estimated_tokens_to_jobs.sql` - kolumna dla F2
7. `20251025000000_fix_shops_user_id.sql` - **NAPRAWA ARCHITEKTURY** (user_id + RLS fix)
8. (DEV ONLY) `seed.dev.sql` - mock data

---

**WAŻNE**: Zawsze testuj migracje lokalnie przed deploym na produkcję!
