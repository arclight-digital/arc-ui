# @arclux/arc-ui-angular

Angular standalone component wrappers for [ARC UI](https://arcui.dev) web components.

> **Auto-generated** — this package is produced by [Prism](https://www.npmjs.com/package/@arclux/prism) from the canonical source in [`@arclux/arc-ui`](https://www.npmjs.com/package/@arclux/arc-ui). Do not edit by hand.

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

Components are organized by tier and can be imported from subpaths:

```typescript
import { Button } from '@arclux/arc-ui-angular/input';
import { Card }   from '@arclux/arc-ui-angular/content';
import { AppShell } from '@arclux/arc-ui-angular/layout';
```

## Events

Each component exposes its `arc-*` CustomEvents as camelCase `@Output()` emitters (`arc-input` → `(arcInput)`, `arc-select` → `(arcSelect)`, …). The emitted value is the original `CustomEvent`; payloads are on `event.detail`:

```html
<arc-input label="Email" (arcInput)="onInput($event)"></arc-input>
```

## Server-side rendering

The wrappers register custom elements on import, which requires a DOM. With Angular Universal / SSR, render them client-side only.

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
