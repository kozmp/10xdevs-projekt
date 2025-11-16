# Test Scripts

Zbiór skryptów pomocniczych do testowania i weryfikacji CI/CD.

## 📋 Dostępne Skrypty

### 1. `run-failing-tests.sh`

**Cel:** Uruchomienie tylko failujących testów jednostkowych

**Użycie:**
```bash
# Linux/macOS
./scripts/run-failing-tests.sh

# Windows (Git Bash)
bash scripts/run-failing-tests.sh

# Windows (WSL)
wsl ./scripts/run-failing-tests.sh
```

**Output:**
- ✅ Lista przechodzących testów
- ❌ Lista wciąż failujących testów
- Podsumowanie: X passed, Y failed

**Kiedy używać:**
- Podczas naprawiania testów jednostkowych
- Przed commitem zmian w testach
- Do szybkiej weryfikacji postępu

---

### 2. `check-e2e-stability.sh`

**Cel:** Sprawdzenie stabilności testów E2E przez wielokrotne uruchomienie

**Użycie:**
```bash
# Domyślnie 3 rundy
./scripts/check-e2e-stability.sh

# Własna liczba rund (np. 5)
./scripts/check-e2e-stability.sh 5
```

**Output:**
- Progress każdego uruchomienia
- Success rate (%)
- Analiza failures (jeśli wystąpiły)
- Artifacts z failed runs w `stability-results/`

**Interpretacja:**
- 100% - ✅ Testy stabilne, gotowe do CI
- 90-99% - ⚠️ Drobne problemy z flakiness
- <90% - ❌ Wymagana naprawa przed CI

**Kiedy używać:**
- Po naprawie testów E2E
- Przed włączeniem E2E w CI
- Po zmianach w test infrastructure

---

### 3. `analyze-test-coverage.sh`

**Cel:** Analiza pokrycia testami i weryfikacja thresholds

**Użycie:**
```bash
./scripts/analyze-test-coverage.sh
```

**Output:**
- Pełny coverage report (HTML + JSON)
- Sprawdzenie thresholds (target: 80%)
- Wskazówki co testować dalej

**Artefakty:**
- `coverage/index.html` - Raport HTML
- `coverage/coverage-summary.json` - Dane JSON

**Kiedy używać:**
- Po dodaniu nowych testów
- Przed release do production
- Do monitoringu quality metrics

---

## 🛠️ Wymagania

### System operacyjny:
- **Linux/macOS:** Działają natywnie
- **Windows:** Wymagany Git Bash lub WSL

### Dependencies:
- Node.js 22+
- npm
- Playwright (dla E2E)
- Vitest (dla unit tests)

### Instalacja zależności:
```bash
npm ci
```

---

## 📊 Przykładowe Użycie - Workflow Naprawy Testów

### Krok 1: Sprawdź które testy failują
```bash
./scripts/run-failing-tests.sh
```

**Output:**
```
Testing: StyleSelectCards (4 tests)
❌ FAILED

Testing: LanguageSelect (3 tests)
❌ FAILED

...

SUMMARY
Passed: 0
Failed: 7
```

### Krok 2: Napraw pierwszy test
```bash
# Edytuj test
vim src/components/forms/controls/__tests__/StyleSelectCards.test.tsx

# Uruchom tylko ten test
npm test -- StyleSelectCards.test.tsx
```

### Krok 3: Powtórz dla wszystkich
```bash
./scripts/run-failing-tests.sh
```

**Target output:**
```
SUMMARY
Passed: 7
Failed: 0
✅ All tests passed!
```

### Krok 4: Sprawdź coverage
```bash
./scripts/analyze-test-coverage.sh
```

### Krok 5: Stabilność E2E
```bash
./scripts/check-e2e-stability.sh 3
```

**Target output:**
```
SUMMARY
Total runs: 3
Passed: 3
Failed: 0
Success rate: 100%
✅ All tests stable!
```

---

## 🔍 Troubleshooting

### Problem: Permission denied

**Linux/macOS:**
```bash
chmod +x scripts/*.sh
```

**Windows:**
```powershell
# Use Git Bash instead
"C:\Program Files\Git\bin\bash.exe" scripts/run-failing-tests.sh
```

### Problem: npm command not found

```bash
# Ensure Node.js is installed
node --version
npm --version

# Install dependencies
npm ci
```

### Problem: Playwright not installed

```bash
npx playwright install chromium --with-deps
```

### Problem: E2E tests timeout

```bash
# Increase timeout in playwright.config.ts
# Or run fewer parallel workers
npm run test:e2e -- --workers=1
```

---

## 📚 Dodatkowa Dokumentacja

- **Pełna analiza CI/CD:** `CI_CD_VERIFICATION_REPORT.md`
- **Quick fixes:** `CI_CD_QUICK_FIXES.md`
- **PR summary:** `PR_CI_CD_IMPROVEMENTS.md`
- **Test plan:** `.ai/test-plan-2.md`

---

## 🤝 Contributing

Dodawanie nowych skryptów:

1. Utwórz `.sh` file w `scripts/`
2. Dodaj shebang: `#!/bin/bash`
3. Dodaj dokumentację w tym README
4. Test na Linux i Windows (Git Bash)
5. Commit z opisem funkcjonalności

**Konwencje:**
- Nazwy: `lowercase-with-dashes.sh`
- Colors: Use ANSI codes dla readability
- Error handling: `set -e` na początku
- Help message: Support `--help` flag

---

**Ostatnia aktualizacja:** 2025-11-16  
**Maintainer:** QA Team

