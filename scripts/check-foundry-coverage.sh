#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "Usage: $0 <lcov.info> [required_percent]" >&2
  exit 2
fi

LCOV_FILE="$1"
REQUIRED=${2:-100}

if [[ ! -f "$LCOV_FILE" ]]; then
  echo "Coverage file not found: $LCOV_FILE" >&2
  exit 3
fi

# Sum lines found (LF) and lines hit (LH) across all files
read -r LH_TOTAL LF_TOTAL < <(awk -F: '/^LH:/{lh+=$2} /^LF:/{lf+=$2} END{print lh+0, lf+0}' "$LCOV_FILE")

if [[ "$LF_TOTAL" -eq 0 ]]; then
  echo "No lines found in coverage data (LF=0)." >&2
  exit 4
fi

PCT=$(( 100 * LH_TOTAL / LF_TOTAL ))

echo "Foundry Coverage: ${PCT}% (LH=${LH_TOTAL}/LF=${LF_TOTAL})"

if [[ "$PCT" -lt "$REQUIRED" ]]; then
  echo "Coverage threshold not met: required ${REQUIRED}% but got ${PCT}%" >&2
  exit 5
fi

echo "Coverage check passed (>= ${REQUIRED}%)."
