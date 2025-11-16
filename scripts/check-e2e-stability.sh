#!/bin/bash

# Script to check E2E test stability
# Usage: ./scripts/check-e2e-stability.sh [runs]

set -e

RUNS=${1:-3}
FAILED=0
RESULTS_DIR="stability-results"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "========================================="
echo "E2E Stability Check"
echo "========================================="
echo "Running E2E tests $RUNS times..."
echo ""

# Create results directory
mkdir -p "$RESULTS_DIR"

for i in $(seq 1 $RUNS); do
  echo ""
  echo "========================================="
  echo -e "${YELLOW}Run $i/$RUNS${NC}"
  echo "========================================="
  
  RESULT_FILE="$RESULTS_DIR/run-$i.txt"
  
  if npm run test:e2e > "$RESULT_FILE" 2>&1; then
    echo -e "${GREEN}✅ Run $i passed${NC}"
    echo "passed" > "$RESULTS_DIR/run-$i.status"
  else
    echo -e "${RED}❌ Run $i failed${NC}"
    echo "failed" > "$RESULTS_DIR/run-$i.status"
    FAILED=$((FAILED + 1))
    
    # Copy failure artifacts
    if [ -d "test-results" ]; then
      mkdir -p "$RESULTS_DIR/run-$i-artifacts"
      cp -r test-results/* "$RESULTS_DIR/run-$i-artifacts/" 2>/dev/null || true
    fi
  fi
done

echo ""
echo "========================================="
echo "SUMMARY"
echo "========================================="
echo "Total runs: $RUNS"
echo -e "${GREEN}Passed: $((RUNS - FAILED))${NC}"
echo -e "${RED}Failed: $FAILED${NC}"

SUCCESS_RATE=$(( (RUNS - FAILED) * 100 / RUNS ))
echo "Success rate: $SUCCESS_RATE%"
echo ""

# Analyze results
if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}✅ All tests stable! (100% success rate)${NC}"
  echo "E2E tests are ready to be enabled in CI."
  exit 0
elif [ $SUCCESS_RATE -ge 90 ]; then
  echo -e "${YELLOW}⚠️ Tests are mostly stable ($SUCCESS_RATE%)${NC}"
  echo "Some flakiness detected. Consider:"
  echo "  - Enabling E2E with continue-on-error: true"
  echo "  - Investigating intermittent failures"
  exit 1
else
  echo -e "${RED}❌ Tests are unstable ($SUCCESS_RATE%)${NC}"
  echo "Fix these issues before enabling in CI:"
  echo ""
  
  # Show common failures
  echo "Analyzing failures..."
  find "$RESULTS_DIR" -name "*.txt" -exec grep -l "Error:" {} \; | while read file; do
    echo "  - $(basename $file)"
    grep -A 2 "Error:" "$file" | head -n 3 || true
  done
  
  echo ""
  echo "Full results saved in: $RESULTS_DIR/"
  echo "See CI_CD_QUICK_FIXES.md for debugging guide"
  exit 1
fi

