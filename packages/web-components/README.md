# @arclux/arc-ui

Lit web components implementing the Arclight design system. This is the canonical source — every framework wrapper package is generated from these components by [Prism](https://www.npmjs.com/package/@arclux/prism).

## Installation

```bash
npm install @arclux/arc-ui lit
```

## Usage

Register every component (simplest — one import defines all `<arc-*>` elements):

```js
import '@arclux/arc-ui/register';
```

Or register only what you use for smaller bundles — each component subpath defines just that element and its required children:

```js
import '@arclux/arc-ui/button';
import '@arclux/arc-ui/card';
import '@arclux/arc-ui/command-palette'; // also registers arc-command-item / arc-command-group
```

Then use the elements anywhere HTML works:

```html
<arc-button variant="primary">Get Started</arc-button>

<arc-card>
  <h3>Card Title</h3>
  <p>Card content.</p>
</arc-card>

<arc-input label="Email" type="email" placeholder="you@example.com"></arc-input>
```

The bare entry point (`import { ArcButton } from '@arclux/arc-ui'`) exports the component **classes** without registering any custom elements — use it when you want to control registration yourself (custom tag names, scoped registries).

## Events

Components emit `arc-*` CustomEvents (`arc-input`, `arc-change`, `arc-select`, `arc-close`, …) that bubble and cross shadow boundaries. Payloads are on `event.detail`:

```js
document.querySelector('arc-input').addEventListener('arc-input', (e) => {
  console.log(e.detail.value);
});
```

## Theming

Components read design tokens from CSS custom properties. Compound tokens (gradients, glows, focus rings) reference a small set of base tokens, so overriding just the accents re-themes everything:

```css
:root {
  --accent-primary: rgb(77, 126, 247);
  --accent-primary-rgb: 77, 126, 247;
  --accent-secondary: rgb(34, 211, 238);
  --accent-secondary-rgb: 34, 211, 238;
}
```

Dark theme is the default; set `data-theme="light"` (or `"auto"`) on the root element to switch. Per-component fine-tuning is available via `::part()` selectors on most components.

## Icons

`<arc-icon>` lazy-loads individual icons from the bundled Phosphor set (Lucide also included):

```js
import { iconRegistry } from '@arclux/arc-ui';

iconRegistry.use('lucide');              // switch the built-in library
iconRegistry.set({ myLogo: '<svg>…</svg>' }); // register custom icons
```

```html
<arc-icon name="magnifying-glass" size="md"></arc-icon>
<arc-icon name="book-open" size="20"></arc-icon> <!-- named sizes or numeric px -->
```

## TypeScript & tooling

The package ships type declarations for every component plus a
[`custom-elements.json`](https://github.com/webcomponents/custom-elements-manifest) manifest, so editors with web-component tooling get tag, attribute, and event completion.

Prop types are unions where the component accepts a fixed set of values
(`variant: 'primary' | 'secondary' | 'ghost'`), and `arc-*` event names are
registered in `GlobalEventHandlersEventMap` with typed `detail` payloads, so
`addEventListener('arc-change', …)` autocompletes and type-checks.

### Editor support

**VS Code** — add the bundled custom data to `.vscode/settings.json` for tag,
attribute, and attribute-value completion (with hover docs) in plain HTML:

```json
{
  "html.customData": ["./node_modules/@arclux/arc-ui/vscode.html-custom-data.json"],
  "css.customData": ["./node_modules/@arclux/arc-ui/vscode.css-custom-data.json"]
}
```

**JetBrains IDEs** (WebStorm, IntelliJ) — no setup needed; the bundled
`web-types.json` is picked up automatically.

## Framework Wrappers

If you are using a framework, prefer the dedicated wrapper package:

| Framework | Package |
|-----------|---------|
| React     | [`@arclux/arc-ui-react`](https://www.npmjs.com/package/@arclux/arc-ui-react) |
| Vue 3     | [`@arclux/arc-ui-vue`](https://www.npmjs.com/package/@arclux/arc-ui-vue) |
| Svelte 5  | [`@arclux/arc-ui-svelte`](https://www.npmjs.com/package/@arclux/arc-ui-svelte) |
| Angular   | [`@arclux/arc-ui-angular`](https://www.npmjs.com/package/@arclux/arc-ui-angular) |
| Solid     | [`@arclux/arc-ui-solid`](https://www.npmjs.com/package/@arclux/arc-ui-solid) |
| Preact    | [`@arclux/arc-ui-preact`](https://www.npmjs.com/package/@arclux/arc-ui-preact) |
| Plain HTML/CSS | [`@arclux/arc-ui-html`](https://www.npmjs.com/package/@arclux/arc-ui-html) |

## Links

- [Documentation & interactive examples](https://arcui.dev)
- [Repository](https://github.com/arclight-digital/arc-ui)
- [License (MIT)](https://github.com/arclight-digital/arc-ui/blob/main/LICENSE)
