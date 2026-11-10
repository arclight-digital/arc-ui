import type { ComponentDef } from './_types';

export const connectionStatus: ComponentDef = {
  name: 'Connection Status',
  slug: 'connection-status',
  tag: 'arc-connection-status',
  tier: 'feedback',
  interactivity: 'interactive',
  description:
    'Shows a warning bar while the browser is offline and a short "Connection restored" message when it comes back.',

  overview: `ConnectionStatus listens for the browser's \`online\` and \`offline\` events. Going offline expands a warning-colored bar that reads "You are offline", with a pulsing dot, and it stays until the connection returns. Then the bar turns success-colored, reads "Connection restored" and collapses after 3 seconds. It has no props.

The bar is in normal document flow, not fixed to the viewport, so it expands wherever you put it. Place it once near the top of your layout, or inside a fixed container if it has to stay on screen.

\`arc-offline\` and \`arc-online\` fire on each change, so you can pause sync while offline and flush queued requests when the connection is back. The browser's online state only says there's a network connection. It doesn't tell you whether your API is reachable.`,

  features: [
    'The bar has `role="status"` and `aria-live="polite"`, so screen readers announce the change without interrupting',
    "If the page loads offline, the bar shows straight away, but `arc-offline` doesn't fire",
    "Reduced motion turns off the expand transition and the dot's pulse",
    "Safe to render on the server: it assumes it's online until the first client render reads `navigator.onLine`",
  ],

  guidelines: {
    do: [
      'Test it with the Offline setting in your browser DevTools Network panel',
      "Leave its visibility to the component. There's no prop to show or hide the bar",
    ],
    dont: ["Don't use it for API errors. Use Toast or Alert"],
  },

  previewHtml: `<arc-connection-status></arc-connection-status><p style="color:var(--text-secondary);font-size:var(--font-size-sm)">Toggle your network connection in browser DevTools to see the status bar appear.</p>`,

  tabs: [
    {
      label: 'Web Component',
      lang: 'html',
      code: `<script type="module" src="@arclux/arc-ui"></script>

<!-- Place once at the root of your layout -->
<arc-connection-status></arc-connection-status>`,
    },
    {
      label: 'React',
      lang: 'tsx',
      code: `import { ConnectionStatus } from '@arclux/arc-ui-react';

export function App() {
  return (
    <>
      <ConnectionStatus
        onArcOffline={() => console.log('Lost connection')}
        onArcOnline={() => console.log('Back online')}
      />
      {/* rest of your app */}
    </>
  );
}`,
    },
    {
      label: 'Vue',
      lang: 'html',
      code: `<script setup>
import { ConnectionStatus } from '@arclux/arc-ui-vue';

const onOffline = () => console.log('Lost connection');
const onOnline  = () => console.log('Back online');
</script>

<template>
  <ConnectionStatus @arc-offline="onOffline" @arc-online="onOnline" />
  <!-- rest of your app -->
</template>`,
    },
    {
      label: 'Svelte',
      lang: 'html',
      code: `<script>
  import { ConnectionStatus } from '@arclux/arc-ui-svelte';
</script>

<ConnectionStatus
  on:arc-offline={() => console.log('Lost connection')}
  on:arc-online={() => console.log('Back online')} />`,
    },
    {
      label: 'Angular',
      lang: 'ts',
      code: `import { Component } from '@angular/core';
import { ConnectionStatus } from '@arclux/arc-ui-angular';

@Component({
  imports: [ConnectionStatus],
  template: \`
    <arc-connection-status
      (arc-offline)="onOffline()"
      (arc-online)="onOnline()">
    </arc-connection-status>
  \`,
})
export class AppComponent {
  onOffline() { console.log('Lost connection'); }
  onOnline()  { console.log('Back online'); }
}`,
    },
    {
      label: 'Solid',
      lang: 'tsx',
      code: `import { ConnectionStatus } from '@arclux/arc-ui-solid';

export function App() {
  return (
    <>
      <ConnectionStatus
        onArcOffline={() => console.log('Lost connection')}
        onArcOnline={() => console.log('Back online')}
      />
      {/* rest of your app */}
    </>
  );
}`,
    },
    {
      label: 'Preact',
      lang: 'tsx',
      code: `import { ConnectionStatus } from '@arclux/arc-ui-preact';

export function App() {
  return (
    <>
      <ConnectionStatus
        onArcOffline={() => console.log('Lost connection')}
        onArcOnline={() => console.log('Back online')}
      />
      {/* rest of your app */}
    </>
  );
}`,
    },
  ],

  seeAlso: ['banner', 'toast', 'alert'],
};
