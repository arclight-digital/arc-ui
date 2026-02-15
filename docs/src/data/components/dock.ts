import type { ComponentDef } from './_types';

export const dock: ComponentDef = {
    name: 'Dock',
    slug: 'dock',
    tag: 'arc-dock',
    tier: 'layout',
    interactivity: 'interactive',
    description: 'Edge-snapped auto-hide panel with a 1px border edge line and subtle accent glow on hover-reveal. Slides in with spring easing.',

    overview: `Dock is a fixed-position panel that snaps to an edge of the viewport and auto-hides when not in use. When the user hovers near the edge, the dock reveals itself with a subtle accent-primary glow and a smooth spring easing animation, providing quick access to persistent controls without permanently consuming screen real estate.

The component draws a 1px border-surface edge line along its snapped edge, giving users a visible affordance that something is tucked away. On hover-reveal, the panel slides into view with a spring-eased transform, and the edge line transitions to an accent-primary glow that reinforces the design system's color language. Body scroll is preserved while the dock is visible — unlike drawers or modals, the dock is a non-blocking overlay.

Common use cases include persistent media control bars at the bottom of a music or video application, developer tools panels that slide up from the bottom edge, and secondary toolbars pinned to the left or right side of a canvas-based editor. Use Dock when controls should be instantly accessible but not permanently visible; use Toolbar for always-visible command bars, and Drawer for full off-canvas panels.`,

    features: [
      'Edge-snapped positioning to bottom, left, or right viewport edges',
      'Auto-hide behavior with hover-reveal for non-intrusive persistent access',
      '1px border-surface edge line as a visible affordance when hidden',
      'Accent-primary glow effect on reveal for visual emphasis',
      'Spring easing animation for natural, responsive slide-in/slide-out',
      'Configurable position prop to target different viewport edges',
      'Body scroll preserved — non-blocking overlay that does not lock interaction',
      'Fires arc-open and arc-close events for state synchronization',
      'CSS part: `dock` for targeted ::part() styling',
      'Accessible with appropriate ARIA attributes for toolbar semantics',
    ],

    guidelines: {
      do: [
        'Use for persistent toolbars like media controls that should be accessible but not always visible',
        'Use position="bottom" for media players, status bars, and quick-action toolbars',
        'Use position="left" or position="right" for canvas-based editor tool palettes',
        'Keep dock content concise — icon buttons and compact controls work best',
        'Listen for arc-open and arc-close events to synchronize application state',
        'Combine with IconButton components for a compact, icon-driven toolbar',
      ],
      dont: [
        'Do not put large forms or lengthy content inside a Dock — use Drawer instead',
        'Do not use Dock for navigation menus — use Sidebar or Drawer',
        'Do not disable auto-hide if the dock contains primary page actions that need constant visibility — use Toolbar instead',
        'Do not nest multiple Docks on the same edge',
        'Do not place Dock content that requires scrolling — keep it single-row or single-column',
        'Do not rely solely on auto-hide for critical actions — ensure keyboard accessibility',
      ],
    },

    previewHtml: `<div style="position:relative;width:100%;height:200px;border:1px solid var(--border-subtle);border-radius:var(--radius-md);overflow:hidden;background:var(--bg-surface)">
  <div style="padding:var(--space-md);text-align:center;color:var(--text-muted);font-size:13px;font-family:var(--font-body)">
    Page content area
  </div>
  <div style="position:absolute;bottom:0;left:0;right:0;display:flex;align-items:center;justify-content:center;gap:var(--space-sm);padding:var(--space-sm) var(--space-md);background:var(--bg-elevated);backdrop-filter:blur(12px);border-top:1px solid var(--border-subtle);box-shadow:0 0 12px rgba(var(--accent-primary-rgb),0.15)">
    <arc-icon-button name="skip-back" label="Previous"></arc-icon-button>
    <arc-icon-button name="play" label="Play"></arc-icon-button>
    <arc-icon-button name="skip-forward" label="Next"></arc-icon-button>
    <arc-separator orientation="vertical" style="height:20px"></arc-separator>
    <arc-icon-button name="speaker-high" label="Volume"></arc-icon-button>
    <arc-icon-button name="corners-out" label="Fullscreen"></arc-icon-button>
  </div>
</div>`,

    props: [
      { name: 'position', type: "'bottom' | 'left' | 'right'", default: "'bottom'", description: 'Which viewport edge the dock snaps to. Bottom is the most common for media controls and action bars; left and right are suited for tool palettes in canvas editors.' },
      { name: 'auto-hide', type: 'boolean', default: 'true', description: 'When true, the dock hides itself when the cursor moves away from the edge and reveals on hover. Set to false to keep the dock permanently visible.' },
      { name: 'open', type: 'boolean', default: 'false', description: 'Controls the visible state of the dock programmatically. When auto-hide is true, this reflects the current hover-reveal state; when auto-hide is false, use this to toggle visibility manually.' },
    ],
    events: [
      { name: 'arc-open', description: 'Fired when the dock becomes visible, either via hover-reveal or programmatic open.' },
      { name: 'arc-close', description: 'Fired when the dock hides, either because the cursor left the edge area or the open prop was set to false.' },
    ],

    tabs: [
      {
        label: 'Web Component',
        lang: 'html',
        code: `<arc-dock position="bottom">
  <arc-icon-button name="skip-back" label="Previous"></arc-icon-button>
  <arc-icon-button name="play" label="Play"></arc-icon-button>
  <arc-icon-button name="skip-forward" label="Next"></arc-icon-button>
  <arc-icon-button name="speaker-high" label="Volume"></arc-icon-button>
</arc-dock>

<script>
  const dock = document.querySelector('arc-dock');
  dock.addEventListener('arc-open', () => console.log('Dock revealed'));
  dock.addEventListener('arc-close', () => console.log('Dock hidden'));
</script>`,
      },
      {
        label: 'React',
        lang: 'tsx',
        code: `import { Dock, IconButton } from '@arclux/arc-ui-react';

function MediaControls() {
  return (
    <Dock position="bottom" onArcOpen={() => console.log('open')} onArcClose={() => console.log('close')}>
      <IconButton icon="skip-back" label="Previous" />
      <IconButton icon="play" label="Play" />
      <IconButton icon="skip-forward" label="Next" />
      <IconButton icon="volume-2" label="Volume" />
    </Dock>
  );
}`,
      },
      {
        label: 'Vue',
        lang: 'html',
        code: `<script setup>
import { Dock, IconButton } from '@arclux/arc-ui-vue';
</script>

<template>
  <Dock position="bottom" @arc-open="console.log('open')" @arc-close="console.log('close')">
    <IconButton icon="skip-back" label="Previous" />
    <IconButton icon="play" label="Play" />
    <IconButton icon="skip-forward" label="Next" />
    <IconButton icon="volume-2" label="Volume" />
  </Dock>
</template>`,
      },
      {
        label: 'Svelte',
        lang: 'html',
        code: `<script>
  import { Dock, IconButton } from '@arclux/arc-ui-svelte';
</script>

<Dock position="bottom" on:arc-open={() => console.log('open')} on:arc-close={() => console.log('close')}>
  <IconButton icon="skip-back" label="Previous" />
  <IconButton icon="play" label="Play" />
  <IconButton icon="skip-forward" label="Next" />
  <IconButton icon="volume-2" label="Volume" />
</Dock>`,
      },
      {
        label: 'Angular',
        lang: 'ts',
        code: `import { Component } from '@angular/core';
import { Dock, IconButton } from '@arclux/arc-ui-angular';

@Component({
  imports: [Dock, IconButton],
  template: \`
    <Dock position="bottom" (arcOpen)="onOpen()" (arcClose)="onClose()">
      <IconButton icon="skip-back" label="Previous" />
      <IconButton icon="play" label="Play" />
      <IconButton icon="skip-forward" label="Next" />
      <IconButton icon="volume-2" label="Volume" />
    </Dock>
  \`,
})
export class MediaControlsComponent {
  onOpen() { console.log('open'); }
  onClose() { console.log('close'); }
}`,
      },
      {
        label: 'Solid',
        lang: 'tsx',
        code: `import { Dock, IconButton } from '@arclux/arc-ui-solid';

function MediaControls() {
  return (
    <Dock position="bottom" onArcOpen={() => console.log('open')} onArcClose={() => console.log('close')}>
      <IconButton icon="skip-back" label="Previous" />
      <IconButton icon="play" label="Play" />
      <IconButton icon="skip-forward" label="Next" />
      <IconButton icon="volume-2" label="Volume" />
    </Dock>
  );
}`,
      },
      {
        label: 'Preact',
        lang: 'tsx',
        code: `import { Dock, IconButton } from '@arclux/arc-ui-preact';

function MediaControls() {
  return (
    <Dock position="bottom" onArcOpen={() => console.log('open')} onArcClose={() => console.log('close')}>
      <IconButton icon="skip-back" label="Previous" />
      <IconButton icon="play" label="Play" />
      <IconButton icon="skip-forward" label="Next" />
      <IconButton icon="volume-2" label="Volume" />
    </Dock>
  );
}`,
      },
    ],

  seeAlso: ['drawer', 'toolbar', 'float-bar'],
};
