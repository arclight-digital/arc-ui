import type { ComponentDef } from './_types';

export const notificationPanel: ComponentDef = {
  name: 'Notification Panel',
  slug: 'notification-panel',
  tag: 'arc-notification-panel',
  tier: 'feedback',
  interactivity: 'interactive',
  description: 'Dropdown panel for notifications. A trigger slot opens a panel with a header, a scrolling body and a footer.',

  overview: `Notification Panel puts a list of notifications or activity behind a trigger, usually a bell icon. Put the trigger in the \`trigger\` slot. Clicking it opens a panel with a \`header\` slot, the default slot for the list, and a \`footer\` slot.

The panel closes when you click the trigger again, click outside, or move focus out of it. \`arc-open\` and \`arc-close\` fire when it opens and closes.

The panel always opens below the trigger. \`position\` picks which edge lines up with it: \`top-right\` (the default) aligns the right edges and \`top-left\` the left edges. Near a viewport edge, the panel shifts to stay on screen. \`max-height\` (400px by default) caps the body, which scrolls past that.`,

  features: [
    'Opens and closes with a fade and a short slide',
  ],

  guidelines: {
    do: [
      'Use the `header` slot for a title like "Notifications" and an unread count',
      'Use the `footer` slot for a "View all notifications" link or a "Mark all as read" action',
      'Set `max-height` so the panel fits on small screens',
      'Listen for `arc-open` to load or refresh notifications, and update a badge count or mark items read',
    ],
    dont: [
      'Don\'t use it for general dropdown menus. Use Dropdown Menu or Select',
      'Don\'t put complex forms in the panel. Keep it to a list of items people can act on',
    ],
  },

  previewHtml: `<div style="height:320px;display:flex;align-items:flex-start;justify-content:flex-start;padding-top:var(--space-md)">
  <arc-notification-panel position="top-left">
    <div slot="trigger" style="position:relative;display:inline-block;">
      <arc-icon-button name="bell" variant="ghost" size="sm" label="Notifications"></arc-icon-button>
      <span style="position:absolute;top:2px;right:2px;width:8px;height:8px;border-radius:50%;background:var(--color-error);pointer-events:none;"></span>
    </div>
    <div slot="header" style="font-weight:600;font-size:14px;color:var(--text-primary);font-family:var(--font-body)">Notifications</div>
    <div style="padding:var(--space-sm);display:flex;flex-direction:column;gap:var(--space-sm)">
      <div style="padding:var(--space-sm);border-radius:var(--radius-sm);background:rgba(77,126,247,0.06);font-size:13px;color:var(--text-secondary);font-family:var(--font-body)">
        <strong style="color:var(--text-primary)">Deploy succeeded</strong><br/>Production build completed in 42s
      </div>
      <div style="padding:var(--space-sm);border-radius:var(--radius-sm);font-size:13px;color:var(--text-secondary);font-family:var(--font-body)">
        <strong style="color:var(--text-primary)">New comment</strong><br/>Alice commented on PR #128
      </div>
    </div>
    <div slot="footer" style="text-align:center;font-size:13px"><a href="#" style="color:var(--accent-primary);text-decoration:none">View all notifications</a></div>
  </arc-notification-panel>
</div>`,

  tabs: [
    {
      label: 'Web Component',
      lang: 'html',
      code: `<arc-notification-panel position="top-right">
  <!-- Trigger: bell icon-button with unread badge -->
  <div slot="trigger" style="position:relative;display:inline-block;">
    <arc-icon-button name="bell" variant="ghost" size="sm" label="Notifications"></arc-icon-button>
    <span id="badge" style="position:absolute;top:2px;right:2px;width:8px;height:8px;border-radius:50%;background:var(--color-error);pointer-events:none;"></span>
  </div>

  <div slot="header">
    <span>Notifications</span>
    <arc-badge variant="primary">3 new</arc-badge>
  </div>

  <!-- Notification items -->
  <div style="display:flex;flex-direction:column;">
    <div style="padding:12px 16px;border-bottom:1px solid var(--border-subtle);display:flex;gap:10px;align-items:flex-start;">
      <arc-icon name="check-circle" size="16" style="color:var(--color-success);margin-top:2px;flex-shrink:0;"></arc-icon>
      <div>
        <div style="font-weight:600;font-size:13px;color:var(--text-primary);">Deploy succeeded</div>
        <div style="font-size:12px;color:var(--text-tertiary);margin-top:2px;">Production build completed in 42s</div>
        <div style="font-size:11px;color:var(--text-tertiary);margin-top:4px;">2 min ago</div>
      </div>
    </div>
    <div style="padding:12px 16px;border-bottom:1px solid var(--border-subtle);display:flex;gap:10px;align-items:flex-start;">
      <arc-icon name="message-circle" size="16" style="color:var(--accent-primary);margin-top:2px;flex-shrink:0;"></arc-icon>
      <div>
        <div style="font-weight:600;font-size:13px;color:var(--text-primary);">Alice commented on PR #128</div>
        <div style="font-size:12px;color:var(--text-tertiary);margin-top:2px;">"Looks good, just one nit on the error handling"</div>
        <div style="font-size:11px;color:var(--text-tertiary);margin-top:4px;">18 min ago</div>
      </div>
    </div>
    <div style="padding:12px 16px;display:flex;gap:10px;align-items:flex-start;">
      <arc-icon name="alert-triangle" size="16" style="color:var(--color-warning);margin-top:2px;flex-shrink:0;"></arc-icon>
      <div>
        <div style="font-weight:600;font-size:13px;color:var(--text-primary);">Build warning</div>
        <div style="font-size:12px;color:var(--text-tertiary);margin-top:2px;">Bundle size increased by 12% in staging</div>
        <div style="font-size:11px;color:var(--text-tertiary);margin-top:4px;">1 hour ago</div>
      </div>
    </div>
  </div>

  <div slot="footer">
    <arc-link href="/notifications">View all notifications</arc-link>
  </div>
</arc-notification-panel>

<script>
  const panel = document.querySelector('arc-notification-panel');
  panel.addEventListener('arc-open', () => console.log('opened'));
  panel.addEventListener('arc-close', () => console.log('closed'));
</script>`,
    },
    {
      label: 'React',
      lang: 'tsx',
      code: `import { NotificationPanel, IconButton, Icon, Badge, Link } from '@arclux/arc-ui-react';

function AppHeader() {
  return (
    <NotificationPanel position="top-right">
      <div slot="trigger" style={{ position: 'relative', display: 'inline-block' }}>
        <IconButton name="bell" variant="ghost" size="sm" label="Notifications" />
        <span style={{
          position: 'absolute', top: 2, right: 2,
          width: 8, height: 8, borderRadius: '50%',
          background: 'var(--color-error)', pointerEvents: 'none'
        }} />
      </div>

      <div slot="header">
        <span>Notifications</span>
        <Badge variant="primary">3 new</Badge>
      </div>

      <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', gap: 10 }}>
        <Icon name="check-circle" size="16" style={{ color: 'var(--color-success)', flexShrink: 0 }} />
        <div>
          <div style={{ fontWeight: 600, fontSize: 13 }}>Deploy succeeded</div>
          <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>Production build completed in 42s</div>
        </div>
      </div>

      <div slot="footer">
        <Link href="/notifications">View all notifications</Link>
      </div>
    </NotificationPanel>
  );
}`,
    },
    {
      label: 'Vue',
      lang: 'html',
      code: `<script setup>
import { NotificationPanel, IconButton, Icon, Badge, Link } from '@arclux/arc-ui-vue';
</script>

<template>
  <NotificationPanel position="top-right">
    <div slot="trigger" style="position:relative;display:inline-block;">
      <IconButton name="bell" variant="ghost" size="sm" label="Notifications" />
      <span style="position:absolute;top:2px;right:2px;width:8px;height:8px;border-radius:50%;background:var(--color-error);pointer-events:none;" />
    </div>

    <template #header>
      <span>Notifications</span>
      <Badge variant="primary">3 new</Badge>
    </template>

    <div style="padding:12px 16px;border-bottom:1px solid var(--border-subtle);display:flex;gap:10px;">
      <Icon name="check-circle" size="16" style="color:var(--color-success)" />
      <div>
        <div style="font-weight:600;font-size:13px;">Deploy succeeded</div>
        <div style="font-size:12px;color:var(--text-tertiary);margin-top:2px;">Production build completed in 42s</div>
      </div>
    </div>

    <template #footer>
      <Link href="/notifications">View all notifications</Link>
    </template>
  </NotificationPanel>
</template>`,
    },
    {
      label: 'Svelte',
      lang: 'html',
      code: `<script>
  import { NotificationPanel, IconButton, Icon, Badge, Link } from '@arclux/arc-ui-svelte';
</script>

<NotificationPanel position="top-right">
  <div slot="trigger" style="position:relative;display:inline-block;">
    <IconButton name="bell" variant="ghost" size="sm" label="Notifications" />
    <span style="position:absolute;top:2px;right:2px;width:8px;height:8px;border-radius:50%;background:var(--color-error);pointer-events:none;" />
  </div>

  <div slot="header">
    <span>Notifications</span>
    <Badge variant="primary">3 new</Badge>
  </div>

  <div style="padding:12px 16px;border-bottom:1px solid var(--border-subtle);display:flex;gap:10px;">
    <Icon name="check-circle" size="16" style="color:var(--color-success)" />
    <div>
      <div style="font-weight:600;font-size:13px;">Deploy succeeded</div>
      <div style="font-size:12px;color:var(--text-tertiary);margin-top:2px;">Production build completed in 42s</div>
    </div>
  </div>

  <div slot="footer">
    <Link href="/notifications">View all notifications</Link>
  </div>
</NotificationPanel>`,
    },
    {
      label: 'Angular',
      lang: 'ts',
      code: `import { Component } from '@angular/core';
import { NotificationPanel, IconButton, Icon, Badge, Link } from '@arclux/arc-ui-angular';

@Component({
  imports: [NotificationPanel, IconButton, Icon, Badge, Link],
  template: \`
    <arc-notification-panel position="top-right">
      <div slot="trigger" style="position:relative;display:inline-block;">
        <arc-icon-button name="bell" variant="ghost" size="sm" label="Notifications" />
        <span style="position:absolute;top:2px;right:2px;width:8px;height:8px;border-radius:50%;background:var(--color-error);pointer-events:none;"></span>
      </div>
      <div slot="header">
        <span>Notifications</span>
        <arc-badge variant="primary">3 new</arc-badge>
      </div>
      <div style="padding:12px 16px;border-bottom:1px solid var(--border-subtle);display:flex;gap:10px;">
        <arc-icon name="check-circle" size="16" style="color:var(--color-success)" />
        <div>
          <div style="font-weight:600;font-size:13px;">Deploy succeeded</div>
          <div style="font-size:12px;color:var(--text-tertiary);margin-top:2px;">Production build completed in 42s</div>
        </div>
      </div>
      <div slot="footer">
        <arc-link href="/notifications">View all notifications</arc-link>
      </div>
    </arc-notification-panel>
  \`,
})
export class AppHeaderComponent {}`,
    },
    {
      label: 'Solid',
      lang: 'tsx',
      code: `import { NotificationPanel, IconButton, Icon, Badge, Link } from '@arclux/arc-ui-solid';

function AppHeader() {
  return (
    <NotificationPanel position="top-right">
      <div slot="trigger" style="position:relative;display:inline-block;">
        <IconButton name="bell" variant="ghost" size="sm" label="Notifications" />
        <span style="position:absolute;top:2px;right:2px;width:8px;height:8px;border-radius:50%;background:var(--color-error);pointer-events:none;" />
      </div>
      <div slot="header">
        <span>Notifications</span>
        <Badge variant="primary">3 new</Badge>
      </div>
      <div style="padding:12px 16px;border-bottom:1px solid var(--border-subtle);display:flex;gap:10px;">
        <Icon name="check-circle" size="16" style="color:var(--color-success)" />
        <div>
          <div style="font-weight:600;font-size:13px;">Deploy succeeded</div>
          <div style="font-size:12px;color:var(--text-tertiary);margin-top:2px;">Production build completed in 42s</div>
        </div>
      </div>
      <div slot="footer">
        <Link href="/notifications">View all notifications</Link>
      </div>
    </NotificationPanel>
  );
}`,
    },
    {
      label: 'Preact',
      lang: 'tsx',
      code: `import { NotificationPanel, IconButton, Icon, Badge, Link } from '@arclux/arc-ui-preact';

function AppHeader() {
  return (
    <NotificationPanel position="top-right">
      <div slot="trigger" style="position:relative;display:inline-block;">
        <IconButton name="bell" variant="ghost" size="sm" label="Notifications" />
        <span style="position:absolute;top:2px;right:2px;width:8px;height:8px;border-radius:50%;background:var(--color-error);pointer-events:none;" />
      </div>
      <div slot="header">
        <span>Notifications</span>
        <Badge variant="primary">3 new</Badge>
      </div>
      <div style="padding:12px 16px;border-bottom:1px solid var(--border-subtle);display:flex;gap:10px;">
        <Icon name="check-circle" size="16" style="color:var(--color-success)" />
        <div>
          <div style="font-weight:600;font-size:13px;">Deploy succeeded</div>
          <div style="font-size:12px;color:var(--text-tertiary);margin-top:2px;">Production build completed in 42s</div>
        </div>
      </div>
      <div slot="footer">
        <Link href="/notifications">View all notifications</Link>
      </div>
    </NotificationPanel>
  );
}`,
    },
  ],

  seeAlso: ['toast', 'alert', 'badge'],
};
