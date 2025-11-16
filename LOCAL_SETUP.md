# 🚀 Przewodnik Uruchomienia Lokalnego

**Projekt:** AI Product Description Generator (MVP)  
**Stack:** Astro 5 + React 19 + Supabase + TypeScript

---

## 📋 Wymagania Wstępne

### Sprawdź czy masz zainstalowane:

```bash
# Node.js 22+
node --version  # powinno być >= v22.x.x

# npm
npm --version

# Supabase CLI
npx supabase --version

# Docker Desktop (wymagane dla Supabase lokalnego)
docker --version
docker ps  # sprawdź czy Docker działa
```

### Jeśli czegoś brakuje:

**Node.js 22:**
```bash
# Pobierz z https://nodejs.org/
# Lub użyj nvm:
nvm install 22
nvm use 22
```

**Docker Desktop:**
```bash
# Windows: https://www.docker.com/products/docker-desktop/
# Po instalacji uruchom Docker Desktop
```

**Supabase CLI:**
```bash
# Jest już w devDependencies, ale można też globalnie:
npm install -g supabase
```

---

## 🔧 Krok 1: Instalacja Dependencies

```bash
# W głównym katalogu projektu
npm ci

# Lub jeśli chcesz zaktualizować:
npm install
```

**Oczekiwany output:**
```
✓ Dependencies installed
✓ 97 packages installed
```

---

## 🗄️ Krok 2: Uruchomienie Supabase Lokalnie

### 2.1. Start Docker Desktop

**WAŻNE:** Docker MUSI być uruchomiony przed supabase start!

```bash
# Windows: Uruchom Docker Desktop z menu Start
# Poczekaj aż ikona Docker będzie zielona
```

### 2.2. Start Supabase

```bash
# W katalogu projektu
npx supabase start
```

**To może potrwać 2-3 minuty za pierwszym razem!**

**Oczekiwany output:**
```
Starting Supabase local development setup...

         API URL: http://127.0.0.1:54321
     GraphQL URL: http://127.0.0.1:54321/graphql/v1
  S3 Storage URL: http://127.0.0.1:54321/storage/v1/s3
          DB URL: postgresql://postgres:postgres@127.0.0.1:54322/postgres
      Studio URL: http://127.0.0.1:54323
    Inbucket URL: http://127.0.0.1:54324
      JWT secret: super-secret-jwt-token-with-at-least-32-characters-long
        anon key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   S3 Access Key: 625729a08b95bf1b7ff351a663f3a23c
   S3 Secret Key: 850181e4652dd023b7a98c58ae0d2d34bd487ee0cc3254aed6eda37307425907
       S3 Region: local
```

**ZAPISZ KLUCZE!** Będziesz ich potrzebować w .env

### 2.3. Weryfikacja Supabase

```bash
# Sprawdź status
npx supabase status
```

**Powinieneś zobaczyć:**
```
✓ supabase_db_10xdevs-projekt       running
✓ supabase_studio_10xdevs-projekt   running
✓ supabase_kong_10xdevs-projekt     running
✓ supabase_auth_10xdevs-projekt     running
```

### 2.4. Otwórz Supabase Studio

```bash
# Otwórz w przeglądarce:
http://127.0.0.1:54323
```

**Powinno otworzyć się Supabase Studio** - interfejs zarządzania bazą.

---

## 🔐 Krok 3: Konfiguracja Zmiennych Środowiskowych

### 3.1. Utwórz .env

```bash
# Kopiuj .env.example do .env
cp .env.example .env
```

### 3.2. Wypełnij .env

**Otwórz** `.env` i wypełnij wartościami z output `npx supabase start`:

