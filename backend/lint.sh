#!/bin/bash
set -e

echo "=== Node.js/TypeScript Linting ==="
echo ""

echo "Running ESLint..."
if npm run lint; then
  echo "[PASSED] ESLint"
  echo ""
  echo "[PASSED] All linting checks passed"
  exit 0
else
  echo "[FAILED] ESLint"
  exit 1
fi
