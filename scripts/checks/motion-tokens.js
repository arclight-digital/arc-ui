/**
 * Motion has to come from the token tree.
 *
 * Before the v3 motion pass every one of the three transition tokens ended in
 * the CSS keyword `ease` — the browser default — across 356 uses, while the two
 * curves the tree published were spelled four times in the whole library. The
 * tokens are only worth having if new work reaches for them, and a convention
 * nobody can see is one that decays. Hence a check rather than a note.
 *
 * Three things fail here:
 *
 *   1. A bare timing keyword (`ease`, `ease-in`, `linear`, …) in a transition or
 *      animation. Every curve the library uses has a token; a keyword means
 *      someone reached past them.
 *   2. A literal cubic-bezier(). Same reason, and it is how the spring curve
 *      ended up written out by hand in one component while --ease-spring
 *      existed.
 *   3. A curve token sitting where a duration belongs — `transition: transform
 *      var(--ease-out)`. This is the one worth the whole script: it is valid
 *      CSS, so nothing warns, and the shorthand's first <time> is the duration,
 *      which is therefore 0s. The property silently never animates. Three sites
 *      shipped this way, including the accordion chevron.
 *
 * Literal *durations* are allowed. A component tuning 80ms or 250ms against a
 * specific gesture is doing design work; a component picking its own curve is
 * leaving the system.
 */
import fs from 'node:fs';
import path from 'node:path';

const SRC = 'packages/web-components/src';

/** Timing keywords that have a token equivalent, and should use it. */
const KEYWORDS = ['ease', 'ease-in', 'ease-out', 'ease-in-out'];

/**
 * Three deliberate exemptions, each because a token would make the motion worse
 * rather than more consistent:
 *
 *   `linear` — correct for a value mapping to a continuous input rather than to
 *     a state change. arc-scroll-indicator tracks scroll position; an eased
 *     curve would lag the finger and then catch up.
 *   `step-start` / `step-end` — a blinking cursor has to step. arc-typewriter.
 *   any `infinite` animation — a loop wants a symmetric breathing curve, which
 *     is a different problem from the enter/exit curves in the tree. The
 *     ease-in-out keyword is the right shape for a shimmer or a pulse, and
 *     substituting --ease-out (a strong decelerate, built for entrances) would
 *     give every loop a limp. If loops ever want a token it should be a new one,
 *     not a reused entrance curve.
 */
const isLoop = (line) => /\binfinite\b/.test(line);

const failures = [];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.name.endsWith('.js')) check(full);
  }
}

function check(file) {
  // The generated token layer is where the literal curves are supposed to live.
  if (file.endsWith('generated/host-tokens.js')) return;

  const src = fs.readFileSync(file, 'utf8');
  const rel = path.relative(process.cwd(), file);

  // Join multi-line declarations onto the line they start on. A transition
  // wrapped across four lines hid a bare `ease` from the first version of this
  // check — the continuation lines carry no `transition:` to match against, so
  // they were skipped, and the check reported clean while the keyword was still
  // there. Line numbers are preserved by padding the consumed lines out.
  const raw = src.split('\n');
  const lines = [];
  for (let i = 0; i < raw.length; i++) {
    if (/\b(transition|animation)(-timing-function)?\s*:/.test(raw[i]) && !raw[i].includes(';')) {
      let joined = raw[i];
      let j = i + 1;
      while (j < raw.length && j < i + 8 && !joined.includes(';')) {
        joined += ' ' + raw[j].trim();
        j++;
      }
      lines.push(joined);
      for (let k = i + 1; k < j; k++) lines.push('');
      i = j - 1;
    } else {
      lines.push(raw[i]);
    }
  }

  lines.forEach((line, i) => {
    const at = (msg) => failures.push({ file: rel, line: i + 1, msg, text: line.trim() });

    // Only look at declarations that actually set motion.
    if (!/\b(transition|animation)(-timing-function)?\s*:/.test(line)) return;
    if (isLoop(line)) return;

    if (/cubic-bezier\s*\(/.test(line)) {
      at('literal cubic-bezier() — use an --ease-* token');
    }

    for (const kw of KEYWORDS) {
      // A keyword as its own token in the value, not part of --ease-out-expo.
      const re = new RegExp(String.raw`(?:^|[\s,:])${kw}(?=[\s,;)]|$)`);
      const value = line.slice(line.indexOf(':') + 1);
      if (re.test(value)) {
        at(`bare "${kw}" timing keyword — use an --ease-* token`);
        break;
      }
    }

    // A curve token where the duration belongs: no <time> before it in the
    // same comma-separated segment.
    for (const segment of line.slice(line.indexOf(':') + 1).split(',')) {
      if (!/var\(--ease-/.test(segment)) continue;
      const beforeCurve = segment.slice(0, segment.indexOf('var(--ease-'));
      if (!/\d\s*m?s\b|var\(--(duration|transition)-/.test(beforeCurve)) {
        at('curve token where a duration belongs — the shorthand reads 0s, so this never animates');
      }
    }
  });
}

walk(SRC);

if (failures.length > 0) {
  console.error(`\n✗ ${failures.length} motion value(s) outside the token tree:\n`);
  for (const f of failures) {
    console.error(`  ${f.file}:${f.line}  ${f.msg}`);
    console.error(`    ${f.text}\n`);
  }
  process.exit(1);
}

console.log('✓ motion values all come from tokens');
