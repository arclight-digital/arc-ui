import type { ComponentDef } from './_types';

export const announcement: ComponentDef = {
    name: 'Announcement',
    slug: 'announcement',
    tag: 'arc-announcement',
    tier: 'feedback',
    interactivity: 'static',
    description: 'ARIA live-region wrapper with no visual output. Announces dynamic content changes to screen readers. Zero visual footprint — pure accessibility utility.',

    overview: `Announcement is a pure accessibility utility that creates an ARIA live region for announcing dynamic content changes to screen readers. It has absolutely no visual output — zero width, zero height, and no visible rendering — making it a behind-the-scenes component that exists solely for assistive technology users.

When you set the \`message\` property, the component updates its internal live region and the screen reader announces the new content. The \`politeness\` prop controls the interruption level: \`polite\` waits for the screen reader to finish its current announcement before speaking the new message, while \`assertive\` interrupts immediately for urgent updates.

Use announcement for any dynamic state change that sighted users can perceive visually but screen reader users would otherwise miss: route changes, live search result counts, form submission confirmations, timer updates, or chat message arrivals. Place the component once in your layout and update its message property whenever you need to announce something.`,

    features: [
      'ARIA live region with configurable politeness (polite or assertive)',
      'Zero visual footprint — no width, height, or visible rendering',
      'Set the message property to trigger a screen-reader announcement',
      'Polite mode waits for current speech to finish before announcing',
      'Assertive mode interrupts current speech for urgent updates',
      'Supports dynamic message updates — each change triggers a new announcement',
      'Lightweight — renders a single visually-hidden element',
      'Works with all major screen readers (NVDA, JAWS, VoiceOver, TalkBack)',
    ],

    guidelines: {
      do: [
        'Use announcement for dynamic content changes that screen reader users would otherwise miss',
        'Use polite for non-urgent updates like search result counts or status changes',
        'Use assertive for critical updates like errors, timeouts, or session expiration warnings',
        'Place a single <arc-announcement> in your layout and reuse it for all announcements',
        'Keep messages concise — screen reader users cannot skim long announcements',
      ],
      dont: [
        'Use announcement for content that is already in an ARIA live region (like toast or alert)',
        'Fire rapid successive announcements — screen readers may drop intermediate messages',
        'Use assertive for routine updates — it interrupts the user and should be reserved for urgency',
        'Duplicate announcements that are already handled by native ARIA roles',
        'Use announcement as a substitute for proper labelling and semantic HTML',
      ],
    },

    previewHtml: `<arc-announcement id="demo-announce" politeness="polite"></arc-announcement><arc-button id="demo-announce-btn" variant="secondary">Announce Message</arc-button>`,

    previewSetup: `
      document.getElementById('demo-announce-btn')?.addEventListener('click', () => {
        const el = document.getElementById('demo-announce');
        if (el) el.message = 'New search results loaded: 42 items found.';
      });
    `,

    props: [
      {
        name: 'politeness',
        type: "'polite' | 'assertive'",
        default: "'polite'",
        description: 'Controls the ARIA live region politeness level. Polite waits for the screen reader to finish before announcing; assertive interrupts immediately.',
      },
      {
        name: 'message',
        type: 'string',
        default: "''",
        description: 'The text to announce to screen readers. Each time this property changes, a new announcement is triggered.',
      },
    ],
    events: [],

    tabs: [
      {
        label: 'Web Component',
        lang: 'html',
        code: `<script type="module" src="@arclux/arc-ui"></script>

<arc-announcement id="announcer" politeness="polite"></arc-announcement>

<arc-button onclick="document.getElementById('announcer').message = '42 results found.'">
  Search
</arc-button>`,
      },
      {
        label: 'React',
        lang: 'tsx',
        code: `import { Announcement, Button } from '@arclux/arc-ui-react';
import { useRef } from 'react';

export function SearchDemo() {
  const announcerRef = useRef<HTMLElement>(null);

  const handleSearch = () => {
    // perform search...
    if (announcerRef.current) {
      (announcerRef.current as any).message = '42 results found.';
    }
  };

  return (
    <>
      <Announcement ref={announcerRef} politeness="polite" />
      <Button onClick={handleSearch}>Search</Button>
    </>
  );
}`,
      },
      {
        label: 'Vue',
        lang: 'html',
        code: `<script setup>
import { ref } from 'vue';
import { Announcement, Button } from '@arclux/arc-ui-vue';

const announcer = ref(null);
const handleSearch = () => {
  if (announcer.value) announcer.value.message = '42 results found.';
};
</script>

<template>
  <Announcement ref="announcer" politeness="polite" />
  <Button @click="handleSearch">Search</Button>
</template>`,
      },
      {
        label: 'Svelte',
        lang: 'html',
        code: `<script>
  import { Announcement, Button } from '@arclux/arc-ui-svelte';

  let announcer;
  const handleSearch = () => {
    if (announcer) announcer.message = '42 results found.';
  };
</script>

<Announcement bind:this={announcer} politeness="polite" />
<Button on:click={handleSearch}>Search</Button>`,
      },
      {
        label: 'Angular',
        lang: 'ts',
        code: `import { Component, ViewChild, ElementRef } from '@angular/core';
import { Announcement, Button } from '@arclux/arc-ui-angular';

@Component({
  imports: [Announcement, Button],
  template: \`
    <Announcement #announcer politeness="polite"></Announcement>
    <Button (click)="handleSearch()">Search</Button>
  \`,
})
export class SearchDemoComponent {
  @ViewChild('announcer') announcer!: ElementRef;

  handleSearch() {
    this.announcer.nativeElement.message = '42 results found.';
  }
}`,
      },
      {
        label: 'Solid',
        lang: 'tsx',
        code: `import { Announcement, Button } from '@arclux/arc-ui-solid';

export function SearchDemo() {
  let announcer: HTMLElement | undefined;

  const handleSearch = () => {
    if (announcer) (announcer as any).message = '42 results found.';
  };

  return (
    <>
      <Announcement ref={announcer} politeness="polite" />
      <Button onClick={handleSearch}>Search</Button>
    </>
  );
}`,
      },
      {
        label: 'Preact',
        lang: 'tsx',
        code: `import { Announcement, Button } from '@arclux/arc-ui-preact';
import { useRef } from 'preact/hooks';

export function SearchDemo() {
  const announcerRef = useRef<HTMLElement>(null);

  const handleSearch = () => {
    if (announcerRef.current) {
      (announcerRef.current as any).message = '42 results found.';
    }
  };

  return (
    <>
      <Announcement ref={announcerRef} politeness="polite" />
      <Button onClick={handleSearch}>Search</Button>
    </>
  );
}`,
      },
      {
        label: 'HTML',
        lang: 'html',
        code: `<!-- See HTML tab after running pnpm generate -->
<div class="arc-announcement" aria-live="polite">...</div>`,
      },
      {
        label: 'HTML (Inline)',
        lang: 'html',
        code: `<!-- See HTML (Inline) tab after running pnpm generate -->
<div class="arc-announcement" style="..." aria-live="polite">...</div>`,
      },
    ],

    seeAlso: ['alert'],
};
