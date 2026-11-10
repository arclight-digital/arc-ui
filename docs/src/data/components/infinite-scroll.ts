import type { ComponentDef } from './_types';

export const infiniteScroll: ComponentDef = {
  name: 'Infinite Scroll',
  slug: 'infinite-scroll',
  tag: 'arc-infinite-scroll',
  tier: 'content',
  interactivity: 'interactive',
  description:
    'Container that fires a load event as the reader nears the bottom, with a loading spinner and an end-of-list state.',

  overview: `Infinite Scroll wraps your items and puts an Intersection Observer sentinel after them. When the sentinel comes within \`threshold\` pixels of the bottom of the viewport (200 by default), the component fires \`arc-load-more\`. Fetch the next batch and append it. A larger \`threshold\` asks for the next batch earlier. Changing it on a mounted component takes effect at once, and fires \`arc-load-more\` straight away if the sentinel is already inside the new distance.

Set \`loading\` to \`true\` while you fetch. A spinner shows in the footer, and no further \`arc-load-more\` fires until you set \`loading\` back to \`false\`.

When there's nothing left, set \`finished\` to \`true\`. The observer disconnects and the footer shows "No more items". The container sets \`aria-busy\` while loading. If your items are self-contained entries such as posts, slot them as \`<article>\` elements and add \`role="feed"\` to the component for the ARIA feed pattern.`,

  features: [
    '`disabled` disconnects the observer, blocks pointer events and dims the component to 50% opacity',
    'The observer reconnects when `finished` or `disabled` is set back to false',
  ],

  guidelines: {
    do: [
      'Set `loading` to `true` as soon as you start fetching, and back to `false` when the data arrives',
      'Set `finished` when the API says there are no more pages',
      'Put it inside a scrollable parent, or let the page scroll',
      'Append new items as direct children. They render in the default slot',
    ],
    dont: [
      'Don\'t use it for small, fixed datasets. Use pagination or a plain list',
      'Don\'t put footer content below it without another way to reach it. The footer moves down every time items load',
    ],
  },

  previewHtml: `<arc-infinite-scroll id="demo-infinite" threshold="100" style="max-height:300px; overflow:auto; width:100%;"></arc-infinite-scroll>`,

  previewSetup: `
      var phrases = [
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
        'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.',
        'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum.',
        'Excepteur sint occaecat cupidatat non proident, sunt in culpa.',
        'Nulla facilisi morbi tempus iaculis urna id volutpat lacus.',
        'Viverra accumsan in nisl nisi scelerisque eu ultrices vitae.',
        'Amet consectetur adipiscing elit pellentesque habitant morbi tristique.',
        'Faucibus pulvinar elementum integer enim neque volutpat ac tincidunt.',
        'Pellentesque eu tincidunt tortor aliquam nulla facilisi cras fermentum.',
        'Turpis egestas integer eget aliquet nibh praesent tristique magna.',
        'Quis hendrerit dolor magna eget est lorem ipsum dolor.',
        'Volutpat blandit aliquam etiam erat velit scelerisque in dictum.',
        'Ultrices sagittis orci a scelerisque purus semper eget duis.',
        'Bibendum ut tristique et egestas quis ipsum suspendisse ultrices.',
        'Sagittis id consectetur purus ut faucibus pulvinar elementum integer.',
        'Morbi tincidunt augue interdum velit euismod in pellentesque massa.',
        'Amet risus nullam eget felis eget nunc lobortis mattis.',
        'Egestas fringilla phasellus faucibus scelerisque eleifend donec pretium vulputate.',
        'Consequat nisl vel pretium lectus quam id leo in vitae.'
      ];
      var feed = document.getElementById('demo-infinite');
      var batch = 0;
      var maxBatches = 4;
      function addItems() {
        for (var i = 0; i < 5; i++) {
          var div = document.createElement('div');
          div.style.cssText = 'padding:var(--space-sm) var(--space-md);border-bottom:1px solid var(--border-subtle);font-size:14px;color:var(--text-secondary);line-height:1.6;';
          div.textContent = phrases[Math.floor(Math.random() * phrases.length)];
          feed.appendChild(div);
        }
      }
      addItems();
      feed.addEventListener('arc-load-more', function() {
        feed.loading = true;
        setTimeout(function() {
          batch++;
          addItems();
          feed.loading = false;
          if (batch >= maxBatches) feed.finished = true;
        }, 800);
      });
    `,

  tabs: [
    {
      label: 'Web Component',
      lang: 'html',
      code: `<arc-infinite-scroll id="feed" threshold="200">
  <!-- Items appended here -->
</arc-infinite-scroll>

<script>
  const feed = document.getElementById('feed');
  let page = 1;

  feed.addEventListener('arc-load-more', async () => {
    feed.loading = true;
    const items = await fetchPage(page++);
    items.forEach(item => feed.appendChild(createItemEl(item)));
    feed.loading = false;
    if (!items.length) feed.finished = true;
  });
</script>`,
    },
    {
      label: 'React',
      lang: 'tsx',
      code: `import { InfiniteScroll } from '@arclux/arc-ui-react';

const [items, setItems] = useState(initialItems);
const [loading, setLoading] = useState(false);
const [finished, setFinished] = useState(false);

async function loadMore() {
  setLoading(true);
  const next = await fetchNextPage();
  setItems(prev => [...prev, ...next]);
  setLoading(false);
  if (!next.length) setFinished(true);
}

<InfiniteScroll loading={loading} finished={finished} onArcLoadMore={loadMore}>
  {items.map(item => <div key={item.id}>{item.name}</div>)}
</InfiniteScroll>`,
    },
    {
      label: 'Vue',
      lang: 'html',
      code: `<script setup>
import { ref } from 'vue';
import { InfiniteScroll } from '@arclux/arc-ui-vue';

const items = ref(initialItems);
const loading = ref(false);
const finished = ref(false);

async function loadMore() {
  loading.value = true;
  const next = await fetchNextPage();
  items.value.push(...next);
  loading.value = false;
  if (!next.length) finished.value = true;
}
</script>

<template>
  <InfiniteScroll :loading="loading" :finished="finished" @arc-load-more="loadMore">
    <div v-for="item in items" :key="item.id">{{ item.name }}</div>
  </InfiniteScroll>
</template>`,
    },
    {
      label: 'Svelte',
      lang: 'html',
      code: `<script>
  import { InfiniteScroll } from '@arclux/arc-ui-svelte';

  let items = $state(initialItems);
  let loading = $state(false);
  let finished = $state(false);

  async function loadMore() {
    loading = true;
    const next = await fetchNextPage();
    items = [...items, ...next];
    loading = false;
    if (!next.length) finished = true;
  }
</script>

<InfiniteScroll {loading} {finished} on:arc-load-more={loadMore}>
  {#each items as item (item.id)}
    <div>{item.name}</div>
  {/each}
</InfiniteScroll>`,
    },
    {
      label: 'Angular',
      lang: 'ts',
      code: `import { Component } from '@angular/core';
import { InfiniteScroll } from '@arclux/arc-ui-angular';

@Component({
  imports: [InfiniteScroll],
  template: \`
    <arc-infinite-scroll
      [loading]="loading"
      [finished]="finished"
      (arc-load-more)="loadMore()"
    >
      <div *ngFor="let item of items">{{ item.name }}</div>
    </arc-infinite-scroll>
  \`,
})
export class FeedComponent {
  items = [];
  loading = false;
  finished = false;

  async loadMore() {
    this.loading = true;
    const next = await this.fetchNextPage();
    this.items.push(...next);
    this.loading = false;
    if (!next.length) this.finished = true;
  }
}`,
    },
    {
      label: 'Solid',
      lang: 'tsx',
      code: `import { createSignal, For } from 'solid-js';
import { InfiniteScroll } from '@arclux/arc-ui-solid';

const [items, setItems] = createSignal(initialItems);
const [loading, setLoading] = createSignal(false);
const [finished, setFinished] = createSignal(false);

async function loadMore() {
  setLoading(true);
  const next = await fetchNextPage();
  setItems(prev => [...prev, ...next]);
  setLoading(false);
  if (!next.length) setFinished(true);
}

<InfiniteScroll loading={loading()} finished={finished()} onArcLoadMore={loadMore}>
  <For each={items()}>{item => <div>{item.name}</div>}</For>
</InfiniteScroll>`,
    },
    {
      label: 'Preact',
      lang: 'tsx',
      code: `import { useState } from 'preact/hooks';
import { InfiniteScroll } from '@arclux/arc-ui-preact';

const [items, setItems] = useState(initialItems);
const [loading, setLoading] = useState(false);
const [finished, setFinished] = useState(false);

async function loadMore() {
  setLoading(true);
  const next = await fetchNextPage();
  setItems(prev => [...prev, ...next]);
  setLoading(false);
  if (!next.length) setFinished(true);
}

<InfiniteScroll loading={loading} finished={finished} onArcLoadMore={loadMore}>
  {items.map(item => <div key={item.id}>{item.name}</div>)}
</InfiniteScroll>`,
    },
  ],

  seeAlso: ['pagination', 'scroll-area'],
};
