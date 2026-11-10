import type { ComponentDef } from './_types';

export const sheet: ComponentDef = {
  name: 'Sheet',
  slug: 'sheet',
  tag: 'arc-sheet',
  tier: 'feedback',
  interactivity: 'interactive',
  description:
    'A panel that slides in from the bottom or right edge of the screen over a blurred backdrop.',

  overview: `Sheet slides a panel in from the bottom (the default) or the right edge, set with \`side\`. Use it for filters, a detail view or a short form that doesn't need its own page. The bottom sheet has a drag-handle bar at the top. The right sheet doesn't.

The panel has a header row with the \`heading\` and a close button, a body that scrolls when its content is long, and a footer row below it for action buttons. The \`header\` slot replaces the heading, and the \`footer\` slot holds the buttons.

By default the sheet is modal. A backdrop with a 4px blur covers the page, and clicking it closes the sheet. The page behind is scroll-locked, focus moves to the close button, and Escape closes it. \`arc-open\` fires when the sheet opens and \`arc-close\` when it closes, so you can keep your own state in step.`,

  features: [
    '`snap-points` for a bottom sheet that rests at several heights (a peek strip and a full view): drag the handle between them, or step with the arrow keys',
    '`no-modal` for a sheet that floats over a page that stays usable: no backdrop, no scroll lock, and focus stays where it was',
  ],

  guidelines: {
    do: [
      'Use the bottom sheet for filters or share menus on a phone',
      'Use the right sheet for detail panes, settings forms or property inspectors on a desktop',
      'Set `heading`. It\'s also the panel\'s `aria-label`, so screen readers announce it',
      'Put the primary and secondary actions in the `footer` slot',
    ],
    dont: [
      'Don\'t use it for a quick confirmation or a status message. Use Confirm or Toast',
      'Don\'t put navigation people need in a sheet. It can be dismissed, so keep its content optional',
      'Don\'t put a long, complex form in a sheet. Give it a page',
    ],
  },

  previewHtml: `<div style="display:flex;gap:var(--space-sm);">
  <arc-button id="open-bottom-sheet" variant="secondary">Filters</arc-button>
  <arc-button id="open-right-sheet" variant="secondary">Details</arc-button>
  <arc-button id="open-peek-sheet" variant="secondary">Peek</arc-button>
</div>
<arc-sheet id="demo-bottom-sheet" heading="Filter results" side="bottom">
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
    <arc-button id="apply-filters" variant="primary">Apply filters</arc-button>
  </div>
</arc-sheet>
<arc-sheet id="demo-right-sheet" heading="Project details" side="right">
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
    <arc-button variant="primary">Open project</arc-button>
  </div>
</arc-sheet>
<arc-sheet id="demo-peek-sheet" heading="Now playing" no-modal snap-points="140px, 70dvh">
  <p style="margin:0;">Drag the handle, or focus it and use the arrow keys. The page behind stays usable.</p>
</arc-sheet>`,

  previewSetup: `const bottomBtn = el.querySelector('#open-bottom-sheet'); const rightBtn = el.querySelector('#open-right-sheet'); const bottomSheet = el.querySelector('#demo-bottom-sheet'); const rightSheet = el.querySelector('#demo-right-sheet'); const peekSheet = el.querySelector('#demo-peek-sheet'); bottomBtn?.addEventListener('click', () => { if (bottomSheet) bottomSheet.open = true; }); rightBtn?.addEventListener('click', () => { if (rightSheet) rightSheet.open = true; }); el.querySelector('#open-peek-sheet')?.addEventListener('click', () => { if (peekSheet) peekSheet.open = !peekSheet.open; }); el.querySelector('#reset-filters')?.addEventListener('click', () => { if (bottomSheet) bottomSheet.open = false; }); el.querySelector('#apply-filters')?.addEventListener('click', () => { if (bottomSheet) bottomSheet.open = false; });`,

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
    <arc-button variant="secondary" (click)="filtersOpen = true">Filters</arc-button>
    <arc-sheet heading="Filter Results" side="bottom" [open]="filtersOpen" (arcClose)="filtersOpen = false">
      <div style="display:flex;flex-direction:column;gap:16px;">
        <strong style="font-size:13px;">Status</strong>
        <div style="display:flex;gap:6px;">
          <arc-chip [selected]="true">Active</arc-chip>
          <arc-chip>Archived</arc-chip>
        </div>
      </div>
      <div slot="footer">
        <arc-button variant="ghost" (click)="filtersOpen = false">Reset</arc-button>
        <arc-button variant="primary" (click)="filtersOpen = false">Apply</arc-button>
      </div>
    </arc-sheet>
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

  seeAlso: ['drawer', 'dialog', 'sidebar'],
};
