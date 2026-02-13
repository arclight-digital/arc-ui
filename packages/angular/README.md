# @arclux/arc-ui-angular

Angular standalone component wrappers for [ARC UI](https://arcui.dev) web components.

> **Auto-generated** -- this package is produced by [Prism](../../prism.config.js) from the canonical source in [`@arclux/arc-ui`](../web-components/). Do not edit by hand.

## Installation

```bash
npm install @arclux/arc-ui-angular @arclux/arc-ui
```

Requires `@angular/core >= 17.0.0`.

## Usage

```typescript
import { Component } from '@angular/core';
import { Button, Card, Input } from '@arclux/arc-ui-angular';

@Component({
  standalone: true,
  imports: [Button, Card, Input],
  template: `
    <arc-button variant="primary" (click)="onClick()">Get Started</arc-button>
    <arc-card>
      <h3>Card Title</h3>
      <p>Card content.</p>
    </arc-card>
    <arc-input label="Email" type="email" placeholder="you@example.com"></arc-input>
  `,
})
export class AppComponent {
  onClick() {
    console.log('clicked');
  }
}
```

Components are organized by category and can be imported from subpaths:

```typescript
import { Button } from '@arclux/arc-ui-angular/input';
import { Card }   from '@arclux/arc-ui-angular/content';
import { AppShell } from '@arclux/arc-ui-angular/layout';
```

## Documentation

Full component docs and interactive examples: [arcui.dev](https://arcui.dev)

## Links

- [Canonical source (`@arclux/arc-ui`)](../web-components/)
- [Root README](../../README.md)
- [License](../../LICENSE)
