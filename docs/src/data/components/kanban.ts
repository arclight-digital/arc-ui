import type { ComponentDef } from './_types';

export const kanban: ComponentDef = {
  name: 'Kanban',
  slug: 'kanban',
  tag: 'arc-kanban',
  tier: 'data',
  interactivity: 'interactive',
  status: 'beta',
  description: 'A drag-and-drop kanban board driven by a `columns` data array. Cards can be dragged between and within columns with the pointer, or moved entirely from the keyboard with live screen-reader announcements. Column limits, tags, and descriptions are supported per card, and every move emits an `arc-card-move` event so the consumer can sync its source of truth.',

  overview: `Kanban renders a horizontally scrolling row of columns from a single \`columns\` array — each column has an id, a title, an optional work-in-progress \`limit\`, and an \`items\` array of cards. Cards show a label, an optional two-line description, and an optional \`arc-tag\` chip. When a column has a limit, the header count renders as \`count/limit\` and switches to the error color when the column is over its limit.

Dragging is pointer-based: press and move a card to lift it into a floating ghost that follows the cursor, with a horizontal indicator line showing exactly where the card will land. Dragging near the left or right edge of the board auto-scrolls it so long boards remain reachable. The component applies the move to its own internal copy immediately for instant feedback and emits \`arc-card-move\` with the card id, source column, target column, and final index — listen to that event to update your actual data store, then pass the new array back in.

The keyboard model follows the accepted accessible kanban pattern: each column's card list is a single tab stop (roving tabindex), ArrowUp/ArrowDown move focus between cards, and ArrowLeft/ArrowRight jump between columns. Enter or Space grabs the focused card, arrows then move it within and across columns, Enter drops it (emitting the same \`arc-card-move\` event), and Escape cancels and returns the card to where it started. Every grab, move, drop, and cancel is announced through a polite live region.`,

  features: [
    'Data-driven: one columns array renders the whole board — no manual markup per card',
    'Pointer drag between and within columns with a floating drag ghost',
    'Horizontal drop indicator line between cards shows the exact insertion point',
    'Automatic horizontal board scrolling when dragging near the edges',
    'Full keyboard move protocol: Enter/Space grabs, arrows move, Enter drops, Escape cancels',
    'One tab stop per column (roving tabindex) — no tab-key marathons through every card',
    'aria-live announcements for every grab, move, drop, and cancel',
    'Optional per-column WIP limit with count/limit badge that turns error-colored when exceeded',
    'Optional card description with a two-line clamp and an arc-tag chip per card',
    'Empty columns render a subtle dashed drop zone that highlights during drag',
    'arc-card-move and arc-card-click events for syncing external state',
    'Styleable via ::part — board, column, column-header, card and more',
  ],

  guidelines: {
    do: [
      'Give every column and card a stable, unique id — moves and rendering are keyed on them',
      'Listen to arc-card-move and update your source-of-truth data, then pass the new array back into columns',
      'Set a limit on columns where work-in-progress caps matter — the badge flags overruns automatically',
      'Keep card labels short and put detail in the description — it clamps to two lines',
      'Use tag variants (primary, success, danger, ...) to encode card category at a glance',
    ],
    dont: [
      'Mutate the columns array in place and expect a re-render — assign a new array instead',
      'Rely on the component as the source of truth — its internal copy is for immediate feedback only',
      'Put interactive controls (buttons, links) inside card labels — the whole card is the drag/keyboard target',
      'Use kanban for a single static list — arc-sortable-list or arc-list is a better fit',
      'Exceed a handful of columns without expecting horizontal scrolling — columns have a fixed 280px width',
    ],
  },

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
    { id: 'd2', label: 'Fix focus trap in modal', tag: 'Bug', variant: 'danger' },
    { id: 'd3', label: 'Ship dark-mode charts', tag: 'Feature', variant: 'success' }
  ]},
  { id: 'done', title: 'Done', items: [
    { id: 'x1', label: 'Set up CI pipeline', tag: 'Infra' }
  ]}
];`,

  props: [
    {
      name: 'columns',
      type: 'Array<{ id, title, limit?, items: Array<{ id, label, description?, tag?, variant? }> }>',
      default: '[]',
      description: 'The data array that drives the board. Each entry becomes a column with a header (title plus count badge) and a list of cards. `limit` renders the count as `count/limit` and turns it error-colored when exceeded. Each card needs a unique `id` and a `label`; `description` renders below the label with a two-line clamp, and `tag` renders an arc-tag chip styled by `variant`. Set via JavaScript — it is not an HTML attribute. The component works on an internal copy for immediate drag feedback; sync your source of truth from `arc-card-move` and assign a new array to re-render.',
    },
    {
      name: 'disabled',
      type: 'boolean',
      default: 'false',
      description: 'Disables all pointer and keyboard interaction and dims the board.',
    },
  ],
  events: [
    { name: 'arc-card-move', description: 'Fired when a card is dropped in a new position (pointer or keyboard). detail: { cardId, fromColumn, toColumn, index } where index is the final position in the target column.' },
    { name: 'arc-card-click', description: 'Fired when a card is clicked without being dragged. detail: { cardId, columnId }.' },
  ],

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
  ],

  seeAlso: ['sortable-list', 'data-table', 'tag'],
};