```bash
# Environment Configuration
ENV_NAME="local"

# POBIERZ Z OUTPUT "npx supabase start":
PUBLIC_SUPABASE_URL="http://127.0.0.1:54321"
PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0"
PUBLIC_APP_URL="http://localhost:3003"

# OpenRouter API Key (do generowania opisów)
# Pobierz z: https://openrouter.ai/keys
OPENROUTER_API_KEY="sk-or-v1-..."

# Encryption Key (do szyfrowania kluczy API Shopify)
# Wygeneruj 32-znakowy random string:
ENCRYPTION_KEY="wygeneruj-32-znaki-losowe-tutaj"

# Powtórz Supabase URL i klucz (dla backend)
SUPABASE_URL="http://127.0.0.1:54321"
SUPABASE_PUBLIC_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# E2E Test User (opcjonalne, dla testów)
E2E_USERNAME_ID=""
E2E_USERNAME="test@example.com"
E2E_PASSWORD="testpassword123"
```

### 3.3. Wygeneruj ENCRYPTION_KEY

```bash
# Option A: Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Option B: PowerShell
[System.Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes([guid]::NewGuid().ToString("N")))

# Option C: Online generator
# https://www.random.org/strings/?num=1&len=32&digits=on&upperalpha=on&loweralpha=on
```

**Skopiuj wygenerowany string do .env:**
```bash
ENCRYPTION_KEY="a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"
```

---

## 🚀 Krok 4: Uruchomienie Aplikacji

### 4.1. Start Development Server

```bash
npm run dev
```

**Oczekiwany output:**
```
  🚀  astro  v5.13.7 started in 125ms

  ┃ Local    http://localhost:3003/
  ┃ Network  use --host to expose

  watching for file changes...
```

### 4.2. Otwórz Aplikację

```bash
# Przegląda automatycznie otworzy:
http://localhost:3003
```

---

## ✅ Krok 5: Weryfikacja Setup

### Sprawdź czy wszystko działa:

#### 1. **Supabase Studio** (http://127.0.0.1:54323)
- ✅ Widzisz tabele: `users`, `shops`, `products`, `jobs`, etc.
- ✅ Zakładka "Table Editor" pokazuje strukturę

#### 2. **Aplikacja** (http://localhost:3003)
- ✅ Strona główna się ładuje
- ✅ Możesz przejść do `/login`
- ✅ Możesz przejść do `/dashboard`

#### 3. **Inbucket** (http://127.0.0.1:54324) - Email Testing
- ✅ Interfejs email testing działa
- ✅ Emails będą tu widoczne (nie wysyłane naprawdę)

#### 4. **Database Connection**
```bash
# Sprawdź połączenie
npx supabase db dump --local

# Powinieneś zobaczyć SQL dump
```

---

## 🔧 Krok 6: Seed Database (Opcjonalne)

### Jeśli chcesz dane testowe:

```bash
# Uruchom seed
npx supabase db reset --local

# Lub tylko seed (bez reset):
psql postgresql://postgres:postgres@127.0.0.1:54322/postgres < supabase/seed.dev.sql
```

---

## 🧪 Krok 7: Uruchom Testy (Opcjonalne)

### Unit Tests

```bash
# Wszystkie testy
npm test

# Z UI
npm run test:ui

# Z coverage
npm run test:coverage
```

### E2E Tests

```bash
# NAJPIERW zbuduj aplikację
npm run build:e2e

# Potem uruchom E2E
npm run test:e2e

# Z UI (interaktywne)
npm run test:e2e:ui

# Z debuggerem
npm run test:e2e:debug
```

---

## 🐛 Troubleshooting

### Problem: Supabase nie startuje

**Error:** `Error starting local database`

**Rozwiązanie:**
```bash
# 1. Sprawdź czy Docker działa
docker ps

# 2. Stop i start ponownie
npx supabase stop
npx supabase start

# 3. Jeśli dalej nie działa, reset
npx supabase db reset --local
```

### Problem: Port już zajęty

**Error:** `Port 54321 already in use`

**Rozwiązanie:**
```bash
# Option A: Stop Supabase i start ponownie
npx supabase stop
npx supabase start

# Option B: Zmień port w supabase/config.toml
# [api]
# port = 54330  # zamiast 54321
```

