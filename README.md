<h1 align="center">ARC UI</h1>
<p align="center"><strong>Lit Web Components, with a native package for each of seven frameworks.</strong></p>

<p align="center">
  <a href="https://www.npmjs.com/package/@arclux/arc-ui"><img src="https://img.shields.io/npm/v/@arclux/arc-ui?style=flat-square&color=4d7ef7" alt="npm version"></a>
  <a href="https://github.com/arclight-digital/arc-ui/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-8b5cf6?style=flat-square" alt="license"></a>
  <img src="https://img.shields.io/badge/frameworks-7-8b5cf6?style=flat-square" alt="frameworks">
  <img src="https://img.shields.io/badge/components-169-4d7ef7?style=flat-square" alt="components">
  <img src="https://img.shields.io/badge/Lit_powered-3.3-14b8a6?style=flat-square" alt="Lit 3.3">
</p>

<p align="center">
  <a href="https://arcui.dev">Documentation</a> &nbsp;&middot;&nbsp;
  <a href="https://arcui.dev/docs/getting-started">Getting started</a> &nbsp;&middot;&nbsp;
  <a href="https://arcui.dev/docs/components">Components</a> &nbsp;&middot;&nbsp;
  <a href="https://arcui.dev/docs/theme-synthesizer">Theme Synthesizer</a>
</p>

---

ARC UI is a set of [Lit](https://lit.dev) Web Components. **Prism**, our generator, produces native packages for React, Vue, Svelte, Angular, Solid, Preact and plain HTML from that one source, so every framework gets the same elements and the same tokens. Changing framework means changing the import path.

It's built AI-first: Claude writes most of the code, and the tests and CI decide what ships. Before anything ships it has to pass 5,196 browser tests (the test runner's count at v4.9.2) and Prism's own suite of about 690 tests, and CI mounts every wrapper package in a real browser on every run. Styling is CSS custom properties throughout, so in dark mode the zero-JS HTML package looks the same as the React one. The HTML package has no light theme.

Lit is a peer dependency. The package depends on `@lit-labs/ssr-client` and `qrcode-generator`, and takes `shiki` and `@shikijs/langs` (for Code Block) and `@lit-labs/ssr` (for server rendering) as optional peers.

## Quick start

```bash
npm install @arclux/arc-ui lit
```

```html
<arc-button variant="primary">Get Started</arc-button>
<arc-card>
  <span slot="heading">Hello, ARC</span>
  <p>A card with gradient hover borders and ambient glow.</p>
</arc-card>
```

### React

```bash
npm install @arclux/arc-ui-react @arclux/arc-ui lit
```

```tsx
import { Button, Card } from '@arclux/arc-ui-react';

function App() {
  return (
    <Card heading="Hello, ARC">
      <Button variant="primary">Get Started</Button>
    </Card>
  );
}
```

### CDN (zero JS)

```html
<link rel="stylesheet" href="https://unpkg.com/@arclux/arc-ui-html/css/arc-ui.css">

<button class="arc-button" data-variant="primary">Get Started</button>
```

## Framework packages

| Framework | Package | Install |
|-----------|---------|---------|
| Web Components | `@arclux/arc-ui` | `npm i @arclux/arc-ui lit` |
| React | `@arclux/arc-ui-react` | `npm i @arclux/arc-ui-react @arclux/arc-ui lit` |
| Vue 3 | `@arclux/arc-ui-vue` | `npm i @arclux/arc-ui-vue @arclux/arc-ui lit` |
| Svelte 5 | `@arclux/arc-ui-svelte` | `npm i @arclux/arc-ui-svelte @arclux/arc-ui lit` |
| Angular | `@arclux/arc-ui-angular` | `npm i @arclux/arc-ui-angular @arclux/arc-ui lit` |
| Solid | `@arclux/arc-ui-solid` | `npm i @arclux/arc-ui-solid @arclux/arc-ui lit` |
| Preact | `@arclux/arc-ui-preact` | `npm i @arclux/arc-ui-preact @arclux/arc-ui lit` |
| HTML / CSS | `@arclux/arc-ui-html` | `npm i @arclux/arc-ui-html` |

Prism generates every framework package from the same Lit source, and CI fails any commit where the generated output doesn't match it. Icons are a separate install: `@arclux/arc-ui-icons` has Phosphor and Lucide, so a project that renders no icons downloads none.

