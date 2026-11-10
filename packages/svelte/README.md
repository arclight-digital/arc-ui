# @arclux/arc-ui-svelte

Svelte 5 component wrappers for [ARC UI](https://arcui.dev) Web Components, using runes (`$props`) and snippets.

> [Prism](https://www.npmjs.com/package/@arclux/prism) generates this package's code from [`@arclux/arc-ui`](https://www.npmjs.com/package/@arclux/arc-ui). To change a component, edit its source in [`packages/web-components`](https://github.com/arclight-digital/arc-ui/tree/main/packages/web-components). Hand edits here are overwritten the next time `pnpm generate` runs.

## Installation

```bash
npm install @arclux/arc-ui-svelte @arclux/arc-ui lit
```

Requires `svelte` ^5.0.0.

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

Each tier also has its own subpath:

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

To render the components on the server, pass your framework's HTML output through `renderDeclarativeShadowDOM` from `@arclux/arc-ui/ssr`. It renders each `<arc-*>` element into a declarative shadow root and needs the optional peer `@lit-labs/ssr`. On the client, import `@arclux/arc-ui/hydrate` before any component. The [server rendering guide](https://arcui.dev/docs/server-rendering) has the details.

To skip server rendering in SvelteKit, render them behind a `browser` guard or set `ssr = false` for the page.

## Theming

Components read design tokens from CSS custom properties. Gradients, glows and focus rings are built from the accent tokens, so overriding those changes them too. See the [theming guide](https://arcui.dev/docs/theming):

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
