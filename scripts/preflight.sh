#!/usr/bin/env bash
#
# Neon compute preflight — the blocking gate from ~/.claude/CLAUDE-neon-compute-rules.md §9.
#
# Neon bills by wake-time, not query count, so a single crawler hitting a
# dynamically-rendered public page keeps the database awake continuously. These
# checks catch the patterns that cause that.
#
# What lives here vs. in the ESLint plugin: the plugin catches per-file AST
# mistakes (dynamic APIs in a public route, unscoped queries). This catches
# repo-shaped ones — a missing export, a cron interval, a write in a render
# path — that lint has no natural hook for.
#
# Usage: npm run preflight

set -uo pipefail

FAIL=0

fail() {
  printf '\033[31mFAIL\033[0m  %s\n' "$1"
  FAIL=1
}

pass() {
  printf '\033[32mok\033[0m    %s\n' "$1"
}

echo "Neon compute preflight"
echo

# 1. Dynamic rendering escape hatches on any route.
if grep -rn "force-dynamic\|revalidate = 0" app/ 2>/dev/null; then
  fail "force-dynamic or revalidate = 0 found. The answer is a long ISR window plus on-write revalidation, never force-dynamic."
else
  pass "no force-dynamic or revalidate = 0"
fi

# 2. Client polling. Anything under 15 minutes keeps the database awake.
if grep -rn "setInterval\|refetchInterval" app/ components/ 2>/dev/null; then
  fail "polling found. No interval under 15 minutes; prefer webhooks or on-write revalidation."
else
  pass "no client polling"
fi

# 3. Writes in a render path.
if grep -rln "\.insert(\|\.update(\|\.set(" $(find app -name 'page.tsx' -o -name 'layout.tsx' 2>/dev/null) 2>/dev/null; then
  fail "database write in a page or layout. No write on a render, ever — that includes view counters and last-seen timestamps."
else
  pass "no writes in render paths"
fi

# 4. Every route outside the authenticated segments declares an explicit
#    revalidate. Matched by exclusion rather than by naming (public) so a new
#    route group — (marketing) landed this way — is covered the day it appears.
#    (app) and (onboarding) both require a session, so they are legitimately
#    dynamic and excluded here; add a segment to this list only if it is gated.
MISSING_REVALIDATE=""
while IFS= read -r file; do
  [ -z "$file" ] && continue
  grep -q "export const revalidate" "$file" || MISSING_REVALIDATE="${MISSING_REVALIDATE}\n  $file"
done < <(find app -name 'page.tsx' -not -path 'app/(app)/*' -not -path 'app/(onboarding)/*' 2>/dev/null)

if [ -n "$MISSING_REVALIDATE" ]; then
  # shellcheck disable=SC2059
  printf "public routes without an explicit revalidate:$MISSING_REVALIDATE\n"
  fail "every public route needs an explicit revalidate (minimum 3600 for content, 300 for time-sensitive)."
else
  pass "every public route declares revalidate"
fi

# 5. Cron cadence. Nothing under an hour without written approval.
if [ -f vercel.json ] || [ -f vercel.ts ]; then
  if grep -n "schedule" vercel.json vercel.ts 2>/dev/null | grep -vE '0 \*|0 [0-9]+ \*'; then
    fail "review cron schedules — nothing under 1 hour without approval."
  else
    pass "cron schedules within policy"
  fi
else
  pass "no cron configuration"
fi

echo
if [ "$FAIL" -ne 0 ]; then
  echo "Preflight failed. Do not deploy."
  exit 1
fi

echo "Preflight passed."
