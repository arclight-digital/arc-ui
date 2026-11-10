import type { ComponentDef } from './_types';

export const list: ComponentDef = {
  name: 'List',
  slug: 'list',
  tag: 'arc-list',
  tier: 'data',
  interactivity: 'interactive',
  description:
    'List container with optional selection, keyboard navigation and three visual variants. Holds arc-list-item rows.',

  overview: `List holds a column of \`<arc-list-item>\` rows. Arrow Up and Down move between rows and wrap at the ends, and Home and End jump to the first and last.

Set \`selectable\` and the list becomes a \`role="listbox"\` that manages \`aria-selected\` on its items. Add \`multiple\` for multi-select, which also sets \`aria-multiselectable\`. The selection is a \`value\` string, comma-separated in multi-select, and \`arc-change\` fires on each change with the new value in \`event.detail.value\`. Without \`selectable\`, the list is a plain \`role="list"\`.

\`variant\` is default (plain), bordered (an outlined container) or separated (a bottom border between items). \`size\` (sm, md, lg) scales each row's text, padding and height.`,

  features: [
    'Enter and Space select the focused row in a selectable list',
    'Row actions: an `actions` slot on arc-list-item, shown on hover or focus (always shown on devices without hover). Clicking an action never selects the row',
  ],

  guidelines: {
    do: [
      'Use arc-list-item as direct children',
      'Put per-row buttons (rename, delete) in the `actions` slot of a plain list, and give each one a label naming its row: "Rename Weekly review", not "Rename"',
      'Mark the current row of a list with actions using `href` and `selected`, which sets aria-current. A selectable list is a listbox and can\'t hold row actions',
      'Set `selectable` when the rows are choices to pick from',
      'Use the bordered variant inside cards or panels',
      'Use the separated variant for long lists, where a line between rows makes them easier to scan',
    ],
    dont: [
      'Don\'t use List for navigation menus. Use Navigation Menu or Dropdown Menu',
      'Don\'t mix arc-list-item with other elements inside a selectable list',
      'Don\'t nest lists more than one level deep. Use a tree view for hierarchical data',
    ],
  },

  previewHtml: `<div style="display: flex; gap: var(--space-xl); flex-wrap: wrap;">
  <arc-list variant="bordered" selectable label="Mailboxes" style="width: 260px;">
    <arc-list-item value="inbox">Inbox</arc-list-item>
    <arc-list-item value="drafts">Drafts</arc-list-item>
    <arc-list-item value="sent">Sent</arc-list-item>
    <arc-list-item value="trash" disabled>Trash</arc-list-item>
  </arc-list>
  <arc-list variant="bordered" label="Documents" style="width: 260px;">
    <arc-list-item href="#weekly" selected>
      Weekly review
      <arc-icon-button slot="actions" name="pencil" label="Rename Weekly review" variant="ghost" size="sm"></arc-icon-button>
      <arc-icon-button slot="actions" name="x" label="Delete Weekly review" variant="ghost" size="sm"></arc-icon-button>
    </arc-list-item>
    <arc-list-item href="#roadmap">
      Roadmap
      <arc-icon-button slot="actions" name="pencil" label="Rename Roadmap" variant="ghost" size="sm"></arc-icon-button>
      <arc-icon-button slot="actions" name="x" label="Delete Roadmap" variant="ghost" size="sm"></arc-icon-button>
    </arc-list-item>
  </arc-list>
</div>`,

  subComponents: [
    {
      name: 'List Item',
      tag: 'arc-list-item',
      description:
        'Individual row within an arc-list. Supports prefix/suffix slots, a description slot for secondary text, an actions slot for per-row buttons, links, and selection state.',
    },
  ],

  tabs: [
    {
      label: 'Web Component',
      lang: 'html',
      code: `<arc-list variant="bordered" selectable>
  <arc-list-item value="inbox">
    <arc-icon slot="prefix" name="inbox"></arc-icon>
    Inbox
    <arc-badge slot="suffix" variant="primary">12</arc-badge>
  </arc-list-item>
  <arc-list-item value="drafts">
    <arc-icon slot="prefix" name="file-text"></arc-icon>
    Drafts
  </arc-list-item>
  <arc-list-item value="sent">
    <arc-icon slot="prefix" name="send"></arc-icon>
    Sent
  </arc-list-item>
</arc-list>`,
    },
    {
      label: 'React',
      lang: 'tsx',
      code: `import { List, ListItem, Icon, Badge } from '@arclux/arc-ui-react';

export default function Example() {
  return (
    <List variant="bordered" selectable>
      <ListItem value="inbox">
        <Icon slot="prefix" name="inbox" />
        Inbox
        <Badge slot="suffix" variant="primary">12</Badge>
      </ListItem>
      <ListItem value="drafts">
        <Icon slot="prefix" name="file-text" />
        Drafts
      </ListItem>
      <ListItem value="sent">
        <Icon slot="prefix" name="send" />
        Sent
      </ListItem>
    </List>
  );
}`,
    },
    {
      label: 'Vue',
      lang: 'html',
      code: `<script setup>
import { List, ListItem, Icon, Badge } from '@arclux/arc-ui-vue';
</script>

<template>
  <List variant="bordered" selectable>
    <ListItem value="inbox">
      <Icon slot="prefix" name="inbox" />
      Inbox
      <Badge slot="suffix" variant="primary">12</Badge>
    </ListItem>
    <ListItem value="drafts">
      <Icon slot="prefix" name="file-text" />
      Drafts
    </ListItem>
  </List>
</template>`,
    },
    {
      label: 'Svelte',
      lang: 'html',
      code: `<script>
  import { List, ListItem, Icon, Badge } from '@arclux/arc-ui-svelte';
</script>

<List variant="bordered" selectable>
  <ListItem value="inbox">
    <Icon slot="prefix" name="inbox" />
    Inbox
    <Badge slot="suffix" variant="primary">12</Badge>
  </ListItem>
  <ListItem value="drafts">
    <Icon slot="prefix" name="file-text" />
    Drafts
  </ListItem>
</List>`,
    },
    {
      label: 'Angular',
      lang: 'ts',
      code: `import { Component } from '@angular/core';
import { List, ListItem, Icon, Badge } from '@arclux/arc-ui-angular';

@Component({
  imports: [List, ListItem, Icon, Badge],
  template: \`
    <arc-list variant="bordered" selectable>
      <arc-list-item value="inbox">
        <arc-icon slot="prefix" name="inbox" />
        Inbox
        <arc-badge slot="suffix" variant="primary">12</arc-badge>
      </arc-list-item>
      <arc-list-item value="drafts">
        <arc-icon slot="prefix" name="file-text" />
        Drafts
      </arc-list-item>
    </arc-list>
  \`,
})
export class MailboxComponent {}`,
    },
    {
      label: 'Solid',
      lang: 'tsx',
      code: `import { List, ListItem, Icon, Badge } from '@arclux/arc-ui-solid';

export default function Example() {
  return (
    <List variant="bordered" selectable>
      <ListItem value="inbox">
        <Icon slot="prefix" name="inbox" />
        Inbox
        <Badge slot="suffix" variant="primary">12</Badge>
      </ListItem>
      <ListItem value="drafts">
        <Icon slot="prefix" name="file-text" />
        Drafts
      </ListItem>
    </List>
  );
}`,
    },
    {
      label: 'Preact',
      lang: 'tsx',
      code: `import { List, ListItem, Icon, Badge } from '@arclux/arc-ui-preact';

export default function Example() {
  return (
    <List variant="bordered" selectable>
      <ListItem value="inbox">
        <Icon slot="prefix" name="inbox" />
        Inbox
        <Badge slot="suffix" variant="primary">12</Badge>
      </ListItem>
      <ListItem value="drafts">
        <Icon slot="prefix" name="file-text" />
        Drafts
      </ListItem>
    </List>
  );
}`,
    },
  ],

  seeAlso: ['data-grid', 'navigation-menu', 'virtual-list'],
};
