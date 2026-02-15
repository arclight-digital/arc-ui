import type { ComponentDef } from './_types';

export const virtualList: ComponentDef = {
  name: 'Virtual List',
  slug: 'virtual-list',
  tag: 'arc-virtual-list',
  tier: 'content',
  interactivity: 'interactive',
  description: 'Windowed list that renders only visible items for efficient scrolling through thousands of rows. Fixed item height with configurable overscan.',

  overview: `Virtual List implements windowed rendering for large datasets. Instead of mounting every item in the DOM, it calculates which items are visible based on the scroll position and item height, then renders only those items plus a configurable overscan buffer. This keeps DOM node count constant regardless of list size, enabling smooth 60fps scrolling through tens of thousands of items.

The component uses absolute positioning within a spacer div whose height equals the total list height (\`items.length × itemHeight\`). As the user scrolls, a \`requestAnimationFrame\`-throttled handler recalculates the visible window and repositions rendered items. The overscan prop (default: 5) controls how many extra items are rendered above and below the viewport to prevent flicker during fast scrolling.

Items are rendered via named slots (\`item-0\`, \`item-1\`, etc.), giving you full control over item templates. The \`visibleRange\` getter exposes the current start/end indices for external template rendering loops.`,

  features: [
    'Windowed rendering — only visible items are in the DOM',
    'Handles tens of thousands of items with constant DOM node count',
    'rAF-throttled scroll handler for smooth 60fps performance',
    'Configurable overscan buffer to prevent flicker during fast scrolling',
    'Fixed item height for predictable layout calculations',
    'Named slot pattern for flexible item templates',
    '`visibleRange` getter for external rendering integration',
    'Exposed CSS parts: spacer, item'
  ],

  guidelines: {
    do: [
      'Use for lists with 100+ items where full DOM rendering would cause jank',
      'Set `item-height` to match the actual rendered height of each item',
      'Use overscan of 3-10 items — higher values reduce flicker but increase DOM nodes',
      'Combine with arc-list-item for consistent styling within the virtual container'
    ],
    dont: [
      'Use for short lists under 50 items — the overhead is not worth it',
      'Mix different item heights — virtual-list requires fixed row height',
      'Nest scrollable containers inside virtual-list items',
      'Forget to set a fixed height on the virtual-list host element'
    ],
  },

  previewHtml: `<arc-virtual-list item-height="40" style="height: 200px; width: 100%; border: 1px solid var(--border-default); border-radius: var(--radius-md);" id="vl-demo"></arc-virtual-list>`,

  previewSetup: `{
  const vl = document.getElementById('vl-demo');
  if (!vl) return;

  function syncSlots() {
    const { start, end } = vl.visibleRange;
    for (const child of [...vl.children]) {
      const idx = parseInt(child.slot?.replace('item-', ''), 10);
      if (isNaN(idx) || idx < start || idx >= end) child.remove();
    }
    for (let i = start; i < end; i++) {
      if (!vl.querySelector('[slot="item-' + i + '"]')) {
        const div = document.createElement('div');
        div.slot = 'item-' + i;
        div.style.cssText = 'display:flex;align-items:center;padding:0 16px;height:100%;font-family:var(--font-body);font-size:var(--text-sm);color:var(--text-secondary);border-bottom:1px solid var(--border-subtle);';
        div.textContent = 'Item ' + (i + 1);
        vl.appendChild(div);
      }
    }
  }

  vl.addEventListener('scroll', () => requestAnimationFrame(syncSlots));

  // Wait for element to have layout before setting items
  const ro = new ResizeObserver((entries) => {
    if (entries[0].contentRect.height > 0) {
      ro.disconnect();
      vl.items = Array.from({ length: 1000 }, (_, i) => ({ label: 'Item ' + (i + 1) }));
      vl.updateComplete.then(syncSlots);
    }
  });
  ro.observe(vl);
}`,

  props: [
    { name: 'items', type: 'Array', default: '[]', description: 'The full data array. Only the visible slice is rendered at any given time.' },
    { name: 'item-height', type: 'number', default: '40', description: 'Height in pixels of each item row. Must match the actual rendered height.' },
    { name: 'overscan', type: 'number', default: '5', description: 'Number of extra items to render above and below the visible window to reduce flicker.' }
  ],

  tabs: [
    {
      label: 'Web Component',
      lang: 'html',
      code: `<arc-virtual-list
  id="my-list"
  item-height="48"
  overscan="5"
  style="height: 400px;"
></arc-virtual-list>

<script type="module">
  const vl = document.getElementById('my-list');
  const data = Array.from({ length: 10000 }, (_, i) => \`Row \${i + 1}\`);
  vl.items = data;

  // Sync slotted DOM elements to the visible window
  function syncSlots() {
    const { start, end } = vl.visibleRange;
    // Remove items that scrolled out of view
    for (const child of [...vl.children]) {
      const idx = parseInt(child.slot.replace('item-', ''), 10);
      if (idx < start || idx >= end) child.remove();
    }
    // Add items that scrolled into view
    for (let i = start; i < end; i++) {
      if (!vl.querySelector(\`[slot="item-\${i}"]\`)) {
        const div = document.createElement('div');
        div.slot = \`item-\${i}\`;
        div.textContent = data[i];
        vl.appendChild(div);
      }
    }
  }

  vl.addEventListener('scroll', () => requestAnimationFrame(syncSlots));
  vl.updateComplete.then(syncSlots);
</script>`,
    },
    {
      label: 'React',
      lang: 'tsx',
      code: `import { useRef, useEffect, useCallback } from 'react';
import { VirtualList } from '@arclux/arc-ui-react';

const data = Array.from({ length: 10000 }, (_, i) => \`Row \${i + 1}\`);

function MyVirtualList() {
  const ref = useRef<any>(null);
  const [range, setRange] = useState({ start: 0, end: 20 });

  const onScroll = useCallback(() => {
    const vl = ref.current;
    if (vl) setRange({ ...vl.visibleRange });
  }, []);

  return (
    <VirtualList ref={ref} items={data} item-height={48} style={{ height: '400px' }}
      onScroll={onScroll}>
      {data.slice(range.start, range.end).map((label, i) => (
        <div key={range.start + i} slot={\`item-\${range.start + i}\`}>{label}</div>
      ))}
    </VirtualList>
  );
}`,
    },
    {
      label: 'Vue',
      lang: 'html',
      code: `<script setup>
import { VirtualList } from '@arclux/arc-ui-vue';

const items = Array.from({ length: 10000 }, (_, i) => ({
  id: i,
  name: \`Row \${i + 1}\`,
}));
</script>

<template>
  <VirtualList :items="items" item-height="48" :overscan="5" style="height: 400px" />
</template>`,
    },
    {
      label: 'Svelte',
      lang: 'html',
      code: `<script>
  import { VirtualList } from '@arclux/arc-ui-svelte';

  const items = Array.from({ length: 10000 }, (_, i) => ({
    id: i,
    name: \`Row \${i + 1}\`,
  }));
</script>

<VirtualList {items} item-height={48} overscan={5} style="height: 400px" />`,
    },
    {
      label: 'Angular',
      lang: 'ts',
      code: `import { Component } from '@angular/core';
import { VirtualList } from '@arclux/arc-ui-angular';

@Component({
  imports: [VirtualList],
  template: \`
    <VirtualList [items]="items" item-height="48" [overscan]="5" style="height: 400px" />
  \`,
})
export class LargeListComponent {
  items = Array.from({ length: 10000 }, (_, i) => ({
    id: i,
    name: \`Row \${i + 1}\`,
  }));
}`,
    },
    {
      label: 'Solid',
      lang: 'tsx',
      code: `import { VirtualList } from '@arclux/arc-ui-solid';

const items = Array.from({ length: 10000 }, (_, i) => ({
  id: i,
  name: \`Row \${i + 1}\`,
}));

<VirtualList items={items} item-height={48} overscan={5} style={{ height: '400px' }} />`,
    },
    {
      label: 'Preact',
      lang: 'tsx',
      code: `import { VirtualList } from '@arclux/arc-ui-preact';

const items = Array.from({ length: 10000 }, (_, i) => ({
  id: i,
  name: \`Row \${i + 1}\`,
}));

<VirtualList items={items} item-height={48} overscan={5} style={{ height: '400px' }} />`,
    },
  ],

  seeAlso: ['list', 'data-table', 'infinite-scroll'],
};
