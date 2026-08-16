/**
 * Re-exports @lit/react's `createComponent`.
 *
 * @deprecated Since v4.0.0 — import from `@lit/react` directly. Removed in v5.
 *
 * This file is a two-line pass-through and has never been part of this
 * package's public surface: it is absent from `index.ts` and from all 207
 * entries of the export map, which carries no wildcard. Under `node16` or
 * `bundler` resolution it is already unreachable. It ships in the tarball
 * because `files` includes `src/` and `dist/`, so the one way to reach it is a
 * deep import under legacy `node` resolution, which ignores `exports` —
 * `@arclux/arc-ui-react/dist/create-component.js`.
 *
 * That is the population this notice is for, and it is the whole reason the
 * file gets a deprecation release rather than being deleted outright. The
 * replacement is what the file itself does:
 *
 *     import { createComponent, type EventName } from '@lit/react';
 *
 * Individual wrappers already import `@lit/react` directly; nothing inside this
 * package reads this module.
 */
export { createComponent, type EventName } from '@lit/react';
