# @arclux/arc-ui-icons

Phosphor and Lucide, packaged for [ARC UI](https://arcui.dev).

Two libraries, 3,408 glyphs, one module each — so a page downloads the icons it
renders and nothing else.

```bash
npm i @arclux/arc-ui @arclux/arc-ui-icons
```

## Register a pack

```js
import '@arclux/arc-ui-icons/phosphor';
```

That is the whole setup. The import registers Phosphor with ARC UI's icon
registry and, if no library has been selected yet, makes it the active one:

```html
<arc-icon name="star"></arc-icon>
```

Lucide is the same line with a different name, and both can be registered at
once. Registration never takes the choice back from a page that has already made
one, so importing both and calling neither `use()` nor `<arc-icon-library>`
leaves the first-imported pack active. Say which you want:

```js
import '@arclux/arc-ui-icons/phosphor';
import '@arclux/arc-ui-icons/lucide';

import { iconRegistry } from '@arclux/arc-ui';
iconRegistry.use('lucide');
```

or declaratively, anywhere in the document:

```html
<arc-icon-library name="lucide"></arc-icon-library>
```

## Or skip the pack

A `*.register.js` module carries a resolver with an entry per glyph — 1,896 for
Lucide, 1,512 for Phosphor. Each entry is a static `import()` specifier, which is
what lets a bundler split them into one chunk per icon, but it also means the
bundler has to walk all of them.

An app that uses a dozen icons should import those twelve instead. No resolver,
twelve modules:

```js
import { iconRegistry } from '@arclux/arc-ui';
import check from '@arclux/arc-ui-icons/phosphor/check';
import x from '@arclux/arc-ui-icons/phosphor/x';

iconRegistry.set({ check, x });
```

Icons registered this way are library-independent: they answer to their name
whatever `use()` points at, and they win over a registered pack — which is also
how you override one glyph without replacing the set.

If you want a whole library as a single value — an icon picker is the usual
reason — that is one import, and it loads every glyph:

```js
import phosphor from '@arclux/arc-ui-icons/phosphor'; // { 'check': '<svg…>', … }
```

## A library of your own

Nothing here is privileged. `register()` takes any name and any map:

```js
import { iconRegistry } from '@arclux/arc-ui';

iconRegistry.register('brand', {
  icons: { logo: '<svg…>', mark: '<svg…>' },
  // ARC UI's built-in components ask for Lucide's names. Map them if your
  // library spells them differently, and those components resolve too.
  aliases: { 'chevron-right': 'arrow-right' },
});

iconRegistry.use('brand');
```

Values may be SVG strings, as above, or `() => import('./somewhere.js')` thunks
if you want them code-split the way the built-in packs are.

## Names

Phosphor and Lucide disagree about what common glyphs are called, and for the
carets they disagree completely — Phosphor has `caret-right` and no
`chevron-right`, Lucide the reverse. ARC UI's own components use the Lucide
spelling and each pack ships an alias table, exported as
`@arclux/arc-ui-icons/aliases`, so built-in components resolve under either.

Browse both sets at [arcui.dev/docs/components/icon](https://arcui.dev/docs/components/icon).

## Licence

`MIT AND ISC`. The packaging is ARC UI's, under MIT; the artwork is not ours to
relicense and is redistributed under its own terms — **Phosphor Icons** under MIT
([phosphoricons.com](https://phosphoricons.com)) and **Lucide** under ISC, with
portions derived from Feather under MIT ([lucide.dev](https://lucide.dev)). Both
permit commercial use, modification and redistribution.

All three notices are in [LICENSE](./LICENSE), which is generated from the
installed upstream packages so that it stays a copy rather than a transcription;
`scripts/checks/icon-attribution.js` fails the build if it drifts from what is
actually being shipped. Each glyph is reproduced unchanged apart from the removal
of fixed `width`/`height` and `class` attributes, so it can inherit size and
colour from its host.
