# Instrukcja Wykonania Migracji RLS - Naprawa Luk Bezpieczeństwa

## 📋 Podsumowanie Zmian

Migracja `20251019000000_fix_rls_gaps.sql` naprawia krytyczne luki w zabezpieczeniach Row Level Security (RLS) w bazie danych Supabase.

### ✅ Co naprawia ta migracja:

1. **Dodaje RLS do tabel asocjacyjnych** (KRYTYCZNE):
   - `product_categories` - relacje produkt-kategoria
   - `product_collections` - relacje produkt-kolekcja
   - `job_products` - relacje job-produkt

2. **Dodaje brakującą politykę DELETE** dla tabeli `jobs` (wersja z user_id)

3. **Tworzy indeksy** dla optymalizacji wydajności zapytań z RLS

### 🔒 Model Bezpieczeństwa

Wszystkie polityki RLS zapewniają izolację na poziomie `shop_id`:

- Użytkownicy mogą tylko odczytywać/modyfikować dane ze swojego sklepu
- Sprawdzanie odbywa się poprzez JOIN z tabelami nadrzędnymi (products, jobs, categories, collections)
- Każda operacja CRUD (SELECT, INSERT, UPDATE, DELETE) jest zabezpieczona

---

## 🚀 Metoda 1: Supabase CLI (Zalecana dla Developmentu)

### Wymagania Wstępne

```bash
# Zainstaluj Supabase CLI (jeśli jeszcze nie masz)
npm install -g supabase

# Sprawdź wersję
supabase --version
```

### Krok 1: Uruchom Lokalną Bazę Supabase

```bash
# Uruchom lokalny stack Supabase
supabase start
```

Powinieneś zobaczyć output z dostępami:

```
Started supabase local development setup.

         API URL: http://localhost:54321
          DB URL: postgresql://postgres:postgres@localhost:54322/postgres
      Studio URL: http://localhost:54323
```

### Krok 2: Wykonaj Migrację

```bash
# Wykonaj wszystkie oczekujące migracje (włącznie z nową)
supabase db push

# LUB wykonaj tylko nową migrację
supabase migration up
```

### Krok 3: Weryfikacja

```bash
# Połącz się z bazą danych
supabase db reset

# LUB użyj psql
psql postgresql://postgres:postgres@localhost:54322/postgres
```

W psql wykonaj zapytania weryfikacyjne:

```sql
-- 1. Sprawdź czy RLS jest włączone
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename IN ('product_categories', 'product_collections', 'job_products');

-- Oczekiwany wynik: wszystkie tabele z rowsecurity = true
```

```sql
-- 2. Policz polityki dla każdej tabeli
SELECT schemaname, tablename, COUNT(*) as policy_count
FROM pg_policies
WHERE tablename IN ('product_categories', 'product_collections', 'job_products', 'jobs')
GROUP BY schemaname, tablename
ORDER BY tablename;

-- Oczekiwany wynik:
-- job_products: 4 polityki
-- jobs: 4 polityki (jeśli używa user_id) lub 4 (jeśli shop_id)
-- product_categories: 4 polityki
-- product_collections: 4 polityki
```

```sql
-- 3. Wyświetl wszystkie polityki dla tabel asocjacyjnych
SELECT tablename, policyname, cmd, qual, with_check
FROM pg_policies
WHERE tablename IN ('product_categories', 'product_collections', 'job_products')
ORDER BY tablename, cmd;

-- Powinieneś zobaczyć po 4 polityki dla każdej tabeli (SELECT, INSERT, UPDATE, DELETE)
```

### Krok 4: Testowanie Funkcjonalne (Opcjonalne)

```sql
-- Symuluj zalogowanego użytkownika
SET request.jwt.claim.sub = 'your-test-user-uuid-here';

-- Spróbuj pobrać dane - powinieneś zobaczyć tylko swoje dane
SELECT * FROM product_categories;
SELECT * FROM product_collections;
SELECT * FROM job_products;

-- Reset ustawień
RESET request.jwt.claim.sub;
```

---

## 🌐 Metoda 2: Supabase Dashboard (Zalecana dla Produkcji)

### Krok 1: Zaloguj się do Supabase Dashboard

1. Otwórz: https://app.supabase.com
2. Wybierz swój projekt
3. Przejdź do **SQL Editor** (ikona bazy danych w menu)

### Krok 2: Wykonaj Migrację

1. Kliknij **New Query**
2. Skopiuj całą zawartość pliku `supabase/migrations/20251019000000_fix_rls_gaps.sql`
3. Wklej do edytora SQL
4. Kliknij **Run** (lub Ctrl+Enter)

### Krok 3: Weryfikacja w Dashboard

1. Przejdź do **Table Editor**
2. Dla każdej z tabel: `product_categories`, `product_collections`, `job_products`:
   - Kliknij na nazwę tabeli
   - Przejdź do zakładki **Policies**
   - Powinieneś zobaczyć 4 polityki (SELECT, INSERT, UPDATE, DELETE)

3. Sprawdź czy RLS jest włączone:
   - Przejdź do **Database** → **Roles**
   - Lub wykonaj zapytanie weryfikacyjne w SQL Editor (patrz Metoda 1, Krok 3)

---

## 🔄 Metoda 3: Supabase Migration System (CI/CD)

### Dla automatycznego deploymentu w pipeline

```bash
# 1. Link do projektu produkcyjnego
supabase link --project-ref your-project-ref

# 2. Push migracji
supabase db push

# 3. Weryfikacja
supabase db diff
```

---

