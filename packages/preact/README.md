# @arclux/arc-ui-preact

Preact component wrappers for [ARC UI](https://arcui.dev) web components with typed props and events.

> [Prism](https://www.npmjs.com/package/@arclux/prism) generates this package's code from [`@arclux/arc-ui`](https://www.npmjs.com/package/@arclux/arc-ui). To change a component, edit its source in [`packages/web-components`](https://github.com/arclight-digital/arc-ui/tree/main/packages/web-components). Hand edits here are overwritten the next time `pnpm generate` runs.

## Installation

```bash
npm install @arclux/arc-ui-preact @arclux/arc-ui lit
```

Requires `preact` ^10.19.0.

## Usage

```tsx
import { Button, Card, Input } from '@arclux/arc-ui-preact';

export function App() {
  return (
    <>
      <Button variant="primary" onClick={() => console.log('clicked')}>
        Get Started
      </Button>
      <Card>
        <h3>Card Title</h3>
        <p>Card content.</p>
      </Card>
      <Input label="Email" type="email" placeholder="you@example.com" />
    </>
  );
}
```

Each tier also has its own subpath:

```tsx
import { Button } from '@arclux/arc-ui-preact/input';
import { Card }   from '@arclux/arc-ui-preact/content';
import { AppShell } from '@arclux/arc-ui-preact/layout';
```

## Events

Each component's `arc-*` CustomEvents are exposed as typed `onArc*` props (`arc-input` → `onArcInput`, `arc-select` → `onArcSelect`, …). The handler receives the original `CustomEvent`; payloads are on `event.detail`:

```tsx
<Input label="Email" onArcInput={(e) => console.log(e.detail.value)} />
```

## Server-side rendering

To render the components on the server, pass your framework's HTML output through `renderDeclarativeShadowDOM` from `@arclux/arc-ui/ssr`. It renders each `<arc-*>` element into a declarative shadow root and needs the optional peer `@lit-labs/ssr`. On the client, import `@arclux/arc-ui/hydrate` before any component. The [server rendering guide](https://arcui.dev/docs/server-rendering) has the details.

To skip server rendering, render them client-side only.

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
