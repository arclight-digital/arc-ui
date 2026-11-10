import type { ComponentDef } from './_types';

export const tooltip: ComponentDef = {
  name: 'Tooltip',
  slug: 'tooltip',
  tag: 'arc-tooltip',
  tier: 'feedback',
  interactivity: 'hybrid',
  searchKeywords: ['hint'],
  description:
    'A short text hint shown next to a control on hover or keyboard focus.',

  overview: `Tooltip shows a short plain-text hint when the pointer rests on its trigger or the trigger gets focus. Use it when a control's purpose isn't clear from how it looks, as with icon-only buttons, truncated labels, abbreviations and keyboard shortcuts. For formatted or interactive content, use Popover.

\`position\` puts it above, below, left or right of the trigger. It waits \`delay\` milliseconds (200 by default) before showing, so a pointer sweeping across a dense toolbar doesn't set off every tooltip.

The trigger gets the tooltip text as \`aria-description\`, the popup has \`role="tooltip"\`, and Escape dismisses it. The popup has \`pointer-events: none\`, so it never blocks clicks on what's around it.`,

  features: [
    'Shows on `mouseenter` and `focusin`',
    'An arrow points at the trigger, and the tooltip flips to the opposite side when `position` doesn\'t fit in the viewport',
  ],

  guidelines: {
    do: [
      'Use tooltips on icon-only buttons to name the action, such as "Edit" or "Delete"',
      'Keep the text to one line, ideally under eight words',
      'Set a longer delay (400 to 600ms) in dense toolbars',
      'Give the trigger an `aria-label` when the tooltip is its only name',
    ],
    dont: [
      'Don\'t put links or buttons in a tooltip. Use Popover',
      'Don\'t repeat what the trigger\'s label already says',
      'Don\'t put information the reader needs to finish a task in a tooltip',
      'Don\'t set `delay` to 0. Tooltips then flash up during ordinary pointer movement',
      'Don\'t rely on tooltips for touch users. There\'s no hover to trigger them',
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
      <arc-tooltip content="Edit item" position="top">
        <arc-icon-button label="Edit"><arc-icon name="pencil" /></arc-icon-button>
      </arc-tooltip>
      <arc-tooltip content="Delete item" position="top">
        <arc-icon-button label="Delete"><arc-icon name="trash" /></arc-icon-button>
      </arc-tooltip>
      <arc-tooltip content="Settings" position="bottom">
        <arc-icon-button label="Settings"><arc-icon name="gear" /></arc-icon-button>
      </arc-tooltip>
      <arc-tooltip content="Download file" position="bottom">
        <arc-icon-button label="Download"><arc-icon name="download" /></arc-icon-button>
      </arc-tooltip>
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
<!-- arc-tooltip — requires tooltip.css + base.css (or arc-ui.css) -->
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

  seeAlso: ['hover-card', 'popover'],
};