## 📊 Weryfikacja Po Migracji

### Checklist

- [ ] RLS włączone na `product_categories`
- [ ] RLS włączone na `product_collections`
- [ ] RLS włączone na `job_products`
- [ ] Każda tabela ma 4 polityki (SELECT, INSERT, UPDATE, DELETE)
- [ ] Polityka DELETE dla `jobs` istnieje (jeśli używa user_id)
- [ ] Indeksy zostały utworzone
- [ ] Testy funkcjonalne przechodzą (opcjonalne)

### Komendy Weryfikacyjne

```bash
# Szybka weryfikacja z CLI
supabase db dump --schema public --data-only=false | grep -E "ENABLE ROW LEVEL SECURITY|CREATE POLICY"

# Sprawdź logi migracji
supabase migration list
```

### Sprawdzenie w Aplikacji

Po wykonaniu migracji przetestuj w aplikacji:

1. **Test izolacji danych**:
   - Zaloguj się jako User A
   - Utwórz relację produkt-kategoria
   - Zaloguj się jako User B
   - Sprawdź czy User B NIE widzi danych User A

2. **Test operacji CRUD**:
   - SELECT: Pobierz listę relacji
   - INSERT: Dodaj nową relację
   - UPDATE: Zaktualizuj relację (jeśli dotyczy)
   - DELETE: Usuń relację

---

## 🛡️ Co Robi Ta Migracja - Szczegóły Techniczne

### PART 1: Włączenie RLS

```sql
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_products ENABLE ROW LEVEL SECURITY;
```

### PART 2-4: Polityki dla Tabel Asocjacyjnych

Dla każdej tabeli asocjacyjnej tworzone są 4 polityki:

#### Przykład: product_categories

**SELECT Policy** - Użytkownicy widzą tylko swoje relacje:

```sql
USING (
  EXISTS (
    SELECT 1 FROM products
    WHERE products.id = product_categories.product_id
      AND products.shop_id = auth.uid()
  )
)
```

**INSERT Policy** - Użytkownicy mogą tworzyć tylko relacje dla swoich danych:

```sql
WITH CHECK (
  EXISTS (SELECT 1 FROM products WHERE id = product_id AND shop_id = auth.uid())
  AND
  EXISTS (SELECT 1 FROM categories WHERE id = category_id AND shop_id = auth.uid())
)
```

**UPDATE Policy** - Analogicznie do INSERT

**DELETE Policy** - Użytkownicy mogą usuwać tylko swoje relacje:

```sql
USING (
  EXISTS (SELECT 1 FROM products WHERE id = product_id AND shop_id = auth.uid())
)
```

### PART 5: Naprawa Tabeli Jobs

Dodaje brakującą politykę DELETE dla tabeli `jobs` (jeśli używa `user_id`):

```sql
CREATE POLICY "Users can delete their own jobs"
  ON jobs FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
```

### PART 6: Indeksy dla Wydajności

Tworzy indeksy B-tree dla kluczy obcych, co znacząco przyspiesza sprawdzanie polityk RLS:

```sql
CREATE INDEX idx_product_categories_product_id ON product_categories(product_id);
CREATE INDEX idx_product_categories_category_id ON product_categories(category_id);
-- ... itd.
```

---

## 🚨 Troubleshooting

### Problem: "relation already exists"

**Rozwiązanie**: Migracja jest idempotentna (bezpieczna do wielokrotnego uruchomienia) dzięki:

- `CREATE INDEX IF NOT EXISTS`
- Sprawdzeniu czy polityki już istnieją przed utworzeniem

Możesz bezpiecznie uruchomić migrację ponownie.

### Problem: "permission denied for table X"

**Rozwiązanie**: Upewnij się że użytkownik wykonujący migrację ma odpowiednie uprawnienia:

```sql
-- Jako postgres superuser
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
```

### Problem: Polityki RLS spowalniają zapytania

**Rozwiązanie**: Migracja automatycznie tworzy indeksy. Jeśli problem nadal występuje:

```sql
-- Sprawdź plan wykonania zapytania
EXPLAIN ANALYZE SELECT * FROM product_categories WHERE product_id = 'some-uuid';

-- Upewnij się że indeksy są używane
```

### Problem: Konflikt z istniejącymi politykami

**Rozwiązanie**: Usuń stare polityki przed uruchomieniem migracji:

```sql
-- Lista istniejących polityk
SELECT policyname FROM pg_policies WHERE tablename = 'product_categories';

-- Usuń konkretną politykę
DROP POLICY IF EXISTS "old_policy_name" ON product_categories;
```

---

## 📞 Wsparcie

Jeśli napotkasz problemy:

1. Sprawdź logi Supabase: `supabase logs`
2. Sprawdź status: `supabase status`
3. Reset lokalnej bazy: `supabase db reset`
4. Sprawdź dokumentację: https://supabase.com/docs/guides/database/migrations

---

## ✅ Potwierdzenie Zakończenia

Po pomyślnym wykonaniu migracji powinieneś zobaczyć:

```
✓ RLS enabled on product_categories
✓ RLS enabled on product_collections
✓ RLS enabled on job_products
✓ 4 policies created for product_categories (SELECT, INSERT, UPDATE, DELETE)
✓ 4 policies created for product_collections (SELECT, INSERT, UPDATE, DELETE)
✓ 4 policies created for job_products (SELECT, INSERT, UPDATE, DELETE)
✓ Missing DELETE policy added to jobs table
✓ Performance indexes created
```

**Twoja baza danych jest teraz w pełni zabezpieczona! 🎉**
