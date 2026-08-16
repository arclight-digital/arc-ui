<h1 align="center">ARC UI</h1>
<p align="center"><strong>Change framework without changing your design system.</strong></p>

<p align="center">
  <a href="https://www.npmjs.com/package/@arclux/arc-ui"><img src="https://img.shields.io/npm/v/@arclux/arc-ui?style=flat-square&color=4d7ef7" alt="npm version"></a>
  <a href="https://github.com/arclight-digital/arc-ui/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-8b5cf6?style=flat-square" alt="license"></a>
  <img src="https://img.shields.io/badge/frameworks-7-8b5cf6?style=flat-square" alt="frameworks">
  <img src="https://img.shields.io/badge/components-177-4d7ef7?style=flat-square" alt="components">
  <img src="https://img.shields.io/badge/Lit_powered-3.3-14b8a6?style=flat-square" alt="Lit 3.3">
</p>

<p align="center">
  <a href="https://arcui.dev">Documentation</a> &nbsp;&middot;&nbsp;
  <a href="https://arcui.dev/docs/getting-started">Getting Started</a> &nbsp;&middot;&nbsp;
  <a href="https://arcui.dev/docs/components">Components</a> &nbsp;&middot;&nbsp;
  <a href="https://arcui.dev/docs/theme-synthesizer">Theme Synthesizer</a>
</p>

---

A component library is usually a bet on a framework. Rewrite the app and you rewrite the design system with it — the tokens, the a11y work, the focus behaviour, the eighteen months of small corrections nobody wrote down.

