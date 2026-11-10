import type { ComponentDef } from './_types';

export const kanban: ComponentDef = {
  name: 'Kanban',
  slug: 'kanban',
  tag: 'arc-kanban',
  tier: 'data',
  interactivity: 'interactive',
  description:
    'Drag-and-drop board of columns and cards, driven by a `columns` array. Cards move by pointer or keyboard, and each move fires `arc-card-move`.',

  overview: `Kanban renders a horizontally scrolling row of columns from one \`columns\` array. Each column has an id, a title, an optional work-in-progress \`limit\` and an \`items\` array of cards. Each card has a label, and optionally a description and an \`arc-tag\` chip.

Drag a card with the pointer and a floating ghost follows the cursor, with a line marking where it will land. Dragging near the left or right edge scrolls the board. The board moves the card in its own internal copy straight away and fires \`arc-card-move\` with the card id, source column, target column and final index. Listen for it, update your data, then pass the new array back in.

From the keyboard, each column's card list is one tab stop. ArrowUp and ArrowDown move between cards, and ArrowLeft and ArrowRight move between columns. Enter or Space grabs the focused card, the arrows move it, Enter drops it (firing the same \`arc-card-move\`) and Escape puts it back. A polite live region announces every grab, move, drop and cancel.`,

  features: [
    'With a `limit`, the column header shows `count/limit` and turns error-colored when the column is over it',
    'Card descriptions clamp to two lines',
    'An empty column shows a dashed drop zone that highlights during a drag',
    '`arc-card-click` fires when a card is clicked without being dragged',
  ],

  guidelines: {
    do: [
      'Give every column and card a stable, unique id. Rendering and moves are keyed on it',
      'Set a `limit` on columns that have a work-in-progress cap',
      'Keep card labels short and put detail in the description',
      'Use tag variants (primary, success, error and so on) to show a card\'s category',
    ],
    dont: [
      'Don\'t mutate the `columns` array in place. Assign a new array to re-render',
      'Don\'t use it for a single list. Use arc-sortable-list or arc-list',
      'Don\'t expect many columns to fit without horizontal scrolling. Each one is a fixed 280px wide',
    ],
  },

  previewLayout: 'scroll',
  previewHtml: `<div style="width:100%">
  <arc-kanban id="demo-kanban-preview"></arc-kanban>
</div>`,

  previewSetup: `const kb = el.querySelector('#demo-kanban-preview');
if (kb) kb.columns = [
  { id: 'todo', title: 'To Do', items: [
    { id: 't1', label: 'Design onboarding flow', description: 'Draft wireframes for the first-run experience and empty states.', tag: 'Design', variant: 'secondary' },
    { id: 't2', label: 'Audit color tokens' },
    { id: 't3', label: 'Write migration guide', tag: 'Docs' }
  ]},
  { id: 'doing', title: 'In Progress', limit: 2, items: [
    { id: 'd1', label: 'Refactor auth middleware', description: 'Split session handling out of the request pipeline.', tag: 'Backend', variant: 'primary' },
    { id: 'd2', label: 'Fix focus trap in modal', tag: 'Bug', variant: 'error' },
    { id: 'd3', label: 'Ship dark-mode charts', tag: 'Feature', variant: 'success' }
  ]},
  { id: 'done', title: 'Done', items: [
    { id: 'x1', label: 'Set up CI pipeline', tag: 'Infra' }
  ]}
];`,

  tabs: [
    {
      label: 'Web Component',
      lang: 'html',
      code: `<arc-kanban id="board"></arc-kanban>

<script type="module">
  import '@arclux/arc-ui/kanban';

  const board = document.querySelector('#board');
  let columns = [
    { id: 'todo', title: 'To Do', items: [
      { id: 't1', label: 'Design onboarding flow', description: 'Draft wireframes for the first-run experience.', tag: 'Design', variant: 'secondary' },
      { id: 't2', label: 'Audit color tokens' }
    ]},
    { id: 'doing', title: 'In Progress', limit: 2, items: [
      { id: 'd1', label: 'Refactor auth middleware', tag: 'Backend', variant: 'primary' }
    ]},
    { id: 'done', title: 'Done', items: [
      { id: 'x1', label: 'Set up CI pipeline', tag: 'Infra' }
    ]}
  ];
  board.columns = columns;

  // Sync the source of truth from move events
  board.addEventListener('arc-card-move', (e) => {
    const { cardId, fromColumn, toColumn, index } = e.detail;
    columns = moveCard(columns, cardId, fromColumn, toColumn, index);
  });
</script>`,
    },
    {
      label: 'React',
      lang: 'tsx',
      code: `import { useState } from 'react';
import { Kanban } from '@arclux/arc-ui-react';

const initial = [
  { id: 'todo', title: 'To Do', items: [
    { id: 't1', label: 'Design onboarding flow', description: 'Draft wireframes for the first-run experience.', tag: 'Design', variant: 'secondary' },
    { id: 't2', label: 'Audit color tokens' }
  ]},
  { id: 'doing', title: 'In Progress', limit: 2, items: [
    { id: 'd1', label: 'Refactor auth middleware', tag: 'Backend', variant: 'primary' }
  ]},
  { id: 'done', title: 'Done', items: [
    { id: 'x1', label: 'Set up CI pipeline', tag: 'Infra' }
  ]}
];

export function Board() {
  const [columns, setColumns] = useState(initial);

  return (
    <Kanban
      columns={columns}
      onArcCardMove={(e) => {
        const { cardId, fromColumn, toColumn, index } = e.detail;
        setColumns((cols) => moveCard(cols, cardId, fromColumn, toColumn, index));
      }}
      onArcCardClick={(e) => openCardDetail(e.detail.cardId)}
    />
  );
}`,
    },
    {
      label: 'Vue',
      lang: 'html',
      code: `<script setup>
import { ref } from 'vue';
import { Kanban } from '@arclux/arc-ui-vue';

const columns = ref([
  { id: 'todo', title: 'To Do', items: [
    { id: 't1', label: 'Design onboarding flow', tag: 'Design', variant: 'secondary' }
  ]},
  { id: 'doing', title: 'In Progress', limit: 2, items: [
    { id: 'd1', label: 'Refactor auth middleware', tag: 'Backend', variant: 'primary' }
  ]},
  { id: 'done', title: 'Done', items: [] }
]);

function onMove(e) {
  const { cardId, fromColumn, toColumn, index } = e.detail;
  columns.value = moveCard(columns.value, cardId, fromColumn, toColumn, index);
}
</script>

<template>
  <Kanban :columns="columns" @arc-card-move="onMove" />
</template>`,
    },
    {
      label: 'Svelte',
      lang: 'html',
      code: `<script>
  import { Kanban } from '@arclux/arc-ui-svelte';

  let columns = [
    { id: 'todo', title: 'To Do', items: [
      { id: 't1', label: 'Design onboarding flow', tag: 'Design', variant: 'secondary' }
    ]},
    { id: 'doing', title: 'In Progress', limit: 2, items: [
      { id: 'd1', label: 'Refactor auth middleware', tag: 'Backend', variant: 'primary' }
    ]},
    { id: 'done', title: 'Done', items: [] }
  ];

  function onMove(e) {
    const { cardId, fromColumn, toColumn, index } = e.detail;
    columns = moveCard(columns, cardId, fromColumn, toColumn, index);
  }
</script>

<Kanban {columns} on:arc-card-move={onMove} />`,
    },
    {
      label: 'Angular',
      lang: 'ts',
      code: `import { Component } from '@angular/core';
import { Kanban } from '@arclux/arc-ui-angular';

@Component({
  imports: [Kanban],
  template: \`
    <arc-kanban [columns]="columns" (arcCardMove)="onMove($event)"></arc-kanban>
  \`,
})
export class BoardComponent {
  columns = [
    { id: 'todo', title: 'To Do', items: [
      { id: 't1', label: 'Design onboarding flow', tag: 'Design', variant: 'secondary' }
    ]},
    { id: 'doing', title: 'In Progress', limit: 2, items: [
      { id: 'd1', label: 'Refactor auth middleware', tag: 'Backend', variant: 'primary' }
    ]},
    { id: 'done', title: 'Done', items: [] }
  ];

  onMove(e: CustomEvent) {
    const { cardId, fromColumn, toColumn, index } = e.detail;
    this.columns = moveCard(this.columns, cardId, fromColumn, toColumn, index);
  }
}`,
    },
  ],

  seeAlso: ['sortable-list', 'data-grid', 'tag'],
};
