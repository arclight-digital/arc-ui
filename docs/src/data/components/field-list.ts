import type { ComponentDef } from './_types';

export const fieldList: ComponentDef = {
  name: 'Field List',
  slug: 'field-list',
  tag: 'arc-field-list',
  tier: 'input',
  interactivity: 'interactive',
  description: 'A repeating set of form rows the user can add to, remove from and reorder.',

  overview: `FieldList is for a form field that repeats: the options of a poll, the levels of a scale, a list of email addresses. Each row is an \`<arc-field-row>\` holding whatever inputs it needs, with a handle to reorder it and a button to remove it, and the list adds an Add button below.

**Your application owns the rows.** Render them from your own array. The list never adds, removes or moves an element itself: it fires \`arc-add\`, \`arc-remove\` (with the \`index\`) and \`arc-move\` (with \`from\` and \`to\`), and you update your array. Keeping a single copy of the data means nothing can drift out of step. Everything around the data is the list's job: \`min\` and \`max\`, reordering by keyboard (the arrow keys on a row's handle) and by dragging, putting focus back where the user expects after each change, and a spoken confirmation of every change for screen reader users.

The rows are plain light DOM, so their inputs submit with the surrounding form as they are named.`,

  features: [
    'Add, remove and reorder rows of any inputs',
    'Reorder with the arrow keys on a row handle, or by dragging it',
    '`min` and `max`, which disable Remove and Add at the limits',
    "Focus follows the change: into a new row, onto a moved row, onto the row that took a removed one's place",
    'Each change announced in a polite live region; each control named after its row',
    'Your array stays the only copy: the list asks, your code changes it',
  ],

  guidelines: {
    do: [
      'Give the list a `label` and each row a `label` ("Option 2") so controls read as "Remove Option 2"',
      'Update your array on arc-add, arc-remove and arc-move; the rows follow when you re-render',
      'Set `min` to the fewest rows the form can accept, so the last required row cannot be removed',
    ],
    dont: [
      "Do not add, remove or reorder rows in the DOM behind the list's back while a change it asked for is pending",
      'Do not use it for a fixed number of fields; plain inputs are clearer',
    ],
  },

  previewHtml: `<arc-field-list id="fl-demo" label="Options" add-label="Add option" min="2" max="5" style="width: 320px;">
  <arc-field-row label="Option 1"><arc-input label="Option 1" value="Yes"></arc-input></arc-field-row>
  <arc-field-row label="Option 2"><arc-input label="Option 2" value="No"></arc-input></arc-field-row>
</arc-field-list>`,

  previewSetup: `const list = el.querySelector('#fl-demo'); const relabel = () => [...list.children].forEach((row, i) => { row.label = 'Option ' + (i + 1); const input = row.querySelector('arc-input'); if (input) input.label = 'Option ' + (i + 1); }); list.addEventListener('arc-add', () => { const row = document.createElement('arc-field-row'); row.innerHTML = '<arc-input></arc-input>'; list.append(row); relabel(); }); list.addEventListener('arc-remove', (e) => { list.children[e.detail.index]?.remove(); relabel(); }); list.addEventListener('arc-move', (e) => { const rows = [...list.children]; const row = rows[e.detail.from]; rows.splice(e.detail.from, 1); rows.splice(e.detail.to, 0, row); list.append(...rows); relabel(); });`,

  tabs: [
    {
      label: 'Web Component',
      lang: 'html',
      code: `<arc-field-list label="Options" add-label="Add option" min="2" max="6">
  <arc-field-row label="Option 1"><arc-input label="Option 1" name="option" value="Yes"></arc-input></arc-field-row>
  <arc-field-row label="Option 2"><arc-input label="Option 2" name="option" value="No"></arc-input></arc-field-row>
</arc-field-list>

<script>
  // The list asks; your code changes the rows.
  const list = document.querySelector('arc-field-list');
  list.addEventListener('arc-add', () => { /* append a row to your data and re-render */ });
  list.addEventListener('arc-remove', (e) => { /* remove row e.detail.index */ });
  list.addEventListener('arc-move', (e) => { /* move row e.detail.from to e.detail.to */ });
</script>`,
    },
    {
      label: 'React',
      lang: 'tsx',
      code: `import { FieldList, FieldRow, Input } from '@arclux/arc-ui-react';
import { useState } from 'react';

export default function Example() {
  const [options, setOptions] = useState(['Yes', 'No']);
  const move = (from, to) => setOptions((o) => { const n = [...o]; n.splice(to, 0, n.splice(from, 1)[0]); return n; });
  return (
    <FieldList label="Options" addLabel="Add option" min={2} max={6}
      onArcAdd={() => setOptions((o) => [...o, ''])}
      onArcRemove={(e) => setOptions((o) => o.filter((_, i) => i !== e.detail.index))}
      onArcMove={(e) => move(e.detail.from, e.detail.to)}>
      {options.map((value, i) => (
        <FieldRow key={i} label={\`Option \${i + 1}\`}>
          <Input label={\`Option \${i + 1}\`} value={value} name="option" />
        </FieldRow>
      ))}
    </FieldList>
  );
}`,
    },
    {
      label: 'Vue',
      lang: 'html',
      code: `<script setup>
import { ref } from 'vue';
import { FieldList, FieldRow, Input } from '@arclux/arc-ui-vue';

const options = ref(['Yes', 'No']);
function move(from, to) {
  const [row] = options.value.splice(from, 1);
  options.value.splice(to, 0, row);
}
</script>

<template>
  <FieldList label="Options" add-label="Add option" :min="2" :max="6"
    @arc-add="options.push('')"
    @arc-remove="(e) => options.splice(e.detail.index, 1)"
    @arc-move="(e) => move(e.detail.from, e.detail.to)">
    <FieldRow v-for="(value, i) in options" :key="i" :label="\`Option \${i + 1}\`">
      <Input :label="\`Option \${i + 1}\`" :value="value" name="option" />
    </FieldRow>
  </FieldList>
</template>`,
    },
    {
      label: 'Svelte',
      lang: 'html',
      code: `<script>
  import { FieldList, FieldRow, Input } from '@arclux/arc-ui-svelte';
  let options = ['Yes', 'No'];
  function move(from, to) {
    const next = [...options];
    next.splice(to, 0, next.splice(from, 1)[0]);
    options = next;
  }
</script>

<FieldList label="Options" addLabel="Add option" min={2} max={6}
  on:arc-add={() => (options = [...options, ''])}
  on:arc-remove={(e) => (options = options.filter((_, i) => i !== e.detail.index))}
  on:arc-move={(e) => move(e.detail.from, e.detail.to)}>
  {#each options as value, i}
    <FieldRow label={\`Option \${i + 1}\`}>
      <Input label={\`Option \${i + 1}\`} {value} name="option" />
    </FieldRow>
  {/each}
</FieldList>`,
    },
    {
      label: 'Angular',
      lang: 'ts',
      code: `import { Component } from '@angular/core';
import { FieldList, FieldRow, Input } from '@arclux/arc-ui-angular';

@Component({
  imports: [FieldList, FieldRow, Input],
  template: \`
    <arc-field-list label="Options" add-label="Add option" [min]="2" [max]="6"
      (arc-add)="options.push('')"
      (arc-remove)="options.splice($event.detail.index, 1)"
      (arc-move)="move($event.detail.from, $event.detail.to)">
      @for (value of options; track $index) {
        <arc-field-row [label]="'Option ' + ($index + 1)">
          <arc-input [label]="'Option ' + ($index + 1)" [value]="value" name="option"></arc-input>
        </arc-field-row>
      }
    </arc-field-list>
  \`,
})
export class MyComponent {
  options = ['Yes', 'No'];
  move(from: number, to: number) {
    const [row] = this.options.splice(from, 1);
    this.options.splice(to, 0, row);
  }
}`,
    },
    {
      label: 'Solid',
      lang: 'tsx',
      code: `import { FieldList, FieldRow, Input } from '@arclux/arc-ui-solid';
import { createSignal, For } from 'solid-js';

export default function Example() {
  const [options, setOptions] = createSignal(['Yes', 'No']);
  const move = (from, to) => setOptions((o) => { const n = [...o]; n.splice(to, 0, n.splice(from, 1)[0]); return n; });
  return (
    <FieldList label="Options" addLabel="Add option" min={2} max={6}
      onArcAdd={() => setOptions((o) => [...o, ''])}
      onArcRemove={(e) => setOptions((o) => o.filter((_, i) => i !== e.detail.index))}
      onArcMove={(e) => move(e.detail.from, e.detail.to)}>
      <For each={options()}>{(value, i) => (
        <FieldRow label={\`Option \${i() + 1}\`}>
          <Input label={\`Option \${i() + 1}\`} value={value} name="option" />
        </FieldRow>
      )}</For>
    </FieldList>
  );
}`,
    },
    {
      label: 'Preact',
      lang: 'tsx',
      code: `import { FieldList, FieldRow, Input } from '@arclux/arc-ui-preact';
import { useState } from 'preact/hooks';

export default function Example() {
  const [options, setOptions] = useState(['Yes', 'No']);
  const move = (from, to) => setOptions((o) => { const n = [...o]; n.splice(to, 0, n.splice(from, 1)[0]); return n; });
  return (
    <FieldList label="Options" addLabel="Add option" min={2} max={6}
      onArcAdd={() => setOptions((o) => [...o, ''])}
      onArcRemove={(e) => setOptions((o) => o.filter((_, i) => i !== e.detail.index))}
      onArcMove={(e) => move(e.detail.from, e.detail.to)}>
      {options.map((value, i) => (
        <FieldRow key={i} label={\`Option \${i + 1}\`}>
          <Input label={\`Option \${i + 1}\`} value={value} name="option" />
        </FieldRow>
      ))}
    </FieldList>
  );
}`,
    },
  ],

  subComponents: [
    {
      name: 'FieldRow',
      tag: 'arc-field-row',
      description:
        'One row: your inputs, with a handle to reorder the row and a button to remove it.',
    },
  ],

  seeAlso: ['sortable-list', 'form', 'input'],
};
