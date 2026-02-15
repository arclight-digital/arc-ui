import type { ComponentDef } from './_types';

export const infiniteScroll: ComponentDef = {
    name: 'Infinite Scroll',
    slug: 'infinite-scroll',
    tag: 'arc-infinite-scroll',
    tier: 'content',
    interactivity: 'interactive',
    description: 'Intersection Observer-powered container that fires a load event when the user scrolls near the bottom, with built-in loading spinner and end-of-list state.',

    overview: `Infinite Scroll wraps your content in a feed container and watches for when the user approaches the bottom using an Intersection Observer sentinel element. When the sentinel enters the viewport (plus a configurable \`threshold\` margin), the component fires an \`arc-load-more\` event, signalling your application to fetch and append the next batch of items. This eliminates the need for manual scroll listeners or pagination button clicks.

While data is being fetched, set the \`loading\` prop to \`true\` to display a centered spinner in the footer area. The component automatically suppresses additional \`arc-load-more\` events while loading is active, preventing duplicate fetch requests. Once your data arrives, reset \`loading\` to \`false\` and the sentinel resumes observation.

When all data has been loaded, set the \`finished\` prop to \`true\`. The sentinel is removed and replaced with a "No more items" text indicator, and the Intersection Observer is disconnected. The container uses \`role="feed"\` and \`aria-busy\` to communicate loading state to assistive technologies, ensuring the infinite scrolling pattern remains accessible.`,

    features: [
      'Intersection Observer-based sentinel that fires `arc-load-more` when the user nears the content bottom',
      'Configurable `threshold` prop (in pixels) to control how far in advance the load event triggers',
      'Built-in `arc-spinner` displayed in the footer when `loading` is `true`',
      'Automatic suppression of duplicate load events while loading is in progress',
      'End-of-list state via `finished` prop -- removes the sentinel and shows "No more items" text',
      'ARIA `role="feed"` and `aria-busy` for accessible loading communication',
      'Observer automatically disconnects and reconnects when `finished` or `disabled` change',
      'Disabled state at 40% opacity with pointer events blocked'
    ],

    guidelines: {
      do: [
        'Set `loading` to `true` immediately when you begin fetching data, and reset it to `false` when data arrives',
        'Set `finished` to `true` when the API indicates no more pages remain, so the observer disconnects',
        'Use a reasonable `threshold` (100-300px) so content loads before users hit the bottom and see a gap',
        'Place Infinite Scroll inside a scrollable parent or let the page itself be the scroll container',
        'Append new items as direct children of the component -- they render in the default slot'
      ],
      dont: [
        'Do not leave `loading` as `true` indefinitely -- this blocks further load events and leaves the spinner visible',
        'Do not use Infinite Scroll for small, fixed datasets -- standard pagination or a simple list is more appropriate',
        'Do not set `threshold` to 0 -- the user will see a flash of empty space before content loads',
        'Do not nest multiple Infinite Scroll components -- their observers may conflict',
        'Avoid using Infinite Scroll without providing a way to reach footer content, since it pushes the footer down continuously'
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

    props: [
      { name: 'threshold', type: 'number', default: '200', description: 'Distance in pixels from the bottom of the content at which `arc-load-more` fires. Controls how eagerly new data is requested.' },
      { name: 'loading', type: 'boolean', default: 'false', description: 'When true, displays a spinner in the footer and suppresses additional `arc-load-more` events.' },
      { name: 'finished', type: 'boolean', default: 'false', description: 'When true, disconnects the observer and displays "No more items" text in the footer.' },
      { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables the component, disconnects the observer, and reduces opacity to 40%.' }
    ],
    events: [
      { name: 'arc-load-more', description: 'Fired when the scroll sentinel enters the viewport, signaling more content should load' }
    ],
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
    <InfiniteScroll
      [loading]="loading"
      [finished]="finished"
      (arc-load-more)="loadMore()"
    >
      <div *ngFor="let item of items">{{ item.name }}</div>
    </InfiniteScroll>
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
      }
    ],
  
  seeAlso: ["pagination","scroll-area"],
};
