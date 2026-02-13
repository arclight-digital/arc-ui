# @arclux/arc-ui-solid

Solid component wrappers for [ARC UI](https://arcui.dev) web components.

> **Auto-generated** -- this package is produced by [Prism](../../prism.config.js) from the canonical source in [`@arclux/arc-ui`](../web-components/). Do not edit by hand.

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

Components are organized by category and can be imported from subpaths:

```tsx
import { Button } from '@arclux/arc-ui-solid/input';
import { Card }   from '@arclux/arc-ui-solid/content';
import { AppShell } from '@arclux/arc-ui-solid/layout';
```

## Documentation

Full component docs and interactive examples: [arcui.dev](https://arcui.dev)

## Links

- [Canonical source (`@arclux/arc-ui`)](../web-components/)
- [Root README](../../README.md)
- [License](../../LICENSE)
