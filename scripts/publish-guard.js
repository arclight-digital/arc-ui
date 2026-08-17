#!/usr/bin/env node
/**
 * A publish goes through pnpm, or it does not go.
 *
 * Every published manifest in this repo declares its core floor as
 * `workspace:^` — scripts/checks/version-floor.js requires that exact spelling,
 * because pnpm rewrites it at pack time to `^<the core version in this tree>`
 * and a literal cannot follow a release. The rewrite is the whole mechanism.
 * It is also the whole exposure: `workspace:^` is not a range npm can resolve,
 * so a manifest that reaches the registry without being rewritten installs
 * nowhere at all.
 *
 * That is not hypothetical. @arclux/arc-ui-icons@4.0.0 went out on 2026-08-17
 * from a laptop, seven minutes ahead of the release workflow that would have
 * published it — `npm publish`, which packs the manifest verbatim and rewrites
 * nothing. The tarball carried `"@arclux/arc-ui": "workspace:^"` into its
 * peerDependencies and every `npm install` of it died on EUNSUPPORTEDPROTOCOL.
 * CI then found 4.0.0 already on the registry and skipped the package, so the
 * broken copy is the only copy, and the version number can never be reused.
 *
 * Nothing in the repo was wrong that day. The manifest was right, the check
 * suite was green, `pnpm pack` produced a correct tarball the whole time. What
 * was missing was anything that made the wrong command fail, so this is that:
 * a prepublishOnly hook on every publishable package that refuses a publish not
 * driven by pnpm. npm runs it before it packs, which is early enough.
 *
 * It is a guard against the accident, not against intent — `--ignore-scripts`
 * walks straight past it. The accident is what happened.
 *
 * The other half of the lesson has no code in it: that publish also skipped
 * provenance. Everything from CI carries a SLSA attestation and this one does
 * not, which is the visible fingerprint of a release that went around the
 * workflow. Tag it and let CI publish it.
 */
const agent = process.env.npm_config_user_agent ?? '';
const pkg = process.env.npm_package_name ?? 'this package';

// pnpm/10.29.3 npm/? node/v24.18.0 linux x64  ← pnpm
// npm/11.16.0 node/v24.18.0 linux x64 …       ← npm
if (/\bpnpm\//.test(agent)) process.exit(0);

console.error(`
✗ ${pkg} must be published with pnpm, not ${agent.split('/')[0] || 'this client'}.

  Every manifest here declares its core floor as "workspace:^". pnpm rewrites
  that to a real caret range while it packs; npm ships the string as written,
  and the published package then fails every install with:

      npm error code EUNSUPPORTEDPROTOCOL
      npm error Unsupported URL Type "workspace:": workspace:^

  That is exactly how @arclux/arc-ui-icons@4.0.0 shipped broken, and a version
  burned this way cannot be republished — the fix costs a whole release.

  Publish by tagging. The release workflow packs with pnpm and signs the result
  with provenance:

      pnpm bump-versions <version>
      git commit -am "chore(release): v<version>"
      git tag v<version> && git push origin main --tags

  If you genuinely need to publish from here, use pnpm so the rewrite happens:

      pnpm publish --access public
`);
process.exit(1);
