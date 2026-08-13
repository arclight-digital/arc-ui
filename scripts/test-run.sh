#!/usr/bin/env bash
# Run the suite so a failure cannot be lost.
#
# The flake in this repo has now destroyed its own evidence three times: twice by
# re-running until green, and once by piping the runner through `grep` for the
# summary line, which discarded the assertion message. Every one of those was a
# process failure, not a memory failure — "be careful next time" has already been
# tried and did not work.
#
# So the full log is always written to a file first, and the summary is derived
# from that file rather than from a pipe. A failure prints with context and the
# log path is echoed either way, so the evidence outlives the terminal.
#
#   pnpm test:log            # whole suite
#   pnpm test:log <file>     # one file, same capture
set -u
cd "$(dirname "$0")/.."

DIR=.test-logs
mkdir -p "$DIR"
LOG="$DIR/run-$(date +%Y%m%d-%H%M%S).log"

if [ "$#" -gt 0 ]; then
  npx web-test-runner --files "$@" >"$LOG" 2>&1
else
  npx web-test-runner >"$LOG" 2>&1
fi
CODE=$?

grep -E "test files \|" "$LOG" | tail -1

if [ "$CODE" -ne 0 ]; then
  echo
  echo "FAILURES ($LOG):"
  echo
  # -A 20 rather than the bare line: the assertion message is what goes missing,
  # and it sits under the ❌, not on it.
  grep -A 20 '❌' "$LOG"
fi

echo
echo "full log: $LOG"
exit "$CODE"
