# @arclux/arc-ui-react

React wrappers for [ARC UI](https://arcui.dev) web components with full TypeScript support.

> **Auto-generated** -- this package is produced by [Prism](../../prism.config.js) from the canonical source in [`@arclux/arc-ui`](../web-components/). Do not edit by hand.

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

Components are organized by category and can be imported from subpaths:

```tsx
import { Button } from '@arclux/arc-ui-react/input';
import { Card }   from '@arclux/arc-ui-react/content';
import { AppShell } from '@arclux/arc-ui-react/layout';
```

## Documentation

Full component docs and interactive examples: [arcui.dev](https://arcui.dev)

## Links

- [Canonical source (`@arclux/arc-ui`)](../web-components/)
- [Root README](../../README.md)
- [License](../../LICENSE)
