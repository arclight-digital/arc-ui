import type { ComponentDef } from './_types';

export const tooltip: ComponentDef = {
    name: 'Tooltip',
    slug: 'tooltip',
    tag: 'arc-tooltip',
    tier: 'feedback',
    interactivity: 'hybrid',
    description: 'Contextual hint that appears on hover or focus, providing supplementary information without cluttering the UI. Supports four placement positions and a configurable show delay.',

    overview: `Tooltip is a non-intrusive disclosure component that surfaces contextual information when a user hovers over or focuses on an element. It is the right choice whenever a control's purpose is not immediately obvious from its visual alone — icon-only buttons, truncated labels, abbreviated values, and keyboard shortcuts all benefit from a tooltip that fills in the gap without adding permanent visual noise.

The component supports four placement positions — top, bottom, left, and right — so you can anchor the tooltip wherever there is available space relative to its trigger. A configurable delay (defaulting to 200 ms) prevents tooltips from firing on casual mouse movement, keeping the experience calm during rapid pointer traversal across a dense toolbar or action bar.

Tooltip is fully accessible out of the box. It links the popup to its trigger via \`aria-describedby\`, uses the \`role="tooltip"\` semantic, and dismisses on Escape so keyboard and screen-reader users receive the same contextual hints as mouse users. Because the popup is pointer-events-none, it never blocks interaction with surrounding elements.`,

    features: [
      'Four placement positions (top, bottom, left, right)',
      'Configurable show delay to avoid accidental activation',
      'Accessible by default with aria-describedby and role="tooltip"',
      'Escape key dismissal for keyboard users',
      'Automatic show on hover (mouseenter) and focus (focusin)',
      'Smooth opacity transition using design-token timing',
      'Directional arrow that points toward the trigger element',
      'Pointer-events-none popup that never blocks surrounding UI',
    ],

    guidelines: {
      do: [
        'Use tooltips on icon-only buttons to describe the action (e.g. "Edit", "Delete")',
        'Keep tooltip text short — one line, ideally under eight words',
        'Prefer top position as the default; switch only when clipped by viewport edges',
        'Set a longer delay (400-600 ms) in dense toolbars to reduce visual noise',
        'Pair with aria-label on the trigger when the tooltip is the only accessible name',
      ],
      dont: [
        'Put interactive content (links, buttons) inside a tooltip — use Popover instead',
        'Duplicate information already visible in the trigger label',
        'Use tooltips for essential information that the user must see to complete a task',
        'Set delay to 0 — instant tooltips are distracting during normal pointer movement',
        'Rely on tooltips for touch-only users; they have no hover event to trigger them',
      ],
    },

    previewHtml: `<div style="display: flex; align-items: center; gap: 16px; padding: 32px 0;">
  <arc-tooltip content="Edit item" position="top">
    <arc-icon-button label="Edit"><arc-icon name="pencil"></arc-icon></arc-icon-button>
  </arc-tooltip>
  <arc-tooltip content="Delete item" position="top">
    <arc-icon-button label="Delete"><arc-icon name="trash"></arc-icon></arc-icon-button>
  </arc-tooltip>
  <arc-tooltip content="Settings" position="bottom">
    <arc-icon-button label="Settings"><arc-icon name="gear"></arc-icon></arc-icon-button>
  </arc-tooltip>
  <arc-tooltip content="Download file" position="bottom">
    <arc-icon-button label="Download"><arc-icon name="download"></arc-icon></arc-icon-button>
  </arc-tooltip>
</div>`,

    props: [
      {
        name: 'content',
        type: 'string',
        description: 'The plain-text string displayed inside the tooltip popup. Keep this concise — one short phrase that describes the trigger element or provides a supplementary hint. HTML is not supported; for rich content, use the Popover component instead.',
      },
      {
        name: 'position',
        type: "'top' | 'bottom' | 'left' | 'right'",
        default: "'top'",
        description: 'Controls which side of the trigger the tooltip appears on. Top is the most common default. Switch to bottom, left, or right when the trigger sits near a viewport edge or when the surrounding layout makes another direction more natural.',
      },
      {
        name: 'delay',
        type: 'number',
        default: '200',
        description: 'Time in milliseconds to wait after mouseenter or focusin before the tooltip becomes visible. The default of 200 ms prevents accidental activation during casual pointer movement. Increase to 400-600 ms in dense toolbars; avoid setting to 0 as it creates a jittery experience.',
      },
    ],

    tabs: [
      {
        label: 'Web Component',
        lang: 'html',
        code: `<script type="module" src="@arclux/arc-ui"></script>

<div style="display: flex; align-items: center; gap: 16px;">
  <arc-tooltip content="Edit item" position="top">
    <arc-icon-button label="Edit"><arc-icon name="pencil"></arc-icon></arc-icon-button>
  </arc-tooltip>
  <arc-tooltip content="Delete item" position="top">
    <arc-icon-button label="Delete"><arc-icon name="trash"></arc-icon></arc-icon-button>
  </arc-tooltip>
  <arc-tooltip content="Settings" position="bottom">
    <arc-icon-button label="Settings"><arc-icon name="gear"></arc-icon></arc-icon-button>
  </arc-tooltip>
  <arc-tooltip content="Download file" position="bottom">
    <arc-icon-button label="Download"><arc-icon name="download"></arc-icon></arc-icon-button>
  </arc-tooltip>
</div>`,
      },
      {
        label: 'React',
        lang: 'tsx',
        code: `import { Tooltip, IconButton, Icon } from '@arclux/arc-ui-react';

export function ActionBar() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <Tooltip content="Edit item" position="top">
        <IconButton label="Edit"><Icon name="pencil" /></IconButton>
      </Tooltip>
      <Tooltip content="Delete item" position="top">
        <IconButton label="Delete"><Icon name="trash" /></IconButton>
      </Tooltip>
      <Tooltip content="Settings" position="bottom">
        <IconButton label="Settings"><Icon name="gear" /></IconButton>
      </Tooltip>
      <Tooltip content="Download file" position="bottom">
        <IconButton label="Download"><Icon name="download" /></IconButton>
      </Tooltip>
    </div>
  );
}`,
      },
      {
        label: 'Vue',
        lang: 'html',
        code: `<script setup>
import { Tooltip, IconButton, Icon } from '@arclux/arc-ui-vue';
</script>

<template>
  <div style="display: flex; align-items: center; gap: 16px;">
    <Tooltip content="Edit item" position="top">
      <IconButton label="Edit"><Icon name="pencil" /></IconButton>
    </Tooltip>
    <Tooltip content="Delete item" position="top">
      <IconButton label="Delete"><Icon name="trash" /></IconButton>
    </Tooltip>
    <Tooltip content="Settings" position="bottom">
      <IconButton label="Settings"><Icon name="gear" /></IconButton>
    </Tooltip>
    <Tooltip content="Download file" position="bottom">
      <IconButton label="Download"><Icon name="download" /></IconButton>
    </Tooltip>
  </div>
</template>`,
      },
      {
        label: 'Svelte',
        lang: 'html',
        code: `<script>
  import { Tooltip, IconButton, Icon } from '@arclux/arc-ui-svelte';
</script>

<div style="display: flex; align-items: center; gap: 16px;">
  <Tooltip content="Edit item" position="top">
    <IconButton label="Edit"><Icon name="pencil" /></IconButton>
  </Tooltip>
  <Tooltip content="Delete item" position="top">
    <IconButton label="Delete"><Icon name="trash" /></IconButton>
  </Tooltip>
  <Tooltip content="Settings" position="bottom">
    <IconButton label="Settings"><Icon name="gear" /></IconButton>
  </Tooltip>
  <Tooltip content="Download file" position="bottom">
    <IconButton label="Download"><Icon name="download" /></IconButton>
  </Tooltip>
</div>`,
      },
      {
        label: 'Angular',
        lang: 'ts',
        code: `import { Component } from '@angular/core';
import { Tooltip, IconButton, Icon } from '@arclux/arc-ui-angular';

@Component({
  imports: [Tooltip, IconButton, Icon],
  template: \`
    <div style="display: flex; align-items: center; gap: 16px;">
      <Tooltip content="Edit item" position="top">
        <IconButton label="Edit"><Icon name="pencil" /></IconButton>
      </Tooltip>
      <Tooltip content="Delete item" position="top">
        <IconButton label="Delete"><Icon name="trash" /></IconButton>
      </Tooltip>
      <Tooltip content="Settings" position="bottom">
        <IconButton label="Settings"><Icon name="gear" /></IconButton>
      </Tooltip>
      <Tooltip content="Download file" position="bottom">
        <IconButton label="Download"><Icon name="download" /></IconButton>
      </Tooltip>
    </div>
  \`,
})
export class ActionBarComponent {}`,
      },
      {
        label: 'Solid',
        lang: 'tsx',
        code: `import { Tooltip, IconButton, Icon } from '@arclux/arc-ui-solid';

export function ActionBar() {
  return (
    <div style={{ display: 'flex', 'align-items': 'center', gap: '16px' }}>
      <Tooltip content="Edit item" position="top">
        <IconButton label="Edit"><Icon name="pencil" /></IconButton>
      </Tooltip>
      <Tooltip content="Delete item" position="top">
        <IconButton label="Delete"><Icon name="trash" /></IconButton>
      </Tooltip>
      <Tooltip content="Settings" position="bottom">
        <IconButton label="Settings"><Icon name="gear" /></IconButton>
      </Tooltip>
      <Tooltip content="Download file" position="bottom">
        <IconButton label="Download"><Icon name="download" /></IconButton>
      </Tooltip>
    </div>
  );
}`,
      },
      {
        label: 'Preact',
        lang: 'tsx',
        code: `import { Tooltip, IconButton, Icon } from '@arclux/arc-ui-preact';

export function ActionBar() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <Tooltip content="Edit item" position="top">
        <IconButton label="Edit"><Icon name="pencil" /></IconButton>
      </Tooltip>
      <Tooltip content="Delete item" position="top">
        <IconButton label="Delete"><Icon name="trash" /></IconButton>
      </Tooltip>
      <Tooltip content="Settings" position="bottom">
        <IconButton label="Settings"><Icon name="gear" /></IconButton>
      </Tooltip>
      <Tooltip content="Download file" position="bottom">
        <IconButton label="Download"><Icon name="download" /></IconButton>
      </Tooltip>
    </div>
  );
}`,
      },
      {
        label: 'HTML',
        lang: 'html',
        code: `<!-- Auto-generated by @arclux/prism — do not edit manually -->
<!-- arc-tooltip — requires tooltip.css + tokens.css (or arc-ui.css) -->
<span class="arc-tooltip">
  <div
   class="tooltip__trigger"
   aria-describedby="_tooltip Id"
  >
    Tooltip
  </div>
  <div
   class="tooltip__popup _visible"
   role="tooltip"
   id="_tooltip Id"
  >
    Content goes here
    <div class="tooltip__arrow"></div>
  </div>
</span>`,
      },
      {
        label: 'HTML (Inline)',
        lang: 'html',
        code: `<!-- Auto-generated by @arclux/prism — do not edit manually -->
<!-- arc-tooltip — self-contained, no external CSS needed -->
<span class="arc-tooltip" style="display: inline-block; position: relative">
  <div
   style="display: inline-block"
   aria-describedby="_tooltip Id"
  >
    Tooltip
  </div>
  <div
   role="tooltip"
   id="_tooltip Id"
  >
    Content goes here
    <div style="position: absolute; width: 8px; height: 8px; background: rgb(17, 17, 22); border: 1px solid rgb(34, 34, 41); transform: rotate(45deg)"></div>
  </div>
</span>`,
      },
    ],
  };
