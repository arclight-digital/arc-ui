import type { ComponentDef } from './_types';

export const sheet: ComponentDef = {
    name: 'Sheet',
    slug: 'sheet',
    tag: 'arc-sheet',
    tier: 'feedback',
    interactivity: 'interactive',
    description: 'A sliding overlay panel that emerges from the bottom or right edge of the viewport, with a blurred backdrop, header, scrollable body, and footer slot.',

    overview: `Sheet provides a modal-like surface that slides into view from the bottom or right edge of the screen, ideal for contextual actions, filters, or detail views that do not warrant a full-page navigation. When opened, a backdrop with a 4px blur covers the rest of the UI and clicking it dismisses the sheet. The bottom variant includes a drag-handle bar at the top for visual affordance, while the right variant omits it in favour of a clean sidebar aesthetic.

The panel is structured into three zones: a header row with a heading and close button, a scrollable body for slotted content, and a sticky footer for action buttons. The header and footer slots allow full customisation -- you can replace the default heading with any markup via the \`header\` named slot, and populate the footer with buttons via the \`footer\` slot. The body area uses \`overflow-y: auto\` so long content scrolls naturally within the panel.

Sheet manages focus trapping and scroll locking automatically. When opened, it locks \`document.body\` overflow to prevent background scrolling, moves focus to the close button, and listens for the Escape key to dismiss. The \`arc-open\` event fires when the sheet becomes visible and \`arc-close\` fires on dismissal, allowing parent components to synchronise state or perform cleanup.`,

    features: [
      'Two placement modes: `bottom` (default) and `right`, controlled by the `side` prop',
      'Backdrop overlay with `backdrop-filter: blur(4px)` that dismisses the sheet on click',
      'Bottom variant includes a rounded drag-handle bar for mobile touch affordance',
      'Structured layout with header, scrollable body, and sticky footer zones',
      'Named slots for `header` and `footer` allow full customisation of chrome areas',
      'Automatic scroll locking on `document.body` when open, restored on close',
      'Escape key dismissal with focus auto-moved to the close button on open',
      'Fires `arc-open` and `arc-close` custom events for lifecycle synchronisation',
    ],

    guidelines: {
      do: [
        'Use the bottom sheet for mobile-friendly contextual panels like filters or share menus',
        'Use the right sheet for desktop detail panes, settings forms, or property inspectors',
        'Provide a descriptive `heading` so screen readers announce the dialog purpose via `aria-label`',
        'Listen to `arc-close` to reset your local open state and perform any necessary cleanup',
        'Populate the `footer` slot with primary and secondary action buttons for task-oriented sheets',
      ],
      dont: [
        'Do not nest a Sheet inside another Sheet -- use a Modal for layered overlays instead',
        'Do not use Sheet for brief confirmations or alerts -- use Modal or Toast for those patterns',
        'Do not set both `side="bottom"` and `side="right"` -- only one placement is active at a time',
        'Do not place critical navigation inside a Sheet -- it is dismissible and should contain optional content',
        'Avoid overloading the sheet body with too many form fields -- consider a full page for complex forms',
      ],
    },

    previewHtml: `<div style="display:flex;gap:var(--space-sm);">
  <arc-button id="open-bottom-sheet" variant="secondary">Filters</arc-button>
  <arc-button id="open-right-sheet" variant="secondary">Details</arc-button>
</div>
<arc-sheet id="demo-bottom-sheet" heading="Filter Results" side="bottom">
  <div style="display:flex;flex-direction:column;gap:var(--space-md);">
    <div>
      <div style="font-weight:600;font-size:13px;color:var(--text-primary);margin-bottom:var(--space-xs);">Status</div>
      <div style="display:flex;gap:var(--space-xs);flex-wrap:wrap;">
        <arc-chip selected>Active</arc-chip>
        <arc-chip>Archived</arc-chip>
        <arc-chip>Draft</arc-chip>
      </div>
    </div>
    <div>
      <div style="font-weight:600;font-size:13px;color:var(--text-primary);margin-bottom:var(--space-xs);">Category</div>
      <arc-select placeholder="All categories" style="width:100%;"></arc-select>
    </div>
    <div>
      <div style="font-weight:600;font-size:13px;color:var(--text-primary);margin-bottom:var(--space-xs);">Sort by</div>
      <div style="display:flex;gap:var(--space-xs);">
        <arc-chip selected>Newest</arc-chip>
        <arc-chip>Name A-Z</arc-chip>
        <arc-chip>Most used</arc-chip>
      </div>
    </div>
  </div>
  <div slot="footer" style="display:flex;gap:var(--space-sm);width:100%;justify-content:flex-end;">
    <arc-button id="reset-filters" variant="ghost">Reset</arc-button>
    <arc-button id="apply-filters" variant="primary">Apply Filters</arc-button>
  </div>
</arc-sheet>
<arc-sheet id="demo-right-sheet" heading="Project Details" side="right">
  <div style="display:flex;flex-direction:column;gap:var(--space-lg);">
    <div style="display:flex;align-items:center;gap:var(--space-md);">
      <arc-avatar name="acme-dashboard" size="lg"></arc-avatar>
      <div>
        <div style="font-weight:600;font-size:15px;color:var(--text-primary);">acme-dashboard</div>
        <div style="font-size:13px;color:var(--text-tertiary);">Last deployed 2 hours ago</div>
      </div>
    </div>
    <arc-divider></arc-divider>
    <div style="display:flex;flex-direction:column;gap:var(--space-sm);">
      <div style="display:flex;justify-content:space-between;font-size:13px;">
        <span style="color:var(--text-tertiary);">Framework</span>
        <span style="color:var(--text-primary);font-weight:500;">Next.js 14</span>
      </div>
      <div style="display:flex;justify-content:space-between;font-size:13px;">
        <span style="color:var(--text-tertiary);">Region</span>
        <span style="color:var(--text-primary);font-weight:500;">US East (iad1)</span>
      </div>
      <div style="display:flex;justify-content:space-between;font-size:13px;">
        <span style="color:var(--text-tertiary);">Status</span>
        <arc-badge variant="success">Live</arc-badge>
      </div>
      <div style="display:flex;justify-content:space-between;font-size:13px;">
        <span style="color:var(--text-tertiary);">Team</span>
        <span style="color:var(--text-primary);font-weight:500;">3 members</span>
      </div>
    </div>
  </div>
  <div slot="footer" style="display:flex;gap:var(--space-sm);width:100%;justify-content:flex-end;">
    <arc-button variant="ghost">Settings</arc-button>
    <arc-button variant="primary">Open Project</arc-button>
  </div>
</arc-sheet>`,

    previewSetup: `const bottomBtn = el.querySelector('#open-bottom-sheet'); const rightBtn = el.querySelector('#open-right-sheet'); const bottomSheet = el.querySelector('#demo-bottom-sheet'); const rightSheet = el.querySelector('#demo-right-sheet'); bottomBtn?.addEventListener('click', () => { if (bottomSheet) bottomSheet.open = true; }); rightBtn?.addEventListener('click', () => { if (rightSheet) rightSheet.open = true; }); el.querySelector('#reset-filters')?.addEventListener('click', () => { if (bottomSheet) bottomSheet.open = false; }); el.querySelector('#apply-filters')?.addEventListener('click', () => { if (bottomSheet) bottomSheet.open = false; });`,

    props: [
      { name: 'open', type: 'boolean', default: 'false', description: 'Controls whether the sheet is visible. Reflected as an attribute and toggleable programmatically.' },
      { name: 'side', type: "'bottom' | 'right'", default: "'bottom'", description: 'Which edge the panel slides in from. Bottom sheets have a max-height of 80vh; right sheets are 400px wide.' },
      { name: 'heading', type: 'string', default: "''", description: 'Text displayed in the header row. Also used as the `aria-label` for the dialog panel.' },
    ],
    events: [
      { name: 'arc-open', description: 'Fired when the sheet opens' },
      { name: 'arc-close', description: 'Fired when the sheet closes' },
    ],

    tabs: [
      {
        label: 'Web Component',
        lang: 'html',
        code: `<!-- Bottom sheet for filters -->
<arc-button id="open-filters" variant="secondary">Filters</arc-button>
<arc-sheet id="filter-sheet" heading="Filter Results" side="bottom">
  <div style="display:flex;flex-direction:column;gap:16px;">
    <div>
      <strong style="font-size:13px;">Status</strong>
      <div style="display:flex;gap:6px;margin-top:6px;">
        <arc-chip selected>Active</arc-chip>
        <arc-chip>Archived</arc-chip>
        <arc-chip>Draft</arc-chip>
      </div>
    </div>
    <arc-select placeholder="All categories" style="width:100%;"></arc-select>
  </div>
  <div slot="footer">
    <arc-button variant="ghost" onclick="this.closest('arc-sheet').open = false">Reset</arc-button>
    <arc-button variant="primary" onclick="this.closest('arc-sheet').open = false">Apply</arc-button>
  </div>
</arc-sheet>

<!-- Right sheet for detail pane -->
<arc-button id="open-details" variant="secondary">Details</arc-button>
<arc-sheet id="detail-sheet" heading="Project Details" side="right">
  <div style="display:flex;flex-direction:column;gap:12px;font-size:13px;">
    <div style="display:flex;justify-content:space-between;">
      <span style="color:var(--text-tertiary);">Framework</span>
      <span style="font-weight:500;">Next.js 14</span>
    </div>
    <div style="display:flex;justify-content:space-between;">
      <span style="color:var(--text-tertiary);">Status</span>
      <arc-badge variant="success">Live</arc-badge>
    </div>
  </div>
  <div slot="footer">
    <arc-button variant="primary">Open Project</arc-button>
  </div>
</arc-sheet>

<script>
  document.querySelector('#open-filters').addEventListener('click', () => {
    document.querySelector('#filter-sheet').open = true;
  });
  document.querySelector('#open-details').addEventListener('click', () => {
    document.querySelector('#detail-sheet').open = true;
  });
</script>`,
      },
      {
        label: 'React',
        lang: 'tsx',
        code: `import { Sheet, Button, Chip, Select, Badge } from '@arclux/arc-ui-react';
import { useState } from 'react';

function FilterSheet() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>Filters</Button>
      <Sheet heading="Filter Results" side="bottom" open={open} onArcClose={() => setOpen(false)}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <strong style={{ fontSize: 13 }}>Status</strong>
            <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
              <Chip selected>Active</Chip>
              <Chip>Archived</Chip>
              <Chip>Draft</Chip>
            </div>
          </div>
          <Select placeholder="All categories" />
        </div>
        <div slot="footer">
          <Button variant="ghost" onClick={() => setOpen(false)}>Reset</Button>
          <Button variant="primary" onClick={() => setOpen(false)}>Apply</Button>
        </div>
      </Sheet>
    </>
  );
}

function DetailSheet() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>Details</Button>
      <Sheet heading="Project Details" side="right" open={open} onArcClose={() => setOpen(false)}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 13 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-tertiary)' }}>Framework</span>
            <span style={{ fontWeight: 500 }}>Next.js 14</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-tertiary)' }}>Status</span>
            <Badge variant="success">Live</Badge>
          </div>
        </div>
        <div slot="footer">
          <Button variant="primary">Open Project</Button>
        </div>
      </Sheet>
    </>
  );
}`,
      },
      {
        label: 'Vue',
        lang: 'html',
        code: `<script setup>
import { ref } from 'vue';
import { Sheet, Button, Chip, Badge } from '@arclux/arc-ui-vue';

const filtersOpen = ref(false);
const detailsOpen = ref(false);
</script>

<template>
  <Button variant="secondary" @click="filtersOpen = true">Filters</Button>
  <Sheet heading="Filter Results" side="bottom" :open="filtersOpen" @arc-close="filtersOpen = false">
    <div style="display:flex;flex-direction:column;gap:16px;">
      <div>
        <strong style="font-size:13px;">Status</strong>
        <div style="display:flex;gap:6px;margin-top:6px;">
          <Chip selected>Active</Chip>
          <Chip>Archived</Chip>
        </div>
      </div>
    </div>
    <template #footer>
      <Button variant="ghost" @click="filtersOpen = false">Reset</Button>
      <Button variant="primary" @click="filtersOpen = false">Apply</Button>
    </template>
  </Sheet>

  <Button variant="secondary" @click="detailsOpen = true">Details</Button>
  <Sheet heading="Project Details" side="right" :open="detailsOpen" @arc-close="detailsOpen = false">
    <div style="display:flex;flex-direction:column;gap:12px;font-size:13px;">
      <div style="display:flex;justify-content:space-between;">
        <span>Framework</span>
        <span style="font-weight:500;">Next.js 14</span>
      </div>
      <div style="display:flex;justify-content:space-between;">
        <span>Status</span>
        <Badge variant="success">Live</Badge>
      </div>
    </div>
    <template #footer>
      <Button variant="primary">Open Project</Button>
    </template>
  </Sheet>
</template>`,
      },
      {
        label: 'Svelte',
        lang: 'html',
        code: `<script>
  import { Sheet, Button, Chip, Badge } from '@arclux/arc-ui-svelte';

  let filtersOpen = $state(false);
  let detailsOpen = $state(false);
</script>

<Button variant="secondary" onclick={() => filtersOpen = true}>Filters</Button>
<Sheet heading="Filter Results" side="bottom" open={filtersOpen} on:arc-close={() => filtersOpen = false}>
  <div style="display:flex;flex-direction:column;gap:16px;">
    <strong style="font-size:13px;">Status</strong>
    <div style="display:flex;gap:6px;">
      <Chip selected>Active</Chip>
      <Chip>Archived</Chip>
    </div>
  </div>
  <div slot="footer">
    <Button variant="ghost" onclick={() => filtersOpen = false}>Reset</Button>
    <Button variant="primary" onclick={() => filtersOpen = false}>Apply</Button>
  </div>
</Sheet>

<Button variant="secondary" onclick={() => detailsOpen = true}>Details</Button>
<Sheet heading="Project Details" side="right" open={detailsOpen} on:arc-close={() => detailsOpen = false}>
  <div style="font-size:13px;display:flex;justify-content:space-between;">
    <span>Status</span>
    <Badge variant="success">Live</Badge>
  </div>
  <div slot="footer">
    <Button variant="primary">Open Project</Button>
  </div>
</Sheet>`,
      },
      {
        label: 'Angular',
        lang: 'ts',
        code: `import { Component } from '@angular/core';
import { Sheet, Button, Chip, Badge } from '@arclux/arc-ui-angular';

@Component({
  imports: [Sheet, Button, Chip, Badge],
  template: \`
    <Button variant="secondary" (click)="filtersOpen = true">Filters</Button>
    <Sheet heading="Filter Results" side="bottom" [open]="filtersOpen" (arcClose)="filtersOpen = false">
      <div style="display:flex;flex-direction:column;gap:16px;">
        <strong style="font-size:13px;">Status</strong>
        <div style="display:flex;gap:6px;">
          <Chip [selected]="true">Active</Chip>
          <Chip>Archived</Chip>
        </div>
      </div>
      <div slot="footer">
        <Button variant="ghost" (click)="filtersOpen = false">Reset</Button>
        <Button variant="primary" (click)="filtersOpen = false">Apply</Button>
      </div>
    </Sheet>
  \`,
})
export class FilterComponent {
  filtersOpen = false;
}`,
      },
      {
        label: 'Solid',
        lang: 'tsx',
        code: `import { createSignal } from 'solid-js';
import { Sheet, Button, Chip, Badge } from '@arclux/arc-ui-solid';

function FilterSheet() {
  const [open, setOpen] = createSignal(false);

  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>Filters</Button>
      <Sheet heading="Filter Results" side="bottom" open={open()} onArcClose={() => setOpen(false)}>
        <div style="display:flex;flex-direction:column;gap:16px;">
          <strong style="font-size:13px;">Status</strong>
          <div style="display:flex;gap:6px;">
            <Chip selected>Active</Chip>
            <Chip>Archived</Chip>
          </div>
        </div>
        <div slot="footer">
          <Button variant="ghost" onClick={() => setOpen(false)}>Reset</Button>
          <Button variant="primary" onClick={() => setOpen(false)}>Apply</Button>
        </div>
      </Sheet>
    </>
  );
}`,
      },
      {
        label: 'Preact',
        lang: 'tsx',
        code: `import { useState } from 'preact/hooks';
import { Sheet, Button, Chip, Badge } from '@arclux/arc-ui-preact';

function FilterSheet() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>Filters</Button>
      <Sheet heading="Filter Results" side="bottom" open={open} onArcClose={() => setOpen(false)}>
        <div style="display:flex;flex-direction:column;gap:16px;">
          <strong style="font-size:13px;">Status</strong>
          <div style="display:flex;gap:6px;">
            <Chip selected>Active</Chip>
            <Chip>Archived</Chip>
          </div>
        </div>
        <div slot="footer">
          <Button variant="ghost" onClick={() => setOpen(false)}>Reset</Button>
          <Button variant="primary" onClick={() => setOpen(false)}>Apply</Button>
        </div>
      </Sheet>
    </>
  );
}`,
      },
    ],
  };
