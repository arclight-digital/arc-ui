#!/usr/bin/env node
/**
 * The icon packs carry the notices their licences require.
 *
 * Both sets are permissive and neither restricts what this repo does with them —
 * vendoring, reshaping the SVG, republishing under another package name, selling
 * what is built on top. Both ask for one thing in return, and in almost the same
 * words. Phosphor is MIT: the copyright and permission notice "shall be included
 * in all copies or substantial portions of the Software". Lucide is ISC:
 * "provided that the above copyright notice and this permission notice appear in
 * all copies". 3,408 glyphs is a substantial portion under any reading.
 *
 * They shipped inside @arclux/arc-ui from v1.9.0 with only ARC's own MIT beside
 * them. Nothing about that was disallowed; the required notices were simply
 * absent, which is a compliance defect rather than a licensing one, and the kind
 * that gets found by a downstream consumer's legal review rather than by anyone
 * here. 4.7 closes it, because the packs became a package with its own LICENSE.
 *
 * ── Why a check and not just a file ──
 *
 * A pasted notice is correct on the day it is pasted. The failure this guards is
 * an *upstream* change nobody here would notice: a relicense, a new copyright
 * holder, a year rolling over in the Lucide/Feather attribution. The LICENSE is
 * generated from the installed packages by scripts/generate/icons.js, so a
 * change shows up as a diff — and this asserts the file on disk still matches
 * what is actually being redistributed, which is the assertion that survives
 * someone editing it by hand.
 *
 * Four rules:
 *
 *   1. Each upstream LICENSE is present in the repo to copy from. Without this
 *      the rest is vacuous — a missing source and an empty notice would agree.
 *   2. packages/icons/LICENSE contains each upstream notice verbatim.
 *   3. It names the version of each pack it was generated from, and that is the
 *      version installed. A notice for a version nobody ships is not a notice.
 *   4. The package's `license` field is the SPDX expression covering all three.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..', '..');
const PKG_DIR = path.join(ROOT, 'packages', 'icons');
const SPDX = 'MIT AND ISC';

/** Upstream packs, as `generate/icons.js` reads them. */
const UPSTREAM = [
  { pkg: '@phosphor-icons/core', label: 'Phosphor Icons' },
  { pkg: 'lucide-static', label: 'Lucide' },
];

const failures = [];

const licensePath = path.join(PKG_DIR, 'LICENSE');
if (!fs.existsSync(licensePath)) {
  console.error(
    '\n✗ packages/icons/LICENSE does not exist — run `pnpm generate:icons`, which writes it.\n',
  );
  process.exit(1);
}
const shipped = fs.readFileSync(licensePath, 'utf-8');

for (const { pkg, label } of UPSTREAM) {
  const dir = path.join(ROOT, 'node_modules', pkg);

  // Rule 1.
  const found = ['LICENSE', 'LICENSE.md', 'LICENCE', 'license']
    .map((n) => path.join(dir, n))
    .find((f) => fs.existsSync(f));
  if (!found) {
    failures.push(
      `${pkg}: no LICENSE in node_modules — nothing to check the shipped notice against. ` +
        'Run `pnpm install`, or find where upstream moved it.',
    );
    continue;
  }

  // Rule 2.
  const upstream = fs.readFileSync(found, 'utf-8').trim();
  if (!shipped.includes(upstream)) {
    failures.push(
      `${label}: packages/icons/LICENSE does not carry ${pkg}'s notice verbatim. ` +
        'Upstream may have relicensed — read the diff before regenerating.',
    );
  }

  // Rule 3.
  const { version } = JSON.parse(fs.readFileSync(path.join(dir, 'package.json'), 'utf-8'));
  if (!shipped.includes(`${pkg} ${version}`)) {
    failures.push(
      `${label}: the shipped notice does not name ${pkg} ${version}, the installed version. ` +
        'Regenerate so the notice describes what is actually being redistributed.',
    );
  }
}

// Rule 4.
const pkgJson = JSON.parse(fs.readFileSync(path.join(PKG_DIR, 'package.json'), 'utf-8'));
if (pkgJson.license !== SPDX) {
  failures.push(
    `packages/icons/package.json declares "license": "${pkgJson.license}" — this package ` +
      `redistributes MIT artwork (Phosphor) and ISC artwork (Lucide) alongside ARC UI's own ` +
      `MIT packaging, so the SPDX expression is "${SPDX}". Every automated licence scanner a ` +
      `consumer runs reads this field and not the file.`,
  );
}

if (failures.length > 0) {
  console.error(`\n✗ ${failures.length} icon-attribution problem(s):\n`);
  for (const f of failures) console.error(`  ${f}`);
  console.error(
    '\n  packages/icons/LICENSE is written by scripts/generate/icons.js from the installed\n' +
      '  packages, so it is a copy of what is being redistributed rather than a transcription.\n' +
      '  `pnpm generate:icons` rewrites it.\n',
  );
  process.exit(1);
}

console.log(`✓ ${UPSTREAM.length} icon packs redistributed with their notices (${SPDX})`);
