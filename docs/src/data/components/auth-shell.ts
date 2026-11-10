import type { ComponentDef } from './_types';

export const authShell: ComponentDef = {
  name: 'Auth Shell',
  slug: 'auth-shell',
  tag: 'arc-auth-shell',
  tier: 'layout',
  interactivity: 'hybrid',
  description:
    'A page layout for sign-in, sign-up and password reset, with the form in a centered card or beside an aside panel.',

  overview: `AuthShell is the page layout for sign-in, sign-up and password reset. It has slots for your logo, the form (default slot), footer links and an optional aside panel.

The \`centered\` variant puts one card in the middle of the viewport, for sign-in, password reset and invite acceptance. The \`split\` variant puts the form on one side and the aside on the other, for an illustration, a testimonial or product highlights.`,

  features: [
    'At 768 px and below, the split layout collapses to one column and hides the aside',
    "The card is at most 420px wide, so inputs don't stretch across a large monitor",
  ],

  guidelines: {
    do: [
      'Use the centered variant for short flows like sign-in, password reset and magic-link entry',
      'Use the split variant when you have an illustration or other content to show next to the form',
      'Put your logo in the logo slot',
      'Put links to the terms, privacy policy and support in the footer slot, plus a way to sign up or get back to the main site',
      'Ask only for credentials, plus an optional remember-me toggle',
    ],
    dont: [
      "Don't put AuthShell inside AppShell. Auth pages stand on their own, outside the app's chrome",
      "Don't use the split variant in a mobile-only app, where the aside never shows",
      "Don't put navigation bars or sidebars inside it",
      "Don't pack the card with fields. Split long registration forms into steps",
    ],
  },

  previewLayout: 'frame',
  previewHeight: '560px',

  previewHtml: `<div style="width:100%;height:100%;border:1px solid var(--border-subtle);border-radius:var(--radius-md);overflow:hidden">
  <arc-auth-shell variant="split">
    <div slot="logo" style="font-family: 'Tomorrow', system-ui, sans-serif; font-size: 22px; font-weight: 700; letter-spacing: 1px; color: var(--text-heading);">ARC UI</div>
    <div style="display: flex; flex-direction: column; gap: 16px;">
      <h2 style="margin: 0 0 4px 0; font-family: 'Tomorrow', system-ui, sans-serif; font-size: 20px; color: var(--text-heading);">Sign in</h2>
      <p style="margin: 0; font-size: 14px; color: var(--text-muted);">Enter your credentials to continue</p>
      <arc-input label="Email" type="email" placeholder="you@example.com"></arc-input>
      <arc-input label="Password" type="password" placeholder="••••••••"></arc-input>
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <arc-toggle size="sm" label="Remember me"></arc-toggle>
        <arc-link href="#">Forgot password?</arc-link>
      </div>
      <arc-button variant="primary" style="width: 100%;">Sign in</arc-button>
    </div>
    <div slot="footer">Don't have an account? <arc-link href="#">Sign up</arc-link></div>
    <div slot="aside" style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px; text-align: center; padding: 40px;">
      <div style="font-size: 48px;">&#128274;</div>
      <h3 style="margin: 0; font-family: 'Tomorrow', system-ui, sans-serif; font-size: 18px; color: var(--text-heading);">Welcome back</h3>
      <p style="margin: 0; font-size: 14px; color: var(--text-muted); max-width: 260px;">Sign in to see your projects and recent activity.</p>
    </div>
  </arc-auth-shell>
</div>`,

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
      <arc-toggle size="sm" label="Remember me"></arc-toggle>
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
          <Toggle size="sm" label="Remember me" />
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
        <Toggle size="sm" label="Remember me" />
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
      <Toggle size="sm" label="Remember me" />
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
    <arc-auth-shell variant="split">
      <div slot="logo" style="font-size: 22px; font-weight: 700;">ARC UI</div>

      <div style="display: flex; flex-direction: column; gap: 16px;">
        <h2 style="margin: 0;">Sign In</h2>
        <p style="margin: 0; color: var(--text-muted); font-size: 14px;">
          Enter your credentials to continue
        </p>
        <arc-input label="Email" type="email" placeholder="you@example.com"></arc-input>
        <arc-input label="Password" type="password" placeholder="••••••••"></arc-input>
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <arc-toggle size="sm" label="Remember me"></arc-toggle>
          <arc-link href="#">Forgot password?</arc-link>
        </div>
        <arc-button variant="primary" style="width: 100%;">Sign In</arc-button>
      </div>

      <div slot="footer">Don't have an account? <arc-link href="#">Sign up</arc-link></div>
      <div slot="aside" style="padding: 40px; text-align: center;">
        <h3>Secure by default</h3>
        <p style="color: var(--text-muted);">Enterprise-grade encryption on every layer.</p>
      </div>
    </arc-auth-shell>
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
          <Toggle size="sm" label="Remember me" />
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
          <Toggle size="sm" label="Remember me" />
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
      label: 'HTML',
      lang: 'html',
      code: `<!-- Auto-generated by @arclux/prism — do not edit manually -->
<!-- arc-auth-shell — requires auth-shell.css + base.css (or arc-ui.css) -->
<div class="arc-auth-shell">
  <div class="auth-shell--split">
   <div class="form-side">
   <div class="logo">

   </div>
   <div class="card">
   AuthShell
   </div>
   <div class="footer">

   </div>
   </div>
   <div class="aside-side">

   </div>
   </div>
</div>`,
    },
    {
      label: 'HTML (Inline)',
      lang: 'html',
      code: `<!-- Auto-generated by @arclux/prism — do not edit manually -->
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
   AuthShell
   </div>
   <div style="margin-top: 24px; color: rgb(124, 124, 137); font-size: 13px; text-align: center">

   </div>
   </div>
   <div class="aside-side" style="display: flex; align-items: center; justify-content: center; background: rgb(3, 3, 7); padding: 40px">

   </div>
   </div>
</div>`,
    },
  ],

  seeAlso: ['app-shell', 'form'],
};
