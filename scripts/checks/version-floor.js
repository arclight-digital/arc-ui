/**
 * Every wrapper declares a floor under the core it was generated from.
 *
 * The release workflow publishes only the packages whose files changed since
 * the previous tag, which means a wrapper can sit on npm at an older version
 * than core. That is fine — and it is only fine because each wrapper carries a
 * caret range under `@arclux/arc-ui`, so the copy already published accepts the
 * newer core rather than pinning the one it shipped beside.
 *
 * The spelling is what this checks, and it is `workspace:^` in every case. pnpm
 * rewrites that at pack time to `^<the core version in this tree>`, so the
 * floor is stamped by the release rather than typed by a person. A literal —
 * `"^3.2.0"` — reads identically in the repo and is the one thing that cannot
 * follow: it stays at whatever was true the day it was written, and the failure
 * surfaces as a peer-dependency conflict in a consumer's install, months later,
 * with nothing in this repo pointing at it.
 *
 * Three rules:
 *
 *   1. A wrapper that imports core declares it as a peer dependency.
 *   2. Spelled `workspace:^`, never a literal and never `*`.
 *   3. Versions stay in lockstep with core. Diff-gating changes *what gets
 *      published*, not what the version number means — the release workflow's
 *      tag gate reads core's version alone, so a wrapper carrying a different
 *      one would be tagged as something it is not.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..', '..');
const PACKAGES = path.join(ROOT, 'packages');
const CORE = '@arclux/arc-ui';

/**
 * The one publishable package with no dependency on core.
 *
 * `@arclux/arc-ui-html` ships standalone CSS and static HTML examples — the
 * output of the same generator, but nothing in it imports or executes core, so
 * a peer range would assert a relationship that does not exist and would fail a
 * consumer's install for no reason.
 */
const NO_CORE_DEPENDENCY = new Set(['@arclux/arc-ui-html']);

const corePkg = JSON.parse(
  fs.readFileSync(path.join(PACKAGES, 'web-components', 'package.json'), 'utf-8'),
);

const failures = [];
let checked = 0;

for (const dir of fs.readdirSync(PACKAGES)) {
  const manifest = path.join(PACKAGES, dir, 'package.json');
  if (!fs.existsSync(manifest)) continue;

  const pkg = JSON.parse(fs.readFileSync(manifest, 'utf-8'));
  if (pkg.private || pkg.name === CORE) continue;
  const at = (msg) => failures.push({ pkg: pkg.name, msg });

  // Rule 3 applies to every published package, core dependency or not: the
  // release tag is checked against core's version and nothing else.
  if (pkg.version !== corePkg.version) {
    at(`version ${pkg.version} — core is ${corePkg.version}; the release tag names core's`);
  }

  if (NO_CORE_DEPENDENCY.has(pkg.name)) {
    checked++;
    continue;
  }

  const range = pkg.peerDependencies?.[CORE];
  if (range === undefined) {
    const elsewhere = pkg.dependencies?.[CORE] ?? pkg.devDependencies?.[CORE];
    at(
      elsewhere
        ? `declares ${CORE} as a dependency, not a peer — a wrapper must not bundle a second copy of the elements`
        : `does not declare ${CORE} at all, so nothing stops it installing beside a core that predates it`,
    );
  } else if (range !== 'workspace:^') {
    at(
      `declares ${CORE} as "${range}" — must be "workspace:^", which pnpm stamps with ` +
        `the core version at pack time. A literal cannot follow a release.`,
    );
  }

  checked++;
}

if (checked === 0) {
  console.error('\n✗ no publishable packages found — is this running from the repo root?\n');
  process.exit(1);
}

if (failures.length > 0) {
  console.error(`\n✗ ${failures.length} version-floor problem(s):\n`);
  for (const f of failures) console.error(`  ${f.pkg}\n    ${f.msg}\n`);
  console.error(
    `  The release publishes only the packages whose files changed since the last\n` +
      `  tag, so a wrapper can be older than core on npm. That is safe exactly while\n` +
      `  its floor is a caret stamped at pack time. See .github/workflows/release.yml.\n`,
  );
  process.exit(1);
}

console.log(`✓ ${checked} published packages carry a stamped floor under ${CORE}`);
