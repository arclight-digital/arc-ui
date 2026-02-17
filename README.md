<h1 align="center">ARC UI</h1>
<p align="center"><strong>ARC Reactive Components</strong> — a modern, dark-first component library built on web standards</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@arclux/arc-ui"><img src="https://img.shields.io/npm/v/@arclux/arc-ui?style=flat-square&color=4d7ef7" alt="npm version"></a>
  <a href="https://github.com/arclight-digital/arc-ui/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-8b5cf6?style=flat-square" alt="license"></a>
  <img src="https://img.shields.io/badge/components-170%2B-4d7ef7?style=flat-square" alt="components">
  <img src="https://img.shields.io/badge/frameworks-7-8b5cf6?style=flat-square" alt="frameworks">
  <img src="https://img.shields.io/badge/Lit_powered-3.3-14b8a6?style=flat-square" alt="Lit 3.3">
</p>

<p align="center">
  <a href="https://arcui.dev">Documentation</a> &nbsp;&middot;&nbsp;
  <a href="https://arcui.dev/docs/getting-started">Getting Started</a> &nbsp;&middot;&nbsp;
  <a href="https://arcui.dev/docs/components">Components</a> &nbsp;&middot;&nbsp;
  <a href="https://arcui.dev/docs/theme-synthesizer">Theme Synthesizer</a>
</p>

---

ARC UI is a design system and component library built on [Lit](https://lit.dev) web components. Write components once in Lit, then use **Prism** — our custom code generator — to produce native wrappers for React, Vue, Svelte, Angular, Solid, Preact, and standalone HTML/CSS. One source of truth, seven framework targets, zero runtime dependencies beyond Lit.

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

All framework packages are generated from the same Lit source and stay in sync automatically.

## Components

170+ components organized across seven tiers:

| Tier | Count | Highlights |
|------|-------|------------|
| **Layout** | 21 | App Shell, Dashboard Grid, Page Layout, Split Pane, Dock, Resizable, Masonry |
| **Navigation** | 28 | Top Bar, Sidebar, Tabs, Breadcrumb, Command Bar, Drawer, Tree View, Speed Dial |
| **Content** | 28 | Card, Accordion, Carousel, Avatar, CTA Banner, Divider, Infinite Scroll, Virtual List |
| **Data** | 23 | Data Table, Stepper, Timeline, Badge, Tag, Stat, Sparkline, Comparison, Diff |
| **Input** | 36 | Button, Input, Select, Combobox, Date Picker, File Upload, Rating, Slider, Hotkey |
| **Feedback** | 24 | Modal, Dialog, Toast, Command Palette, Tooltip, Sheet, Popover, Guided Tour |
| **Typography** | 12 | Code Block, Markdown, Kbd, Gradient Text, Typewriter, Prose, Blockquote |

Browse the full catalog at [arcui.dev/docs/components](https://arcui.dev/docs/components).

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

Use the `theme-fixed` class for regions that always stay dark (e.g., top bar, footer).

### Token Categories

Backgrounds, text, borders, accents, spacing (xs–4xl), type scale, shadows, radii, z-index, transitions, glows, and gradients. See the [Token Reference](https://arcui.dev/docs/tokens) for the full list.

## How Prism Works

Prism reads Lit web component source files — parsing properties, styles, slots, events, and CSS parts — then generates idiomatic wrappers for each target:

- **React** — `@lit/react` `createComponent` wrappers with TypeScript types
- **Vue 3** — Single-file components with prop definitions
- **Svelte 5** — Native Svelte components
- **Angular** — Standalone components with `CUSTOM_ELEMENTS_SCHEMA`
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
    brand/                   # Logo and brand assets (@arclux/brand)
  docs/                      # Astro documentation site (arcui.dev)
```

Only `packages/web-components/` and `shared/tokens.js` are hand-edited. Everything else is generated.

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

## License

[MIT](https://github.com/arclight-digital/arc-ui/blob/main/LICENSE) — Arclight Digital, LLC

## Links

- [Documentation](https://arcui.dev)
- [Getting Started](https://arcui.dev/docs/getting-started)
- [Components](https://arcui.dev/docs/components)
- [Theme Synthesizer](https://arcui.dev/docs/theme-synthesizer)
- [GitHub](https://github.com/arclight-digital/arc-ui)
- [npm](https://www.npmjs.com/package/@arclux/arc-ui)
