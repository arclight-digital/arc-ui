/**
 * Focus indication has to be a token, and has to be keyboard-scoped.
 *
 * The library was in better shape here than it looked: ninety-two of the
 * hundred-and-three `outline: none` sites already paired with a visible
 * replacement, and the eleven that did not turned out to ring through a JS
 * state class or a wrapper's :focus-within. Nothing was missing. What was
 * missing was a *rule* — the error ring had been written out by hand
 * identically in four components, and arc-carousel had the glow and the ring
 * inverted, because there was nothing to disagree with.
 *
 * So this checks the two things that were actually drifting:
 *
 *   1. A hand-rolled focus shadow. Every focus treatment is a token; a literal
 *      rgba() or px ring inside a :focus rule means someone rebuilt one.
 *   2. `outline: none` under a bare `:focus`. `:focus` matches a mouse click,
 *      so suppressing the outline there removes the indicator for pointer users
 *      and — where the replacement is scoped to :focus-visible — leaves the
 *      keyboard user as the only one served. `:hover:not(:focus)` is exempt:
 *      that is suppressing *hover* while focused, which is what it should do.
 *
 * What this deliberately does not check is which of the two treatments a
 * component picked. Glow for a bounded control, ring for an inline or dense
 * target — see the note on tokens.focus — is a judgement about the target, and
 * a script that tried to infer it from a selector name would be wrong more
 * often than the components are.
 */
import fs from 'node:fs';
import path from 'node:path';

const SRC = 'packages/web-components/src';
const failures = [];

/** Focus treatments that are allowed to appear in a focus rule. */
const TOKEN = /var\(--(interactive-focus|interactive-focus-ring|interactive-focus-error|focus-ring|focus-glow|focus-error|shadow-[a-z]+|interactive-hover)\)/;

function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full);
    else if (e.name.endsWith('.js')) scan(full);
  }
}

/**
 * Rules are read as innermost selector/body pairs over the whole source, not
 * line by line.
 *
 * The line-based version could not see a rule written on one line: for
 * `.field:focus { outline: none; }` the backscan for a selector started from
 * the `}` that closed the very same rule, and so found no selector at all.
 * Four real violations — data-grid's cell editor, input, masked-input and
 * password-input — sat unreported behind that until the tree was run through
 * prettier and the declarations landed on their own lines. Same blind spot
 * check-motion-tokens had, and the same fix: normalise the shape before
 * matching, so how a rule is formatted cannot decide whether it is checked.
 */
/** The contents of each css`…` tagged template, with its offset in the file. */
function* styleBlocks(src) {
  const open = /\bcss`/g;
  let m;
  while ((m = open.exec(src))) {
    const start = m.index + m[0].length;
    const end = src.indexOf('`', start);
    if (end === -1) return;
    yield { text: src.slice(start, end), offset: start };
    open.lastIndex = end + 1;
  }
}

function* rules(src) {
  // Scoped to the style blocks: run over the whole module and the braces of
  // imports, objects and function bodies pair up with CSS braces, which puts
  // every selector one rule out of step.
  for (const block of styleBlocks(src)) {
    for (const m of block.text.matchAll(/([^{}]*)\{([^{}]*)\}/g)) {
      const at = block.offset + m.index;
      yield {
        selector: m[1].trim(),
        body: m[2],
        line: src.slice(0, at).split('\n').length,
      };
    }
  }
}

function scan(file) {
  const src = fs.readFileSync(file, 'utf8');
  const rel = path.relative(process.cwd(), file);

  for (const { selector, body, line } of rules(src)) {
    const at = (msg, text) => failures.push({ file: rel, line, msg, text: text.trim() });

    // An explicit, greppable opt-out for the rare rule that has a reason. It
    // has to name one — the point is that a deviation stays visible in review
    // rather than being absorbed as normal.
    if (/focus-ring-exempt/.test(selector) || /focus-ring-exempt/.test(body)) continue;

    // 1. A box-shadow inside a focus rule that is not built from tokens.
    if (/:focus(-visible|-within)?\b/.test(selector)) {
      const shadow = body.match(/box-shadow:\s*([^;]+);/);
      if (shadow && !TOKEN.test(shadow[1]) && /rgba?\(|\d+px/.test(shadow[1])) {
        at('hand-rolled focus shadow — use --interactive-focus, -ring or -error', shadow[0]);
      }
    }

    // 2. outline:none under a bare :focus (not :focus-visible, not a
    //    :not(:focus) hover suppression).
    if (/outline:\s*none/.test(body)) {
      if (/:focus\b/.test(selector) && !/:focus-visible|:focus-within|:not\(:focus/.test(selector)) {
        at('outline suppressed under a bare :focus — scope it to :focus-visible', selector);
      }
    }
  }
}

walk(SRC);

if (failures.length > 0) {
  console.error(`\n✗ ${failures.length} focus issue(s):\n`);
  for (const f of failures) {
    console.error(`  ${f.file}:${f.line}  ${f.msg}`);
    console.error(`    ${f.text}\n`);
  }
  process.exit(1);
}

console.log('✓ focus indication is tokenised and keyboard-scoped');
