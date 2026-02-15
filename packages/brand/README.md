# @arclux/brand

Arclight brand components — self-contained Lit web components for logo, wordmark, and attribution badges. All fonts are embedded as subsetted base64 WOFF2, no external requests.

## Components

### `<arclight-logo>`

Standalone logo mark.

```html
<arclight-logo size="sm"></arclight-logo>
<arclight-logo size="lg"></arclight-logo>
```

| Prop | Values | Default | Description |
|------|--------|---------|-------------|
| `size` | `sm`, `lg` | `sm` | 32px or 96px tall |

### `<arclight-wordmark>`

"ARCLIGHT" text in Host Grotesk (embedded subset).

```html
<arclight-wordmark size="sm"></arclight-wordmark>
<arclight-wordmark size="md"></arclight-wordmark>
<arclight-wordmark size="lg"></arclight-wordmark>
```

| Prop | Values | Default | Description |
|------|--------|---------|-------------|
| `size` | `sm`, `md`, `lg`, `stacked` | `sm` | Font size variant |

### `<arclight-logo-wordmark>`

Logo + wordmark lockup.

```html
<arclight-logo-wordmark layout="inline"></arclight-logo-wordmark>
<arclight-logo-wordmark layout="stacked"></arclight-logo-wordmark>
```

| Prop | Values | Default | Description |
|------|--------|---------|-------------|
| `layout` | `inline`, `stacked` | `inline` | Horizontal or vertical layout |
| `href` | URL string | `https://arclight.build` | Link target |

### `<arclight-by>`

"BY [logo] ARCLIGHT" attribution badge.

```html
<arclight-by></arclight-by>
```

| Prop | Values | Default | Description |
|------|--------|---------|-------------|
| `href` | URL string | `https://arclight.build` | Link target |

### `<arclight-powered-by>`

"POWERED BY [logo] ARCLIGHT" attribution badge.

```html
<arclight-powered-by size="sm"></arclight-powered-by>
<arclight-powered-by size="md"></arclight-powered-by>
```

| Prop | Values | Default | Description |
|------|--------|---------|-------------|
| `size` | `sm`, `md` | `md` | Font size variant |
| `href` | URL string | `https://arclight.build` | Link target |

## Theming

Components use `currentColor` for the logo SVG and `--text-primary` for the wordmark. On dark backgrounds they work out of the box. On light backgrounds, set `color` on a parent element or load `base.css` with a light theme.

Hover effects use `--accent-primary-rgb` and `--accent-secondary-rgb` with hardcoded fallbacks.

## Updating logos

1. Drop `.svg` files in `packages/brand/src/assets/svg/`
2. Run `pnpm generate` (or `node scripts/generate-brand-assets.js`)
3. The script strips XML headers and replaces brand colors with `currentColor`

## Preview

```
cd packages/brand && pnpm preview
```

## Install

```
pnpm add @arclux/brand
```

Peer dependency: `lit ^3.3.0`
