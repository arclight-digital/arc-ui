# @arclux/arc-ui-angular

Angular standalone component wrappers for [ARC UI](https://arcui.dev) web components.

> [Prism](https://www.npmjs.com/package/@arclux/prism) generates this package's code from [`@arclux/arc-ui`](https://www.npmjs.com/package/@arclux/arc-ui). To change a component, edit its source in [`packages/web-components`](https://github.com/arclight-digital/arc-ui/tree/main/packages/web-components). Hand edits here are overwritten the next time `pnpm generate` runs.

## Installation

```bash
npm install @arclux/arc-ui-angular @arclux/arc-ui lit
```

Requires `@angular/core`, `@angular/common` and `@angular/forms` >=17.0.0 <22.0.0.

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

The package has one entry point, so import every component from `@arclux/arc-ui-angular`.

## Events

Bind an `arc-*` event by its own name, the way you bind a DOM event: `(arc-input)="onInput($event)"`. `$event` is the `CustomEvent`, and the payload is on `event.detail`.

When an event reports a property's new value, the wrapper also has a `<property>Change` output that emits the bare value (`valueChange` on Input, `checkedChange` on Toggle, `openChange` on Collapsible), so `[(value)]` and `[(checked)]` work.

```html
<arc-input label="Email" (arc-input)="onInput($event)"></arc-input>
```

## Forms

Form controls implement `ControlValueAccessor`, so `formControlName` and `ngModel` work on them.

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
