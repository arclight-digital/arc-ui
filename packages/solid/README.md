# @arclux/arc-ui-solid

Solid component wrappers for [ARC UI](https://arcui.dev) web components with typed props and events.

> **Auto-generated** — this package is produced by [Prism](https://www.npmjs.com/package/@arclux/prism) from the canonical source in [`@arclux/arc-ui`](https://www.npmjs.com/package/@arclux/arc-ui). Do not edit by hand.

## Installation

```bash
npm install @arclux/arc-ui-solid @arclux/arc-ui
```

Requires `solid-js >= 1.8.0`.

## Usage

```tsx
import { Button, Card, Input } from '@arclux/arc-ui-solid';

export default function App() {
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

Components are organized by tier and can be imported from subpaths:

```tsx
import { Button } from '@arclux/arc-ui-solid/input';
import { Card }   from '@arclux/arc-ui-solid/content';
import { AppShell } from '@arclux/arc-ui-solid/layout';
```

## Events

Each component's `arc-*` CustomEvents are exposed as typed `onArc*` props (`arc-input` → `onArcInput`, `arc-select` → `onArcSelect`, …). The handler receives the original `CustomEvent`; payloads are on `event.detail`:

```tsx
<Input label="Email" onArcInput={(e) => console.log(e.detail.value)} />
```

## Server-side rendering

The wrappers register custom elements on import, which requires a DOM. With SolidStart / SSR, render them client-side only (e.g. `clientOnly()`).

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
