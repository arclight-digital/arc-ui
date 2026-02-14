import type { ComponentDef } from './_types';

export const authShell: ComponentDef = {
    name: 'Auth Shell',
    slug: 'auth-shell',
    tag: 'arc-auth-shell',
    tier: 'layout',
    interactivity: 'hybrid',
    description: 'Authentication page layout with centered and split variants for sign-in, sign-up, password-reset, and other credential flows. Provides logo, form card, footer, and optional aside slots out of the box.',

    overview: `AuthShell is a purpose-built page layout for authentication flows. Rather than assembling a centered card with manual CSS every time you need a login page, AuthShell gives you a semantically clear structure with dedicated slots for your logo, form content, footer links, and an optional marketing aside panel. The result is a consistent, polished auth experience that takes minutes to wire up instead of hours.

Two layout variants cover the most common patterns. The \`centered\` variant places a single card in the middle of the viewport — ideal for minimal sign-in pages, password-reset screens, and invite-acceptance flows where you want the user's full attention on the form. The \`split\` variant divides the viewport into a form side and an aside panel, giving you space for a product illustration, testimonial, or feature highlights alongside the credentials form.

Both variants are fully responsive. On mobile, the split layout collapses to a single column and hides the aside panel automatically, so users on small screens still get a clean, focused form without any extra media-query work on your part. The card region enforces a comfortable max-width of 420px, preventing overly wide inputs on large monitors while remaining spacious enough for multi-field forms, social login buttons, and terms-of-service links.`,

    features: [
      'Two layout variants: centered (single card) and split (form + aside panel)',
      'Dedicated slots for logo, default content (form), footer, and aside',
      'Responsive split layout collapses to single column on mobile',
      'Card region enforces 420px max-width for comfortable form widths',
      'CSS custom property theming via ARC UI design tokens',
      'Aside panel auto-hides on narrow viewports to keep forms uncluttered',
      'Exposed CSS parts (shell, logo, card, footer, form-side, aside) for deep customization',
      'Works seamlessly with Input, Button, Toggle, and other ARC UI form components',
    ],

    guidelines: {
      do: [
        'Use the centered variant for simple flows like sign-in, password reset, and magic-link entry',
        'Use the split variant when you have marketing content, illustrations, or testimonials to show alongside the form',
        'Place your brand logo in the logo slot so it appears above the form card consistently',
        'Include a footer slot with links to terms of service, privacy policy, and support',
        'Pair with ARC UI Input, Select, and Button components for consistent form styling',
        'Keep the form concise — ask only for credentials and one optional remember-me toggle',
      ],
      dont: [
        'Nest AuthShell inside AppShell — auth pages should be standalone, outside the main app chrome',
        'Use the split variant for mobile-only apps where the aside will never be visible',
        'Put navigation bars or sidebars inside AuthShell — it is designed as a single-purpose layout',
        'Overload the form card with too many fields; split long registration forms into multi-step flows instead',
        'Forget to provide a way back to the marketing site or a "sign up" link in the footer',
      ],
    },

    previewHtml: `<div style="width:100%;height:400px;border:1px solid var(--border-subtle);border-radius:var(--radius-md);overflow:hidden">
  <arc-auth-shell variant="split">
    <div slot="logo" style="font-family: 'Tektur', system-ui, sans-serif; font-size: 22px; font-weight: 700; letter-spacing: 2px; color: var(--text-heading);">ARC UI</div>
    <div style="display: flex; flex-direction: column; gap: 16px;">
      <h2 style="margin: 0 0 4px 0; font-family: 'Tektur', system-ui, sans-serif; font-size: 20px; color: var(--text-heading);">Sign In</h2>
      <p style="margin: 0; font-size: 14px; color: var(--text-muted);">Enter your credentials to continue</p>
      <arc-input label="Email" type="email" placeholder="you@example.com"></arc-input>
      <arc-input label="Password" type="password" placeholder="••••••••"></arc-input>
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <arc-toggle size="sm">Remember me</arc-toggle>
        <arc-link href="#">Forgot password?</arc-link>
      </div>
      <arc-button variant="primary" style="width: 100%;">Sign In</arc-button>
    </div>
    <div slot="footer">Don't have an account? <arc-link href="#">Sign up</arc-link></div>
    <div slot="aside" style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px; text-align: center; padding: 40px;">
      <div style="font-size: 48px;">&#128274;</div>
      <h3 style="margin: 0; font-family: 'Tektur', system-ui, sans-serif; font-size: 18px; color: var(--text-heading);">Secure by default</h3>
      <p style="margin: 0; font-size: 14px; color: var(--text-muted); max-width: 260px;">Your data is encrypted end-to-end with enterprise-grade security built into every layer.</p>
    </div>
  </arc-auth-shell>
</div>`,

    props: [
      {
        name: 'variant',
        type: "'centered' | 'split'",
        default: "'centered'",
        description: 'Controls the page layout. Centered places a single card in the middle of the viewport, best for focused credential flows. Split divides the viewport into a form side and an aside panel for marketing content or illustrations. On mobile, split collapses to a single-column centered layout automatically.',
      },
    ],

    tabs: [
      {
        label: 'Web Component',
        lang: 'html',
        code: `<script type="module" src="@arclux/arc-ui"></script>

<arc-auth-shell variant="split">
  <div slot="logo" style="font-size: 22px; font-weight: 700;">ARC UI</div>

  <div style="display: flex; flex-direction: column; gap: 16px;">
    <h2 style="margin: 0;">Sign In</h2>
    <p style="margin: 0; color: var(--text-muted); font-size: 14px;">Enter your credentials to continue</p>
    <arc-input label="Email" type="email" placeholder="you@example.com"></arc-input>
    <arc-input label="Password" type="password" placeholder="••••••••"></arc-input>
    <div style="display: flex; align-items: center; justify-content: space-between;">
      <arc-toggle size="sm">Remember me</arc-toggle>
      <arc-link href="#">Forgot password?</arc-link>
    </div>
    <arc-button variant="primary" style="width: 100%;">Sign In</arc-button>
  </div>

  <div slot="footer">Don't have an account? <arc-link href="#">Sign up</arc-link></div>
  <div slot="aside" style="padding: 40px; text-align: center;">
    <h3>Secure by default</h3>
    <p style="color: var(--text-muted);">Enterprise-grade encryption on every layer.</p>
  </div>
</arc-auth-shell>`,
      },
      {
        label: 'React',
        lang: 'tsx',
        code: `import { AuthShell, Input, Button, Toggle, Link } from '@arclux/arc-ui-react';

export function SignInPage() {
  return (
    <AuthShell variant="split">
      <div slot="logo" style={{ fontSize: 22, fontWeight: 700 }}>ARC UI</div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <h2 style={{ margin: 0 }}>Sign In</h2>
        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: 14 }}>
          Enter your credentials to continue
        </p>
        <Input label="Email" type="email" placeholder="you@example.com" />
        <Input label="Password" type="password" placeholder="••••••••" />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Toggle size="sm">Remember me</Toggle>
          <Link href="#">Forgot password?</Link>
        </div>
        <Button variant="primary" style={{ width: '100%' }}>Sign In</Button>
      </div>

      <div slot="footer">Don't have an account? <Link href="#">Sign up</Link></div>
      <div slot="aside" style={{ padding: 40, textAlign: 'center' }}>
        <h3>Secure by default</h3>
        <p style={{ color: 'var(--text-muted)' }}>Enterprise-grade encryption on every layer.</p>
      </div>
    </AuthShell>
  );
}`,
      },
      {
        label: 'Vue',
        lang: 'html',
        code: `<script setup>
import { AuthShell, Input, Button, Toggle, Link } from '@arclux/arc-ui-vue';
</script>

<template>
  <AuthShell variant="split">
    <div slot="logo" style="font-size: 22px; font-weight: 700;">ARC UI</div>

    <div style="display: flex; flex-direction: column; gap: 16px;">
      <h2 style="margin: 0;">Sign In</h2>
      <p style="margin: 0; color: var(--text-muted); font-size: 14px;">
        Enter your credentials to continue
      </p>
      <Input label="Email" type="email" placeholder="you@example.com" />
      <Input label="Password" type="password" placeholder="••••••••" />
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <Toggle size="sm">Remember me</Toggle>
        <Link href="#">Forgot password?</Link>
      </div>
      <Button variant="primary" style="width: 100%;">Sign In</Button>
    </div>

    <div slot="footer">Don't have an account? <Link href="#">Sign up</Link></div>
    <div slot="aside" style="padding: 40px; text-align: center;">
      <h3>Secure by default</h3>
      <p style="color: var(--text-muted);">Enterprise-grade encryption on every layer.</p>
    </div>
  </AuthShell>
</template>`,
      },
      {
        label: 'Svelte',
        lang: 'html',
        code: `<script>
  import { AuthShell, Input, Button, Toggle, Link } from '@arclux/arc-ui-svelte';
</script>

<AuthShell variant="split">
  <div slot="logo" style="font-size: 22px; font-weight: 700;">ARC UI</div>

  <div style="display: flex; flex-direction: column; gap: 16px;">
    <h2 style="margin: 0;">Sign In</h2>
    <p style="margin: 0; color: var(--text-muted); font-size: 14px;">
      Enter your credentials to continue
    </p>
    <Input label="Email" type="email" placeholder="you@example.com" />
    <Input label="Password" type="password" placeholder="••••••••" />
    <div style="display: flex; align-items: center; justify-content: space-between;">
      <Toggle size="sm">Remember me</Toggle>
      <Link href="#">Forgot password?</Link>
    </div>
    <Button variant="primary" style="width: 100%;">Sign In</Button>
  </div>

  <div slot="footer">Don't have an account? <Link href="#">Sign up</Link></div>
  <div slot="aside" style="padding: 40px; text-align: center;">
    <h3>Secure by default</h3>
    <p style="color: var(--text-muted);">Enterprise-grade encryption on every layer.</p>
  </div>
</AuthShell>`,
      },
      {
        label: 'Angular',
        lang: 'ts',
        code: `import { Component } from '@angular/core';
import { AuthShell, Input, Button, Toggle, Link } from '@arclux/arc-ui-angular';

@Component({
  imports: [AuthShell, Input, Button, Toggle, Link],
  template: \`
    <AuthShell variant="split">
      <div slot="logo" style="font-size: 22px; font-weight: 700;">ARC UI</div>

      <div style="display: flex; flex-direction: column; gap: 16px;">
        <h2 style="margin: 0;">Sign In</h2>
        <p style="margin: 0; color: var(--text-muted); font-size: 14px;">
          Enter your credentials to continue
        </p>
        <Input label="Email" type="email" placeholder="you@example.com"></Input>
        <Input label="Password" type="password" placeholder="••••••••"></Input>
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <Toggle size="sm">Remember me</Toggle>
          <Link href="#">Forgot password?</Link>
        </div>
        <Button variant="primary" style="width: 100%;">Sign In</Button>
      </div>

      <div slot="footer">Don't have an account? <Link href="#">Sign up</Link></div>
      <div slot="aside" style="padding: 40px; text-align: center;">
        <h3>Secure by default</h3>
        <p style="color: var(--text-muted);">Enterprise-grade encryption on every layer.</p>
      </div>
    </AuthShell>
  \`,
})
export class SignInPageComponent {}`,
      },
      {
        label: 'Solid',
        lang: 'tsx',
        code: `import { AuthShell, Input, Button, Toggle, Link } from '@arclux/arc-ui-solid';

export function SignInPage() {
  return (
    <AuthShell variant="split">
      <div slot="logo" style={{ 'font-size': '22px', 'font-weight': '700' }}>ARC UI</div>

      <div style={{ display: 'flex', 'flex-direction': 'column', gap: '16px' }}>
        <h2 style={{ margin: '0' }}>Sign In</h2>
        <p style={{ margin: '0', color: 'var(--text-muted)', 'font-size': '14px' }}>
          Enter your credentials to continue
        </p>
        <Input label="Email" type="email" placeholder="you@example.com" />
        <Input label="Password" type="password" placeholder="••••••••" />
        <div style={{ display: 'flex', 'align-items': 'center', 'justify-content': 'space-between' }}>
          <Toggle size="sm">Remember me</Toggle>
          <Link href="#">Forgot password?</Link>
        </div>
        <Button variant="primary" style={{ width: '100%' }}>Sign In</Button>
      </div>

      <div slot="footer">Don't have an account? <Link href="#">Sign up</Link></div>
      <div slot="aside" style={{ padding: '40px', 'text-align': 'center' }}>
        <h3>Secure by default</h3>
        <p style={{ color: 'var(--text-muted)' }}>Enterprise-grade encryption on every layer.</p>
      </div>
    </AuthShell>
  );
}`,
      },
      {
        label: 'Preact',
        lang: 'tsx',
        code: `import { AuthShell, Input, Button, Toggle, Link } from '@arclux/arc-ui-preact';

export function SignInPage() {
  return (
    <AuthShell variant="split">
      <div slot="logo" style={{ fontSize: 22, fontWeight: 700 }}>ARC UI</div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <h2 style={{ margin: 0 }}>Sign In</h2>
        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: 14 }}>
          Enter your credentials to continue
        </p>
        <Input label="Email" type="email" placeholder="you@example.com" />
        <Input label="Password" type="password" placeholder="••••••••" />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Toggle size="sm">Remember me</Toggle>
          <Link href="#">Forgot password?</Link>
        </div>
        <Button variant="primary" style={{ width: '100%' }}>Sign In</Button>
      </div>

      <div slot="footer">Don't have an account? <Link href="#">Sign up</Link></div>
      <div slot="aside" style={{ padding: 40, textAlign: 'center' }}>
        <h3>Secure by default</h3>
        <p style={{ color: 'var(--text-muted)' }}>Enterprise-grade encryption on every layer.</p>
      </div>
    </AuthShell>
  );
}`,
      },
      { label: 'HTML', lang: 'html', code: `<!-- Auto-generated by @arclux/prism — do not edit manually -->
<!-- arc-auth-shell — requires auth-shell.css + base.css (or arc-ui.css) -->
<div class="arc-auth-shell">
  <div class="auth-shell--split">
   <div class="form-side">
   <div class="logo">

   </div>
   <div class="card">
   Auth Shell
   </div>
   <div class="footer">

   </div>
   </div>
   <div class="aside-side">

   </div>
   </div>
</div>` },
      { label: 'HTML (Inline)', lang: 'html', code: `<!-- Auto-generated by @arclux/prism — do not edit manually -->
<!-- arc-auth-shell — self-contained, no external CSS needed -->
<style>
  @media (max-width: 768px) {
    .arc-auth-shell .auth-shell--split { grid-template-columns: 1fr; }
  }
  @media (max-width: 768px) {
    .arc-auth-shell .auth-shell--split .aside-side { display: none; }
  }
</style>
<div class="arc-auth-shell" style="display: block; box-sizing: border-box">
  <div class="auth-shell--split" style="display: grid; grid-template-columns: 1fr 1fr; min-height: 100vh; box-sizing: border-box">
   <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; background: rgb(10, 10, 15); padding: 40px 24px">
   <div style="margin-bottom: 40px; text-align: center">

   </div>
   <div style="background: rgb(13, 13, 18); border: 1px solid rgb(34, 34, 41); border-radius: 14px; padding: 40px; width: 100%; max-width: 420px; box-sizing: border-box">
   Auth Shell
   </div>
   <div style="margin-top: 24px; color: rgb(124, 124, 137); font-size: 13px; text-align: center">

   </div>
   </div>
   <div class="aside-side" style="display: flex; align-items: center; justify-content: center; background: rgb(3, 3, 7); padding: 40px">

   </div>
   </div>
</div>` }
    ],
  
  seeAlso: ["app-shell","form"],
};