## Components

169 components across seven tiers. v4 cut five that were broken or far short of their job, and [MIGRATION.md](https://github.com/arclight-digital/arc-ui/blob/main/MIGRATION.md#the-five-cuts) says what was wrong with each.

| Tier | Count | Highlights |
|------|-------|------------|
| **Layout** | 19 | App Shell, Auth Shell, Dashboard Grid, Page Layout, Split Pane, Resizable, Masonry |
| **Navigation** | 22 | Top Bar, Sidebar, Tabs, Menubar, Breadcrumb, Command Bar, Drawer, Tree View |
| **Content** | 26 | Card, Accordion, Avatar, Lightbox, QR Code, Divider, Infinite Scroll, Virtual List |
| **Data** | 25 | Chart, Data Grid, Kanban, Timeline, Stat, Gauge, Sparkline |
| **Input** | 44 | Input, Select, Combobox, Calendar, Date Range Picker, Tag Input, Transfer List, Image Cropper |
| **Feedback** | 18 | Dialog, Confirm, Toast, Command Palette, Tooltip, Sheet, Popover, Alert |
| **Typography** | 15 | Code Block, Markdown, Terminal, Kbd, Keyboard Map, Prose, Blockquote |

Ten marketing components (Carousel, CTA Banner, Typewriter and seven more) and three audio and media components (Knob, Level Meter, Waveform) are published from `@arclux/arc-ui/marketing` and `@arclux/arc-ui/media`. They're in the same package at the same version, but left out of the `@arclux/arc-ui` barrel, so an admin dashboard that imports from it never bundles a landing-page hero. `@arclux/arc-ui/register` still registers them. The full catalog is at [arcui.dev/docs/components](https://arcui.dev/docs/components).

## Server rendering

Every component renders to declarative shadow DOM on the server. `renderDeclarativeShadowDOM` takes the HTML your framework rendered (Next, Nuxt, SvelteKit, Angular Universal, Astro, or a string you built yourself) and returns it with each `<arc-*>` element rendered into a shadow root, along with the stylesheets to serve beside it. It needs the optional peer `@lit-labs/ssr`.

```js
import { renderDeclarativeShadowDOM } from '@arclux/arc-ui/ssr';

const page = await renderDeclarativeShadowDOM(appHtml);
```

On the client, import `@arclux/arc-ui/hydrate` before any component, so the elements adopt the server's markup instead of rendering it again. The same function renders [arcui.dev](https://arcui.dev).

## Icons

`@arclux/arc-ui-icons` has both packs (Phosphor and Lucide, about 3,400 glyphs). You register one explicitly, and each glyph loads on demand, so a page downloads only the icons it renders:

```js
import '@arclux/arc-ui-icons/phosphor'; // registers and selects; <arc-icon name="star"> just works
```

Your own icon set registers the same way, with an alias table so the built-in components find their icons in it.

## Accessibility

Every component documentation page, live demos included, is audited with [axe-core](https://github.com/dequelabs/axe-core) in both dark and light themes on every commit. Serious and critical violations fail CI. Run the audit yourself with `pnpm audit:a11y` after `pnpm build:docs`. Live results: [arcui.dev/docs/accessibility](https://arcui.dev/docs/accessibility).

## Verification

CI runs:

- the browser test suite, against every component
- build-time checks that fail on docs claims a component doesn't back up, motion curves and focus rings that skip the tokens, and generated files that drifted from their source
- mutation testing on the shared modules every component uses, with each module's threshold set just under its measured score
- `pnpm test:wrappers`, which mounts all six framework wrapper packages in a real browser and runs one shared contract against them

A release tag on a failing commit doesn't publish.

## Design tokens

Colors, spacing, type, shadows and glows are all CSS custom properties. To rebrand, set the two accent colors, each with its `-rgb` channel:

```css
:root {
  --accent-primary:       rgb(16, 185, 129);
  --accent-primary-rgb:   16, 185, 129;
  --accent-secondary:     rgb(6, 182, 212);
  --accent-secondary-rgb: 6, 182, 212;
}
```

Gradients, glows, focus rings and card hovers are built from those through `var()`, so they follow.

### Theme modes

```html
<html data-theme="dark">   <!-- Default -->
<html data-theme="light">  <!-- Light theme -->
<html data-theme="auto">   <!-- Follow OS preference -->
```

Use `theme-fixed-dark` or `theme-fixed-light` to pin a region, such as a top bar or footer, to one scheme whatever the page theme. A pinned dark region is plain near-black on a dark page. On a light page it becomes a deep color derived from your accent.

`[data-density="compact"]` and `[data-density="comfortable"]` scale the spacing by 0.75x and 1.25x, on the page or on one region. Touch targets and type sizes don't change. A generated high-contrast preset ships at `@arclux/arc-ui/themes/high-contrast`, solved to 7:1 by the same contrast contract as the four shipped schemes.

### Token categories

Backgrounds, text, borders, accents, spacing (xs–4xl), type scale, shadows, radii, z-index, transitions, glows and gradients. The [token reference](https://arcui.dev/docs/tokens) lists every token.

## How Prism works

Prism reads the Lit source (properties, styles, slots, events and CSS parts) and generates wrappers for each target:

- **React**: `@lit/react` `createComponent` wrappers with TypeScript types
- **Vue 3**: Single-file components with prop definitions
- **Svelte 5**: Native Svelte components
- **Angular**: Standalone components whose selectors are the `arc-*` tags; form controls implement `ControlValueAccessor`, so `formControlName` and `ngModel` work
- **Solid**: Solid component wrappers
- **Preact**: Preact-compatible components
- **HTML/CSS**: Standalone CSS extracted from Shadow DOM + plain HTML examples

To regenerate everything:

```bash
pnpm generate
```

## Project structure

```
arc-ui/
  shared/
    tokens.js               # Design tokens (JS source of truth)
    base.css                 # Generated from tokens.js
  packages/
    web-components/          # Lit source, canonical component code
    react/                   # Generated by Prism
    vue/                     # Generated by Prism
    svelte/                  # Generated by Prism
    angular/                 # Generated by Prism
    solid/                   # Generated by Prism
    preact/                  # Generated by Prism
    html/css/                # Generated standalone CSS
    html/examples/           # Generated HTML examples
    icons/                   # Phosphor + Lucide packs (generated from upstream)
  docs/                      # Astro documentation site (arcui.dev)
```

Of the source in `packages/` and `shared/`, only `packages/web-components/`, `shared/tokens.js`, `shared/color.js`, `shared/utilities.js` and the handful of hand-written modules in `packages/icons/src/` (the alias table and the two registration entry points) are hand-edited. The rest is generated.

## Development

```bash
pnpm install          # Install dependencies
pnpm dev              # Start Astro docs dev server
pnpm generate         # Regenerate tokens + all framework wrappers
```

## Browser support

| Browser | Version |
|---------|---------|
| Chrome | 114+ |
| Firefox | 125+ |
| Safari | 17+ |
| Edge | 114+ |

These are the first versions with the Popover API, which overlays need. Entry animations need `@starting-style` (Chrome and Edge 117, Firefox 129, Safari 17.5); older supported browsers show panels without animating. The [browser support page](https://arcui.dev/docs/browser-support) has the details.

## Upgrading

Every breaking change since v2 is written up in
[MIGRATION.md](https://github.com/arclight-digital/arc-ui/blob/main/MIGRATION.md).
One section per change, each with what changed, why, and the mechanical fix.
Start with the [v4.0.0 release
notes](https://arcui.dev/docs/changelog) (curation, contracts, platform,
light), then the [v4 contents
list](https://github.com/arclight-digital/arc-ui/blob/main/MIGRATION.md#v4-breaking-changes)
if you are coming from v3. v3 gets security fixes until 2026-11-16, a quarter
after the v4.0.0 tag.

## License

[MIT](https://github.com/arclight-digital/arc-ui/blob/main/LICENSE) © Arclight Digital, LLC.
The icon packs in `@arclux/arc-ui-icons` are redistributed under their own terms
(Phosphor, MIT; Lucide, ISC); see that package's
[LICENSE](https://github.com/arclight-digital/arc-ui/blob/main/packages/icons/LICENSE).

## Links

- [Documentation](https://arcui.dev)
- [Getting started](https://arcui.dev/docs/getting-started)
- [Components](https://arcui.dev/docs/components)
- [Theme Synthesizer](https://arcui.dev/docs/theme-synthesizer)
- [GitHub](https://github.com/arclight-digital/arc-ui)
- [npm](https://www.npmjs.com/package/@arclux/arc-ui)
