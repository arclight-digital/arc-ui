# @arclux/arc-ui-svelte

Svelte 5 component wrappers for [ARC UI](https://arcui.dev) web components, using runes (`$props`) and snippets.

> **Auto-generated** — this package is produced by [Prism](https://www.npmjs.com/package/@arclux/prism) from the canonical source in [`@arclux/arc-ui`](https://www.npmjs.com/package/@arclux/arc-ui). Do not edit by hand.

## Installation

```bash
npm install @arclux/arc-ui-svelte @arclux/arc-ui
```

Requires `svelte >= 5.0.0`.

## Usage

```svelte
<script>
  import { Button, Card, Input } from '@arclux/arc-ui-svelte';
</script>

<Button variant="primary" onclick={() => console.log('clicked')}>
  Get Started
</Button>

<Card>
  <h3>Card Title</h3>
  <p>Card content.</p>
</Card>

<Input label="Email" type="email" placeholder="you@example.com" />
```

Components are organized by tier and can be imported from subpaths:

```svelte
<script>
  import { Button } from '@arclux/arc-ui-svelte/input';
  import { Card }   from '@arclux/arc-ui-svelte/content';
  import { AppShell } from '@arclux/arc-ui-svelte/layout';
</script>
```

## Events

Props that aren't declared component props are forwarded to the underlying `<arc-*>` element, including event attributes. Listen to `arc-*` CustomEvents with `onarc-*` attributes:

```svelte
<Input label="Email" onarc-input={(e) => console.log(e.detail.value)} />
```

## Server-side rendering

The wrappers register custom elements on import, which requires a DOM. In SvelteKit, use them from client-rendered code (e.g. behind a `browser` guard or with `ssr = false` for the page).

## Theming

Components read design tokens from CSS custom properties. Overriding the base accent tokens re-themes every component — see the [theming guide](https://arcui.dev/docs/theming):

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
