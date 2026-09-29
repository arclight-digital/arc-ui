import type { ComponentDef } from './_types';

export const connectionStatus: ComponentDef = {
  name: 'Connection Status',
  slug: 'connection-status',
  tag: 'arc-connection-status',
  tier: 'feedback',
  interactivity: 'interactive',
  description:
    'Detects online/offline via the navigator API. Offline shows a persistent warning bar with an amber glow pulse. Reconnecting dismisses it with a success flash.',

  overview: `ConnectionStatus monitors the browser's network state via the Navigator online/offline API and surfaces a persistent notification bar when connectivity is lost. It needs no configuration: place it once in your layout.

When the browser goes offline, a warning bar slides down from the top of the viewport with an amber glow pulse animation, telling the user their connection has been lost. The bar persists until connectivity is restored, at which point it briefly flashes green (success variant) with a "Back online" message before auto-dismissing.

The component fires \`arc-online\` and \`arc-offline\` events so your application can react to connectivity changes, for example by pausing sync, queuing mutations for retry, or showing extra UI. The bar uses \`aria-live="polite"\` so screen readers announce changes at the next pause instead of interrupting the user.`,

  features: [
    'Automatic online/offline detection via Navigator API',
    'Persistent warning bar with amber glow pulse when offline',
    'Success flash with auto-dismiss when connectivity is restored',
    'No configuration: place once, no props required',
    '`arc-online` and `arc-offline` events for application-level reactions',
    'Slide-down enter and collapse exit transitions',
    'aria-live="polite" for non-disruptive screen-reader announcements',
    'Full-width bar anchored to the top of the viewport',
    'Respects `prefers-reduced-motion` by disabling the glow pulse',
  ],

  guidelines: {
    do: [
      'Place a single <arc-connection-status> at the root of your layout',
      'Listen for arc-offline to pause background sync or queue operations',
      'Listen for arc-online to retry failed requests or flush queued mutations',
      'Let the component manage its own visibility; do not toggle it manually',
      'Test with browser DevTools Network offline simulation',
    ],
    dont: [
      'Do not create multiple <arc-connection-status> elements; one per application is enough',
      "Do not override the component's internal visibility state; it manages itself",
      'Do not rely on connection-status as a health check; it only detects browser-level offline',
      'Do not use connection-status for API-level errors. Use toast or alert for those',
      'Do not hide the component on specific pages; connectivity is always relevant',
    ],
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
