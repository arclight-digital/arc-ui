# @arclux/arc-ui-vue

Vue 3 component wrappers for [ARC UI](https://arcui.dev) web components, with typed props and emits.

> [Prism](https://www.npmjs.com/package/@arclux/prism) generates this package's code from [`@arclux/arc-ui`](https://www.npmjs.com/package/@arclux/arc-ui). To change a component, edit its source in [`packages/web-components`](https://github.com/arclight-digital/arc-ui/tree/main/packages/web-components). Hand edits here are overwritten the next time `pnpm generate` runs.

## Installation

```bash
npm install @arclux/arc-ui-vue @arclux/arc-ui lit
```

Requires `vue` ^3.3.0.

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

Each tier also has its own subpath:

```js
import { Button } from '@arclux/arc-ui-vue/input';
import { Card }   from '@arclux/arc-ui-vue/content';
import { AppShell } from '@arclux/arc-ui-vue/layout';
```

## Events

Each component declares its `arc-*` CustomEvents as typed emits, so you bind them like any Vue event (`@arc-input`, `@arc-change`, `@arc-select`, …). The handler receives the original `CustomEvent`; payloads are on `event.detail`.

## Server-side rendering

To render the components on the server, pass your framework's HTML output through `renderDeclarativeShadowDOM` from `@arclux/arc-ui/ssr`. It renders each `<arc-*>` element into a declarative shadow root and needs the optional peer `@lit-labs/ssr`. On the client, import `@arclux/arc-ui/hydrate` before any component. The [server rendering guide](https://arcui.dev/docs/server-rendering) has the details.

To skip server rendering, render them client-side only, for example inside Nuxt's `<ClientOnly>`.

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