### Problem: Aplikacja nie łączy się z Supabase

**Symptom:** Błędy w konsoli przeglądarki

**Rozwiązanie:**
```bash
# 1. Sprawdź .env
cat .env
# Upewnij się że PUBLIC_SUPABASE_URL i PUBLIC_SUPABASE_ANON_KEY są wypełnione

# 2. Restart dev server
# Ctrl+C
npm run dev

# 3. Sprawdź status Supabase
npx supabase status
```

### Problem: "ENCRYPTION_KEY is not set"

**Rozwiązanie:**
```bash
# Wygeneruj nowy klucz (32 znaki)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Dodaj do .env
echo "ENCRYPTION_KEY=wygenerowany-klucz" >> .env

# Restart server
```

### Problem: E2E testy failują

**Rozwiązanie:**
```bash
# 1. Sprawdź czy build działa
npm run build:e2e

# 2. Sprawdź czy preview działa
npm run preview
# Otwórz http://localhost:3003 - czy działa?

# 3. Jeśli nie, sprawdź env variables
cat .env.test
# Upewnij się że wszystkie są wypełnione

# 4. Uruchom debugger
npm run test:e2e:debug
```

---

## 📊 Porty Używane

| Service | Port | URL |
|---------|------|-----|
| **Aplikacja (Astro)** | 3003 | http://localhost:3003 |
| **Supabase API** | 54321 | http://127.0.0.1:54321 |
| **Supabase DB** | 54322 | postgresql://postgres:postgres@127.0.0.1:54322/postgres |
| **Supabase Studio** | 54323 | http://127.0.0.1:54323 |
| **Inbucket (Email)** | 54324 | http://127.0.0.1:54324 |

---

## 🔄 Workflow Codziennej Pracy

### Start dnia:

```bash
# 1. Upewnij się że Docker działa
docker ps

# 2. Start Supabase (jeśli nie działa)
npx supabase start

# 3. Start aplikacji
npm run dev

# 4. Otwórz:
# - App: http://localhost:3003
# - Studio: http://127.0.0.1:54323
```

### Koniec dnia:

```bash
# 1. Stop dev server (Ctrl+C w terminalu)

# 2. Stop Supabase (opcjonalne, może zostać)
npx supabase stop

# 3. Stop Docker (opcjonalne)
# Zamknij Docker Desktop
```

### Przydatne komendy:

```bash
# Status wszystkiego
npx supabase status

# Logi Supabase
npx supabase logs

# Reset database
npx supabase db reset --local

# Sprawdź migracje
npx supabase db diff

# Generuj nową migrację
npx supabase db diff -f nazwa_migracji
```

---

## 🎯 Quick Start (TL;DR)

Dla doświadczonych:

```bash
# 1. Docker on
# 2. Install
npm ci

# 3. Supabase
npx supabase start

# 4. .env
cp .env.example .env
# Wypełnij wartościami z supabase start output

# 5. Generate ENCRYPTION_KEY
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Dodaj do .env

# 6. Start
npm run dev

# 7. Open
# http://localhost:3003
# http://127.0.0.1:54323 (Studio)
```

---

## 📚 Dokumentacja

- **Astro:** https://docs.astro.build/
- **Supabase:** https://supabase.com/docs
- **Supabase CLI:** https://supabase.com/docs/guides/cli
- **React 19:** https://react.dev/
- **Playwright:** https://playwright.dev/

---

## 🆘 Pomoc

**Problemy z setup?**

1. Sprawdź sekcję **Troubleshooting** powyżej
2. Przejrzyj logi: `npx supabase logs`
3. Sprawdź konsole przeglądarki (F12)
4. Sprawdź terminal z `npm run dev`

**Stack Overflow tags:**
- `astro`
- `supabase`
- `react-19`
- `typescript`

---

**Status:** ✅ Ready to use  
**Last updated:** 2025-11-16  
**Maintained by:** Development Team

