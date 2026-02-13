# @arclux/arc-ui-vue

Vue 3 component wrappers for [ARC UI](https://arcui.dev) web components.

> **Auto-generated** -- this package is produced by [Prism](../../prism.config.js) from the canonical source in [`@arclux/arc-ui`](../web-components/). Do not edit by hand.

## Installation

```bash
npm install @arclux/arc-ui-vue @arclux/arc-ui
```

Requires `vue >= 3.3.0`.

## Usage

```vue
<script setup>
import { Button, Card, Input } from '@arclux/arc-ui-vue';
</script>

<template>
  <Button variant="primary" @click="console.log('clicked')">
    Get Started
  </Button>

  <Card>
    <h3>Card Title</h3>
    <p>Card content.</p>
  </Card>

  <Input label="Email" type="email" placeholder="you@example.com" />
</template>
```

Components are organized by category and can be imported from subpaths:

```js
import { Button } from '@arclux/arc-ui-vue/input';
import { Card }   from '@arclux/arc-ui-vue/content';
import { AppShell } from '@arclux/arc-ui-vue/layout';
```

## Documentation

Full component docs and interactive examples: [arcui.dev](https://arcui.dev)

## Links

- [Canonical source (`@arclux/arc-ui`)](../web-components/)
- [Root README](../../README.md)
- [License](../../LICENSE)
