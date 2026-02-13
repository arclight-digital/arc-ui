# @arclux/arc-ui

Lit web components implementing the Arclight design system. This is the canonical source -- all framework wrapper packages are generated from these components by [Prism](../../prism.config.js).

## Installation

```bash
npm install @arclux/arc-ui lit
```

## Usage

```js
// Import all components
import '@arclux/arc-ui';

// Or import individually for smaller bundles
import '@arclux/arc-ui/button';
import '@arclux/arc-ui/card';
```

```html
<arc-button variant="primary">Get Started</arc-button>

<arc-card>
  <h3>Card Title</h3>
  <p>Card content.</p>
</arc-card>

<arc-input label="Email" type="email" placeholder="you@example.com"></arc-input>
```

## Styling

Components use Shadow DOM. Override styles via CSS custom properties or `::part()` selectors:

```css
arc-button {
  --accent-primary: #3b82f6;
}
```

## Framework Wrappers

If you are using a framework, prefer the dedicated wrapper package:

| Framework | Package |
|-----------|---------|
| React     | [`@arclux/arc-ui-react`](../react/) |
| Vue 3     | [`@arclux/arc-ui-vue`](../vue/) |
| Svelte 5  | [`@arclux/arc-ui-svelte`](../svelte/) |
| Angular   | [`@arclux/arc-ui-angular`](../angular/) |
| Solid     | [`@arclux/arc-ui-solid`](../solid/) |
| Preact    | [`@arclux/arc-ui-preact`](../preact/) |
| Plain HTML/CSS | [`@arclux/arc-ui-html`](../html/) |

## Documentation

Full component docs and interactive examples: [arcui.dev](https://arcui.dev)

## Links

- [Root README](../../README.md)
- [License](../../LICENSE)
