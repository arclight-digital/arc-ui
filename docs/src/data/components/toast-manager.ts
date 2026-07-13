import type { ComponentDef } from './_types';

export const toastManager: ComponentDef = {
    name: 'Toast Manager',
    slug: 'toast-manager',
    tag: 'arc-toast-manager',
    tier: 'feedback',
    interactivity: 'interactive',
    status: 'beta',
    description: 'Policy layer over Toast that caps how many notifications show at once, queues the overflow FIFO, deduplicates repeated messages, and lets any component fire toasts via a document-level event.',

    overview: `Toast Manager wraps a single internal \`<arc-toast>\` and adds the traffic-control policies that raw toasts lack. Where \`<arc-toast>\` happily stacks every notification you throw at it, the manager enforces a visible ceiling (\`max-visible\`, default 3): additional calls to \`show()\` are queued first-in-first-out and released automatically as visible toasts dismiss — whether by timeout, close button, or action click. The queue itself is bounded by \`queue-limit\`; when a burst exceeds it, the oldest queued (never visible) entries are dropped and an \`arc-queue-overflow\` event reports how many.

Deduplication is on by default: a \`show()\` whose message and variant match a toast that is already visible or queued is coalesced instead of duplicated. For a visible match the toast is re-shown with a "(×N)" counter suffix and a fresh timer; for a queued match the counter is bumped in place, so a burst of identical errors surfaces as one toast reading "Connection lost (×5)" rather than five copies.

Because a toaster is usually a singleton placed at the application root, the manager also listens for a document-level \`arc-toast\` CustomEvent. Any component, anywhere in the tree, can fire a toast without holding a ref: \`document.dispatchEvent(new CustomEvent('arc-toast', { detail: { message: 'Saved.', variant: 'success' } }))\`. The event detail is the same options object accepted by \`show()\`. The inner \`<arc-toast>\` retains full ownership of rendering and accessibility (\`role="status"\`, \`aria-live="polite"\`), so the manager itself renders nothing of its own (\`display: contents\`) and forwards its \`position\` and \`duration\` props straight through.`,

    features: [
      'Composes the existing arc-toast — rendering, animations, and a11y are unchanged',
      'max-visible cap (default 3) with FIFO queueing of the overflow',
      'Queued toasts release automatically as visible ones dismiss',
      'Deduplication by message + variant: visible matches re-show with a "(×N)" counter, queued matches coalesce silently',
      'Bounded queue (queue-limit, default 20) — oldest queued entries drop with an arc-queue-overflow event',
      'show() returns a stable id usable with dismiss(id); clear() dismisses everything and flushes the queue',
      'Document-level arc-toast event channel — fire toasts from anywhere without a ref',
      'arc-queue-change event reports { visible, queued } whenever counts change',
      'position and duration forwarded to the inner toast; inner parts re-exported for ::part styling',
      'No visual output of its own (display: contents) — zero layout impact'
    ],

    guidelines: {
      do: [
        'Place a single <arc-toast-manager> at your application root and treat it as the app-wide toaster',
        'Fire toasts from deep components via the document-level arc-toast event instead of threading refs',
        'Keep dedupe enabled for retry loops and polling errors so repeats collapse into one "(×N)" toast',
        'Listen for arc-queue-overflow in development — it usually means something is firing toasts in a loop',
        'Use the id returned by show() with dismiss(id) to retire a progress toast when its task completes',
        'Tune max-visible down (1–2) on dense dashboards where toasts cover live content'
      ],
      dont: [
        'Nest an <arc-toast-manager> inside another, or mix it with a bare <arc-toast> on the same page — two toasters will overlap',
        'Set queue-limit very high to "never lose" notifications; stale toasts shown minutes later confuse more than they inform',
        'Disable dedupe and then fire per-item toasts for batch operations — summarize into one message instead',
        'Use the queue as a persistent notification inbox; use a Notification Panel for history',
        'Rely on arc-queue-change for business logic — it describes UI state, not delivery guarantees'
      ],
    },

    previewHtml: `<div style="width:100%"><arc-toast-manager id="demo-manager" position="top-right" max-visible="3"></arc-toast-manager><div style="display:flex;gap:8px;flex-wrap:wrap"><arc-button variant="primary" id="demo-tm-show">Show Toast</arc-button><arc-button variant="secondary" id="demo-tm-burst">Burst ×8 (queues)</arc-button><arc-button variant="ghost" id="demo-tm-dup">Duplicate (dedupes)</arc-button><arc-button variant="ghost" id="demo-tm-clear">Clear</arc-button></div></div>`,

    previewSetup: `
      const manager = document.getElementById('demo-manager');
      let n = 0;
      document.getElementById('demo-tm-show')?.addEventListener('click', () => {
        manager?.show({ message: 'Notification #' + (++n), variant: 'success' });
      });
      document.getElementById('demo-tm-burst')?.addEventListener('click', () => {
        for (let i = 1; i <= 8; i++) {
          manager?.show({ message: 'Burst item ' + (++n), variant: 'info' });
        }
      });
      document.getElementById('demo-tm-dup')?.addEventListener('click', () => {
        // Same message + variant every time — watch the (×N) counter climb.
        document.dispatchEvent(new CustomEvent('arc-toast', {
          detail: { message: 'Connection lost. Retrying...', variant: 'error' },
        }));
      });
      document.getElementById('demo-tm-clear')?.addEventListener('click', () => {
        manager?.clear();
      });
    `,

    props: [
      {
        name: 'position',
        type: "'top-right' | 'top-left' | 'top-center' | 'bottom-right' | 'bottom-left' | 'bottom-center'",
        default: "'top-right'",
        description: 'Forwarded to the inner arc-toast. Anchors the toast stack to a fixed edge of the viewport.',
      },
      {
        name: 'duration',
        type: 'number',
        default: '4000',
        description: 'Forwarded to the inner arc-toast as the default auto-dismiss time in milliseconds. Overridable per-toast via the duration option in the show() payload; pass persistent: true (or duration 0) to require manual dismissal.',
      },
      {
        name: 'maxVisible',
        type: 'number',
        default: '3',
        description: 'Maximum number of toasts visible at once (attribute: max-visible). Further show() calls queue FIFO and release as visible toasts dismiss.',
      },
      {
        name: 'dedupe',
        type: 'boolean',
        default: 'true',
        description: 'When true, a show() whose message and variant match a visible or queued toast is coalesced: visible matches re-show with a "(×N)" counter suffix and a fresh timer; queued matches bump their counter in place. Set the property to false from JS to disable.',
      },
      {
        name: 'queueLimit',
        type: 'number',
        default: '20',
        description: 'Maximum queued (not visible) toasts (attribute: queue-limit). Beyond it the oldest queued entries are dropped and arc-queue-overflow fires with the drop count.',
      }
    ],
    events: [
      { name: 'arc-dismiss', description: 'Fired when a managed toast is dismissed. detail: { id } — the id returned by show().' },
      { name: 'arc-queue-change', description: 'Fired whenever the visible or queued count changes. detail: { visible, queued }.' },
      { name: 'arc-queue-overflow', description: 'Fired when the queue exceeds queueLimit and oldest queued entries are dropped. detail: { dropped } — how many were dropped.' }
    ],

    tabs: [
    {
        label: 'Web Component',
        lang: 'html',
        code: `<script type="module" src="@arclux/arc-ui"></script>

<!-- One manager at the app root -->
<arc-toast-manager id="toaster" position="top-right" max-visible="3" queue-limit="20"></arc-toast-manager>

<div style="display: flex; gap: 8px; flex-wrap: wrap;">
  <arc-button variant="primary"
    onclick="document.getElementById('toaster').show({ message: 'Changes saved.', variant: 'success' })">
    Show
  </arc-button>

  <!-- Any component can fire a toast without a ref via the document event -->
  <arc-button variant="secondary"
    onclick="document.dispatchEvent(new CustomEvent('arc-toast', { detail: { message: 'Sync failed.', variant: 'error' } }))">
    Fire via document event
  </arc-button>

  <arc-button variant="ghost"
    onclick="document.getElementById('toaster').clear()">
    Clear all
  </arc-button>
</div>

<script>
  const toaster = document.getElementById('toaster');
  toaster.addEventListener('arc-queue-change', (e) => {
    console.log('visible:', e.detail.visible, 'queued:', e.detail.queued);
  });
  toaster.addEventListener('arc-queue-overflow', (e) => {
    console.warn(e.detail.dropped + ' queued toast(s) dropped');
  });
</script>`,
      },
    {
        label: 'React',
        lang: 'tsx',
        code: `import { ToastManager, Button } from '@arclux/arc-ui-react';
import { useRef } from 'react';

export function ToastManagerDemo() {
  const managerRef = useRef<HTMLElement>(null);

  const save = () =>
    (managerRef.current as any)?.show({ message: 'Changes saved.', variant: 'success' });

  // From any component, no ref needed:
  const fireGlobal = () =>
    document.dispatchEvent(new CustomEvent('arc-toast', {
      detail: { message: 'Sync failed.', variant: 'error' },
    }));

  return (
    <>
      <ToastManager
        ref={managerRef}
        position="top-right"
        maxVisible={3}
        onArcQueueOverflow={(e: CustomEvent) => console.warn(e.detail.dropped, 'dropped')}
      />
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <Button variant="primary" onClick={save}>Show</Button>
        <Button variant="secondary" onClick={fireGlobal}>Fire via document event</Button>
        <Button variant="ghost" onClick={() => (managerRef.current as any)?.clear()}>Clear all</Button>
      </div>
    </>
  );
}`,
      },
    {
        label: 'Vue',
        lang: 'html',
        code: `<script setup>
import { ref } from 'vue';
import { Button, ToastManager } from '@arclux/arc-ui-vue';

const manager = ref(null);
const save = () => manager.value?.show({ message: 'Changes saved.', variant: 'success' });

// From any component, no ref needed:
const fireGlobal = () => document.dispatchEvent(new CustomEvent('arc-toast', {
  detail: { message: 'Sync failed.', variant: 'error' },
}));
</script>

<template>
  <ToastManager ref="manager" position="top-right" :max-visible="3" />
  <div style="display: flex; gap: 8px; flex-wrap: wrap;">
    <Button variant="primary" @click="save">Show</Button>
    <Button variant="secondary" @click="fireGlobal">Fire via document event</Button>
    <Button variant="ghost" @click="manager?.clear()">Clear all</Button>
  </div>
</template>`,
      },
  ],

  seeAlso: ['toast', 'alert', 'notification-panel'],
};
