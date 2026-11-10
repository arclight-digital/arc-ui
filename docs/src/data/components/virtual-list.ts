import type { ComponentDef } from './_types';

export const virtualList: ComponentDef = {
  name: 'Virtual List',
  slug: 'virtual-list',
  tag: 'arc-virtual-list',
  tier: 'content',
  interactivity: 'interactive',
  description: 'A scrolling list of fixed-height rows that renders only the rows on screen.',

  overview: `VirtualList renders only the rows on screen. A spacer stands in for the full list height (\`items.length × itemHeight\`), so the scrollbar behaves as if every row existed, while the DOM holds one screenful plus an \`overscan\` buffer. Scroll handling is throttled with \`requestAnimationFrame\`, and the number of DOM nodes stays the same however long the array is. The tests run it with 10,000 rows.

In plain JS, HTML or Lit, give it a \`renderItem\` callback. It's called only for rows on screen and can return anything Lit can render, such as a template, a DOM node or a string.

\`\`\`js
list.items = data;
list.renderItem = (item, index) => \`\${index + 1}. \${item.name}\`;
\`\`\`

In a framework, use the wrapper's own idiom: a \`renderItem\` prop in React, Preact and Solid, a \`row\` scoped slot in Vue, a \`row\` snippet in Svelte, and a \`rowTemplate\` in Angular. Each of these wrappers listens for \`arc-range-change\`, tracks the visible range and renders exactly those rows as your framework's own elements.

Working with the element directly, you can also drive it yourself. It renders an \`item-N\` slot for each index in the visible range and fires \`arc-range-change\` with \`{ start, end }\` (\`end\` exclusive) when the range changes, at most once per animation frame. \`visibleRange\` returns the same values on demand, and \`scrollToIndex(n)\` jumps to a row. An index past the end is clamped and scrolls to the last row.`,

  features: [
    'All rows share one height, `item-height` (40px by default)',
    '`overscan` (5 by default) sets how many extra rows render above and below the window, to cover fast scrolling',
  ],

  guidelines: {
    do: [
      'Use it for lists of 100 or more items, where rendering every row would make scrolling stutter',
      'Set `item-height` to the height each row actually renders at',
      'Keep `overscan` between 3 and 10. More rows cut flicker but add DOM nodes',
      'Use arc-list-item inside rows to match the styling of List',
      'Set `items` as a property. A JSON attribute also works, but it puts the whole array in your markup',
    ],
    dont: [
      "Don't use it for lists under 50 items. It isn't worth the overhead",
      "Don't mix row heights. Every row must be `item-height` tall",
      "Don't put scrollable containers inside rows",
      "Don't leave the host without a fixed height",
      "Don't put all the items in the light DOM and let the component hide them. That's the cost this component exists to avoid",
    ],
  },

  previewHtml: `<arc-virtual-list item-height="40" style="height: 200px; width: 100%; border: 1px solid var(--border-default); border-radius: var(--radius-md);" id="vl-demo"></arc-virtual-list>`,

  previewSetup: `{
  const vl = document.getElementById('vl-demo');
  if (!vl) return;

  const rowStyle = 'display:flex;align-items:center;padding:0 16px;height:100%;font-family:var(--font-body);font-size:var(--text-sm);color:var(--text-secondary);border-bottom:1px solid var(--border-subtle);';

  vl.renderItem = (item) => {
    const div = document.createElement('div');
    div.style.cssText = rowStyle;
    div.textContent = item.label;
    return div;
  };

  // Wait for the element to have layout before setting items
  const ro = new ResizeObserver((entries) => {
    if (entries[0].contentRect.height > 0) {
      ro.disconnect();
      vl.items = Array.from({ length: 1000 }, (_, i) => ({ label: 'Item ' + (i + 1) }));
    }
  });
  ro.observe(vl);
}`,

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

  // Both are properties, not attributes: an array and a function
  // cannot survive being stringified into markup.
  vl.items = Array.from({ length: 10000 }, (_, i) => \`Row \${i + 1}\`);
  vl.renderItem = (item, index) => {
    const div = document.createElement('div');
    div.textContent = \`\${index + 1}. \${item}\`;
    return div;
  };
</script>`,
    },
    {
      label: 'React',
      lang: 'tsx',
      code: `import { VirtualList } from '@arclux/arc-ui-react';

const data = Array.from({ length: 10000 }, (_, i) => ({ name: \`Row \${i + 1}\` }));

function MyVirtualList() {
  return (
    <VirtualList
      items={data}
      itemHeight={48}
      overscan={5}
      style={{ height: '400px' }}
      renderItem={(item, index) => (
        <div className="row">{index + 1}. {item.name}</div>
      )}
    />
  );
}

// renderItem is called only for rows on screen. The wrapper tracks the
// visible range itself, so these are real React elements — hooks, context
// and event handlers all work as they would anywhere else.`,
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
  <!-- Rows come from the \`row\` scoped slot, instantiated only when visible -->
  <VirtualList :items="items" :item-height="48" :overscan="5" style="height: 400px">
    <template #row="{ item, index }">
      <div class="row">{{ index + 1 }}. {{ item.name }}</div>
    </template>
  </VirtualList>
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

<!-- Rows come from the \`row\` snippet, rendered only when visible -->
<VirtualList {items} itemHeight={48} overscan={5} style="height: 400px">
  {#snippet row(item, index)}
    <div class="row">{index + 1}. {item.name}</div>
  {/snippet}
</VirtualList>`,
    },
    {
      label: 'Angular',
      lang: 'ts',
      code: `import { Component } from '@angular/core';
import { VirtualList } from '@arclux/arc-ui-angular';

@Component({
  imports: [VirtualList],
  template: \`
    <arc-virtual-list
      [items]="items"
      [itemHeight]="48"
      [overscan]="5"
      [rowTemplate]="row"
      style="height: 400px"
    >
      <!-- Instantiated only for rows on screen -->
      <ng-template #row let-item let-i="index">
        <div class="row">{{ i + 1 }}. {{ item.name }}</div>
      </ng-template>
    </arc-virtual-list>
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

<VirtualList
  items={items}
  itemHeight={48}
  overscan={5}
  style={{ height: '400px' }}
  renderItem={(item, index) => <div class="row">{index + 1}. {item.name}</div>}
/>`,
    },
    {
      label: 'Preact',
      lang: 'tsx',
      code: `import { VirtualList } from '@arclux/arc-ui-preact';

const items = Array.from({ length: 10000 }, (_, i) => ({
  id: i,
  name: \`Row \${i + 1}\`,
}));

<VirtualList
  items={items}
  itemHeight={48}
  overscan={5}
  style={{ height: '400px' }}
  renderItem={(item, index) => <div class="row">{index + 1}. {item.name}</div>}
/>`,
    },
  ],

  seeAlso: ['list', 'data-grid', 'infinite-scroll'],
};
