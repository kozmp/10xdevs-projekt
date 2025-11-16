#!/bin/bash

# Script to run only the failing unit tests
# Usage: ./scripts/run-failing-tests.sh

set -e

echo "========================================="
echo "Running Failing Unit Tests"
echo "========================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

FAILED=0
PASSED=0

run_test() {
  local test_file=$1
  local description=$2
  
  echo "Testing: $description"
  echo "File: $test_file"
  
  if npm test -- "$test_file" --run; then
    echo -e "${GREEN}✅ PASSED${NC}"
    PASSED=$((PASSED + 1))
  else
    echo -e "${RED}❌ FAILED${NC}"
    FAILED=$((FAILED + 1))
  fi
  
  echo ""
}

echo "========================================="
echo "Priority 1: Form Context Issues (14 tests)"
echo "========================================="
echo ""

run_test "StyleSelectCards.test.tsx" "StyleSelectCards (4 tests)"
run_test "LanguageSelect.test.tsx" "LanguageSelect (3 tests)"

echo "========================================="
echo "Priority 2: Page Component Issues (13 tests)"
echo "========================================="
echo ""

run_test "JobProgressPage.test.tsx" "JobProgressPage (7 tests)"
run_test "JobsHistoryPage.test.tsx" "JobsHistoryPage (6 tests)"

echo "========================================="
echo "Priority 3: Other Issues (8 tests)"
echo "========================================="
echo ""

run_test "GenerateForm.test.tsx" "GenerateForm (3 tests)"
run_test "ProductsTable.test.tsx" "ProductsTable (4 tests)"
run_test "GeneratePage.test.tsx" "GeneratePage (6 tests)"

echo "========================================="
echo "SUMMARY"
echo "========================================="
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}✅ All tests passed!${NC}"
  exit 0
else
  echo -e "${RED}❌ $FAILED test suite(s) still failing${NC}"
  echo "See CI_CD_QUICK_FIXES.md for fix instructions"
  exit 1
fi

