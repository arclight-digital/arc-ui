#!/usr/bin/env node
/**
 * release-scope.js
 *
 * Prints the `pnpm --filter` arguments naming the packages a tag should
 * publish, or `-r` for all of them.
 *
 *   node scripts/release-scope.js v4.1.0        # what that tag published
 *   node scripts/release-scope.js               # what HEAD would publish
 *
 * Every release used to put nine identical tarballs on npm whether or not
 * anything in eight of them had moved, which makes a package's version history
 * say nothing about whether the package moved. The release workflow answered
 * that with `pnpm --filter "[<prev tag>]"` — the packages whose files changed
 * since the previous tag.
 *
 * It has never once excluded a package, for two independent reasons, and v4.1.0
 * shipped all twelve while reporting it was gating:
 *
 *   1. `actions/checkout` clones shallow and fetches no tags, so
 *      `git describe --tags` found nothing, `PREV` was empty, and the step's
 *      own `|| true` fallback took the "no previous tag — publish everything"
 *      branch. Silently: that branch is a legitimate state for a first release,
 *      so it reads as information rather than as a failure.
 *
 *   2. Even with the tag present, the filter selects everything anyway, because
 *      `bump-versions` writes the new version into all twelve package.json
 *      files in the release commit. A version bump is a file change. Lockstep
 *      versioning and a since-the-last-tag file filter cannot both be right,
 *      and the filter is the one that has to give.
 *
 * So the scope is computed here rather than delegated. A package counts as
 * changed unless the only thing that moved in it is its own `"version"` line —
 * which is exactly the edit the release commit makes everywhere.
 *
 * ── What is deliberately not here ──
 *
 * Dependents. A wrapper whose files did not change does not need republishing
 * when core moves: the copy already on npm declares `^<older core>` and a caret
 * accepts the newer one. Across a major it does not, so a major publishes
 * everything regardless — the cost of being wrong that way is a few identical
 * tarballs, and the cost of the other way is a broken upgrade path.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const git = (...args) =>
  execFileSync('git', args, {
    cwd: root,
    encoding: 'utf-8',
    // Not inherited: `git describe` with nothing to describe writes a fatal to
    // stderr, and a caught, expected failure should not look like an error in
    // the log of a release.
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();

const ref = process.argv[2] || 'HEAD';

/**
 * The tag before `ref`, or null on a genuine first release.
 *
 * "No previous tag" means one of two very different things and conflating them
 * is the whole bug: a first release should publish everything, and a shallow
 * clone should publish nothing until someone fixes the clone. `git tag -l` does
 * not tell them apart — a clone made with `--no-tags` reports zero tags, which
 * reads exactly like a repository that has never been released.
 *
 * Shallowness is the question that actually has an answer. A shallow clone
 * cannot say what changed since the last tag, so it does not get to guess.
 */
function previousTag() {
  if (git('rev-parse', '--is-shallow-repository') === 'true') {
    console.error(
      'release-scope: this is a shallow clone, so the previous tag is not\n' +
        'reachable and the publish scope cannot be computed. Set\n' +
        '`fetch-depth: 0` on actions/checkout. Refusing to guess.'
    );
    process.exit(1);
  }

  try {
    return git('describe', '--tags', '--abbrev=0', `${ref}^`) || null;
  } catch {
    return null; // nothing before it — the first release
  }
}

/** True when the only edit to a package.json is its own version line. */
function versionBumpOnly(file, prev) {
  const diff = git('diff', '-U0', prev, ref, '--', file);
  const body = diff
    .split('\n')
    .filter((l) => /^[+-]/.test(l) && !/^(\+\+\+|---)/.test(l))
    .filter((l) => !/^[+-]\s*"version":/.test(l));
  return body.length === 0;
}

const prev = previousTag();
const packagesDir = path.join(root, 'packages');

const publishable = fs
  .readdirSync(packagesDir)
  .map((dir) => ({ dir: `packages/${dir}`, manifest: path.join(packagesDir, dir, 'package.json') }))
  .filter((p) => fs.existsSync(p.manifest))
  .map((p) => ({ ...p, pkg: JSON.parse(fs.readFileSync(p.manifest, 'utf-8')) }))
  .filter((p) => !p.pkg.private);

if (prev === null) {
  console.error('release-scope: no previous tag — publishing everything.');
  console.log('-r');
  process.exit(0);
}

const major = (t) => t.replace(/^v/, '').split('.')[0];
let refTag = ref;
if (ref === 'HEAD') {
  try {
    refTag = git('describe', '--tags', '--abbrev=0');
  } catch {
    refTag = 'HEAD';
  }
}
if (major(refTag) !== major(prev)) {
  console.error(`release-scope: major bump ${prev} → ${refTag} — publishing everything.`);
  console.log('-r');
  process.exit(0);
}

const changed = [];
const skipped = [];

for (const { dir, pkg } of publishable) {
  const files = git('diff', '--name-only', prev, ref, '--', dir).split('\n').filter(Boolean);
  if (files.length === 0) {
    skipped.push(`${pkg.name} (no files changed)`);
    continue;
  }
  if (files.length === 1 && files[0] === `${dir}/package.json` && versionBumpOnly(files[0], prev)) {
    skipped.push(`${pkg.name} (version bump only)`);
    continue;
  }
  changed.push(pkg.name);
}

// A tag that publishes nothing is a tag nobody meant to push.
if (changed.length === 0) {
  console.error(
    `release-scope: nothing changed in any publishable package since ${prev}.\n` +
      'A release that publishes nothing is a mistake — check the tag.'
  );
  process.exit(1);
}

console.error(`release-scope: ${prev} → ${refTag}`);
for (const name of changed) console.error(`  publish  ${name}`);
for (const note of skipped) console.error(`  skip     ${note}`);

console.log(changed.map((name) => `--filter ${name}`).join(' '));
