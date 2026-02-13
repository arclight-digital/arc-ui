# @arclux/arc-ui-svelte

Svelte 5 component wrappers for [ARC UI](https://arcui.dev) web components.

> **Auto-generated** -- this package is produced by [Prism](../../prism.config.js) from the canonical source in [`@arclux/arc-ui`](../web-components/). Do not edit by hand.

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

<Button variant="primary" on:click={() => console.log('clicked')}>
  Get Started
</Button>

<Card>
  <h3>Card Title</h3>
  <p>Card content.</p>
</Card>

<Input label="Email" type="email" placeholder="you@example.com" />
```

Components are organized by category and can be imported from subpaths:

```svelte
<script>
  import { Button } from '@arclux/arc-ui-svelte/input';
  import { Card }   from '@arclux/arc-ui-svelte/content';
  import { AppShell } from '@arclux/arc-ui-svelte/layout';
</script>
```

## Documentation

Full component docs and interactive examples: [arcui.dev](https://arcui.dev)

## Links

- [Canonical source (`@arclux/arc-ui`)](../web-components/)
- [Root README](../../README.md)
- [License](../../LICENSE)
