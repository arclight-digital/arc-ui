#!/usr/bin/env node
/**
 * css-backticks.js
 *
 * Every component source must parse, and when one does not, this says why.
 *
 * The failure it was written for: a backtick inside a `css` tagged template
 * ends the template. Everything after it is parsed as JavaScript, and since the
 * rest of a stylesheet is not JavaScript, the file stops parsing — several
 * lines later, naming an identifier from the CSS:
 *
 *     SyntaxError: Unexpected identifier 'subtle'
 *     divider.js(160,31): error TS1005: ',' expected.
 *
 * Neither message mentions a backtick, and neither points at the line with one.
 * It happened twice in one afternoon during 4.2's merges, both times from
 * ordinary prose in a CSS comment quoting a property or a variant name.
 *
 * **This is a diagnosis, not a new gate.** The defect cannot ship: `check-ssr`
 * fails on it and `generate/module-types.js` fails the whole pipeline. What
 * neither does is name the cause, and both run after the 18-second prism step.
 * So this asserts the same thing earlier and explains it.
 *
 * The parse is `node --check`, not a hand-written scanner. The first draft *was*
 * a scanner — look for `css\``, walk to the matching backtick — and it reported
 * three files that were entirely fine: a css template that is nothing but
 * interpolations and closes on its own line, a plain template literal in a file
 * that happened to contain a css one earlier, and a JSDoc comment containing the
 * literal text `` `css` `` in a list of language names. Every one of those is a
 * case a real parser gets right for free, and a scanner has to be taught. The
 * scan below still exists, but only runs on a file that has *already* failed to
 * parse — where over-reporting costs a glance and cannot produce a false
 * failure, because the failure is the parse.
 *
 * Run via: pnpm check css-backticks (and as part of pnpm generate, in the
 * source-assertion phase)
 */
import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..', '..');
const SRC = join(ROOT, 'packages/web-components/src');

/** Every .js under src/, excluding the generated icon modules. */
function sources(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) {
      if (name !== 'icons' && name !== 'generated') sources(full, out);
    } else if (name.endsWith('.js')) {
      out.push(full);
    }
  }
  return out;
}

/**
 * Lines in a file that already failed to parse which look like the cause.
 *
 * A CSS comment containing a backtick is the shape, and it is cheap to spot
 * once you know the file is broken: CSS comments are `/* … *\/` and a backtick
 * has no business inside one.
 */
function likelyCause(source) {
  const out = [];
  const lines = source.split('\n');
  // Only from the first css template onward. Every component's own JSDoc header
  // is full of backticks in comments and all of them are fine — they are not
  // inside a template. Reporting those buried the one line that mattered under
  // five that did not, on the first run of this check.
  const firstTemplate = lines.findIndex((l) => l.includes('css`'));
  if (firstTemplate === -1) return out;

  let inComment = false;
  lines.forEach((line, n) => {
    if (n < firstTemplate) return;
    const opens = line.includes('/*');
    const closes = line.includes('*/');
    if ((inComment || opens) && line.includes('`')) out.push({ line: n + 1, text: line.trim() });
    if (opens && !closes) inComment = true;
    if (closes) inComment = false;
  });
  return out;
}

const files = sources(SRC);
const broken = [];

for (const file of files) {
  try {
    execFileSync(process.execPath, ['--check', file], { stdio: 'pipe' });
  } catch (err) {
    broken.push({
      file: relative(ROOT, file),
      error: `${err.stderr ?? ''}`.split('\n').find((l) => l.includes('Error')) ?? 'failed to parse',
      causes: likelyCause(readFileSync(file, 'utf-8')),
    });
  }
}

// Anti-vacuity: this repo has ~200 components. Finding almost nothing to check
// means the walk broke, not that the tree is clean.
if (files.length < 100) {
  console.error(`check-css-backticks: only ${files.length} source file(s) found — the scan is broken, not the tree.`);
  process.exit(1);
}

if (broken.length) {
  console.error('check-css-backticks: source file(s) do not parse\n');
  for (const b of broken) {
    console.error(`  ${b.file}`);
    console.error(`    ${b.error.trim()}`);
    for (const c of b.causes) {
      console.error(`    likely cause — backtick in a comment, line ${c.line}:`);
      console.error(`      ${c.text.length > 96 ? c.text.slice(0, 96) + '…' : c.text}`);
    }
    if (!b.causes.length) {
      console.error('    no backtick-in-a-comment found — this is an ordinary syntax error.');
    }
  }
  console.error(
    '\nInside a css template a backtick ends the template, and everything after it\n' +
      'is parsed as JavaScript. In a comment, drop the backticks; in a value, escape\n' +
      'it. The parse error above names an identifier from the CSS and points at the\n' +
      'wrong line, which is why this check exists.',
  );
  process.exit(1);
}

console.log(`check-css-backticks: ${files.length} source files parse`);
