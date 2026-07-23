# @arclux/arc-ui-html

Standalone CSS and copy-paste HTML examples for using [ARC UI](https://arcui.dev) components without JavaScript.

> **Auto-generated** — this package is produced by [Prism](https://www.npmjs.com/package/@arclux/prism) from the canonical source in [`@arclux/arc-ui`](https://www.npmjs.com/package/@arclux/arc-ui). Do not edit by hand.

## Installation

```bash
npm install @arclux/arc-ui-html
```

Or skip the install entirely and copy what you need — everything in this package is plain CSS and HTML.

## Usage

Include the bundled CSS (contains all components and design tokens):

```html
<link rel="stylesheet" href="node_modules/@arclux/arc-ui-html/css/arc-ui.css" />
```

Or import individual component CSS files. These reference the design-token custom properties, so the tokens must already be defined on the page (via `arc-ui.css` or your own definitions):

```html
<link rel="stylesheet" href="node_modules/@arclux/arc-ui-html/css/button.css" />
<link rel="stylesheet" href="node_modules/@arclux/arc-ui-html/css/card.css" />
```

For fully self-contained snippets with styles baked in, use the `.inline.html` examples described below.

## Examples

The `examples/` directory has a ready-to-paste HTML snippet per component, in two flavors:

- `button.html` — class-based markup, pairs with the component's CSS file
- `button.inline.html` — the same markup with inline styles + a small `<style>` block, for contexts where you can't load a stylesheet (emails, embeds, CMS islands)

Components whose behavior fundamentally requires JavaScript (overlays, command palette, interactive inputs, …) are not included here — use [`@arclux/arc-ui`](https://www.npmjs.com/package/@arclux/arc-ui) or a framework wrapper for those.

## HTML Markup

Components use the `.arc-*` class prefix. Variants are set via data attributes:

```html
<span class="arc-button" data-variant="primary" data-size="lg">
  <button class="btn">Get Started</button>
</span>
```

## Theming

Dark mode is the default. Switch with `data-theme` on the root element:

```html
<html data-theme="light">
<html data-theme="auto">
```

All styling flows from CSS custom properties; overriding the base accent tokens re-themes every component — see the [theming guide](https://arcui.dev/docs/theming):

```css
:root {
  --accent-primary: rgb(77, 126, 247);
  --accent-primary-rgb: 77, 126, 247;
}
```

## Links

- [Documentation & interactive examples](https://arcui.dev)
- [Canonical source (`@arclux/arc-ui`)](https://www.npmjs.com/package/@arclux/arc-ui)
- [Repository](https://github.com/arclight-digital/arc-ui)
- [License (MIT)](https://github.com/arclight-digital/arc-ui/blob/main/LICENSE)
