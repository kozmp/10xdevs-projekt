#!/bin/bash

# Script to analyze test coverage and generate report
# Usage: ./scripts/analyze-test-coverage.sh

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "========================================="
echo "Test Coverage Analysis"
echo "========================================="
echo ""

# Run unit tests with coverage
echo -e "${BLUE}Running unit tests with coverage...${NC}"
npm run test:coverage

# Check if coverage directory exists
if [ ! -d "coverage" ]; then
  echo -e "${RED}Error: Coverage directory not found${NC}"
  exit 1
fi

echo ""
echo "========================================="
echo "Coverage Summary"
echo "========================================="

# Parse coverage-summary.json
if [ -f "coverage/coverage-summary.json" ]; then
  # Extract overall coverage
  LINES=$(cat coverage/coverage-summary.json | grep -o '"lines":{"total":[0-9]*,"covered":[0-9]*' | head -1)
  FUNCTIONS=$(cat coverage/coverage-summary.json | grep -o '"functions":{"total":[0-9]*,"covered":[0-9]*' | head -1)
  BRANCHES=$(cat coverage/coverage-summary.json | grep -o '"branches":{"total":[0-9]*,"covered":[0-9]*' | head -1)
  STATEMENTS=$(cat coverage/coverage-summary.json | grep -o '"statements":{"total":[0-9]*,"covered":[0-9]*' | head -1)
  
  echo -e "${GREEN}Coverage Report Generated${NC}"
  echo ""
  echo "View full report:"
  echo "  - HTML: coverage/index.html"
  echo "  - JSON: coverage/coverage-summary.json"
  echo ""
else
  echo -e "${YELLOW}Coverage summary not found${NC}"
fi

# Check coverage thresholds
echo "========================================="
echo "Coverage Thresholds Check"
echo "========================================="
echo ""

TARGET_COVERAGE=80
echo "Target: ${TARGET_COVERAGE}% (MVP requirement from PRD)"
echo ""

# TODO: Parse actual percentages and compare
# For now, just show instructions
echo "Manual check required:"
echo "1. Open coverage/index.html"
echo "2. Check if overall coverage >= ${TARGET_COVERAGE}%"
echo "3. Focus on critical modules:"
echo "   - src/lib/services/"
echo "   - src/components/forms/"
echo "   - src/lib/encryption.ts"
echo ""

echo "========================================="
echo "Next Steps"
echo "========================================="
echo ""
echo "If coverage < ${TARGET_COVERAGE}%:"
echo "  1. Identify uncovered modules"
echo "  2. Prioritize P0/P1 features (see test-plan-2.md)"
echo "  3. Add missing tests"
echo ""
echo "See CI_CD_VERIFICATION_REPORT.md Section 4 for details"

