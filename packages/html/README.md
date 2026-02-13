# @arclux/arc-ui-html

Standalone CSS and HTML examples for using [ARC UI](https://arcui.dev) components without JavaScript.

> **Auto-generated** -- this package is produced by [Prism](../../prism.config.js) from the canonical source in [`@arclux/arc-ui`](../web-components/). Do not edit by hand.

## Installation

```bash
npm install @arclux/arc-ui-html
```

## Usage

Include the bundled CSS (contains all components and design tokens):

```html
<link rel="stylesheet" href="node_modules/@arclux/arc-ui-html/css/arc-ui.css" />
```

Or import individual component CSS files (tokens must be loaded separately):

```html
<link rel="stylesheet" href="node_modules/@arclux/arc-ui-html/css/button.css" />
<link rel="stylesheet" href="node_modules/@arclux/arc-ui-html/css/card.css" />
```

Each component also has an `.inline.css` variant with tokens baked in for zero-dependency use.

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

## Documentation

Full component docs and interactive examples: [arcui.dev](https://arcui.dev)

## Links

- [Canonical source (`@arclux/arc-ui`)](../web-components/)
- [Root README](../../README.md)
- [License](../../LICENSE)
