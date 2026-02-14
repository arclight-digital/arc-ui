import type { ComponentDef } from './_types';

export const notificationPanel: ComponentDef = {
    name: 'Notification Panel',
    slug: 'notification-panel',
    tag: 'arc-notification-panel',
    tier: 'feedback',
    interactivity: 'interactive',
    description: 'Notification dropdown panel triggered by a button.',

    overview: `NotificationPanel is a popover-style dropdown designed for displaying notifications, messages, and activity feeds. It pairs a trigger slot (typically a bell icon or button) with a floating panel that appears on click. The panel includes dedicated header, body, and footer regions, making it easy to compose a complete notification center with a title row, scrollable message list, and a "View all" action at the bottom.

The panel opens and closes via click on the trigger element, and automatically dismisses when the user clicks outside the component boundary. It dispatches \`arc-open\` and \`arc-close\` custom events on state changes so you can synchronize badge counts, mark notifications as read, or fetch fresh data when the panel becomes visible.

Positioning is controlled by the \`position\` prop, which accepts \`top-right\` (default) or \`top-left\` to align the dropdown relative to the trigger. The \`max-height\` prop caps the scrollable body area so long notification lists do not overflow the viewport. The panel uses a smooth fade-and-slide transition on open and close for a polished feel.`,

    features: [
      'Click-triggered popover with automatic outside-click dismissal',
      'Dedicated header, body (default slot), and footer regions for structured content',
      'Scrollable body with configurable max-height to prevent viewport overflow',
      'Position prop (top-right, top-left) for trigger-relative alignment',
      'Smooth opacity and translateY transition on open and close',
      'arc-open and arc-close custom events for state synchronization',
      'Shadow DOM parts (trigger, panel, header, body, footer) for targeted styling',
      'z-index: 1000 overlay stacking for reliable layering above page content',
    ],

    guidelines: {
      do: [
        'Place the trigger button (bell icon, badge) in the trigger slot for consistent click handling',
        'Use the header slot for a title like "Notifications" and an optional unread count',
        'Use the footer slot for a "View all notifications" link or "Mark all as read" action',
        'Set max-height to prevent the panel from exceeding viewport bounds on mobile',
        'Listen for arc-open to lazy-load or refresh notification data',
      ],
      dont: [
        'Use NotificationPanel for generic dropdown menus -- use DropdownMenu or Select instead',
        'Place complex interactive forms inside the panel -- keep it to a list of actionable items',
        'Forget to handle the arc-close event if you need to clean up or reset scroll position',
        'Set position to top-left when the trigger is on the left edge of the screen -- the panel may overflow',
        'Nest NotificationPanel inside another popover or modal -- stacking contexts will conflict',
      ],
    },

    previewHtml: `<arc-notification-panel position="top-left">
  <div slot="trigger" style="position:relative;display:inline-block;">
    <arc-icon-button name="bell" variant="ghost" size="sm" label="Notifications"></arc-icon-button>
    <span style="position:absolute;top:2px;right:2px;width:8px;height:8px;border-radius:50%;background:var(--color-error);pointer-events:none;"></span>
  </div>
  <div slot="header" style="font-weight:600;font-size:14px;color:var(--text-primary);font-family:var(--font-body)">Notifications</div>
  <div style="padding:var(--space-sm) var(--space-md);display:flex;flex-direction:column;gap:var(--space-sm)">
    <div style="padding:var(--space-sm);border-radius:var(--radius-sm);background:rgba(77,126,247,0.06);font-size:13px;color:var(--text-secondary);font-family:var(--font-body)">
      <strong style="color:var(--text-primary)">Deploy succeeded</strong><br/>Production build completed in 42s
    </div>
    <div style="padding:var(--space-sm);border-radius:var(--radius-sm);font-size:13px;color:var(--text-secondary);font-family:var(--font-body)">
      <strong style="color:var(--text-primary)">New comment</strong><br/>Alice commented on PR #128
    </div>
  </div>
  <div slot="footer" style="text-align:center;font-size:13px"><a href="#" style="color:var(--accent-primary);text-decoration:none">View all notifications</a></div>
</arc-notification-panel>`,

    props: [
      { name: 'open', type: 'boolean', default: 'false', description: 'Controls whether the notification panel is visible. Toggle this programmatically or let the built-in trigger click handler manage it.' },
      { name: 'position', type: "'top-right' | 'top-left'", default: "'top-right'", description: 'Horizontal alignment of the panel relative to the trigger element. Use top-right when the trigger is near the right edge of the viewport.' },
      { name: 'max-height', type: 'string', default: "'400px'", description: 'Maximum height of the scrollable body area. Prevents long notification lists from overflowing the viewport.' },
    ],
    events: [
      { name: 'arc-open', description: 'Fired when the notification panel opens' },
      { name: 'arc-close', description: 'Fired when the notification panel closes' },
    ],
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
    <NotificationPanel position="top-right">
      <div slot="trigger" style="position:relative;display:inline-block;">
        <IconButton name="bell" variant="ghost" size="sm" label="Notifications" />
        <span style="position:absolute;top:2px;right:2px;width:8px;height:8px;border-radius:50%;background:var(--color-error);pointer-events:none;"></span>
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
  
  seeAlso: ["toast","alert","badge"],
};
