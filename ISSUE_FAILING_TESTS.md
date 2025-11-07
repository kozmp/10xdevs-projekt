# Fix Failing Unit Tests (35 tests)

## 📊 Summary

35 unit tests are currently failing. These are **pre-existing issues** not related to the structured logging PR.

**Status:**
- ✅ 319 tests passing
- ❌ 35 tests failing
- ⏭️ 4 tests skipped
- **Total:** 358 tests

## 🔍 Failing Tests Breakdown

### 1. Form Components - Form Context Issues (7 tests)

**Files:**
- `src/components/forms/controls/__tests__/StyleSelectCards.test.tsx` (4 failed)
- `src/components/forms/controls/__tests__/LanguageSelect.test.tsx` (3 failed)

**Error:** `Cannot destructure property 'getFieldState' of '(0, useFormContext)(...)' as it is null`

**Root Cause:** Components using `useFormContext()` but tests don't provide `FormProvider` wrapper

**Fix:** Wrap components in `FormProvider` with mock form context in tests

---

### 2. JobProgressPage - Missing Hook (7 tests)

**File:** `src/components/pages/JobProgressPage/__tests__/JobProgressPage.test.tsx`

**Error:** `useJobProgress is not defined`

**Root Cause:** Hook not properly mocked or imported in test

**Fix:** Add proper mock for `useJobProgress` hook

---

### 3. JobsHistoryPage - Component Issues (6 tests)

**File:** `src/components/pages/JobsHistoryPage/__tests__/JobsHistoryPage.test.tsx`

**Root Cause:** Similar to JobProgressPage - missing hooks/context

**Fix:** Add proper mocks for required hooks

---

### 4. GenerateForm - Form Issues (3 tests)

**File:** `src/components/forms/GenerateForm/__tests__/GenerateForm.test.tsx`

**Tests:**
- "shows progress bar when generating"
- "displays results when generation is successful"
- "displays error message when generation fails"

**Root Cause:** Missing form context or hooks

**Fix:** Provide proper test setup with form context and mocked hooks

---

### 5. ProductsTable - Pagination Issues (4 tests)

**Files:**
- `src/components/__tests__/ProductsTable.test.tsx` (2 failed)
- `src/components/tables/ProductsTable/__tests__/ProductsTable.test.tsx` (1 failed)

**Tests:**
- "should disable pagination buttons appropriately"
- "should have accessible pagination controls"
- "handles pagination changes"

**Root Cause:** Pagination component behavior not properly tested

**Fix:** Update test assertions to match actual pagination behavior

---

### 6. GeneratePage - Button/Form Issues (6 tests)

**File:** `src/components/__tests__/GeneratePage.test.tsx`

**Tests:**
- "should render generate button"
- "should be enabled when products are selected and not generating"
- "should call generate function with correct parameters when clicked"
- "should call generate with updated style and language"
- "should show 'Generowanie...' text when generating"
- Plus 1 more

**Root Cause:** Component integration issues with forms and state

**Fix:** Review component structure and update test mocks

---

### 7. Encryption Tests (3 tests)

**File:** Tests related to encryption module (need to identify exact file)

**Root Cause:** To be investigated

**Fix:** Review encryption test setup and assertions

---

## 🎯 Priority

**Priority 1 (High):** Form context issues (14 tests)
- Most common issue
- Affects multiple components
- Likely simple fix (add FormProvider wrapper)

**Priority 2 (Medium):** Page component issues (13 tests)
- JobProgressPage, JobsHistoryPage
- Requires hook mocking

**Priority 3 (Low):** Other issues (8 tests)
- GenerateForm, ProductsTable, GeneratePage, Encryption
- Various issues requiring individual investigation

---

## 📋 Action Items

- [ ] Fix Form Context issues (StyleSelectCards, LanguageSelect)
- [ ] Fix JobProgressPage tests (add useJobProgress mock)
- [ ] Fix JobsHistoryPage tests
- [ ] Fix GenerateForm tests
- [ ] Fix ProductsTable pagination tests
- [ ] Fix GeneratePage tests
- [ ] Investigate and fix Encryption tests

---

## 🔗 Related

- Pre-existing before PR: https://github.com/kozmp/10xdevs-projekt/pull/[PR_NUMBER]
- Evidence: https://github.com/kozmp/10xdevs-projekt/actions/runs/19118595035
- Not caused by structured logging implementation

---

## 📈 Success Criteria

- [ ] All 35 failing tests pass
- [ ] No new test failures introduced
- [ ] Test coverage maintained or improved
- [ ] Tests run successfully in CI/CD
