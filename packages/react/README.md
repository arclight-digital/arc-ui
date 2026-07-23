# @arclux/arc-ui-react

React wrappers for [ARC UI](https://arcui.dev) web components with full TypeScript support, built on [`@lit/react`](https://www.npmjs.com/package/@lit/react).

> **Auto-generated** — this package is produced by [Prism](https://www.npmjs.com/package/@arclux/prism) from the canonical source in [`@arclux/arc-ui`](https://www.npmjs.com/package/@arclux/arc-ui). Do not edit by hand.

## Installation

```bash
npm install @arclux/arc-ui-react @arclux/arc-ui
```

Requires `react >= 18.0.0` and `react-dom >= 18.0.0`.

## Usage

```tsx
import { Button, Card, Input } from '@arclux/arc-ui-react';

function App() {
  return (
    <>
      <Button variant="primary" onClick={() => console.log('clicked')}>
        Get Started
      </Button>
      <Card>
        <h3>Card Title</h3>
        <p>Card content.</p>
      </Card>
      <Input
        label="Email"
        type="email"
        placeholder="you@example.com"
        onArcInput={(e) => console.log(e.detail.value)}
      />
    </>
  );
}
```

Components are organized by tier and can be imported from subpaths:

```tsx
import { Button } from '@arclux/arc-ui-react/input';
import { Card }   from '@arclux/arc-ui-react/content';
import { AppShell } from '@arclux/arc-ui-react/layout';
```

## Events

Each component's `arc-*` CustomEvents are exposed as typed `onArc*` props (`arc-input` → `onArcInput`, `arc-select` → `onArcSelect`, …). The handler receives the original `CustomEvent`; payloads are on `event.detail`. Native DOM events (`onClick`, `onFocus`, …) work as usual.

## Server-side rendering

The wrappers register custom elements on import, which requires a DOM. In server-rendered React (e.g. Next.js App Router), use them from client components (`'use client'`).

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
