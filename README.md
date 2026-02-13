<h1 align="center">ARC UI</h1>
<p align="center"><strong>ARC Reactive Components</strong> -- a modern, dark-first web component library</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@arclux/arc-ui"><img src="https://img.shields.io/npm/v/@arclux/arc-ui?style=flat-square&color=4d7ef7" alt="npm version"></a>
  <a href="https://github.com/arclight-digital/arc-ui/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-8b5cf6?style=flat-square" alt="license"></a>
  <img src="https://img.shields.io/badge/components-90%2B-4d7ef7?style=flat-square" alt="components">
  <img src="https://img.shields.io/badge/frameworks-7-8b5cf6?style=flat-square" alt="frameworks">
</p>

---

ARC UI is a design system and component library built on [Lit](https://lit.dev) Web Components. You write components once, and the **Prism** code generator produces native wrappers for React, Vue, Svelte, Angular, Solid, Preact, and standalone HTML/CSS -- all from a single source of truth.

## Features

- **90+ components** across five tiers: Layout, Navigation, Content, Input, and Feedback
- **7 framework targets** -- React, Vue 3, Svelte 5, Angular, Solid, Preact, and vanilla HTML/CSS
- **Dark-first design** with a full light theme and automatic OS preference detection
- **Design token system** -- override 2-4 base CSS variables and every gradient, glow, and focus ring cascades automatically
- **Prism codegen** -- one command regenerates all framework wrappers, CSS, and HTML examples from the canonical Lit source
- **Zero build step** for the core library -- plain ES modules, no bundler required
- **Accessible** -- keyboard navigation, focus management, `prefers-reduced-motion` support
- **Tree-shakeable** -- import only the components you use

## Quick Start

### Web Components (vanilla)

```bash
npm install @arclux/arc-ui lit
```

```js
import '@arclux/arc-ui';
```

```html
<arc-button variant="primary">Get Started</arc-button>
<arc-card>
  <h3>Hello, ARC</h3>
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
    <Card>
      <h3>Hello, ARC</h3>
      <Button variant="primary">Get Started</Button>
    </Card>
  );
}
```

### CDN (no build step)

```html
<link rel="stylesheet" href="https://unpkg.com/@arclux/arc-ui-html/css/arc-ui.css">

<button class="arc-button" data-variant="primary">Get Started</button>
<div class="arc-card">
  <h3>Hello, ARC</h3>
  <p>Works with zero JavaScript.</p>
</div>
```

## Framework Support

| Framework | Package | Install |
|-----------|---------|---------|
| Web Components | `@arclux/arc-ui` | `npm install @arclux/arc-ui lit` |
| React | `@arclux/arc-ui-react` | `npm install @arclux/arc-ui-react` |
| Vue 3 | `@arclux/arc-ui-vue` | `npm install @arclux/arc-ui-vue` |
| Svelte 5 | `@arclux/arc-ui-svelte` | `npm install @arclux/arc-ui-svelte` |
| Angular | `@arclux/arc-ui-angular` | `npm install @arclux/arc-ui-angular` |
| Solid | `@arclux/arc-ui-solid` | `npm install @arclux/arc-ui-solid` |
| Preact | `@arclux/arc-ui-preact` | `npm install @arclux/arc-ui-preact` |
| HTML / CSS | `@arclux/arc-ui-html` | `npm install @arclux/arc-ui-html` |

All framework packages are generated from the same Lit source and stay in sync automatically.

## Components

Components are organized into five tiers.

### Layout

Application structure and page scaffolding.

| Component | Web Component | Description |
|-----------|---------------|-------------|
| App Shell | `arc-app-shell` | Top-level layout with sidebar, top bar, and content area |
| Auth Shell | `arc-auth-shell` | Centered authentication layout |
| Container | `arc-container` | Max-width content wrapper |
| Dashboard Grid | `arc-dashboard-grid` | Responsive grid for dashboard cards |
| Page Header | `arc-page-header` | Page title with breadcrumbs and actions |
| Page Layout | `arc-page-layout` | Content area with optional sidebar |
| Resizable | `arc-resizable` | Resizable panel container |
| Section | `arc-section` | Page section with label and spacing |
| Settings Layout | `arc-settings-layout` | Two-column settings page |
| Split Pane | `arc-split-pane` | Draggable split view |
| Status Bar | `arc-status-bar` | Bottom status indicator bar |
| Toolbar | `arc-toolbar` | Horizontal action bar |

### Navigation

Wayfinding and routing components.

| Component | Web Component | Description |
|-----------|---------------|-------------|
| Breadcrumb | `arc-breadcrumb` | Hierarchical path navigation |
| Drawer | `arc-drawer` | Slide-out navigation panel |
| Footer | `arc-footer` | Page footer |
| Link | `arc-link` | Styled anchor element |
| Navigation Menu | `arc-navigation-menu` | Horizontal nav with dropdowns |
| Pagination | `arc-pagination` | Page navigation controls |
| Scroll Spy | `arc-scroll-spy` | Tracks scroll position against anchors |
| Scroll to Top | `arc-scroll-to-top` | Floating scroll-to-top button |
| Sidebar | `arc-sidebar` | Vertical sidebar navigation |
| Tabs | `arc-tabs` | Tabbed content panels |
| Top Bar | `arc-top-bar` | Application header bar |
| Tree View | `arc-tree-view` | Hierarchical tree navigation |

### Content

Display and data presentation.

| Component | Web Component | Description |
|-----------|---------------|-------------|
| Accordion | `arc-accordion` | Expandable content sections |
| Animated Number | `arc-animated-number` | Animated numeric transitions |
| Aspect Ratio | `arc-aspect-ratio` | Fixed aspect ratio container |
| Avatar | `arc-avatar` | User avatar with image or initials |
| Avatar Group | `arc-avatar-group` | Stacked avatar collection |
| Badge | `arc-badge` | Label or status pill |
| Callout | `arc-callout` | Highlighted informational block |
| Card | `arc-card` | Container with gradient hover border |
| Carousel | `arc-carousel` | Horizontal content slider |
| Code Block | `arc-code-block` | Syntax-highlighted code display |
| Collapsible | `arc-collapsible` | Toggle content visibility |
| Color Swatch | `arc-color-swatch` | Color preview tile |
| Data Table | `arc-data-table` | Sortable, filterable data grid |
| Divider | `arc-divider` | Horizontal rule with glow variants |
| Empty State | `arc-empty-state` | Placeholder for empty content areas |
| Feature Card | `arc-feature-card` | Card with icon, heading, and description |
| Highlight | `arc-highlight` | Inline text highlight |
| Icon | `arc-icon` | SVG icon renderer (Phosphor, Lucide) |
| Infinite Scroll | `arc-infinite-scroll` | Scroll-triggered content loading |
| Kbd | `arc-kbd` | Keyboard shortcut display |
| Markdown | `arc-markdown` | Rendered markdown content |
| Marquee | `arc-marquee` | Scrolling text ticker |
| Meter | `arc-meter` | Visual value meter |
| Scroll Area | `arc-scroll-area` | Styled scrollable container |
| Skeleton | `arc-skeleton` | Loading placeholder |
| Spinner | `arc-spinner` | Loading spinner |
| Stack | `arc-stack` | Flex-based stack layout |
| Stat | `arc-stat` | Numeric statistic with gradient value |
| Stepper | `arc-stepper` | Multi-step progress indicator |
| Table | `arc-table` | Styled data table |
| Tag | `arc-tag` | Dismissible tag/chip |
| Text | `arc-text` | Typography primitives (display, heading, body, code) |
| Timeline | `arc-timeline` | Vertical timeline |
| Truncate | `arc-truncate` | Text truncation with expand |
| Value Card | `arc-value-card` | Horizontal card with icon and stat |

### Input

Forms and user interaction.

| Component | Web Component | Description |
|-----------|---------------|-------------|
| Button | `arc-button` | Primary, secondary, and ghost variants |
| Calendar | `arc-calendar` | Date selection calendar |
| Checkbox | `arc-checkbox` | Checkbox input |
| Chip | `arc-chip` | Selectable chip / filter tag |
| Color Picker | `arc-color-picker` | Color selection input |
| Combobox | `arc-combobox` | Searchable select dropdown |
| Copy Button | `arc-copy-button` | One-click copy to clipboard |
| Date Picker | `arc-date-picker` | Date input with calendar popup |
| File Upload | `arc-file-upload` | Drag-and-drop file input |
| Form | `arc-form` | Form container with validation |
| Icon Button | `arc-icon-button` | Icon-only action button |
| Input | `arc-input` | Text input with label and validation |
| Multi Select | `arc-multi-select` | Multi-value select dropdown |
| Number Input | `arc-number-input` | Numeric input with stepper |
| OTP Input | `arc-otp-input` | One-time password input |
| Pin Input | `arc-pin-input` | PIN code entry |
| Radio Group | `arc-radio-group` | Radio button group |
| Rating | `arc-rating` | Star rating input |
| Search | `arc-search` | Search input with suggestions |
| Segmented Control | `arc-segmented-control` | Segmented toggle control |
| Select | `arc-select` | Dropdown select |
| Slider | `arc-slider` | Range slider |
| Sortable List | `arc-sortable-list` | Drag-to-reorder list |
| Textarea | `arc-textarea` | Multi-line text input |
| Theme Toggle | `arc-theme-toggle` | Dark / light theme switcher |
| Toggle | `arc-toggle` | On/off toggle switch |

### Feedback

Overlays, notifications, and system responses.

| Component | Web Component | Description |
|-----------|---------------|-------------|
| Alert | `arc-alert` | Inline alert message |
| Command Palette | `arc-command-palette` | Keyboard-driven command launcher |
| Context Menu | `arc-context-menu` | Right-click context menu |
| Dialog | `arc-dialog` | Confirmation dialog |
| Dropdown Menu | `arc-dropdown-menu` | Action dropdown |
| Hover Card | `arc-hover-card` | Hover-triggered info card |
| Modal | `arc-modal` | Overlay modal window |
| Notification Panel | `arc-notification-panel` | Notification feed panel |
| Popover | `arc-popover` | Positioned popover |
| Progress | `arc-progress` | Progress bar |
| Sheet | `arc-sheet` | Slide-in panel overlay |
| Toast | `arc-toast` | Temporary notification toast |
| Tooltip | `arc-tooltip` | Hover tooltip |

## Design Tokens

ARC UI is built on a comprehensive design token system. All visual decisions -- colors, spacing, typography, shadows, glows -- are controlled by CSS custom properties.

```css
:root {
  /* Override the two accent colors to re-theme everything */
  --accent-primary:       rgb(16, 185, 129);
  --accent-primary-rgb:   16, 185, 129;
  --accent-secondary:     rgb(6, 182, 212);
  --accent-secondary-rgb: 6, 182, 212;
}
```

Compound tokens (gradients, glows, focus rings, card hovers) reference the base accent tokens through `var()`, so overriding just 2-4 variables cascades across the entire system.

### Token Categories

| Category | Examples | Count |
|----------|---------|-------|
| Backgrounds | `--bg-deep`, `--bg-surface`, `--bg-card`, `--bg-elevated` | 5 |
| Text | `--text-primary`, `--text-secondary`, `--text-muted`, `--text-ghost` | 4 |
| Borders | `--border-subtle`, `--border-default`, `--border-bright` | 3 |
| Accents | `--accent-primary`, `--accent-secondary` + alpha variants | 10+ |
| Spacing | `--space-xs` through `--space-4xl` | 8 |
| Typography | `--font-body`, `--font-accent`, `--font-mono` + type scale | 15+ |
| Shadows | `--shadow-xs` through `--shadow-xl`, `--shadow-overlay` | 6 |
| Radii | `--radius-sm` through `--radius-full` | 5 |
| Z-Index | `--z-base` through `--z-max` | 8 |
| Transitions | `--transition-fast`, `--transition-base`, `--transition-slow` | 3 |
| Glows | `--glow-primary`, `--glow-secondary`, `--glow-white` | 6+ |
| Gradients | `--gradient-accent-text`, `--gradient-border-glow` | 6+ |

### Theming

ARC UI supports three theme modes:

```html
<html data-theme="dark">   <!-- Force dark (default) -->
<html data-theme="light">  <!-- Force light -->
<html data-theme="auto">   <!-- Follow OS preference -->
```

Use the `theme-fixed` class for regions that should always remain dark (e.g., navigation bars), even in light mode.

## Project Structure

ARC UI is a monorepo powered by [pnpm workspaces](https://pnpm.io/workspaces).

```
arc-ui/
  shared/
    tokens.js              # Design tokens (JS source)
    tokens.css             # Design tokens (CSS source)
  packages/
    web-components/        # Lit source -- the single source of truth
    react/                 # Generated React wrappers
    vue/                   # Generated Vue 3 components
    svelte/                # Generated Svelte 5 components
    angular/               # Generated Angular standalone components
    solid/                 # Generated Solid components
    preact/                # Generated Preact components
    html/
      css/                 # Generated standalone CSS (no JS required)
      examples/            # Generated HTML usage examples
  docs/                    # Astro documentation site
  prism.config.js          # Prism code generation config
```

Every file outside of `packages/web-components/` and `shared/` is **generated** by Prism. Never edit generated packages by hand.

## Development

```bash
# Install dependencies
pnpm install

# Start the docs site (Astro dev server)
pnpm dev

# Regenerate all framework wrappers, CSS, and HTML examples
pnpm prism

# Watch mode -- regenerate on file changes
pnpm prism:watch

# Lint and format
pnpm lint
pnpm format
```

### How Prism Works

Prism reads the Lit web component source files, parses their properties, styles, and templates, and generates idiomatic wrappers for each target framework:

1. **React** -- `@lit/react` `createComponent` wrappers with full TypeScript types
2. **Vue 3** -- Single-file components with prop definitions
3. **Svelte 5** -- Native Svelte components
4. **Angular** -- Standalone components with `CUSTOM_ELEMENTS_SCHEMA`
5. **Solid** -- Solid component wrappers
6. **Preact** -- Preact-compatible components
7. **HTML/CSS** -- Standalone CSS extracted from Shadow DOM styles, plus plain HTML examples

Configuration lives in `prism.config.js`. Running `pnpm prism` is the only command needed to keep everything in sync.

## Browser Support

ARC UI targets modern evergreen browsers:

| Browser | Version |
|---------|---------|
| Chrome | Last 2 versions |
| Firefox | Last 2 versions |
| Safari | 16.4+ |
| Edge | Last 2 versions |

## License

[MIT](https://github.com/arclight-digital/arc-ui/blob/main/LICENSE)

## Links

- [Documentation](https://arc-ui.arclight.build)
- [GitHub](https://github.com/arclight-digital/arc-ui)
- [Issues](https://github.com/arclight-digital/arc-ui/issues)
- [npm](https://www.npmjs.com/package/@arclux/arc-ui)
