# @arclux/arc-ui-vue

Vue 3 component wrappers for [ARC UI](https://arcui.dev) web components, with typed props and emits.

> **Auto-generated** — this package is produced by [Prism](https://www.npmjs.com/package/@arclux/prism) from the canonical source in [`@arclux/arc-ui`](https://www.npmjs.com/package/@arclux/arc-ui). Do not edit by hand.

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

  <Input label="Email" type="email" placeholder="you@example.com" @arc-input="onInput" />
</template>
```

Components are organized by tier and can be imported from subpaths:

```js
import { Button } from '@arclux/arc-ui-vue/input';
import { Card }   from '@arclux/arc-ui-vue/content';
import { AppShell } from '@arclux/arc-ui-vue/layout';
```

## Events

Each component declares its `arc-*` CustomEvents as typed emits, so you bind them like any Vue event (`@arc-input`, `@arc-change`, `@arc-select`, …). The handler receives the original `CustomEvent`; payloads are on `event.detail`.

## Server-side rendering

The wrappers register custom elements on import, which requires a DOM. In SSR setups (e.g. Nuxt), render them client-side — for example inside `<ClientOnly>`.

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
