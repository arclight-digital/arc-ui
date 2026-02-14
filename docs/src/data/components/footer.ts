import type { ComponentDef } from './_types';

export const footer: ComponentDef = {
    name: 'Footer',
    slug: 'footer',
    tag: 'arc-footer',
    tier: 'navigation',
    interactivity: 'static',
    description: 'Page footer with branding, link columns, and legal text. Provides a structured layout with slots for a logo, navigational link groups, social icons, and copyright information.',

    overview: `Footer is the bottom-of-page landmark that anchors every page with branding, navigation, and legal information. It uses a slot-based architecture — logo, default (columns), social, and legal — so you can compose any footer layout from simple single-line copyright notices to expansive multi-column site maps.

The default slot renders its children in a responsive CSS Grid that automatically wraps link columns from a single stack on mobile to as many columns as fit at 160 px minimum width. This means you drop in three or four \`<div>\` elements with heading-and-link-list markup and the grid handles the rest — no manual breakpoints needed.

Footer ships with two boolean props that cover the most common layout tweaks. The \`border\` prop (on by default) adds a subtle top rule to visually separate the footer from the content above. The \`compact\` prop tightens all internal spacing for dashboards and admin panels where vertical real estate is at a premium. Together these two toggles, plus the four slots, cover the vast majority of footer patterns without custom CSS.`,

    features: [
      'Slot-based composition with logo, default (columns), social, and legal regions',
      'Responsive CSS Grid columns that auto-wrap without manual breakpoints',
      'Compact mode for dashboards and space-constrained layouts',
      'Optional top border to separate footer from page content',
      'Dark background with muted text for clear visual hierarchy',
      'Legal section with its own subtle top divider for copyright and policy links',
      'CSS custom property theming via design tokens',
      'Shadow DOM encapsulation with ::part() hooks for targeted styling',
    ],

    guidelines: {
      do: [
        'Place the footer as the last child of your page layout or AppShell',
        'Use the logo slot for your brand mark or wordmark — keep it compact',
        'Organize link columns by category (Product, Company, Resources) for scannability',
        'Include essential legal text (copyright year, company name) in the legal slot',
        'Use the compact variant inside admin shells and dashboards to save vertical space',
        'Keep link column headings short and consistent in casing',
      ],
      dont: [
        'Nest interactive widgets (forms, modals) inside the footer — keep it navigational',
        'Use more than four or five link columns; too many columns overwhelm on smaller screens',
        'Remove the border prop on pages with light backgrounds — the separator aids readability',
        'Duplicate primary navigation in the footer verbatim; footer nav should be a curated subset',
        'Place critical call-to-action buttons in the footer — they belong above the fold',
        'Omit a copyright notice; legal requires it for most commercial products',
      ],
    },

    previewHtml: `<div style="width:100%;border:1px solid var(--border-subtle);border-radius:var(--radius-md);overflow:hidden">
  <arc-footer border>
    <div slot="logo" style="display:flex;align-items:center;gap:8px;">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style="flex-shrink:0"><circle cx="12" cy="12" r="10" stroke="var(--accent)" stroke-width="2"/><path d="M8 12l3 3 5-5" stroke="var(--accent)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      <strong style="color:var(--text-primary);font-size:18px;">ARC UI</strong>
    </div>
    <div>
      <p style="margin:0 0 12px;font-weight:600;color:var(--text-primary);font-size:13px;text-transform:uppercase;letter-spacing:1px;">Product</p>
      <ul style="list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:8px;font-size:14px;">
        <li><a href="#" style="color:var(--text-secondary);text-decoration:none;">Components</a></li>
        <li><a href="#" style="color:var(--text-secondary);text-decoration:none;">Tokens</a></li>
        <li><a href="#" style="color:var(--text-secondary);text-decoration:none;">Changelog</a></li>
      </ul>
    </div>
    <div>
      <p style="margin:0 0 12px;font-weight:600;color:var(--text-primary);font-size:13px;text-transform:uppercase;letter-spacing:1px;">Company</p>
      <ul style="list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:8px;font-size:14px;">
        <li><a href="#" style="color:var(--text-secondary);text-decoration:none;">About</a></li>
        <li><a href="#" style="color:var(--text-secondary);text-decoration:none;">Blog</a></li>
        <li><a href="#" style="color:var(--text-secondary);text-decoration:none;">Careers</a></li>
      </ul>
    </div>
    <div>
      <p style="margin:0 0 12px;font-weight:600;color:var(--text-primary);font-size:13px;text-transform:uppercase;letter-spacing:1px;">Resources</p>
      <ul style="list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:8px;font-size:14px;">
        <li><a href="#" style="color:var(--text-secondary);text-decoration:none;">Documentation</a></li>
        <li><a href="#" style="color:var(--text-secondary);text-decoration:none;">GitHub</a></li>
        <li><a href="#" style="color:var(--text-secondary);text-decoration:none;">Support</a></li>
      </ul>
    </div>
    <div slot="legal">&copy; 2026 ARC UI. All rights reserved. &middot; <a href="#" style="color:var(--text-muted);text-decoration:none;">Privacy</a> &middot; <a href="#" style="color:var(--text-muted);text-decoration:none;">Terms</a></div>
  </arc-footer>
</div>`,

    props: [
      {
        name: 'compact',
        type: 'boolean',
        default: 'false',
        description: 'Reduces internal padding and spacing throughout the footer. Use this in dashboard layouts or admin panels where vertical space is limited and the footer should feel lightweight rather than expansive.',
      },
      {
        name: 'border',
        type: 'boolean',
        default: 'true',
        description: 'Renders a subtle top border on the footer to visually separate it from the page content above. Enabled by default; disable it only when the footer sits against a dark background where the border would be redundant.',
      },
      {
        name: 'align',
        type: 'string',
        default: "'left'",
        description: "Controls footer content alignment. Options: 'left', 'center'.",
      },
    ],

    tabs: [
      {
        label: 'Web Component',
        lang: 'html',
        code: `<script type="module" src="@arclux/arc-ui"></script>

<arc-footer border>
  <div slot="logo"><strong>ARC UI</strong></div>

  <div>
    <p><strong>Product</strong></p>
    <ul>
      <li><a href="/docs/components">Components</a></li>
      <li><a href="/docs/tokens">Tokens</a></li>
      <li><a href="/docs/changelog">Changelog</a></li>
    </ul>
  </div>
  <div>
    <p><strong>Company</strong></p>
    <ul>
      <li><a href="/about">About</a></li>
      <li><a href="/blog">Blog</a></li>
      <li><a href="/careers">Careers</a></li>
    </ul>
  </div>
  <div>
    <p><strong>Resources</strong></p>
    <ul>
      <li><a href="/docs">Documentation</a></li>
      <li><a href="/github">GitHub</a></li>
      <li><a href="/support">Support</a></li>
    </ul>
  </div>

  <div slot="legal">&copy; 2026 ARC UI. All rights reserved.</div>
</arc-footer>`,
      },
      {
        label: 'React',
        lang: 'tsx',
        code: `import { Footer } from '@arclux/arc-ui-react';

export function SiteFooter() {
  return (
    <Footer border>
      <div slot="logo"><strong>ARC UI</strong></div>

      <div>
        <p><strong>Product</strong></p>
        <ul>
          <li><a href="/docs/components">Components</a></li>
          <li><a href="/docs/tokens">Tokens</a></li>
          <li><a href="/docs/changelog">Changelog</a></li>
        </ul>
      </div>
      <div>
        <p><strong>Company</strong></p>
        <ul>
          <li><a href="/about">About</a></li>
          <li><a href="/blog">Blog</a></li>
          <li><a href="/careers">Careers</a></li>
        </ul>
      </div>
      <div>
        <p><strong>Resources</strong></p>
        <ul>
          <li><a href="/docs">Documentation</a></li>
          <li><a href="/github">GitHub</a></li>
          <li><a href="/support">Support</a></li>
        </ul>
      </div>

      <div slot="legal">&copy; 2026 ARC UI. All rights reserved.</div>
    </Footer>
  );
}`,
      },
      {
        label: 'Vue',
        lang: 'html',
        code: `<script setup>
import { Footer } from '@arclux/arc-ui-vue';
</script>

<template>
  <Footer border>
    <div slot="logo"><strong>ARC UI</strong></div>

    <div>
      <p><strong>Product</strong></p>
      <ul>
        <li><a href="/docs/components">Components</a></li>
        <li><a href="/docs/tokens">Tokens</a></li>
        <li><a href="/docs/changelog">Changelog</a></li>
      </ul>
    </div>
    <div>
      <p><strong>Company</strong></p>
      <ul>
        <li><a href="/about">About</a></li>
        <li><a href="/blog">Blog</a></li>
        <li><a href="/careers">Careers</a></li>
      </ul>
    </div>
    <div>
      <p><strong>Resources</strong></p>
      <ul>
        <li><a href="/docs">Documentation</a></li>
        <li><a href="/github">GitHub</a></li>
        <li><a href="/support">Support</a></li>
      </ul>
    </div>

    <div slot="legal">&copy; 2026 ARC UI. All rights reserved.</div>
  </Footer>
</template>`,
      },
      {
        label: 'Svelte',
        lang: 'html',
        code: `<script>
  import { Footer } from '@arclux/arc-ui-svelte';
</script>

<Footer border>
  <div slot="logo"><strong>ARC UI</strong></div>

  <div>
    <p><strong>Product</strong></p>
    <ul>
      <li><a href="/docs/components">Components</a></li>
      <li><a href="/docs/tokens">Tokens</a></li>
      <li><a href="/docs/changelog">Changelog</a></li>
    </ul>
  </div>
  <div>
    <p><strong>Company</strong></p>
    <ul>
      <li><a href="/about">About</a></li>
      <li><a href="/blog">Blog</a></li>
      <li><a href="/careers">Careers</a></li>
    </ul>
  </div>
  <div>
    <p><strong>Resources</strong></p>
    <ul>
      <li><a href="/docs">Documentation</a></li>
      <li><a href="/github">GitHub</a></li>
      <li><a href="/support">Support</a></li>
    </ul>
  </div>

  <div slot="legal">&copy; 2026 ARC UI. All rights reserved.</div>
</Footer>`,
      },
      {
        label: 'Angular',
        lang: 'ts',
        code: `import { Component } from '@angular/core';
import { Footer } from '@arclux/arc-ui-angular';

@Component({
  imports: [Footer],
  template: \`
    <Footer border>
      <div slot="logo"><strong>ARC UI</strong></div>

      <div>
        <p><strong>Product</strong></p>
        <ul>
          <li><a href="/docs/components">Components</a></li>
          <li><a href="/docs/tokens">Tokens</a></li>
          <li><a href="/docs/changelog">Changelog</a></li>
        </ul>
      </div>
      <div>
        <p><strong>Company</strong></p>
        <ul>
          <li><a href="/about">About</a></li>
          <li><a href="/blog">Blog</a></li>
          <li><a href="/careers">Careers</a></li>
        </ul>
      </div>
      <div>
        <p><strong>Resources</strong></p>
        <ul>
          <li><a href="/docs">Documentation</a></li>
          <li><a href="/github">GitHub</a></li>
          <li><a href="/support">Support</a></li>
        </ul>
      </div>

      <div slot="legal">&copy; 2026 ARC UI. All rights reserved.</div>
    </Footer>
  \`,
})
export class SiteFooterComponent {}`,
      },
      {
        label: 'Solid',
        lang: 'tsx',
        code: `import { Footer } from '@arclux/arc-ui-solid';

export function SiteFooter() {
  return (
    <Footer border>
      <div slot="logo"><strong>ARC UI</strong></div>

      <div>
        <p><strong>Product</strong></p>
        <ul>
          <li><a href="/docs/components">Components</a></li>
          <li><a href="/docs/tokens">Tokens</a></li>
          <li><a href="/docs/changelog">Changelog</a></li>
        </ul>
      </div>
      <div>
        <p><strong>Company</strong></p>
        <ul>
          <li><a href="/about">About</a></li>
          <li><a href="/blog">Blog</a></li>
          <li><a href="/careers">Careers</a></li>
        </ul>
      </div>
      <div>
        <p><strong>Resources</strong></p>
        <ul>
          <li><a href="/docs">Documentation</a></li>
          <li><a href="/github">GitHub</a></li>
          <li><a href="/support">Support</a></li>
        </ul>
      </div>

      <div slot="legal">&copy; 2026 ARC UI. All rights reserved.</div>
    </Footer>
  );
}`,
      },
      {
        label: 'Preact',
        lang: 'tsx',
        code: `import { Footer } from '@arclux/arc-ui-preact';

export function SiteFooter() {
  return (
    <Footer border>
      <div slot="logo"><strong>ARC UI</strong></div>

      <div>
        <p><strong>Product</strong></p>
        <ul>
          <li><a href="/docs/components">Components</a></li>
          <li><a href="/docs/tokens">Tokens</a></li>
          <li><a href="/docs/changelog">Changelog</a></li>
        </ul>
      </div>
      <div>
        <p><strong>Company</strong></p>
        <ul>
          <li><a href="/about">About</a></li>
          <li><a href="/blog">Blog</a></li>
          <li><a href="/careers">Careers</a></li>
        </ul>
      </div>
      <div>
        <p><strong>Resources</strong></p>
        <ul>
          <li><a href="/docs">Documentation</a></li>
          <li><a href="/github">GitHub</a></li>
          <li><a href="/support">Support</a></li>
        </ul>
      </div>

      <div slot="legal">&copy; 2026 ARC UI. All rights reserved.</div>
    </Footer>
  );
}`,
      },
      { label: 'HTML', lang: 'html', code: `<!-- Auto-generated by @arclux/prism — do not edit manually -->
<!-- arc-footer — requires footer.css + base.css (or arc-ui.css) -->
<div class="arc-footer">
  <footer class="footer">
   <div class="footer__brand">
    <strong>ARC UI</strong>
   </div>
   <div class="footer__columns">
    <div>
      <p><strong>Product</strong></p>
      <ul>
        <li><a href="/docs/components">Components</a></li>
        <li><a href="/docs/tokens">Tokens</a></li>
        <li><a href="/docs/changelog">Changelog</a></li>
      </ul>
    </div>
    <div>
      <p><strong>Company</strong></p>
      <ul>
        <li><a href="/about">About</a></li>
        <li><a href="/blog">Blog</a></li>
        <li><a href="/careers">Careers</a></li>
      </ul>
    </div>
    <div>
      <p><strong>Resources</strong></p>
      <ul>
        <li><a href="/docs">Documentation</a></li>
        <li><a href="/github">GitHub</a></li>
        <li><a href="/support">Support</a></li>
      </ul>
    </div>
   </div>
   <div class="footer__social">

   </div>
   <div class="footer__legal">
    &copy; 2026 ARC UI. All rights reserved.
   </div>
   </footer>
</div>` },
      { label: 'HTML (Inline)', lang: 'html', code: `<!-- Auto-generated by @arclux/prism — do not edit manually -->
<!-- arc-footer — self-contained, no external CSS needed -->
<div class="arc-footer" style="display: block; background: rgb(3, 3, 7); color: rgb(138, 138, 150); font-family: 'Host Grotesk', system-ui, sans-serif; font-size: clamp(15px, 1.2vw, 16px)">
  <footer style="padding: 64px 40px 40px; border-top: 1px solid rgb(24, 24, 30)">
   <div style="margin-bottom: 40px">
    <strong style="color: rgb(232, 232, 236); font-size: 18px">ARC UI</strong>
   </div>
   <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 40px; margin-bottom: 40px">
    <div>
      <p style="margin: 0 0 12px; font-weight: 600; color: rgb(232, 232, 236); font-size: 13px; text-transform: uppercase; letter-spacing: 1px">Product</p>
      <ul style="list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px; font-size: 14px">
        <li><a href="/docs/components" style="color: rgb(138, 138, 150); text-decoration: none">Components</a></li>
        <li><a href="/docs/tokens" style="color: rgb(138, 138, 150); text-decoration: none">Tokens</a></li>
        <li><a href="/docs/changelog" style="color: rgb(138, 138, 150); text-decoration: none">Changelog</a></li>
      </ul>
    </div>
    <div>
      <p style="margin: 0 0 12px; font-weight: 600; color: rgb(232, 232, 236); font-size: 13px; text-transform: uppercase; letter-spacing: 1px">Company</p>
      <ul style="list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px; font-size: 14px">
        <li><a href="/about" style="color: rgb(138, 138, 150); text-decoration: none">About</a></li>
        <li><a href="/blog" style="color: rgb(138, 138, 150); text-decoration: none">Blog</a></li>
        <li><a href="/careers" style="color: rgb(138, 138, 150); text-decoration: none">Careers</a></li>
      </ul>
    </div>
    <div>
      <p style="margin: 0 0 12px; font-weight: 600; color: rgb(232, 232, 236); font-size: 13px; text-transform: uppercase; letter-spacing: 1px">Resources</p>
      <ul style="list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px; font-size: 14px">
        <li><a href="/docs" style="color: rgb(138, 138, 150); text-decoration: none">Documentation</a></li>
        <li><a href="/github" style="color: rgb(138, 138, 150); text-decoration: none">GitHub</a></li>
        <li><a href="/support" style="color: rgb(138, 138, 150); text-decoration: none">Support</a></li>
      </ul>
    </div>
   </div>
   <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 24px">

   </div>
   <div style="padding-top: 16px; border-top: 1px solid rgb(24, 24, 30); color: rgb(124, 124, 137); font-size: 12px">
    &copy; 2026 ARC UI. All rights reserved.
   </div>
   </footer>
</div>` }
    ],
  
  seeAlso: ["top-bar","sidebar","app-shell","link"],
};