ARC UI is written once as [Lit](https://lit.dev) Web Components — the platform's own component model, not a framework's — and **Prism**, our generator, produces native wrappers for React, Vue, Svelte, Angular, Solid, Preact and plain HTML from that one source. Same elements, same shadow DOM, same tokens, same rendered pixels. Move a team from Angular to React and the design system does not move with them; the import path changes.

That is a claim two things have to be true for, so both are enforced rather than asserted. Every wrapper package is **mounted in a real browser on every run** and checked against one shared contract, which is how three defects that had shipped since the wrapper packages existed were found — Angular defining no custom elements at all among them. And the visual system is CSS custom properties end to end, so the zero-JavaScript HTML/CSS package gets the same design as the React one.

One runtime dependency: Lit. Heavier extras like syntax highlighting and QR encoding ship only with the components that use them.

## Quick Start

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
npm install @arclux/arc-ui-react
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

## Framework Packages

| Framework | Package | Install |
|-----------|---------|---------|
| Web Components | `@arclux/arc-ui` | `npm i @arclux/arc-ui lit` |
| React | `@arclux/arc-ui-react` | `npm i @arclux/arc-ui-react` |
| Vue 3 | `@arclux/arc-ui-vue` | `npm i @arclux/arc-ui-vue` |
| Svelte 5 | `@arclux/arc-ui-svelte` | `npm i @arclux/arc-ui-svelte` |
| Angular | `@arclux/arc-ui-angular` | `npm i @arclux/arc-ui-angular` |
| Solid | `@arclux/arc-ui-solid` | `npm i @arclux/arc-ui-solid` |
| Preact | `@arclux/arc-ui-preact` | `npm i @arclux/arc-ui-preact` |
| HTML / CSS | `@arclux/arc-ui-html` | `npm i @arclux/arc-ui-html` |

All framework packages are generated from the same Lit source and stay in sync automatically. Icons are a separate install — `@arclux/arc-ui-icons` carries Phosphor and Lucide, so a project that renders no icons pays for none.

## Components

The catalog is wide because the point is not having to leave it. 177 components across seven tiers — and the count is a consequence, not the pitch: v4 cut five that existed to make it bigger.

| Tier | Count | Highlights |
|------|-------|------------|
| **Layout** | 20 | App Shell, Dashboard Grid, Page Layout, Split Pane, Dock, Resizable, Masonry |
| **Navigation** | 22 | Top Bar, Sidebar, Tabs, Menubar, Breadcrumb, Command Bar, Drawer, Tree View |
| **Content** | 28 | Card, Accordion, Carousel, Avatar, QR Code, Divider, Infinite Scroll, Virtual List |
| **Data** | 27 | Chart, Data Grid, Data Table, Kanban, Event Calendar, Timeline, Stat, Sparkline |
| **Input** | 44 | Input, Select, Combobox, Date Range Picker, Tag Input, Transfer List, Image Cropper |
| **Feedback** | 22 | Modal, Dialog, Toast Manager, Command Palette, Tooltip, Sheet, Popover, Guided Tour |
| **Typography** | 14 | Code Block, Markdown, Kbd, Gradient Text, Typewriter, Prose, Blockquote |

Browse the full catalog at [arcui.dev/docs/components](https://arcui.dev/docs/components).

## Accessibility

Every component documentation page — live demos included — is audited with [axe-core](https://github.com/dequelabs/axe-core) in both dark and light themes on every commit. Structural WCAG violations fail CI; run the audit yourself with `pnpm audit:a11y`. Live results: [arcui.dev/docs/accessibility](https://arcui.dev/docs/accessibility).

## Design Tokens

Every visual decision — colors, spacing, typography, shadows, glows — is a CSS custom property. Override 2–4 base tokens and the entire system cascades:

```css
:root {
  --accent-primary:       rgb(16, 185, 129);
  --accent-primary-rgb:   16, 185, 129;
  --accent-secondary:     rgb(6, 182, 212);
  --accent-secondary-rgb: 6, 182, 212;
}
```

Compound tokens (gradients, glows, focus rings) reference the base accents through `var()`, so every gradient, card hover, and glow line updates automatically.

### Theme Modes

```html
<html data-theme="dark">   <!-- Default -->
<html data-theme="light">  <!-- Light theme -->
<html data-theme="auto">   <!-- Follow OS preference -->
```

Use `theme-fixed-dark` / `theme-fixed-light` to pin a region to one scheme regardless of the page theme (e.g., top bar, footer). A pinned dark region is plain near-black on a dark page; on a light page it lifts to a deep color derived from your accent, rather than sitting there as a black slab.

### Token Categories

Backgrounds, text, borders, accents, spacing (xs–4xl), type scale, shadows, radii, z-index, transitions, glows, and gradients. See the [Token Reference](https://arcui.dev/docs/tokens) for the full list.

## How Prism Works

Prism reads Lit Web Component source files — parsing properties, styles, slots, events, and CSS parts — then generates idiomatic wrappers for each target:

- **React** — `@lit/react` `createComponent` wrappers with TypeScript types
- **Vue 3** — Single-file components with prop definitions
- **Svelte 5** — Native Svelte components
- **Angular** — Standalone components with `CUSTOM_ELEMENTS_SCHEMA`; form controls implement `ControlValueAccessor`, so `formControlName` and `ngModel` work
- **Solid** — Solid component wrappers
- **Preact** — Preact-compatible components
- **HTML/CSS** — Standalone CSS extracted from Shadow DOM + plain HTML examples

One command keeps everything in sync:

```bash
pnpm generate
```

## Project Structure

```
arc-ui/
  shared/
    tokens.js               # Design tokens (JS source of truth)
    base.css                 # Generated from tokens.js
  packages/
    web-components/          # Lit source — canonical component code
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

Only `packages/web-components/`, `shared/tokens.js` and the handful of hand-written modules in `packages/icons/src/` (the alias table and the two registration entry points) are hand-edited. Everything else is generated.

## Development

```bash
pnpm install          # Install dependencies
pnpm dev              # Start Astro docs dev server
pnpm generate         # Regenerate tokens + all framework wrappers
```

## Browser Support

| Browser | Version |
|---------|---------|
| Chrome | Last 2 versions |
| Firefox | Last 2 versions |
| Safari | 16.4+ |
| Edge | Last 2 versions |

## Upgrading

Every breaking change since v2 is written up in
[MIGRATION.md](https://github.com/arclight-digital/arc-ui/blob/main/MIGRATION.md)
— one section per change, each with what changed, why, and the mechanical fix.
Start at the [v4 contents
list](https://github.com/arclight-digital/arc-ui/blob/main/MIGRATION.md#v4-breaking-changes)
if you are coming from v3.

## License

[MIT](https://github.com/arclight-digital/arc-ui/blob/main/LICENSE) — Arclight Digital, LLC.
The icon packs in `@arclux/arc-ui-icons` are redistributed under their own terms
(Phosphor, MIT; Lucide, ISC) — see that package's
[LICENSE](https://github.com/arclight-digital/arc-ui/blob/main/packages/icons/LICENSE).

## Links

- [Documentation](https://arcui.dev)
- [Getting Started](https://arcui.dev/docs/getting-started)
- [Components](https://arcui.dev/docs/components)
- [Theme Synthesizer](https://arcui.dev/docs/theme-synthesizer)
- [GitHub](https://github.com/arclight-digital/arc-ui)
- [npm](https://www.npmjs.com/package/@arclux/arc-ui)
