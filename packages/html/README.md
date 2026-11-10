# @arclux/arc-ui-html

Standalone CSS and copy-paste HTML examples for using [ARC UI](https://arcui.dev) components without JavaScript.

> [Prism](https://www.npmjs.com/package/@arclux/prism) generates this package's CSS and HTML examples from [`@arclux/arc-ui`](https://www.npmjs.com/package/@arclux/arc-ui). To change a component, edit its source in [`packages/web-components`](https://github.com/arclight-digital/arc-ui/tree/main/packages/web-components). Hand edits here are overwritten the next time `pnpm generate` runs.

## Installation

```bash
npm install @arclux/arc-ui-html
```

Or skip the install and copy what you need. Everything in this package is plain CSS and HTML.

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

For snippets with the styles built in, use the `.inline.html` examples described below.

## Examples

The `examples/` directory has a ready-to-paste HTML snippet per component, in two flavors:

- `button.html`: class-based markup that pairs with the component's CSS file
- `button.inline.html`: the same markup with inline styles and a small `<style>` block, for places you can't load a stylesheet (emails, embeds, CMS islands)

Components that need JavaScript to work (overlays, command palette, interactive inputs, …) aren't included. Use [`@arclux/arc-ui`](https://www.npmjs.com/package/@arclux/arc-ui) or a framework wrapper for those.

## HTML markup

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

All styling comes from CSS custom properties. Gradients, glows and focus rings are built from the accent tokens, so overriding those changes them too. See the [theming guide](https://arcui.dev/docs/theming):

```css
:root {
  --accent-primary: rgb(77, 126, 247);
  --accent-primary-rgb: 77, 126, 247;
}
```

## Links

- [Documentation](https://arcui.dev)
- [Canonical source (`@arclux/arc-ui`)](https://www.npmjs.com/package/@arclux/arc-ui)
- [Repository](https://github.com/arclight-digital/arc-ui)
- [License (MIT)](https://github.com/arclight-digital/arc-ui/blob/main/LICENSE)
