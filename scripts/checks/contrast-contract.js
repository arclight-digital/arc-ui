/**
 * Every scheme that ships clears the contract it claims, measured on the CSS.
 *
 * `solvePalette` already throws during generation when a target is unreachable,
 * and that is the assertion the four shipped schemes have run on since v3. It
 * has one blind spot: it proves the *solver* was asked for the right ratio, not
 * that the file on disk carries the answer. Between the two sits everything
 * that can put a color into a stylesheet without going through the solver — a
 * hand-written theme preset, a literal added to an override block, a scheme
 * whose ground moved after its foregrounds were solved.
 *
 * `themes/high-contrast.css` is why this exists. It was hand-written, its header
 * claimed "WCAG AAA compliance (7:1+ contrast ratios)", and ten of its thirty
 * foreground pairings did not reach 7:1 — two of them, light-mode success and
 * warning, sat at 4.87 and 4.86, which is AA and nothing more. Nothing was
 * wrong with the solver. The file simply never went through it.
 *
 * So this reads the generated stylesheets and measures. It is deliberately dumb
 * about where a value came from: a scheme block declares a ground and some
 * foregrounds, and each foreground owes that ground a ratio.
 *
 * The rounding half is worth stating too, because it is the difference between
 * a contract and a claim. The solver searches in continuous OKLCH lightness and
 * ships three 8-bit channels, and the rounding used to walk the answer back
 * under its own target — by a hundredth, but under. The high-contrast preset
 * came out at 6.97, 6.98 and 6.99 under a header promising 7. `solveContrast`
 * now takes its last step on the value that actually ships; this check is what
 * would have caught it either way.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseColor, contrast } from '../../shared/color.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..', '..');
const SRC = path.join(ROOT, 'packages', 'web-components', 'src');

/**
 * The floors each stylesheet's blocks owe.
 *
 * base.css carries the four shipped schemes at the 5.5 contract — AA plus the
 * headroom dark already had, which is what lets a scheme absorb a ground shift
 * without hand-rescuing anything. high-contrast.css is the AAA preset.
 *
 * Borders are deliberately absent. They are not text, WCAG does not apply, and
 * their contract is "as visible as they are in dark mode" — a ratio taken from
 * the dark scheme rather than a standard, which shared/tokens.js states and
 * solves. Restating it here would be a second copy of a number, which is the
 * class of thing this file exists to catch.
 */
const SHEETS = [
  { file: path.join(SRC, 'base.css'), floor: 5.5, label: 'base.css' },
  {
    file: path.join(SRC, 'themes', 'high-contrast.css'),
    floor: 7,
    label: 'themes/high-contrast.css',
  },
];

/** Foregrounds that sit on the page as text and owe it a ratio. */
const FOREGROUNDS = [
  '--text-primary',
  '--text-secondary',
  '--text-muted',
  '--text-ghost',
  '--accent-primary',
  '--accent-secondary',
  '--color-success',
  '--color-error',
  '--color-warning',
  '--color-info',
];

/** Split a stylesheet into blocks, keeping the selector each one opened with. */
function blocks(css) {
  const out = [];
  // Comments first: they quote token names and ratios, and a `--text-muted:`
  // inside one would be read as a declaration.
  const code = css.replace(/\/\*[\s\S]*?\*\//g, '');
  for (const m of code.matchAll(/([^{}]*)\{([^{}]*)\}/g)) {
    const selector = m[1].trim().split('\n').pop().trim();
    const decls = {};
    for (const d of m[2].matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) decls[d[1]] = d[2].trim();
    if (Object.keys(decls).length) out.push({ selector, decls });
  }
  return out;
}

const failures = [];
let measured = 0;

for (const { file, floor, label } of SHEETS) {
  if (!fs.existsSync(file)) {
    failures.push({ label, msg: `missing — run \`pnpm generate\`` });
    continue;
  }
  const found = blocks(fs.readFileSync(file, 'utf-8'));

  // A block only gets measured if it declares its own ground. That is what
  // makes a "scheme" here: a ground plus the foregrounds solved against it.
  // A block that retunes one token without restating the ground inherits the
  // pairing of whichever block set it, and is not a scheme.
  const schemes = found.filter((b) => b.decls['--bg-deep']);
  if (schemes.length === 0) {
    failures.push({ label, msg: 'no scheme block declares --bg-deep — is this file generated?' });
    continue;
  }

  for (const { selector, decls } of schemes) {
    let ground;
    try {
      ground = parseColor(decls['--bg-deep']);
    } catch {
      continue; // a var() reference rather than a literal; nothing to measure
    }
    for (const name of FOREGROUNDS) {
      const value = decls[name];
      if (!value || value.includes('var(') || value.includes('color-mix')) continue;
      let ratio;
      try {
        ratio = contrast(parseColor(value), ground);
      } catch {
        continue;
      }
      measured++;
      if (ratio >= floor) continue;
      failures.push({
        label,
        msg: `${selector}  ${name} is ${ratio.toFixed(2)}:1 on ${decls['--bg-deep']}, owes ${floor}`,
      });
    }
  }
}

if (failures.length > 0) {
  console.error(`\n✗ ${failures.length} color(s) below the contract of the scheme they ship in:\n`);
  for (const f of failures) console.error(`  ${f.label}  ${f.msg}`);
  console.error(
    `\n  These are measured on the generated CSS, not on the token tree, so a value\n` +
      `  that reached the stylesheet without going through solvePalette fails here\n` +
      `  and nowhere else. Move the ground, raise the seed, or lower the contract\n` +
      `  deliberately in shared/tokens.js.\n`,
  );
  process.exit(1);
}

console.log(`✓ ${measured} foreground/ground pairings clear their scheme's contract`);
