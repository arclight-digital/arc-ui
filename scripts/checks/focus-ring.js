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
 *
 * ── On `scripts/lib/source-walker.js` (V4-PLAN 4.10) ──
 *
 * This check contributed its rule reader to the walker, so the migration is
 * mostly a deletion: `cssRules` is the generator pair below, with the same
 * reasoning and the same two lessons.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { ComponentSource, run } from '../lib/source-walker.js';
import { findComponents, SRC_DIR } from '../lib/component-tags.js';

/** Focus treatments that are allowed to appear in a focus rule. */
const TOKEN = /var\(--(interactive-focus|interactive-focus-ring|interactive-focus-error|focus-ring|focus-glow|focus-error|shadow-[a-z]+|interactive-hover)\)/;

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
 * check-motion-tokens had, and the same fix: normalize the shape before
 * matching, so how a rule is formatted cannot decide whether it is checked.
 *
 * Both halves of that now live in the walker's `cssRules`, which was lifted
 * from the two generators this file used to carry, along with the note on why
 * they were scoped to the style blocks:
 *
 *     The contents of each css`…` tagged template, with its offset in the file.
 *
 *     Scoped to the style blocks: run over the whole module and the braces of
 *     imports, objects and function bodies pair up with CSS braces, which puts
 *     every selector one rule out of step.
 *
 * What is left here is the pair of judgements about a focus rule.
 */
function focusFindings(cssRules) {
  const out = [];
  for (const { selector, body, line } of cssRules) {
    // An explicit, greppable opt-out for the rare rule that has a reason. It
    // has to name one — the point is that a deviation stays visible in review
    // rather than being absorbed as normal.
    if (/focus-ring-exempt/.test(selector) || /focus-ring-exempt/.test(body)) continue;

    const at = (kind, msg, text) => out.push({ kind, line, msg, text: text.trim() });

    // 1. A box-shadow inside a focus rule that is not built from tokens.
    if (/:focus(-visible|-within)?\b/.test(selector)) {
      const shadow = body.match(/box-shadow:\s*([^;]+);/);
      if (shadow && !TOKEN.test(shadow[1]) && /rgba?\(|\d+px/.test(shadow[1])) {
        at('shadow', 'hand-rolled focus shadow — use --interactive-focus, -ring or -error', shadow[0]);
      }
    }

    // 2. outline:none under a bare :focus (not :focus-visible, not a
    //    :not(:focus) hover suppression).
    if (/outline:\s*none/.test(body)) {
      if (/:focus\b/.test(selector) && !/:focus-visible|:focus-within|:not\(:focus/.test(selector)) {
        at('outline', 'outline suppressed under a bare :focus — scope it to :focus-visible', selector);
      }
    }
  }
  return out;
}

/** A rule object per kind, so `run()` groups the two findings under their own hint. */
function ruleFor(kind, name, describe, hint) {
  return {
    name,
    describe,
    hint,
    component({ cssRules, report }) {
      for (const f of focusFindings(cssRules)) {
        if (f.kind === kind) report(f.line, `${f.msg}\n        ${f.text}`);
      }
    },
  };
}

const handRolledShadow = ruleFor(
  'shadow',
  'focus-shadow',
  'a focus rule paints its indicator from a token',
  'The error ring was written out by hand in four components before this existed.\n' +
    '    Use --interactive-focus for a bounded control, --interactive-focus-ring for an\n' +
    '    inline or dense target, --interactive-focus-error for the invalid state. A rule\n' +
    '    with a reason to differ can say `focus-ring-exempt` and name it.',
);

const keyboardScoped = ruleFor(
  'outline',
  'focus-outline',
  '`outline: none` is scoped to :focus-visible, not to a bare :focus',
  ':focus matches a mouse click too, so suppressing the outline there takes the\n' +
    '    indicator away from pointer users while the replacement — scoped to\n' +
    '    :focus-visible — serves only the keyboard. Move the suppression to\n' +
    '    :focus-visible. `:hover:not(:focus)` is already exempt and needs no change.',
);

const code = run({ name: 'focus-ring', rules: [handRolledShadow, keyboardScoped] });

// ── Beside run(): the files that are not components ─────────────────────────

/**
 * The sweep always covered every module under src, and the shared style sheets
 * — button-styles.js, card-styles.js — carry focus rules for the components
 * that compose them. `ComponentSource` reads them with the same primitives, so
 * a rule in a style module is judged exactly as the same rule in a component.
 */
function sources(dir, out = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, e.name);
    if (e.isDirectory()) sources(full, out);
    else if (e.name.endsWith('.js')) out.push(full);
  }
  return out;
}

const visited = new Set(
  [...findComponents().values()].map((m) => resolve(SRC_DIR, m.tier, m.file)),
);
const failures = [];
for (const file of sources(SRC_DIR)) {
  if (visited.has(file)) continue;
  const rel = relative(SRC_DIR, file);
  const view = new ComponentSource({ tag: rel, tier: '.', file: rel }, readFileSync(file, 'utf-8'));
  for (const f of focusFindings(view.cssRules)) failures.push({ file: view.file, ...f });
}

if (failures.length > 0) {
  console.error(`\ncheck-focus-ring: ${failures.length} focus issue(s) outside the components\n`);
  for (const f of failures) {
    console.error(`  ${f.file}:${f.line}  ${f.msg}`);
    console.error(`    ${f.text}\n`);
  }
  process.exit(1);
}

process.exit(code);
