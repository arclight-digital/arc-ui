// Generated from custom-elements.json by scripts/generate-types.js — do not edit
import { LitElement } from 'lit';

/**
 * `<arc-accordion>`
 */
export declare class ArcAccordion extends LitElement {
  /** When true, allows multiple accordion panels to be open simultaneously. When false (default), opening one panel closes any other open panel. @default false */
  multiple: boolean;
}

/**
 * `<arc-accordion-item>`
 */
export declare class ArcAccordionItem extends LitElement {
  /** Answer content from slotted children */
  answer: unknown;
  /** The heading text displayed on the trigger button. Should be a concise, scannable label or question. @default '' */
  question: string;
}

/**
 * `<arc-activity-heatmap>`
 */
export declare class ArcActivityHeatmap extends LitElement {
  /** One entry per day with activity: an ISO `date` (YYYY-MM-DD), a numeric `value` mapped to the intensity ramp, and an optional `label` shown in the hover detail in place of the bare value (e.g. "7 commits"). Days in the rendered span with no entry render as empty cells, so sparse data is fine. Property only — set it from script or a framework binding. @default [] */
  data: Array<{date: string, value: number, label?: string}>;
  /** The newest day shown, as an ISO string (YYYY-MM-DD). Unset: today in the browser; on the server, the newest date in `data` (see above). @default '' */
  endDate: string;
  /** How many week columns to render, counting back from the week containing the end date (default 52). The last column is truncated after the end date, so the newest cell is always the end date itself. @default 52 */
  weeks: number;
  /** Which day starts each column: "sunday" (default, the GitHub convention) or "monday". @default 'sunday' */
  weekStart: string;
  /** When set, intensity is a linear scale from 0 to this value instead of the default quartile mapping: each nonzero value lands on step 1-4 by `value / max`. Values at or above `max` render as step 4. @default null */
  max: number;
  /** Whether to render the Less→More swatch strip under the grid (default true; set the attribute to the string "false" to disable from markup). @default true */
  legend: boolean;
}

/**
 * `<arc-alert>`
 * Events: arc-close
 */
export declare class ArcAlert extends LitElement {
  /** Optional bold heading rendered above the body slot. Use it for a scannable one-line summary so users can quickly gauge the alert's importance before reading the full message. @default '' */
  heading: string;
  /** Controls the semantic color palette and icon. Use "info" for neutral guidance, "success" for confirmations, "warning" for caution states, and "error" for failures or blocking issues. @default 'info' */
  variant: 'info' | 'success' | 'warning' | 'error';
  /** When true, renders a close button in the top-right corner. Clicking it removes the alert from the DOM and fires an "arc-close" event that parent components can listen to. @default false */
  dismissible: boolean;
  /** Visual density. 'compact' reduces padding and font sizes for inline or space-constrained usage. @default 'default' */
  density: 'default' | 'compact';
}

/**
 * `<arc-anchor-nav>`
 * Events: arc-change
 */
export declare class ArcAnchorNav extends LitElement {
  /** The value of the currently active link. Controls which item is highlighted. @default '' */
  value: string;
  /** Declarative list of items to render. Each object needs a label (display text) and value (identifier). Alternative to slotting children. @default [] */
  items: Array<{label: string, value: string}>;
  /** Layout direction. Vertical renders a column of links; horizontal renders a row. @default 'horizontal' */
  orientation: 'vertical' | 'horizontal';
}

/**
 * `<arc-animated-number>`
 */
export declare class ArcAnimatedNumber extends LitElement {
  /** Target number to animate to @default 0 */
  value: number;
  /** Animation duration in milliseconds @default 1000 */
  duration: number;
  /** String prepended before the number (e.g., "$") @default '' */
  prefix: string;
  /** String appended after the number (e.g., "%") @default '' */
  suffix: string;
  /** Number of fixed decimal places @default 0 */
  decimals: number;
  /** BCP 47 locale tag passed to Intl.NumberFormat for locale-aware number formatting (thousands separators, decimal marks). @default 'en-US' */
  locale: string;
  /** Controls how the number is formatted using Intl.NumberFormat. Use currency with a prefix like $ or percent with a suffix like %. @default 'number' */
  format: 'number' | 'currency' | 'percent';
}

/**
 * `<arc-announcement>`
 */
export declare class ArcAnnouncement extends LitElement {
  /** The text to announce to screen readers. Each time this property changes, a new announcement is triggered. @default '' */
  message: string;
  /** Controls the ARIA live region politeness level. Polite waits for the screen reader to finish before announcing; assertive interrupts immediately. @default 'polite' */
  politeness: 'polite' | 'assertive';
}

/**
 * `<arc-app-shell>`
 * Events: arc-sidebar-toggle
 */
export declare class ArcAppShell extends LitElement {
  /** Viewport width in pixels at which the layout switches between mobile and desktop modes. */
  breakpoint: number;
  /** Controls whether the sidebar is visible on mobile viewports (below 768 px). On desktop the sidebar is always shown regardless of this attribute. Toggle it from a hamburger button in your TopBar to give mobile users access to navigation. @default false */
  sidebarOpen: boolean;
}

/**
 * `<arc-aspect-grid>`
 */
export declare class ArcAspectGrid extends LitElement {
  /** Number of columns in the grid. Each column is equal width (1fr). @default 3 */
  columns: number;
  /** Aspect ratio applied to every cell. 1/1 for squares, 16/9 for widescreen, 4/3 for classic landscape. @default '1/1' */
  ratio: '1/1' | '16/9' | '4/3';
  /** Spacing between grid cells, mapped to design system spacing tokens (--space-sm, --space-md, --space-lg). @default 'md' */
  gap: 'sm' | 'md' | 'lg';
}

/**
 * `<arc-aspect-ratio>`
 */
export declare class ArcAspectRatio extends LitElement {
  /** Aspect ratio as a `W/H` string. Supports integers and decimals. Falls back to `16/9` if invalid. @default '16/9' */
  ratio: string;
}

/**
 * `<arc-auth-shell>`
 */
export declare class ArcAuthShell extends LitElement {
  /** Controls the page layout. Centered places a single card in the middle of the viewport, best for focused credential flows. Split divides the viewport into a form side and an aside panel for marketing content or illustrations. On mobile, split collapses to a single-column centered layout automatically. @default 'centered' */
  variant: 'centered' | 'split';
}

/**
 * `<arc-avatar>`
 */
export declare class ArcAvatar extends LitElement {
  /** Image URL for the avatar. When provided, renders an `<img>` element. When empty, displays initials derived from the `name` prop. @default '' */
  src: string;
  /** User name used to generate initials (first letter, uppercased) and as the `alt` text / `aria-label` for the avatar. @default '' */
  name: string;
  /** Controls avatar dimensions: `sm` (32px), `md` (40px), `lg` (56px). @default 'md' */
  size: 'sm' | 'md' | 'lg';
  /** Shows a status indicator dot. Empty (the default) shows none. An unrecognised value falls back to empty rather than rendering an uncoloured dot that screen readers announce by its bogus name. @default '' */
  status: '' | 'online' | 'offline' | 'busy' | 'away';
  /** Controls the avatar shape. Options: 'circle', 'square', 'rounded'. @default 'circle' */
  shape: 'circle' | 'square' | 'rounded';
}

/**
 * `<arc-avatar-group>`
 */
export declare class ArcAvatarGroup extends LitElement {
  /** Maximum number of avatars to display. Excess avatars are hidden and a "+N" overflow badge is shown. @default Infinity */
  max: number;
  /** Overlap density preset. sm = -8px, md = -12px, lg = -16px negative margin between avatars. @default 'md' */
  overlap: 'sm' | 'md' | 'lg';
}

/**
 * `<arc-badge>`
 */
export declare class ArcBadge extends LitElement {
  /** Custom RGB color value (e.g. `"255, 100, 50"`) that overrides the variant color. Sets the border, text, background tint, and hover glow to the specified color. @default '' */
  color: string;
  /** Controls the badge color scheme. Default renders a neutral gray. Primary and secondary use the accent token colors. Success, warning, error, and info map to the corresponding semantic color tokens for status-oriented labels. @default 'default' */
  variant: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  /** Controls the badge size. Options: 'sm', 'md', 'lg'. @default 'md' */
  size: 'sm' | 'md' | 'lg';
}

/**
 * `<arc-banner>`
 * Events: arc-close
 */
export declare class ArcBanner extends LitElement {
  /** Controls the semantic color palette and icon. Use "info" for neutral announcements, "success" for positive confirmations, "warning" for caution states, and "error" for outages or critical failures. @default 'info' */
  variant: 'info' | 'success' | 'warning' | 'error';
  /** When true, renders a close button on the right side. Clicking it collapses the banner and fires an "arc-close" event. @default false */
  dismissible: boolean;
  /** When true, pins the banner to the top of the viewport with position: sticky so it remains visible as the user scrolls. @default false */
  sticky: boolean;
}

/**
 * `<arc-blockquote>`
 */
export declare class ArcBlockquote extends LitElement {
  /** Citation or attribution text displayed beneath the quote with an em dash prefix @default '' */
  cite: string;
  /** Visual variant. Accent applies a gradient text fill to the quote content. @default 'default' */
  variant: 'default' | 'accent';
}

/**
 * `<arc-bottom-nav>`
 * Events: arc-change
 */
export declare class ArcBottomNav extends LitElement {
  /** Array of navigation items, each with a label, icon name, and value identifier. @default [] */
  items: Array<{label: string, icon?: string, value: string}>;
  /** The value of the currently active item. Controls which item is highlighted. @default '' */
  value: string;
}

/**
 * `<arc-breadcrumb>`
 * Events: arc-navigate
 */
export declare class ArcBreadcrumb extends LitElement {
  /** Character used as the separator between breadcrumb items. Common options: '/', '>', '•'. @default '/' */
  separator: string;
  /** @default 'Breadcrumb' */
  label: string;
}

/**
 * `<arc-breadcrumb-item>`
 */
export declare class ArcBreadcrumbItem extends LitElement {
  /** Destination, preferring the explicit attribute over an anchor child. Authoring `<arc-breadcrumb-item><a href="/docs">Docs</a></arc-breadcrumb-item>` leaves a working trail in the pre-upgrade markup — arc-breadcrumb hides this light DOM only once it has re-rendered it into shadow DOM. */
  resolvedHref: unknown;
  /** textContent already reaches through an anchor child, so this needs no special case. */
  label: unknown;
  /** Navigation URL for this crumb. When provided, the crumb renders as a clickable link styled in muted text that brightens on hover. Omit this property on the final item to mark it as the current page -- it will receive `aria-current="page"` and a bolder font weight automatically. @default '' */
  href: string;
}

/**
 * `<arc-breadcrumb-menu>`
 * Events: arc-navigate
 */
export declare class ArcBreadcrumbMenu extends LitElement {
  /** @default 'Breadcrumb' */
  label: string;
  /** Array of breadcrumb items. Each item has a label and href. Optionally include a siblings array to enable a dropdown at that level. @default [] */
  items: Array<{label: string, href?: string, siblings?: Array<{label: string, href?: string}>}>;
}

/**
 * `<arc-button>`
 */
export declare class ArcButton extends LitElement {
  /** When provided, the button renders as an <a> element instead of a <button>, making it a navigational link. This is the recommended approach for any action that takes the user to a new page or section. @default '' */
  href: string;
  /** Controls the visual weight and emphasis. Primary is a filled button with a neon glow hover suited for the top-level CTA. Secondary uses a bordered outline for supporting actions. Ghost renders with no border or background, ideal for low-priority or tertiary actions. @default 'primary' */
  variant: 'primary' | 'secondary' | 'ghost';
  /** Sets the button size. Large (lg) is intended for hero sections and high-impact areas. Medium (md) is the default for general UI. Small (sm) fits compact toolbars, table rows, and inline contexts. @default 'md' */
  size: 'sm' | 'md' | 'lg';
  /** When true, dims the button and prevents all pointer and keyboard interaction. Applies reduced opacity and removes hover/focus effects. Consider pairing with a tooltip that explains why the action is unavailable. @default false */
  disabled: boolean;
  /** Shows a spinner and disables the button. Use for async operations like form submission or API calls. @default false */
  loading: boolean;
  /** Sets the HTML button type attribute. Use `submit` inside forms to trigger native form submission, or `reset` to clear form fields. Only applies when no `href` is set (link buttons ignore this). @default 'button' */
  type: 'button' | 'submit' | 'reset';
}

/**
 * `<arc-button-group>`
 */
export declare class ArcButtonGroup extends LitElement {
  /** Button variant cascaded to all children (e.g., "ghost", "outline"). @default '' */
  variant: string;
  /** Layout direction. Vertical stacks buttons top-to-bottom. @default 'horizontal' */
  orientation: 'horizontal' | 'vertical';
  /** Size cascaded to all child buttons. @default 'md' */
  size: 'sm' | 'md' | 'lg';
}

/**
 * `<arc-calendar>`
 * Events: arc-month-change, arc-change
 */
export declare class ArcCalendar extends LitElement {
  /** BCP 47 tag used for month and weekday names. Defaults to the document's `lang`, then the browser's language. @default '' */
  locale: string;
  /** The selected date as an ISO string (YYYY-MM-DD). Empty string means no date is selected. @default '' */
  value: string;
  /** Minimum selectable date as an ISO string. Days before this date are disabled. @default '' */
  min: string;
  /** Maximum selectable date as an ISO string. Days after this date are disabled. @default '' */
  max: string;
  /** The currently displayed month (0-based, 0=January). Defaults to the current month. Clamped to 0-11: an out-of-range month reached `new Date(year, month)`, which silently rolls into another year. */
  month: number;
  /** The currently displayed year. Defaults to the current year. */
  year: number;
  /** Which day the week starts on, 1 = Monday … 7 = Sunday. 0 (the default) follows the locale's own convention. An unrecognised value falls back to 0 rather than reaching weekdayOffset() and reordering the week arbitrarily. @default 0 */
  firstDayOfWeek: 0|1|2|3|4|5|6|7;
}

/**
 * `<arc-callout>`
 * Events: arc-close
 */
export declare class ArcCallout extends LitElement {
  /** Semantic variant that controls the color scheme, top accent bar, and default icon @default 'info' */
  variant: 'info' | 'tip' | 'warning' | 'error';
  /** Shows a close button that removes the callout. Fires an arc-close event on close. @default false */
  dismissible: boolean;
}

/**
 * `<arc-card>`
 */
export declare class ArcCard extends LitElement {
  /** When set, renders the card as an anchor element, making the entire card surface a clickable link. On hover, the border transitions to a blue-to-violet gradient and the inner surface gains a lift shadow. @default '' */
  href: string;
  /** Controls internal spacing. Options: 'none', 'sm', 'md', 'lg'. @default 'md' */
  padding: 'none' | 'sm' | 'md' | 'lg';
  /** Enables hover effects for clickable cards that trigger JS instead of navigating via href. @default false */
  interactive: boolean;
}

/**
 * `<arc-carousel>`
 * Events: arc-change
 */
export declare class ArcCarousel extends LitElement {
  /** Enables automatic slide advancement on a timer. Pauses on hover and focus, respects prefers-reduced-motion. @default false */
  autoPlay: boolean;
  /** Auto-play interval in milliseconds between slide transitions. @default 5000 */
  interval: number;
  /** Enables wrapping at the edges so the last slide connects to the first and vice versa. @default true */
  loop: boolean;
  /** Shows dot indicators below the viewport for direct slide navigation. @default true */
  showDots: boolean;
  /** Shows previous/next arrow buttons on the left and right edges of the viewport. @default true */
  showArrows: boolean;
}

/**
 * `<arc-center>`
 */
export declare class ArcCenter extends LitElement {
  /** Maximum width for the centered content block. Accepts any CSS length or custom property. Only applies in default (block) centering mode. @default '60ch' */
  maxWidth: string;
  /** Enables intrinsic centering mode using flexbox, which centers children based on their natural width rather than stretching to max-width. @default false */
  intrinsic: boolean;
  /** Adds text-align: center for centering inline text content within the block. @default false */
  text: boolean;
}

/**
 * `<arc-chart>`
 * Events: arc-mark-click
 */
export declare class ArcChart extends LitElement {
  /** The data that drives the chart. Each entry is one series; all series share the x axis defined by `labels`. Set via JavaScript property, not an attribute. Colors are assigned in fixed order from --chart-1 to --chart-6; series beyond six are summed into an "Other" series noted in the legend. @default [] */
  series: Array<{label:string,data:number[]}>;
  /** Category labels for the x axis (or donut segment names when a single series is given). Labels that would collide are automatically thinned — every Nth label renders based on available width. @default [] */
  labels: string[];
  /** Chart height in pixels. Width is fluid and tracked with a ResizeObserver. @default 260 */
  height: number;
  /** ISO 4217 currency code used when value-format="currency". @default 'USD' */
  currency: string;
  /** The chart form. Line and area share the x axis across all series; bar renders grouped columns (or stacked with the `stacked` attribute); donut renders one segment per series (or per category when a single series is given). @default 'line' */
  type: 'line' | 'area' | 'bar' | 'donut';
  /** Bar type only. Stacks series segments on a shared baseline with 2px surface gaps between segments; only the outermost segment gets the rounded value end. Assumes non-negative data. @default false */
  stacked: boolean;
  /** Suppresses the legend. By default the legend renders for two or more series and is omitted for a single series. @default false */
  hideLegend: boolean;
  /** Removes the axis layer — gridlines, y tick labels, and x category labels — for compact trend panels where exact values are read from the tooltip. @default false */
  hideAxis: boolean;
  /** How values are formatted in tooltips, the axis, and the accessible data table, via Intl.NumberFormat. Percent expects fractional data (0.24 → 24%). Axis numbers are abbreviated (1.2k, 3.4M). @default 'number' */
  valueFormat: 'number' | 'percent' | 'currency';
}

/**
 * `<arc-checkbox>`
 * Events: arc-change
 */
export declare class ArcCheckbox extends LitElement {
  /** Prevents all pointer and keyboard interaction and applies a dimmed visual treatment. Use this for options that are unavailable due to unmet prerequisites. Pair with a tooltip or helper text to explain why the option is locked. @default false */
  disabled: boolean;
  /** Visible text rendered beside the checkbox. Clicking the label toggles the checkbox, matching native HTML behavior. Keep labels short, affirmative, and action-oriented for the best readability. @default '' */
  label: string;
  /** The form field name submitted when the checkbox lives inside a <form>. Required for native form submission and useful for serializing checkbox group values on the server. @default '' */
  name: string;
  /** The value sent with the form when the checkbox is checked. Defaults to "on" if omitted, matching native checkbox behavior. Set explicit values when multiple checkboxes share the same name to distinguish them in the submitted data. @default '' */
  value: string;
  /** Controls whether the checkbox is in its checked (selected) state. When true, a checkmark icon is rendered inside the box. Bind to this property for two-way state management in frameworks that support it. @default false */
  checked: boolean;
  /** When true, displays a horizontal dash instead of a checkmark, representing a mixed or partially-selected state. Commonly used on a parent "select all" checkbox when only some children are checked. Clicking an indeterminate checkbox resolves it to fully checked. @default false */
  indeterminate: boolean;
  /** Controls the checkbox size. @default 'md' */
  size: 'sm' | 'md' | 'lg';
  /** @default true */
  formAssociated: boolean;
  /** Lit merges static properties up the prototype chain, so every consumer gets these without declaring them. `required` participates in constraint validation below; `readonly` reflects for styling and is enforced by each component's interaction handlers (the mixin can't know which gestures mutate state). @default { // flag(), unlike `disabled`. The exclusion in props.js is specifically // about form-associated *platform* semantics: a `disabled` content // attribute that is merely present makes the element actually disabled // per the HTML spec, and formDisabledCallback assigns the property back, // so no converter can win. Neither of these is platform-mapped — // `required` is enforced by _computeValidity() below and `readonly` by // each component's own interaction handlers — so the stock converter buys // nothing here and costs the usual bug: `required="false"` read as true, // blocking submission of a form the author meant to leave optional. // Finding #48's shape, across all 26 form controls at once. required: flag(false), readonly: flag(false), } */
  properties: Record<string, unknown>;
  /** Components that run their own constraint-validation logic (pattern checks, range checks) opt out of the automatic required sync by overriding this to false, and own the whole validity flag set instead. @default true */
  autoValidates: boolean;
  form: unknown;
  validity: unknown;
  validationMessage: unknown;
  /** @default false */
  required: boolean;
  /** @default false */
  readonly: boolean;
}

/**
 * `<arc-chip>`
 * Events: arc-change
 */
export declare class ArcChip extends LitElement {
  /** Machine-readable identifier for this chip, included in the `arc-change` event detail. @default '' */
  value: string;
  /** Whether the chip is currently selected. Reflected as an attribute and toggled on click or keypress. @default false */
  selected: boolean;
  /** Disables interaction, reducing opacity to 40% and blocking pointer events. @default false */
  disabled: boolean;
}

/**
 * `<arc-clock>`
 */
export declare class ArcClock extends LitElement {
  /** IANA timezone name (e.g. "Asia/Tokyo"). Defaults to the viewer's local timezone; an unrecognized value falls back to local. @default '' */
  timezone: string;
  /** Optional caption rendered under the face. @default '' */
  label: string;
  /** Force 12-hour display on the digital face. When unset, the viewer's locale decides. Set the property to false to force 24-hour display. @default undefined */
  hour12: boolean;
  /** Which face to render. Digital shows a mono-spaced time string; analog shows an SVG dial with hands. @default 'digital' */
  variant: 'digital' | 'analog';
  /** Show seconds on the digital face, or the second hand on the analog face. @default false */
  showSeconds: boolean;
  /** Render the timezone abbreviation, muted, beside the digital time. @default false */
  showTimezone: boolean;
}

/**
 * `<arc-cluster>`
 */
export declare class ArcCluster extends LitElement {
  /** Spacing between items, mapped to design system spacing tokens. Use sm for dense tag groups, md for button groups. @default 'sm' */
  gap: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Vertical alignment of items within each row (maps to align-items). @default 'center' */
  align: 'start' | 'center' | 'end';
  /** Horizontal distribution of items (maps to justify-content). Use "space-between" for navigation-style spacing. @default 'start' */
  justify: 'start' | 'center' | 'end' | 'space-between' | 'space-around';
}

/**
 * `<arc-code-block>`
 */
export declare class ArcCodeBlock extends LitElement {
  /** Programming language identifier (e.g. `js`, `css`, `html`). Displayed in uppercase in the header bar. @default '' */
  language: string;
  /** Optional filename displayed in the header in monospace font. When empty, the header shows only the language. @default '' */
  filename: string;
  /** Code content to display. Used as the `<pre><code>` content and copied to clipboard when the copy button is clicked. @default '' */
  code: string;
  /** Visual variant. `default` shows the standard layout with optional filename header and status bar. `window` adds a macOS-style title bar with colored orbs and centered filename. `basic` strips all chrome for a compact, minimal display. @default 'default' */
  variant: 'default' | 'window' | 'basic';
}

/**
 * `<arc-collapsible>`
 * Events: arc-toggle
 */
export declare class ArcCollapsible extends LitElement {
  /** Text displayed in the clickable trigger row. Also used as the ARIA label for the content region. @default '' */
  heading: string;
  /** Controls whether the content is visible. Reflected as an attribute and toggleable by clicking the heading. @default false */
  open: boolean;
}

/**
 * `<arc-color-picker>`
 * Events: arc-input, arc-change
 */
export declare class ArcColorPicker extends LitElement {
  /** Current color as a 6-digit hex string (e.g. `#4d7ef7`). Reflected as an attribute. @default '#4d7ef7' */
  value: string;
  /** @default '' */
  name: string;
  /** Array of hex color strings to display as quick-select swatches below the hex input. @default [] */
  presets: string[];
  /** Disables all interaction, reducing opacity to 40% and blocking pointer events. @default false */
  disabled: boolean;
  /** Label text displayed above the picker in uppercase accent font. @default '' */
  label: string;
  /** Prevents changing the color via the area, hue slider, hex input, or swatches while the picker stays focusable and the value still submits. @default false */
  readonly: boolean;
  /** Control size. `md` is the default; `sm` and `lg` scale the swatch and trigger. @default 'md' */
  size: 'sm' | 'md' | 'lg';
  /** @default true */
  formAssociated: boolean;
  /** Lit merges static properties up the prototype chain, so every consumer gets these without declaring them. `required` participates in constraint validation below; `readonly` reflects for styling and is enforced by each component's interaction handlers (the mixin can't know which gestures mutate state). @default { // flag(), unlike `disabled`. The exclusion in props.js is specifically // about form-associated *platform* semantics: a `disabled` content // attribute that is merely present makes the element actually disabled // per the HTML spec, and formDisabledCallback assigns the property back, // so no converter can win. Neither of these is platform-mapped — // `required` is enforced by _computeValidity() below and `readonly` by // each component's own interaction handlers — so the stock converter buys // nothing here and costs the usual bug: `required="false"` read as true, // blocking submission of a form the author meant to leave optional. // Finding #48's shape, across all 26 form controls at once. required: flag(false), readonly: flag(false), } */
  properties: Record<string, unknown>;
  /** Components that run their own constraint-validation logic (pattern checks, range checks) opt out of the automatic required sync by overriding this to false, and own the whole validity flag set instead. @default true */
  autoValidates: boolean;
  form: unknown;
  validity: unknown;
  validationMessage: unknown;
  /** @default false */
  required: boolean;
}

/**
 * `<arc-color-swatch>`
 */
export declare class ArcColorSwatch extends LitElement {
  /** Any valid CSS color value applied as the swatch background @default '#4d7ef7' */
  color: string;
  /** Display label below the swatch; falls back to the color value if empty @default '' */
  label: string;
  /** Controls swatch dimensions: sm (32px), md (48px), lg (64px) @default 'md' */
  size: 'sm' | 'md' | 'lg';
}

/**
 * `<arc-column>`
 */
export declare class ArcColumn extends LitElement {
  /** The row property this column reads, from whichever alias was supplied. React and Preact strip `key` in the reconciler, so a React consumer can only ever reach this through `field`. */
  fieldName: unknown;
  /** The property name on each row object whose value should be displayed in this column. Must match a key present in the objects passed to the parent DataTable's `rows` array. Prefer this over `key`, which React and Preact intercept before the component sees it. @default '' */
  field: string;
  /** Alias of `field`, kept for compatibility. Works in HTML, Vue, Svelte, Angular and Solid, but **not** in React or Preact: both reserve `key` for list reconciliation and strip it before the component receives it. `field` takes precedence when both are set. @default '' */
  key: string;
  /** The human-readable header text displayed in the table's `<th>` element. This is what users see at the top of the column. @default '' */
  label: string;
  /** Sets a fixed CSS width on the column (e.g., "100px", "20%"). Useful for constraining narrow columns like status badges or actions so they do not stretch unnecessarily. @default '' */
  width: string;
  /** When true (and the parent DataTable also has `sortable`), clicking this column's header toggles ascending/descending sort on the corresponding data field. A sort indicator arrow appears next to the label. @default false */
  sortable: boolean;
}

/**
 * `<arc-combobox>`
 * Events: arc-input, arc-change
 */
export declare class ArcCombobox extends LitElement {
  /** The currently selected option value. Reflected as an attribute so it can be read from the DOM. Updated automatically when the user selects an option. @default '' */
  value: string;
  /** Placeholder text shown in the input when no value is entered. @default '' */
  placeholder: string;
  /** Visible label rendered above the input. Also used as the accessible label for the combobox. @default '' */
  label: string;
  /** @default '' */
  name: string;
  /** Disables the input and prevents interaction. The host element receives reduced opacity and pointer-events: none. @default false */
  disabled: boolean;
  /** Prevents typing and selecting an option while the input stays focusable; the list can still be opened for viewing and the value still submits. @default false */
  readonly: boolean;
  /** Control size. `md` is the default; `sm` and `lg` scale the field padding. @default 'md' */
  size: 'sm' | 'md' | 'lg';
  /** @default true */
  formAssociated: boolean;
  /** Lit merges static properties up the prototype chain, so every consumer gets these without declaring them. `required` participates in constraint validation below; `readonly` reflects for styling and is enforced by each component's interaction handlers (the mixin can't know which gestures mutate state). @default { // flag(), unlike `disabled`. The exclusion in props.js is specifically // about form-associated *platform* semantics: a `disabled` content // attribute that is merely present makes the element actually disabled // per the HTML spec, and formDisabledCallback assigns the property back, // so no converter can win. Neither of these is platform-mapped — // `required` is enforced by _computeValidity() below and `readonly` by // each component's own interaction handlers — so the stock converter buys // nothing here and costs the usual bug: `required="false"` read as true, // blocking submission of a form the author meant to leave optional. // Finding #48's shape, across all 26 form controls at once. required: flag(false), readonly: flag(false), } */
  properties: Record<string, unknown>;
  /** Components that run their own constraint-validation logic (pattern checks, range checks) opt out of the automatic required sync by overriding this to false, and own the whole validity flag set instead. @default true */
  autoValidates: boolean;
  form: unknown;
  validity: unknown;
  validationMessage: unknown;
  /** @default false */
  required: boolean;
}

/**
 * `<arc-command-bar>`
 * Events: arc-input, arc-submit
 */
export declare class ArcCommandBar extends LitElement {
  /** Placeholder text displayed when the input is empty. Use it to communicate the scope of the search. @default 'Search…' */
  placeholder: string;
  /** The current value of the input. Set externally to control the input state programmatically. @default '' */
  value: string;
  /** Icon name displayed before the input. Accepts any Phosphor icon name. @default 'magnifying-glass' */
  icon: string;
  /** Accessible name for the input, applied as `aria-label`. Defaults to "Search". A placeholder is not a name: it is announced inconsistently and disappears the moment the user types. @default '' */
  label: string;
}

/**
 * `<arc-command-group>`
 */
export declare class ArcCommandGroup extends LitElement {
  /** Heading text displayed above the group’s items. @default '' */
  heading: string;
}

/**
 * `<arc-command-item>`
 */
export declare class ArcCommandItem extends LitElement {
  label: unknown;
  /** What arc-select reports. Falls back to the label so an item that never sets `value` behaves as it always did. */
  selectionValue: unknown;
  /** Keyboard shortcut hint @default '' */
  shortcut: string;
  /** Name of the icon to display before the item label. @default '' */
  icon: string;
  /** Extra space-separated terms the search filter matches against but never displays — e.g. keywords="dialog popup" on a Modal item. @default '' */
  keywords: string;
  /** Secondary line shown under the label and matched by search. Use it for the sentence that tells two similar results apart; a docs site can put the matching passage here so a query finds page content rather than only page titles. @default '' */
  description: string;
  /** Stable identifier carried on the arc-select detail. Defaults to the label, which is fine until two items share one — give anything a handler must act on its own value rather than matching against display text. @default '' */
  value: string;
}

/**
 * `<arc-command-palette>`
 * Events: arc-select, arc-close
 */
export declare class ArcCommandPalette extends LitElement {
  /** Placeholder text displayed in the search input when the query is empty. @default 'Type a command...' */
  placeholder: string;
  /** How many ranked results to render. Truncation happens after ranking, so what survives is the best of the set. Raise it for a short command list; the default suits a large one. @default 50 */
  maxResults: number;
  /** Controls whether the palette is visible. When set to true, the dialog animates in, the search input auto-focuses, and body scroll is locked. Set to false to close. @default false */
  open: boolean;
}

/**
 * `<arc-comparison>`
 */
export declare class ArcComparison extends LitElement {
  /** JSON array of feature label strings, e.g. '["Storage","Bandwidth","Support"]'. Each entry becomes a row in the comparison grid. @default '[]' */
  features: string;
}

/**
 * `<arc-comparison-column>`
 */
export declare class ArcComparisonColumn extends LitElement {
  /** Column header text displayed at the top of this column (e.g., "Free", "Pro"). @default '' */
  heading: string;
  /** JSON array of values matching the features order. Use "true"/"false" for check/cross icons, or any string for text values. @default '[]' */
  values: string;
  /** When true, adds an accent background to the header and all cells in this column. @default false */
  highlight: boolean;
}

/**
 * `<arc-confirm>`
 * Events: arc-confirm, arc-cancel
 */
export declare class ArcConfirm extends LitElement {
  /** Controls whether the confirmation dialog is visible. For declarative usage; the imperative API manages this automatically. @default false */
  open: boolean;
  /** The heading text displayed at the top of the confirmation dialog. @default '' */
  heading: string;
  /** The body message explaining what the user is confirming. Used as the fallback for the default slot, so it is the simplest way to set the body and the only one available to the imperative `ArcConfirm.open()` API. @default '' */
  message: string;
  /** Label for the confirm button. Use a specific verb like "Delete" or "Publish" instead of generic "OK". @default 'Confirm' */
  confirmLabel: string;
  /** Label for the cancel button. Use a specific alternative like "Keep" or "Go back" when possible. @default 'Cancel' */
  cancelLabel: string;
  /** Controls the confirm button style. Use "error" for destructive actions — the confirm button renders in the error color. @default 'default' */
  variant: 'default' | 'error';
}

/**
 * `<arc-connection-status>`
 * Events: arc-online, arc-offline
 */
export declare class ArcConnectionStatus extends LitElement {
  /** @default true */
  online: boolean;
}

/**
 * `<arc-container>`
 */
export declare class ArcContainer extends LitElement {
  /** Use the narrow max-width (720px vs 1120px) @default false */
  narrow: boolean;
  /** Controls the maximum width. @default 'md' */
  size: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  /** Controls inline padding. @default 'md' */
  padding: 'none' | 'sm' | 'md' | 'lg';
}

/**
 * `<arc-context-menu>`
 * Events: arc-open, arc-close, arc-select
 */
export declare class ArcContextMenu extends LitElement {
  /** Controls the visibility of the context menu. Set to true when the contextmenu event fires; set to false when the user selects an item, clicks the backdrop, or presses Escape. @default false */
  open: boolean;
}

/**
 * `<arc-conversation>`
 * Events: arc-scroll-away, arc-scroll-return
 */
export declare class ArcConversation extends LitElement {
  /** Follow new content: when a message is added or grows while the reader is near the bottom, scroll to keep the latest visible. A reader who has scrolled up is never pulled back down. Defaults to true; set the property to false to leave scrolling entirely to the consumer. @default true */
  autoScroll: boolean;
}

/**
 * `<arc-copy-button>`
 * Events: arc-copy
 */
export declare class ArcCopyButton extends LitElement {
  /** The text string to copy to the clipboard when the button is clicked. @default '' */
  value: string;
  /** Disables the button, preventing clicks and reducing visual opacity. @default false */
  disabled: boolean;
}

/**
 * `<arc-countdown-timer>`
 * Events: arc-expired
 */
export declare class ArcCountdownTimer extends LitElement {
  /** ISO date string or parseable date for the countdown target @default '' */
  target: string;
  /** Optional label displayed above the countdown @default '' */
  label: string;
  /** Text shown when the countdown reaches zero @default 'Expired' */
  expired: string;
  /** Hide leading segments that are zero @default false */
  hideZeroSegments: boolean;
}

/**
 * `<arc-cta-banner>`
 */
export declare class ArcCtaBanner extends LitElement {
  /** Small label text displayed above the headline. Typically a short phrase like "Ready to build?" that sets context. @default '' */
  eyebrow: string;
  /** Main headline text rendered with gradient display styling. Keep it concise and action-oriented. @default '' */
  headline: string;
  /** When true, disables the radial gradient background effect for quieter contexts. @default false */
  nogradient: boolean;
}

/**
 * `<arc-dashboard-grid>`
 */
export declare class ArcDashboardGrid extends LitElement {
  /** Gap between grid cells. Accepts any CSS length value or spacing token. Maps to the --gap CSS custom property. @default 'var(--space-lg)' */
  gap: string;
  /** Minimum column width in auto-fill mode. Controls the minmax() threshold at which columns wrap to the next row. Maps to the --min-col CSS custom property. @default '280px' */
  minColumnWidth: string;
  /** Number of columns when using explicit column mode. When this attribute is set on the element, the grid switches from auto-fill to a fixed repeat(N, 1fr) layout. @default 0 */
  columns: number;
}

/**
 * `<arc-data-grid>`
 * Events: arc-sort, arc-select, arc-cell-change
 */
export declare class ArcDataGrid extends LitElement {
  /** Column definitions. Each entry maps a `key` in your row objects to a rendered column with a `label` header. Optional flags enable sorting, inline editing, and inline-start-edge pinning per column; `width` sets a fixed CSS width (required for accurate pinned offsets) and `align` controls text alignment. Pinned columns are always displayed first. Set via JavaScript property. @default [] */
  columns: Array<{key:string,label:string,sortable?:boolean,editable?:boolean,pinned?:boolean,width?:string,align?:string}>;
  /** The data array. Each object becomes a row keyed by column `key`. The grid works on an internal shallow copy — sorting and inline edits never mutate the array you pass in. Set via JavaScript property; reassigning it resets selection and any open editor. @default [] */
  rows: Array<Record<string, any>>;
  /** Multi-sort state in priority order. Clicking a sortable header cycles it asc → desc → none; Shift+click appends it as a secondary sort. When more than one sort is active, headers show a direction arrow plus priority number. Set this property to pre-sort the grid. @default [] */
  sort: Array<{key:string,direction:'asc'|'desc'}>;
  /** Height in pixels of each row when virtual scrolling is enabled. Must match the actual rendered row height for correct scroll calculations. @default 40 */
  rowHeight: number;
  /** Skips internal sorting. Rows render in the order given, while headers still cycle the `sort` state and emit `arc-sort` — use this to implement server-side sorting. @default false */
  manualSort: boolean;
  /** Adds a checkbox column with a select-all header checkbox (indeterminate when partially selected). Space toggles selection from the keyboard. Emits `arc-select` with the selected row indices. @default false */
  selectable: boolean;
  /** Enables virtual scrolling for large datasets. Only visible rows plus an overscan buffer are rendered, keeping performance constant regardless of row count. @default false */
  virtual: boolean;
}

/**
 * `<arc-data-table>`
 * Events: arc-sort, arc-select
 */
export declare class ArcDataTable extends LitElement {
  /** The data array that drives the table. Each object in the array becomes a row, and its keys are matched against the `key` attribute of each `arc-column` child. Set this property via JavaScript — it is not an HTML attribute. Changing this array triggers a re-render. @default [] */
  rows: Array<Record<string, any>>;
  /** The `key` of the currently sorted column. Set this attribute to pre-sort the table on a specific column when it first renders. Updated automatically when the user clicks a sortable column header. @default '' */
  sortColumn: string;
  /** Height in pixels of each row when virtual scrolling is enabled. Must match the actual rendered row height for correct scroll calculations. @default 40 */
  rowHeight: number;
  /** Enables the sorting system at the table level. When true, columns that also have their own `sortable` attribute become clickable, toggling between ascending and descending order. The table performs client-side sorting by default and emits an `arc-sort` event with the active column key and direction. @default false */
  sortable: boolean;
  /** Adds a checkbox column to the left of the table for row selection. A "select all" checkbox appears in the header. Selected rows receive a visual highlight. The component emits `arc-select` with the current selection (detail.value) when any row or the header checkbox is toggled; detail.all marks header toggles. @default false */
  selectable: boolean;
  /** The current sort direction. Works in tandem with `sort-column` to control the initial sort state. Reflected as an attribute so it can be read from the DOM or targeted with CSS selectors. @default 'asc' */
  sortDirection: 'asc' | 'desc';
  /** Enables virtual scrolling for large datasets. When true, only the visible rows plus an overscan buffer are rendered in the DOM, keeping performance constant regardless of row count. @default false */
  virtual: boolean;
}

/**
 * `<arc-date-picker>`
 * Events: arc-change
 */
export declare class ArcDatePicker extends LitElement {
  /** The selected date as an ISO string (YYYY-MM-DD). Set this to pre-select a date. Updated when the user picks a date from the calendar. @default '' */
  value: string;
  /** @default '' */
  name: string;
  /** Minimum selectable date as an ISO string. Dates before this are visually dimmed and non-interactive. @default '' */
  min: string;
  /** Maximum selectable date as an ISO string. Dates after this are visually dimmed and non-interactive. @default '' */
  max: string;
  /** Placeholder text displayed in the input when no date is selected. @default 'Select date' */
  placeholder: string;
  /** Disables the date picker, reducing opacity and preventing the calendar from opening. @default false */
  disabled: boolean;
  /** Label text rendered above the input in uppercase accent font styling. @default '' */
  label: string;
  /** BCP 47 tag used for month and weekday names. Defaults to the document's `lang`, then the browser's language. @default '' */
  locale: string;
  /** Which day the week starts on, 1 = Monday … 7 = Sunday. Defaults to the locale's own convention, so most of the world gets Monday and the US gets Sunday without configuring anything. @default 0 */
  firstDayOfWeek: number;
  /** Whether the calendar dropdown is visible. Reflected so it can be opened programmatically or styled from CSS. Held at `false` while `disabled`. @default false */
  open: boolean;
  /** Control size. `md` is the default; `sm` and `lg` scale the field padding. @default 'md' */
  size: 'sm' | 'md' | 'lg';
  /** @default true */
  formAssociated: boolean;
  /** Lit merges static properties up the prototype chain, so every consumer gets these without declaring them. `required` participates in constraint validation below; `readonly` reflects for styling and is enforced by each component's interaction handlers (the mixin can't know which gestures mutate state). @default { // flag(), unlike `disabled`. The exclusion in props.js is specifically // about form-associated *platform* semantics: a `disabled` content // attribute that is merely present makes the element actually disabled // per the HTML spec, and formDisabledCallback assigns the property back, // so no converter can win. Neither of these is platform-mapped — // `required` is enforced by _computeValidity() below and `readonly` by // each component's own interaction handlers — so the stock converter buys // nothing here and costs the usual bug: `required="false"` read as true, // blocking submission of a form the author meant to leave optional. // Finding #48's shape, across all 26 form controls at once. required: flag(false), readonly: flag(false), } */
  properties: Record<string, unknown>;
  /** Components that run their own constraint-validation logic (pattern checks, range checks) opt out of the automatic required sync by overriding this to false, and own the whole validity flag set instead. @default true */
  autoValidates: boolean;
  form: unknown;
  validity: unknown;
  validationMessage: unknown;
  /** @default false */
  required: boolean;
  /** @default false */
  readonly: boolean;
}

/**
 * `<arc-date-range-picker>`
 * Events: arc-change
 */
export declare class ArcDateRangePicker extends LitElement {
  /** Runs its own constraint logic — owns the whole validity flag set. @default false */
  autoValidates: boolean;
  /** Read-derived ISO 8601 interval ("start/end") when both dates are set, otherwise an empty string. This is the value submitted with forms. Assigning "start/end" sets both dates. */
  value: string;
  /** BCP 47 tag used for month and weekday names. Defaults to the document's `lang`, then the browser's language. @default '' */
  locale: string;
  /** Which day the week starts on, 1 = Monday … 7 = Sunday. Defaults to the locale's own convention. @default 0 */
  firstDayOfWeek: number;
  /** Range start date as an ISO string (YYYY-MM-DD). Empty when unset. Set both start and end to pre-select a range. @default '' */
  start: string;
  /** Range end date as an ISO string (YYYY-MM-DD). Empty when unset or while an end date is pending. @default '' */
  end: string;
  /** Form field name used when the interval value is submitted with a form. @default '' */
  name: string;
  /** Minimum selectable date as an ISO string. Earlier days are dimmed and non-interactive. @default '' */
  min: string;
  /** Maximum selectable date as an ISO string. Later days are dimmed and non-interactive. @default '' */
  max: string;
  /** Number of month panels shown in the popup. Panels sit side by side and stack vertically when the popup is too narrow. @default 2 */
  months: number;
  /** Quick ranges rendered as a left rail. Each preset selects the last N days ending today and closes the popup. Hidden when empty. @default [] */
  presets: Array<{label:string,days:number}>;
  /** Placeholder text shown in the input when no range is selected. @default 'Select date range' */
  placeholder: string;
  /** Disables the picker, reducing opacity and preventing the popup from opening. @default false */
  disabled: boolean;
  /** Label text rendered above the input in uppercase accent font styling. @default '' */
  label: string;
  /** Marks the control invalid (valueMissing) until a complete range is selected. @default false */
  required: boolean;
  /** Whether the calendar dropdown is visible. Reflected so it can be opened programmatically or styled from CSS. Held at `false` while `disabled`. @default false */
  open: boolean;
  /** Control size. `md` is the default; `sm` and `lg` scale the field padding. @default 'md' */
  size: 'sm' | 'md' | 'lg';
  /** @default true */
  formAssociated: boolean;
  /** Lit merges static properties up the prototype chain, so every consumer gets these without declaring them. `required` participates in constraint validation below; `readonly` reflects for styling and is enforced by each component's interaction handlers (the mixin can't know which gestures mutate state). @default { // flag(), unlike `disabled`. The exclusion in props.js is specifically // about form-associated *platform* semantics: a `disabled` content // attribute that is merely present makes the element actually disabled // per the HTML spec, and formDisabledCallback assigns the property back, // so no converter can win. Neither of these is platform-mapped — // `required` is enforced by _computeValidity() below and `readonly` by // each component's own interaction handlers — so the stock converter buys // nothing here and costs the usual bug: `required="false"` read as true, // blocking submission of a form the author meant to leave optional. // Finding #48's shape, across all 26 form controls at once. required: flag(false), readonly: flag(false), } */
  properties: Record<string, unknown>;
  form: unknown;
  validity: unknown;
  validationMessage: unknown;
  /** @default false */
  readonly: boolean;
}

/**
 * `<arc-description-item>`
 */
export declare class ArcDescriptionItem extends LitElement {
  /** The key or label for this description entry, displayed as an uppercase heading. @default '' */
  term: string;
}

/**
 * `<arc-description-list>`
 */
export declare class ArcDescriptionList extends LitElement {
  /** Number of grid columns for laying out items side by side. @default 1 */
  columns: number;
  /** Show horizontal dividers between rows and vertical dividers between columns. @default true */
  dividers: boolean;
}

/**
 * `<arc-dialog>`
 * Events: arc-confirm, arc-cancel
 */
export declare class ArcDialog extends LitElement {
  /** Dialog title text @default '' */
  heading: string;
  /** Dialog body message @default '' */
  message: string;
  /** Text for the confirm button @default 'Confirm' */
  confirmLabel: string;
  /** Text for the cancel button @default 'Cancel' */
  cancelLabel: string;
  /** Whether the dialog is visible @default false */
  open: boolean;
  /** Visual variant — error adds red accent line, glow border, and red confirm button @default 'default' */
  variant: 'default' | 'error';
}

/**
 * `<arc-diff>`
 */
export declare class ArcDiff extends LitElement {
  /** The original text to compare (split by newlines). @default '' */
  original: string;
  /** The modified text to compare (split by newlines). @default '' */
  revised: string;
  /** Display mode: 'inline' renders changes in a single column, 'side-by-side' renders two panes in a grid. @default 'inline' */
  mode: 'inline' | 'side-by-side';
}

/**
 * `<arc-divider>`
 */
export declare class ArcDivider extends LitElement {
  /** Text displayed in the center of the divider, splitting it into two lines. Common use: 'OR' between form options. Only applies to horizontal dividers. @default '' */
  label: string;
  /** Visual style @default 'subtle' */
  variant: 'subtle' | 'glow' | 'line-white' | 'line-primary' | 'line-gradient';
  /** Shifts the gradient origin so it fades from one edge instead of both. Empty (the default) fades from both edges. Useful for asymmetric layouts where the divider should visually connect to content on one side. @default '' */
  align: '' | 'left' | 'right';
  /** Renders the divider as a vertical line. Switches to `inline-flex` display and rotates gradient directions to run top-to-bottom. Use inside flex rows to separate inline content. @default false */
  vertical: boolean;
}

/**
 * `<arc-dock>`
 * Events: arc-open, arc-close
 */
export declare class ArcDock extends LitElement {
  /** Which viewport edge the dock snaps to. Bottom is the most common for media controls and action bars; left and right are suited for tool palettes in canvas editors. @default 'bottom' */
  position: 'bottom' | 'left' | 'right';
  /** When true, the dock hides itself when the cursor moves away from the edge and reveals on hover. Set to false to keep the dock permanently visible. @default false */
  autoHide: boolean;
  /** Controls the visible state of the dock programmatically. When auto-hide is true, this reflects the current hover-reveal state; when auto-hide is false, use this to toggle visibility manually. @default false */
  open: boolean;
}

/**
 * `<arc-drawer>`
 * Events: arc-close
 */
export declare class ArcDrawer extends LitElement {
  /** Text displayed in the drawer header bar. Also used as the `aria-label` for the dialog panel, ensuring screen readers announce the panel purpose when it opens. @default '' */
  heading: string;
  /** Controls the visible state of the drawer. Set to `true` to slide the panel into view and activate the backdrop; set to `false` to run the exit animation, remove the backdrop, and restore body scroll. @default false */
  open: boolean;
  /** Which edge of the viewport the drawer slides in from. Use `left` for primary navigation menus and `right` for contextual detail panels, filter sidebars, or settings trays. @default 'left' */
  position: 'left' | 'right';
}

/**
 * `<arc-dropdown-menu>`
 * Events: arc-close, arc-select
 */
export declare class ArcDropdownMenu extends LitElement {
  /** Controls whether the menu panel is visible. Toggled by clicking the trigger. Set to false when the user selects an item, clicks outside, or presses Escape. @default false */
  open: boolean;
}

/**
 * `<arc-empty-state>`
 */
export declare class ArcEmptyState extends LitElement {
  /** Main heading text displayed below the icon @default '' */
  heading: string;
  /** Supporting text displayed below the heading, max-width 360px @default '' */
  description: string;
}

/**
 * `<arc-event-calendar>`
 * Events: arc-period-change, arc-date-click, arc-event-click
 */
export declare class ArcEventCalendar extends LitElement {
  /** BCP 47 tag used for month and weekday names. Defaults to the document's `lang`, then the browser's language. @default '' */
  locale: string;
  /** Which day the week starts on, 1 = Monday … 7 = Sunday. Defaults to the locale's own convention. @default 0 */
  firstDayOfWeek: number;
  /** The event objects to display. `date` (and optional `end` for multi-day spans) are ISO strings (YYYY-MM-DD). `color` indexes the fixed `--chart-N` palette and defaults to 1. Set via JavaScript property, not an attribute. @default [] */
  events: Array<{date:string,end?:string,label:string,color?:number}>;
  /** ISO date string (YYYY-MM-DD) anchoring the visible period. Defaults to today when left empty. @default '' */
  date: string;
  /** Which period layout to render. Also switchable by the user via the header view toggle. @default 'month' */
  view: 'month' | 'week';
}

/**
 * `<arc-feature-card>`
 */
export declare class ArcFeatureCard extends LitElement {
  /** Icon text or emoji displayed in the icon box @default '' */
  icon: string;
  /** Card title @default '' */
  heading: string;
  /** Card body text @default '' */
  description: string;
  /** Makes the card a link @default '' */
  href: string;
  /** Action label (e.g. "Learn more") shown at the bottom of the card when href is set. Hidden when empty or when no href is provided. @default '' */
  action: string;
}

/**
 * `<arc-fieldset>`
 */
export declare class ArcFieldset extends LitElement {
  /** Text displayed in the `<legend>` element. Also available via the `legend` slot for rich content. @default '' */
  legend: string;
  /** Helper text displayed below the legend. @default '' */
  description: string;
  /** Error message displayed below the content with `role="alert"`. @default '' */
  error: string;
  /** Disables all child controls and dims the fieldset. @default false */
  disabled: boolean;
  /** Visual style. Card adds a surface background and shadow. @default 'default' */
  variant: 'default' | 'card';
}

/**
 * `<arc-file-upload>`
 * Events: arc-change, arc-remove
 */
export declare class ArcFileUpload extends LitElement {
  /** Comma-separated list of accepted file types, passed directly to the native file input accept attribute. Examples: "image/*", ".pdf,.docx", "audio/mp3". @default '' */
  accept: string;
  /** Maximum file size in bytes. Files exceeding this limit are rejected with an inline error message. Set to 0 for no limit. @default 0 */
  maxSize: number;
  /** When true, allows selecting multiple files. Each drop or browse interaction appends to the existing file list rather than replacing it. @default false */
  multiple: boolean;
  /** Disables the dropzone, preventing drag-and-drop and click interactions. Reduces opacity to 0.4. @default false */
  disabled: boolean;
}

/**
 * `<arc-float-bar>`
 * Events: arc-open, arc-close
 */
export declare class ArcFloatBar extends LitElement {
  /** Controls visibility of the float bar. Set to true when a triggering condition is met (e.g., items selected, form dirty) and false when the condition resolves. @default false */
  open: boolean;
  /** Which edge of the viewport the float bar appears at. Bottom is standard for bulk-action bars; top works for consent banners or global alerts. @default 'bottom' */
  position: 'bottom' | 'top';
}

/**
 * `<arc-footer>`
 */
export declare class ArcFooter extends LitElement {
  /** Sets a max-width containment on the footer content. Accepts any CSS length value or named size token. @default null */
  contained: string;
  /** Visual density. 'compact' reduces internal padding and spacing throughout the footer — for dashboard layouts or admin panels where vertical space is limited. @default 'default' */
  density: 'default' | 'compact';
  /** Renders a subtle top border on the footer to visually separate it from the page content above. Enabled by default; disable it only when the footer sits against a dark background where the border would be redundant. @default true */
  border: boolean;
  /** Controls footer content alignment. @default 'left' */
  align: 'left' | 'center';
}

/**
 * `<arc-form>`
 * Events: arc-invalid, arc-submit, arc-reset
 */
export declare class ArcForm extends LitElement {
  /** Form action URL for native form submission. When set, the form submits to this URL using the browser's built-in mechanism. @default '' */
  action: string;
  /** HTTP method for native form submission (GET or POST). Only applies when action is set. @default '' */
  method: string;
  /** Disables the entire form, propagating the disabled state to every child field. Useful for read-only previews or while awaiting permissions. @default false */
  disabled: boolean;
  /** When true, skips built-in constraint validation on submit. Use this when you need to implement a fully custom validation flow while still leveraging Form for data serialisation. @default false */
  novalidate: boolean;
  /** Indicates an asynchronous submission is in progress. Disables the submit button and shows a loading indicator to prevent duplicate requests. @default false */
  loading: boolean;
  /** When true, renders an aggregated list of validation errors above the submit area after a failed submission attempt. Set to false to handle error display manually. @default true */
  errorSummary: boolean;
}

/**
 * `<arc-gauge>`
 */
export declare class ArcGauge extends LitElement {
  /** Minimum value representing the empty end of the arc. @default 0 */
  min: number;
  /** Maximum value representing the full end of the arc. @default 100 */
  max: number;
  /** Threshold below which the value is considered low. Used for color zone calculation. @default undefined */
  low: number;
  /** Threshold above which the value is considered high. Used for color zone calculation. @default undefined */
  high: number;
  /** The optimal value. Determines which end of the range is "good" for color zone logic. @default undefined */
  optimum: number;
  /** Label text displayed beneath the value and used as the accessible name. @default '' */
  label: string;
  /** Unit suffix rendered after the value (e.g. "%", "ms", "GB"). @default '' */
  unit: string;
  /** Current gauge value. Clamped between `min` and `max`. Reflected as an attribute. @default 0 */
  value: number;
  /** Arc shape: `full` is a 270-degree horseshoe, `half` a 180-degree semicircle. @default 'full' */
  variant: 'full' | 'half';
  /** Whether to render the numeric value in the center of the arc. Defaults to true; disable via the `showValue` property. @default true */
  showValue: boolean;
}

/**
 * `<arc-gradient-text>`
 */
export declare class ArcGradientText extends LitElement {
  /** Custom CSS gradient string, used when variant is set to custom @default '' */
  gradient: string;
  /** Predefined gradient variant to apply @default 'accent' */
  variant: 'accent' | 'display' | 'sunset' | 'ocean' | 'custom';
  /** Animate the gradient with a shifting background-position cycle @default false */
  animated: boolean;
}

/**
 * `<arc-guided-tour>`
 * Events: arc-change, arc-complete, arc-close
 */
export declare class ArcGuidedTour extends LitElement {
  /** Array of step definitions. Each step specifies a CSS selector for the target element, a title for the popover heading, and content for the popover body. @default [] */
  steps: unknown[];
  /** Read-only property reflecting the zero-based index of the currently active step. @default 0 */
  active: number;
  /** Controls whether the tour is active. Set to true to start the tour from the first step. @default false */
  open: boolean;
}

/**
 * `<arc-highlight>`
 */
export declare class ArcHighlight extends LitElement {
  /** The full text to display and search within @default '' */
  text: string;
  /** The search query to highlight within the text @default '' */
  query: string;
  /** Whether matching should be case-sensitive @default false */
  caseSensitive: boolean;
}

/**
 * `<arc-hotkey>`
 * Events: arc-hotkey-trigger
 */
export declare class ArcHotkey extends LitElement {
  /** Key pattern to match. Modifier combos use "+" (e.g., "ctrl+k"). Chords use spaces (e.g., "g i"). @default '' */
  keys: string;
  /** Temporarily suspends the shortcut listener. @default false */
  disabled: boolean;
  /** When true, attaches to `window` instead of `document` and skips input/textarea filtering. @default false */
  global: boolean;
}

/**
 * `<arc-hotspot>`
 * Events: arc-open, arc-close
 */
export declare class ArcHotspot extends LitElement {
  /** Accessible name for the pin button, repeated as the heading of the popover. Always set it — without a label the pin announces nothing useful to a screen reader. @default '' */
  label: string;
  /** Horizontal position of the pin as a percentage of the image width, from 0 (left edge) to 100 (right edge). Values outside the range are clamped; a non-numeric value falls back to 50. @default 50 */
  x: number;
  /** Vertical position of the pin as a percentage of the image height, from 0 (top edge) to 100 (bottom edge). Values outside the range are clamped; a non-numeric value falls back to 50. @default 50 */
  y: number;
  /** Whether the pin's popover is currently visible. Reflected as an attribute. Opens on click; closes on Escape, outside click, or a second click on the pin. @default false */
  open: boolean;
}

/**
 * `<arc-hover-card>`
 * Events: arc-open, arc-close
 */
export declare class ArcHoverCard extends LitElement {
  /** Milliseconds to wait after hover/focus before showing the card. Prevents accidental activation during fast cursor movement. @default 400 */
  openDelay: number;
  /** Milliseconds to wait after the cursor leaves the trigger before hiding the card. Moving into the card cancels this timer. @default 300 */
  closeDelay: number;
  /** Controls which side of the trigger the card appears on. The card is centered along the perpendicular axis using CSS transforms. @default 'bottom' */
  position: 'bottom' | 'top' | 'left' | 'right';
}

/**
 * `<arc-icon>`
 */
export declare class ArcIcon extends LitElement {
  /** Icon name to look up in the icon registry. When provided, renders the matching SVG. When empty, falls back to slotted content. @default '' */
  name: string;
  /** Icon dimensions: `xs` (12px), `sm` (16px), `md` (20px), `lg` (24px), `xl` (32px). @default 'sm' */
  size: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Accessibility label. When provided, sets `role="img"` and `aria-label`. When empty, sets `role="presentation"` and `aria-hidden="true"`. @default '' */
  label: string;
}

/**
 * `<arc-icon-button>`
 */
export declare class ArcIconButton extends LitElement {
  /** Name of the arc-icon to render. When empty, the default slot is used for custom icon content. @default '' */
  name: string;
  /** Optional text label displayed next to the icon. When provided, the button expands from a square to a wider labeled button with uppercase styling. @default '' */
  text: string;
  /** Accessible label for the button. Falls back to `text` if not provided. Required for icon-only usage. @default '' */
  label: string;
  /** When set, renders the button as an anchor tag for navigation links. @default '' */
  href: string;
  /** HTML button type attribute. Only applies when `href` is not set. @default 'button' */
  type: string;
  /** Visual style variant. Ghost is transparent, secondary has a border with glow, primary has a solid accent-primary fill. @default 'ghost' */
  variant: 'ghost' | 'secondary' | 'primary';
  /** Button size controlling dimensions and icon scale. Icon-only sizes are circular: xs=28px, sm=32px, md=36px, lg=44px. The labeled form stays a rounded rectangle. @default 'md' */
  size: 'xs' | 'sm' | 'md' | 'lg';
  /** Disables the button, reducing opacity to 40% and blocking pointer events. @default false */
  disabled: boolean;
}

/**
 * `<arc-icon-library>`
 */
export declare class ArcIconLibrary extends LitElement {
  /** Which icon library to resolve names against. An unrecognised value falls back to `phosphor`. @default 'phosphor' */
  name: 'phosphor' | 'lucide';
}

/**
 * `<arc-image>`
 * Events: arc-load, arc-error
 */
export declare class ArcImage extends LitElement {
  /** Image source URL. @default '' */
  src: string;
  /** Alt text for the image. Used as the accessible description. @default '' */
  alt: string;
  /** URL of a fallback image to display if the primary `src` fails to load. @default '' */
  fallback: string;
  /** Constrains the container to a fixed aspect ratio, preventing layout shift during loading. Empty (the default) leaves the container unconstrained; an unrecognised ratio falls back to it. @default '' */
  aspect: '' | '1/1' | '4/3' | '16/9' | '21/9' | '3/4' | '9/16';
  /** CSS object-fit mode controlling how the image fills its container. @default 'cover' */
  fit: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  /** Native loading strategy. Lazy defers off-screen images until they approach the viewport. @default 'lazy' */
  loading: 'lazy' | 'eager';
}

/**
 * `<arc-image-compare>`
 * Events: arc-input, arc-change
 */
export declare class ArcImageCompare extends LitElement {
  /** Optional caption for the before layer, rendered as a floating chip in the start corner. @default '' */
  beforeLabel: string;
  /** Optional caption for the after layer, rendered as a floating chip in the end corner. @default '' */
  afterLabel: string;
  /** Accessible name for the divider handle, announced as the slider label. @default '' */
  label: string;
  /** Divider position as a percentage, 0 to 100. 0 shows only the after layer, 100 only the before layer. Clamped, reflected, and updated as the user drags. @default 50 */
  position: number;
  /** Axis the divider moves along. `horizontal` (default) moves a vertical divider line left-right; `vertical` moves a horizontal line up-down. @default 'horizontal' */
  orientation: 'horizontal' | 'vertical';
}

/**
 * `<arc-image-cropper>`
 * Events: arc-crop-change
 */
export declare class ArcImageCropper extends LitElement {
  /** Image URL, object URL, or data URL to crop. Must be same-origin or CORS-enabled for canvas export. @default '' */
  src: string;
  /** Fixed stage height in pixels. The image is letterboxed to fit. @default 320 */
  height: number;
  /** Crop aspect ratio as width/height (e.g. `1`, `16/9`). `0` allows free-form cropping. @default 0 */
  aspect: number;
  /** Image zoom factor, clamped to 1-4 on the property as well as on the slider. Scales the image around its center; also settable via the built-in slider. @default 1 */
  zoom: number;
}

/**
 * `<arc-image-hotspots>`
 */
export declare class ArcImageHotspots extends LitElement {
}

/**
 * `<arc-infinite-scroll>`
 * Events: arc-load-more
 */
export declare class ArcInfiniteScroll extends LitElement {
  /** Distance in pixels from the bottom of the content at which `arc-load-more` fires. Controls how eagerly new data is requested. @default 200 */
  threshold: number;
  /** When true, displays a spinner in the footer and suppresses additional `arc-load-more` events. @default false */
  loading: boolean;
  /** When true, disconnects the observer and displays "No more items" text in the footer. @default false */
  finished: boolean;
  /** Disables the component, disconnects the observer, and reduces opacity to 40%. @default false */
  disabled: boolean;
}

/**
 * `<arc-inline-edit>`
 * Events: arc-change, arc-cancel, arc-input
 */
export declare class ArcInlineEdit extends LitElement {
  /** The committed text. Updated only when an edit commits (Enter or blur); keystrokes accumulate in an internal draft until then. @default '' */
  value: string;
  /** Accessible name for the control. The display state announces as "Edit {label}" and the edit field is labeled with it. Always provide one. @default '' */
  label: string;
  /** The `name` attribute sent with form data on submission. The submitted value is the committed `value`, never an in-progress draft. @default '' */
  name: string;
  /** Text shown in muted italic when `value` is empty, and as the field placeholder while editing. Defaults to "Empty". @default 'Empty' */
  placeholder: string;
  /** Prevents activation and applies a muted treatment. The value is excluded from form submission while disabled. @default false */
  disabled: boolean;
  /** When true, editing uses a `<textarea>`: Enter inserts a newline and Cmd/Ctrl+Enter commits. Single-line commits on plain Enter. @default false */
  multiline: boolean;
  /** Marks the field as required. An empty committed value is invalid — including in display state, which shows a subtle error tint. @default false */
  required: boolean;
  /** Renders the display state only: the text remains focusable for reading order, but activation is inert and no pencil affordance appears. @default false */
  readonly: boolean;
  /** @default true */
  formAssociated: boolean;
  /** Lit merges static properties up the prototype chain, so every consumer gets these without declaring them. `required` participates in constraint validation below; `readonly` reflects for styling and is enforced by each component's interaction handlers (the mixin can't know which gestures mutate state). @default { // flag(), unlike `disabled`. The exclusion in props.js is specifically // about form-associated *platform* semantics: a `disabled` content // attribute that is merely present makes the element actually disabled // per the HTML spec, and formDisabledCallback assigns the property back, // so no converter can win. Neither of these is platform-mapped — // `required` is enforced by _computeValidity() below and `readonly` by // each component's own interaction handlers — so the stock converter buys // nothing here and costs the usual bug: `required="false"` read as true, // blocking submission of a form the author meant to leave optional. // Finding #48's shape, across all 26 form controls at once. required: flag(false), readonly: flag(false), } */
  properties: Record<string, unknown>;
  /** Components that run their own constraint-validation logic (pattern checks, range checks) opt out of the automatic required sync by overriding this to false, and own the whole validity flag set instead. @default true */
  autoValidates: boolean;
  form: unknown;
  validity: unknown;
  validationMessage: unknown;
}

/**
 * `<arc-inline-message>`
 */
export declare class ArcInlineMessage extends LitElement {
  /** Controls the icon and text color. Use "info" for neutral hints, "success" for valid state feedback, "warning" for caution notes, and "error" for validation failures. @default 'info' */
  variant: 'info' | 'success' | 'warning' | 'error';
}

/**
 * `<arc-input>`
 * Events: arc-input, arc-change
 */
export declare class ArcInput extends LitElement {
  /** Runs its own constraint logic — owns the whole validity flag set. @default false */
  autoValidates: boolean;
  /** The `name` attribute sent with form data on submission. Also used by the Form component to track field state and validation. @default '' */
  name: string;
  /** Visible label rendered above the input. Automatically associated with the field via a generated id, ensuring screen readers announce it correctly. @default '' */
  label: string;
  /** Hint text displayed inside the field when it is empty. Use it to show an example value -- never as a substitute for the label. @default '' */
  placeholder: string;
  /** The current value of the input. Can be set programmatically to pre-fill the field or used for controlled-component patterns. Updated internally on each keystroke. @default '' */
  value: string;
  /** Prevents user interaction and applies a muted visual treatment. The field value is excluded from form submission when disabled. @default false */
  disabled: boolean;
  /** Error message displayed below the input. When set, the input border turns red and the error text appears. @default '' */
  error: string;
  /** Number of visible text rows when `multiline` is true. Controls the initial height of the textarea. Ignored for single-line inputs. @default 5 */
  rows: number;
  /** The HTML input type. Controls browser validation behavior and which virtual keyboard appears on mobile devices. Ignored when `multiline` is true. @default 'text' */
  type: 'text' | 'email' | 'tel' | 'url' | 'password';
  /** When true, renders a `<textarea>` instead of an `<input>`, allowing multi-row text entry. The textarea is vertically resizable by default. @default false */
  multiline: boolean;
  /** Marks the field as required. Displays a required indicator next to the label and triggers native constraint validation on form submission. @default false */
  required: boolean;
  /** Prevents the user from editing the value while keeping the field focusable, and the value is still submitted with the form. @default false */
  readonly: boolean;
  /** Controls the input size. Options: 'sm', 'md', 'lg'. @default 'md' */
  size: 'sm' | 'md' | 'lg';
  /** @default true */
  formAssociated: boolean;
  /** Lit merges static properties up the prototype chain, so every consumer gets these without declaring them. `required` participates in constraint validation below; `readonly` reflects for styling and is enforced by each component's interaction handlers (the mixin can't know which gestures mutate state). @default { // flag(), unlike `disabled`. The exclusion in props.js is specifically // about form-associated *platform* semantics: a `disabled` content // attribute that is merely present makes the element actually disabled // per the HTML spec, and formDisabledCallback assigns the property back, // so no converter can win. Neither of these is platform-mapped — // `required` is enforced by _computeValidity() below and `readonly` by // each component's own interaction handlers — so the stock converter buys // nothing here and costs the usual bug: `required="false"` read as true, // blocking submission of a form the author meant to leave optional. // Finding #48's shape, across all 26 form controls at once. required: flag(false), readonly: flag(false), } */
  properties: Record<string, unknown>;
  form: unknown;
  validity: unknown;
  validationMessage: unknown;
}

/**
 * `<arc-input-group>`
 */
export declare class ArcInputGroup extends LitElement {
  /** Controls addon padding and font size. @default 'md' */
  size: 'sm' | 'md' | 'lg';
}

/**
 * `<arc-inset>`
 */
export declare class ArcInset extends LitElement {
  /** Padding size mapped to a design system spacing token. Controls all four sides equally. @default 'md' */
  space: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  /** When true, applies negative margins equal to the space value, allowing children to break out of a parent container's padding for full-bleed layouts. @default false */
  bleed: boolean;
}

/**
 * `<arc-json-tree>`
 * Events: arc-toggle
 */
export declare class ArcJsonTree extends LitElement {
  /** The value to render. Set as a property for objects and arrays; takes precedence over the json attribute when both are set. @default undefined */
  data: Record<string, unknown>;
  /** JSON string alternative to the data property, for attribute-only use. Parsed with try/catch; invalid input renders a small inline error state instead of throwing. @default '' */
  json: string;
  /** How many levels open initially (default 1). As a bare boolean attribute, every level opens. @default 1 */
  expanded: number | boolean;
  /** Render object keys with quotes. Off by default, matching devtools. @default false */
  keysQuoted: boolean;
}

/**
 * `<arc-kanban>`
 * Events: arc-card-move, arc-card-click
 */
export declare class ArcKanban extends LitElement {
  /** The data array that drives the board. Each entry becomes a column with a header (title plus count badge) and a list of cards. `limit` renders the count as `count/limit` and turns it error-colored when exceeded. Each card needs a unique `id` and a `label`; `description` renders below the label with a two-line clamp, and `tag` renders an arc-tag chip styled by `variant`. Set via JavaScript — it is not an HTML attribute. The component works on an internal copy for immediate drag feedback; sync your source of truth from `arc-card-move` and assign a new array to re-render. @default [] */
  columns: Array<{id:string,title?:string,limit?:number,items:Array<{id:string,label:string,description?:string,tag?:string,variant?:string}>}>;
  /** Disables all pointer and keyboard interaction and dims the board. @default false */
  disabled: boolean;
}

/**
 * `<arc-kbd>`
 */
export declare class ArcKbd extends LitElement {
}

/**
 * `<arc-key-value>`
 */
export declare class ArcKeyValue extends LitElement {
  /** Controls pair arrangement. Horizontal uses a CSS grid with key and value side by side. Stacked places the key above the value. @default 'horizontal' */
  layout: 'horizontal' | 'stacked';
  /** When true, renders a subtle border between each key-value pair. @default true */
  dividers: boolean;
}

/**
 * `<arc-keyboard-map>`
 */
export declare class ArcKeyboardMap extends LitElement {
  /** Board shape: "compact" (default, a 60%-style block) or "ansi" (adds the F-row and nav cluster). Unknown values fall back to compact. @default 'compact' */
  layout: string;
  /** Key chords to light up: an array property (e.g. ["mod+z", "mod+shift+z"]) or a comma- or space-separated attribute string. Each chord joins keys with "+" ("mod+shift+p"); `mod` resolves to Cmd on mac and Ctrl on win, mirroring arc-hotkey's aliases (cmd/command → meta, option → alt, control → ctrl). Single keys are fine ("g", "escape"). Unknown key names are ignored. @default '' */
  highlight: string|string[];
  /** Whether keys render their legends (default true; set the attribute to the string "false" to disable from markup). @default true */
  labels: boolean;
  /** Which platform's modifier legends and `mod` resolution to use: "auto" (default — detected in the browser, mac on the server), "mac", or "win". @default 'auto' */
  platform: string;
  /** Optional caption rendered below the board in muted text. @default '' */
  caption: string;
}

/**
 * `<arc-knob>`
 * Events: arc-input, arc-change
 */
export declare class ArcKnob extends LitElement {
  /** Degrees of arc the knob sweeps; the remaining 90 stay open at the bottom. @default 270 */
  SWEEP: number;
  /** Pixels of vertical drag that cover the full range. @default 150 */
  DRAG_THROW: number;
  /** Fraction of the range within which a drag snaps to a detent. @default 0.025 */
  DETENT_WINDOW: number;
  /** Current knob value. Reflected as an attribute and updated on user interaction. @default 0 */
  value: number;
  /** Minimum allowed value at the start of the arc sweep. @default 0 */
  min: number;
  /** Maximum allowed value at the end of the arc sweep. @default 100 */
  max: number;
  /** Increment granularity. The value snaps to multiples of this number. @default 1 */
  step: number;
  /** @default '' */
  name: string;
  /** Disables interaction, reducing opacity and blocking pointer events. @default false */
  disabled: boolean;
  /** Label text displayed above the knob in the label typography role. @default '' */
  label: string;
  /** Snap values, as an array from script or a comma-separated attribute (for example "0,50,100"). While dragging, the value snaps magnetically to a detent within 2.5% of the range, and each detent renders as a tick mark around the dial. Keyboard and wheel stepping ignore detents. @default [] */
  detents: number[] | string;
  /** `(value) => string` shaping the readout and the accessible value text, for example adding a unit suffix. Defaults to the plain number. @default undefined */
  format: Function;
  /** Prevents dragging, wheel, and key changes while the dial stays focusable and the value still submits. @default false */
  readonly: boolean;
  /** Control size. `md` is the default; `sm` and `lg` scale the dial. @default 'md' */
  size: 'sm' | 'md' | 'lg';
  /** @default true */
  formAssociated: boolean;
  /** Lit merges static properties up the prototype chain, so every consumer gets these without declaring them. `required` participates in constraint validation below; `readonly` reflects for styling and is enforced by each component's interaction handlers (the mixin can't know which gestures mutate state). @default { // flag(), unlike `disabled`. The exclusion in props.js is specifically // about form-associated *platform* semantics: a `disabled` content // attribute that is merely present makes the element actually disabled // per the HTML spec, and formDisabledCallback assigns the property back, // so no converter can win. Neither of these is platform-mapped — // `required` is enforced by _computeValidity() below and `readonly` by // each component's own interaction handlers — so the stock converter buys // nothing here and costs the usual bug: `required="false"` read as true, // blocking submission of a form the author meant to leave optional. // Finding #48's shape, across all 26 form controls at once. required: flag(false), readonly: flag(false), } */
  properties: Record<string, unknown>;
  /** Components that run their own constraint-validation logic (pattern checks, range checks) opt out of the automatic required sync by overriding this to false, and own the whole validity flag set instead. @default true */
  autoValidates: boolean;
  form: unknown;
  validity: unknown;
  validationMessage: unknown;
  /** @default false */
  required: boolean;
}

/**
 * `<arc-kv-pair>`
 */
export declare class ArcKvPair extends LitElement {
  /** The key/term text displayed in uppercase accent styling. @default '' */
  label: string;
}

/**
 * `<arc-label>`
 */
export declare class ArcLabel extends LitElement {
  /** ID of the target input element. Clicking the label focuses the associated control. @default '' */
  for: string;
  /** Shows a red asterisk (*) after the label text. @default false */
  required: boolean;
  /** Controls the label font size. @default 'md' */
  size: 'sm' | 'md' | 'lg';
  /** Reduces opacity and blocks pointer events. @default false */
  disabled: boolean;
}

/**
 * `<arc-level-meter>`
 */
export declare class ArcLevelMeter extends LitElement {
  /** Value at the empty end of the meter. Defaults to 0. @default 0 */
  min: number;
  /** Value at the full end of the meter. Defaults to 1. Use -60..0 (or your headroom of choice) for dB scales. @default 1 */
  max: number;
  /** Externally supplied peak-hold level, in the same units as `value`. When set, the component renders the hold line exactly there and does no tracking of its own. When absent, the meter tracks its own peak from incoming values, holds it briefly, then decays it toward the current level. @default undefined */
  peak: number;
  /** Number of discrete segments. Defaults to 20. Set 0 for a continuous, unsegmented bar. @default 20 */
  segments: number;
  /** Accessible name applied as aria-label on the meter. The component renders no visible text, so this is the only name screen readers get — use something like "Master left" rather than "Level". @default '' */
  label: string;
  /** Current level. Interpreted against `min` and `max`, so with the defaults (0 and 1) it is a linear fraction, and with `min="-60" max="0"` it is a dB reading. Values outside the range are clamped. @default 0 */
  value: number;
  /** Meter direction. Vertical (the default) fills bottom-up like a channel strip; horizontal fills from the inline start. Unknown values fall back to vertical. @default 'vertical' */
  orientation: 'vertical' | 'horizontal';
  /** Fraction of the range (0..1) where the warning zone begins, regardless of units. Defaults to 0.75. @default 0.75 */
  warn: number;
  /** Fraction of the range (0..1) where the clip (error) zone begins. Defaults to 0.9. @default 0.9 */
  clip: number;
}

/**
 * `<arc-lightbox>`
 * Events: arc-change, arc-close, arc-open
 */
export declare class ArcLightbox extends LitElement {
  /** The gallery to display. Each entry is either a `src` string or an object of shape `{ src, alt, caption }`; `alt` and `caption` are optional. Set as a property — arrays do not round-trip through attributes. @default [] */
  images: Array;
  /** Index of the image currently displayed. Navigation wraps at both ends, so setting it out of range shows the nearest valid image. @default 0 */
  index: number;
  /** Controls the visible state of the viewer. Set to `true` to open at the current `index` and activate the focus trap; set to `false` to close and restore focus to the previously-focused element. @default false */
  open: boolean;
}

/**
 * `<arc-link>`
 */
export declare class ArcLink extends LitElement {
  /** URL destination for the link. @default '' */
  href: string;
  /** Link style variant. `default` uses accent-primary color, `muted` uses muted text, `nav` uses secondary text with 14px size and flex layout. @default 'default' */
  variant: 'default' | 'muted' | 'nav';
  /** Active state — applies accent-primary color for navigation highlighting. @default false */
  active: boolean;
  /** When true, adds `target="_blank"` and `rel="noopener noreferrer"`, and renders an external link icon after the text. @default false */
  external: boolean;
  /** Controls underline behavior: 'hover' underlines on hover, 'always' keeps it visible, 'never' omits it. @default 'hover' */
  underline: 'hover' | 'always' | 'never';
}

/**
 * `<arc-list>`
 * Events: arc-select, arc-change
 */
export declare class ArcList extends LitElement {
  /** The currently selected value(s). Comma-separated when `multiple` is true. The selection itself is held as a list of values, so a value containing a comma is selected and rendered correctly; only the *serialised* multi-select string cannot represent one, since the comma is its separator. Single-select is exact for any value. @default '' */
  value: string;
  /** Accessible name for the list, applied as `aria-label`. Required when `selectable` is set so the listbox has an accessible name. @default '' */
  label: string;
  /** Visual style. Bordered wraps the list in an outlined container. Separated adds bottom borders between items. @default 'default' */
  variant: 'default' | 'bordered' | 'separated';
  /** Controls the base font size for the list and its children. @default 'md' */
  size: 'sm' | 'md' | 'lg';
  /** Enables selection mode. Sets `role="listbox"` and manages `aria-selected` on child items. @default false */
  selectable: boolean;
  /** Allows multiple items to be selected simultaneously. Only applies when `selectable` is true. @default false */
  multiple: boolean;
}

/**
 * `<arc-list-item>`
 * Events: arc-select
 */
export declare class ArcListItem extends LitElement {
  /** Unique identifier used for selection tracking. @default '' */
  value: string;
  /** When set, renders the item as an anchor tag for navigation. @default '' */
  href: string;
  /** Whether this item is currently selected. Managed automatically by the parent list. @default false */
  selected: boolean;
  /** Prevents interaction and dims the item. @default false */
  disabled: boolean;
}

/**
 * `<arc-loading-overlay>`
 */
export declare class ArcLoadingOverlay extends LitElement {
  /** Optional text displayed below the spinner. Use it to communicate what is loading or the current progress step. @default '' */
  message: string;
  /** Controls whether the loading overlay is visible. When true, the overlay fades in and blocks interaction with the content behind it. @default false */
  active: boolean;
  /** When true, the overlay uses fixed positioning to cover the entire viewport instead of just its parent container. Includes a focus trap in this mode. @default false */
  global: boolean;
}

/**
 * `<arc-markdown>`
 */
export declare class ArcMarkdown extends LitElement {
  /** Markdown string to parse and render. Takes precedence over slotted text content. @default '' */
  content: string;
}

/**
 * `<arc-marquee>`
 */
export declare class ArcMarquee extends LitElement {
  /** Scroll speed in pixels per second. The animation duration is calculated from the content width divided by this value. @default 40 */
  speed: number;
  /** CSS length value for the gap between slotted items. Accepts any valid CSS length or custom property. @default 'var(--space-xl)' */
  gap: string;
  /** Scroll direction. `left` scrolls content from right to left (default), `right` reverses the direction. @default 'left' */
  direction: 'left' | 'right';
  /** When true, the animation pauses while the cursor hovers over the marquee. @default true */
  pauseOnHover: boolean;
}

/**
 * `<arc-masked-input>`
 * Events: arc-input, arc-change
 */
export declare class ArcMaskedInput extends LitElement {
  /** Runs its own constraint logic — owns the whole validity flag set. @default false */
  autoValidates: boolean;
  /** The formatted presentation string — raw characters interleaved with mask literals, e.g. raw 12042026 under a date mask reads 12/04/2026. Read-only: it is derived from value and mask, never stored, and never submitted. */
  formattedValue: unknown;
  /** The mask pattern. `#` accepts a digit, `A` an uppercase letter (lowercase input is uppercased), `a` any letter, `*` a letter or digit; every other character is a literal typed for the user. Examples: `##/##/####`, `#### #### #### ####`, `AAA-###`. @default '' */
  mask: string;
  /** The RAW accepted characters only, with no mask literals — `12042026`, never `12/04/2026`. The formatted string is presentation; read it from `formattedValue`. Programmatic values are conformed against the mask, so setting a formatted string keeps only the characters the mask accepts. @default '' */
  value: string;
  /** Character rendered in unfilled positions of the in-field hint once typing starts (for example `12/__/____`). Before any input, the native placeholder shows the full mask shape. Defaults to `_`. @default '_' */
  placeholderChar: string;
  /** Visible label rendered above the field. Automatically associated with the field via a generated id, ensuring screen readers announce it correctly. @default '' */
  label: string;
  /** The `name` attribute sent with form data on submission. The submitted value is the RAW value, without mask literals. @default '' */
  name: string;
  /** Prevents user interaction and applies a muted visual treatment. The field value is excluded from form submission when disabled. @default false */
  disabled: boolean;
  /** Passed through to the inner input, e.g. `cc-number` on a card field so browser autofill can offer saved cards. @default '' */
  autocomplete: string;
  /** Error message displayed below the input. When set, the input border turns red and the error text appears. @default '' */
  error: string;
  /** Marks the field as required. An empty field fails validation with valueMissing; a partially filled one fails with an "Incomplete value" pattern error. @default false */
  required: boolean;
  /** Prevents the user from editing the value while keeping the field focusable, and the value is still submitted with the form. @default false */
  readonly: boolean;
  /** Controls the input size. Options: 'sm', 'md', 'lg'. @default 'md' */
  size: 'sm' | 'md' | 'lg';
  /** @default true */
  formAssociated: boolean;
  /** Lit merges static properties up the prototype chain, so every consumer gets these without declaring them. `required` participates in constraint validation below; `readonly` reflects for styling and is enforced by each component's interaction handlers (the mixin can't know which gestures mutate state). @default { // flag(), unlike `disabled`. The exclusion in props.js is specifically // about form-associated *platform* semantics: a `disabled` content // attribute that is merely present makes the element actually disabled // per the HTML spec, and formDisabledCallback assigns the property back, // so no converter can win. Neither of these is platform-mapped — // `required` is enforced by _computeValidity() below and `readonly` by // each component's own interaction handlers — so the stock converter buys // nothing here and costs the usual bug: `required="false"` read as true, // blocking submission of a form the author meant to leave optional. // Finding #48's shape, across all 26 form controls at once. required: flag(false), readonly: flag(false), } */
  properties: Record<string, unknown>;
  form: unknown;
  validity: unknown;
  validationMessage: unknown;
}

/**
 * `<arc-masonry>`
 */
export declare class ArcMasonry extends LitElement {
  /** Number of columns in the masonry grid. The browser distributes children across columns to minimize overall height difference. @default 3 */
  columns: number;
  /** Spacing between columns and rows, mapped to design system spacing tokens (--space-sm, --space-md, --space-lg). @default 'md' */
  gap: 'sm' | 'md' | 'lg';
}

/**
 * `<arc-menu-divider>`
 */
export declare class ArcMenuDivider extends LitElement {
}

/**
 * `<arc-menu-item>`
 */
export declare class ArcMenuItem extends LitElement {
  /** The text to draw. `label` was documented as a prop and implemented as a getter over textContent with no setter and no attribute, so `<arc-menu-item label="Cut"></arc-menu-item>` rendered a blank item — silently, and the six generated wrappers exposed a writable `label` that did nothing (finding #32). It is a real property now; the text-content form stays the fallback, so every existing consumer is unaffected. */
  displayLabel: unknown;
  /** What arc-select reports. Falls back to the label so an item that never sets `value` behaves as it always did. */
  selectionValue: unknown;
  /** Display text for the menu item. Settable, and falls back to the element's text content when unset — `<arc-menu-item label="Cut">` and `<arc-menu-item>Cut</arc-menu-item>` are equivalent. @default '' */
  label: string;
  /** Keyboard shortcut hint displayed on the right side. @default '' */
  shortcut: string;
  /** Name of the icon to display before the label. @default '' */
  icon: string;
  /** Stable identifier carried on the arc-select detail. Defaults to the label, which is fine until two items share one — give anything a handler must act on its own value rather than matching against display text. @default '' */
  value: string;
  /** Disables the item, preventing interaction. @default false */
  disabled: boolean;
}

/**
 * `<arc-menubar>`
 * Events: arc-select
 */
export declare class ArcMenubar extends LitElement {
  /** The menu structure. Entries with an `items` array become submenus (one further nesting level supported); `{ divider: true }` renders a separator. Set via JavaScript — this is a property, not an HTML attribute. @default [] */
  items: Array<{label:string,disabled?:boolean,items:Array<{label?:string,shortcut?:string,disabled?:boolean,divider?:boolean,items?:Array<{label:string,shortcut?:string,disabled?:boolean}>}>}>;
}

/**
 * `<arc-message>`
 */
export declare class ArcMessage extends LitElement {
  /** Display name shown in the muted meta line above the bubble. Omit it and the meta line only appears when a timestamp is set. @default '' */
  author: string;
  /** When the message was sent, as an ISO 8601 string. Rendered as house relative time ("3 minutes ago") through arc-time-ago, with the absolute date on its title. @default '' */
  timestamp: string;
  /** Whose message this is. "user" aligns to the inline end on an accent-tinted surface, "assistant" to the inline start on a neutral surface, and "system" runs centered and muted for notices in the transcript's own voice. An unrecognized value renders as "user". @default 'user' */
  speaker: 'user' | 'assistant' | 'system';
  /** Renders the typing indicator — three pulsing dots — in place of the body while a reply is being produced. Under prefers-reduced-motion the dots give way to a static ellipsis. @default false */
  pending: boolean;
  /** Render the slotted text through the house markdown renderer. The slot's text content is the source; it re-parses whenever the slot changes, so streaming into the slot streams through the renderer. When false, slotted content renders as-is. @default false */
  markdown: boolean;
}

/**
 * `<arc-meter>`
 */
export declare class ArcMeter extends LitElement {
  /** Minimum value representing the left edge (empty) of the meter. @default 0 */
  min: number;
  /** Maximum value representing the right edge (full) of the meter. @default 100 */
  max: number;
  /** Threshold below which the value is considered low. Used for color zone calculation. @default undefined */
  low: number;
  /** Threshold above which the value is considered high. Used for color zone calculation. @default undefined */
  high: number;
  /** The optimal value. Determines which end of the range is "good" for color zone logic. @default undefined */
  optimum: number;
  /** Label text displayed in the header row alongside the current percentage. @default '' */
  label: string;
  /** Current meter value. Clamped between `min` and `max`. Reflected as an attribute. @default 0 */
  value: number;
}

/**
 * `<arc-modal>`
 * Events: arc-close, arc-open
 */
export declare class ArcModal extends LitElement {
  /** Text displayed in the modal header bar. Automatically linked to the dialog via `aria-labelledby` for screen-reader accessibility. Keep it short and action-oriented (e.g. "Delete Project" rather than "Are you sure?"). @default '' */
  heading: string;
  /** Controls the visible state of the dialog. Set to `true` to open the modal and activate the focus trap; set to `false` to close it, run the exit animation, and restore focus to the previously-focused element. @default false */
  open: boolean;
  /** Controls the maximum width of the dialog panel. `sm` (400px) is ideal for simple confirmations, `md` (560px) for standard forms, and `lg` (720px) for content-heavy dialogs with tables or multi-column layouts. @default 'md' */
  size: 'sm' | 'md' | 'lg';
  /** When `true`, renders the built-in X close button and allows dismissal via Escape key and backdrop click. Set to `false` for critical decision modals where the user must explicitly choose an action from the footer buttons. @default true */
  closable: boolean;
  /** Makes the modal fill the entire viewport. Useful for mobile forms or complex workflows. @default false */
  fullscreen: boolean;
}

/**
 * `<arc-multi-select>`
 * Events: arc-change, arc-input
 */
export declare class ArcMultiSelect extends LitElement {
  /** Array of selected option values. Updated when items are toggled and emitted via `arc-change`. @default [] */
  value: string[];
  /** Hint text shown inside the control when no items are selected and the input is empty. @default '' */
  placeholder: string;
  /** Visible label rendered above the control in a small uppercase style. @default '' */
  label: string;
  /** @default '' */
  name: string;
  /** Disables the control, preventing interaction and reducing opacity to 50%. @default false */
  disabled: boolean;
  /** Prevents toggling options or removing chips while the control stays focusable; the dropdown can still be opened for viewing and the values still submit. @default false */
  readonly: boolean;
  /** Control size. `md` is the default; `sm` and `lg` scale the control height and padding. @default 'md' */
  size: 'sm' | 'md' | 'lg';
  /** @default true */
  formAssociated: boolean;
  /** Lit merges static properties up the prototype chain, so every consumer gets these without declaring them. `required` participates in constraint validation below; `readonly` reflects for styling and is enforced by each component's interaction handlers (the mixin can't know which gestures mutate state). @default { // flag(), unlike `disabled`. The exclusion in props.js is specifically // about form-associated *platform* semantics: a `disabled` content // attribute that is merely present makes the element actually disabled // per the HTML spec, and formDisabledCallback assigns the property back, // so no converter can win. Neither of these is platform-mapped — // `required` is enforced by _computeValidity() below and `readonly` by // each component's own interaction handlers — so the stock converter buys // nothing here and costs the usual bug: `required="false"` read as true, // blocking submission of a form the author meant to leave optional. // Finding #48's shape, across all 26 form controls at once. required: flag(false), readonly: flag(false), } */
  properties: Record<string, unknown>;
  /** Components that run their own constraint-validation logic (pattern checks, range checks) opt out of the automatic required sync by overriding this to false, and own the whole validity flag set instead. @default true */
  autoValidates: boolean;
  form: unknown;
  validity: unknown;
  validationMessage: unknown;
  /** @default false */
  required: boolean;
}

/**
 * `<arc-nav-item>`
 */
export declare class ArcNavItem extends LitElement {
  /** Destination, preferring the explicit attribute over an anchor child. Authoring `<arc-nav-item><a href="/docs">Docs</a></arc-nav-item>` makes the pre-upgrade markup a working link list, which is what no-JS visitors and anyone on a slow connection actually see — arc-navigation-menu hides this light DOM only once it has upgraded and re-rendered it into shadow DOM. */
  resolvedHref: unknown;
  label: unknown;
  /** Nested arc-nav-item children for dropdown menus. */
  subItems: unknown;
  hasChildren: unknown;
  /** Destination URL for the nav item. Required for leaf items that navigate. Omit on parent items that serve only as dropdown triggers. @default '' */
  href: string;
  /** Secondary text displayed below the item label inside a dropdown. Use this to add context like "Real-time dashboards and metrics" so users can scan the mega-menu without clicking through. @default '' */
  description: string;
  /** Highlights the item with an accent-colored bottom border to indicate the current route. Set this on the top-level NavItem that corresponds to the active page. @default false */
  active: boolean;
  /** Visual style variant. `default` shows a subtle border and muted text with accent glow on active. `primary` uses accent-colored text and border in the resting state with a stronger glow on hover/active. `muted` renders a subdued style with no border and lighter text — ideal for secondary links like "Blog" or "Changelog". @default 'default' */
  variant: 'default' | 'primary' | 'muted';
}

/**
 * `<arc-navigation-menu>`
 * Events: arc-mobile-menu-toggle, arc-navigate
 */
export declare class ArcNavigationMenu extends LitElement {
  /** @default 'Navigation menu' */
  label: string;
}

/**
 * `<arc-notification-panel>`
 * Events: arc-open, arc-close
 */
export declare class ArcNotificationPanel extends LitElement {
  /** Maximum height of the scrollable body area. Prevents long notification lists from overflowing the viewport. @default '400px' */
  maxHeight: string;
  /** Controls whether the notification panel is visible. Toggle this programmatically or let the built-in trigger click handler manage it. @default false */
  open: boolean;
  /** Horizontal alignment of the panel relative to the trigger element. Use top-right when the trigger is near the right edge of the viewport. @default 'top-right' */
  position: 'top-right' | 'top-left';
}

/**
 * `<arc-number-format>`
 */
export declare class ArcNumberFormat extends LitElement {
  /** The number to format @default 0 */
  value: number;
  /** BCP 47 locale tag for locale-aware formatting @default 'en-US' */
  locale: string;
  /** ISO 4217 currency code, used when type is "currency" @default 'USD' */
  currency: string;
  /** Number of decimal places (defaults: 0 for number, 2 for currency, 1 for percent) @default undefined */
  decimals: number;
  /** Formatting style to apply @default 'number' */
  type: 'number' | 'currency' | 'percent' | 'compact';
  /** Number notation — compact gives "12.3K", "1.2M" @default 'standard' */
  notation: 'standard' | 'compact';
}

/**
 * `<arc-number-input>`
 * Events: arc-input, arc-change
 */
export declare class ArcNumberInput extends LitElement {
  /** Current numeric value. Reflected as an attribute and updated on user interaction. @default 0 */
  value: number;
  /** Minimum allowed value. The decrement button is disabled when the value reaches this limit. @default undefined */
  min: number;
  /** Maximum allowed value. The increment button is disabled when the value reaches this limit. @default undefined */
  max: number;
  /** Increment and decrement step size. Arrow keys use this value, Shift+Arrow uses 10x this value. @default 1 */
  step: number;
  /** Label text displayed above the control in uppercase accent font. @default '' */
  label: string;
  /** @default '' */
  name: string;
  /** Disables interaction, reducing opacity to 40% and blocking pointer events. @default false */
  disabled: boolean;
  /** Prevents value changes from typing, stepper buttons, and arrow keys while keeping the field focusable and its value submitted. @default false */
  readonly: boolean;
  /** Control size. `md` is the default; `sm` and `lg` scale the field padding. @default 'md' */
  size: 'sm' | 'md' | 'lg';
  /** @default true */
  formAssociated: boolean;
  /** Lit merges static properties up the prototype chain, so every consumer gets these without declaring them. `required` participates in constraint validation below; `readonly` reflects for styling and is enforced by each component's interaction handlers (the mixin can't know which gestures mutate state). @default { // flag(), unlike `disabled`. The exclusion in props.js is specifically // about form-associated *platform* semantics: a `disabled` content // attribute that is merely present makes the element actually disabled // per the HTML spec, and formDisabledCallback assigns the property back, // so no converter can win. Neither of these is platform-mapped — // `required` is enforced by _computeValidity() below and `readonly` by // each component's own interaction handlers — so the stock converter buys // nothing here and costs the usual bug: `required="false"` read as true, // blocking submission of a form the author meant to leave optional. // Finding #48's shape, across all 26 form controls at once. required: flag(false), readonly: flag(false), } */
  properties: Record<string, unknown>;
  /** Components that run their own constraint-validation logic (pattern checks, range checks) opt out of the automatic required sync by overriding this to false, and own the whole validity flag set instead. @default true */
  autoValidates: boolean;
  form: unknown;
  validity: unknown;
  validationMessage: unknown;
  /** @default false */
  required: boolean;
}

/**
 * `<arc-option>`
 */
export declare class ArcOption extends LitElement {
  /** Expose text content as label */
  label: unknown;
  /** The value identifier for this option, used to match against the parent control value. @default '' */
  value: string;
  /** When true, dims this option and prevents it from being selected. @default false */
  disabled: boolean;
  /** @default false */
  selected: boolean;
}

/**
 * `<arc-otp-input>`
 * Events: arc-input, arc-change
 */
export declare class ArcOtpInput extends LitElement {
  /** Number of individual character boxes to render. Reflected as an attribute. @default 6 */
  length: number;
  /** The concatenated value of all boxes. Reflected as an attribute and updated on every input. @default '' */
  value: string;
  /** @default '' */
  name: string;
  /** Disables all input boxes, reducing opacity to 40% and blocking pointer events. @default false */
  disabled: boolean;
  /** Prevents typing, pasting, and clearing digits while the boxes stay focusable and the value still submits. @default false */
  readonly: boolean;
  /** Input mode. `number` filters non-digits and uses the numeric keyboard; `text` allows any character. @default 'number' */
  type: 'number' | 'text';
  /** Control size. `md` is the default; `sm` and `lg` scale the digit boxes. @default 'md' */
  size: 'sm' | 'md' | 'lg';
  /** @default true */
  formAssociated: boolean;
  /** Lit merges static properties up the prototype chain, so every consumer gets these without declaring them. `required` participates in constraint validation below; `readonly` reflects for styling and is enforced by each component's interaction handlers (the mixin can't know which gestures mutate state). @default { // flag(), unlike `disabled`. The exclusion in props.js is specifically // about form-associated *platform* semantics: a `disabled` content // attribute that is merely present makes the element actually disabled // per the HTML spec, and formDisabledCallback assigns the property back, // so no converter can win. Neither of these is platform-mapped — // `required` is enforced by _computeValidity() below and `readonly` by // each component's own interaction handlers — so the stock converter buys // nothing here and costs the usual bug: `required="false"` read as true, // blocking submission of a form the author meant to leave optional. // Finding #48's shape, across all 26 form controls at once. required: flag(false), readonly: flag(false), } */
  properties: Record<string, unknown>;
  /** Components that run their own constraint-validation logic (pattern checks, range checks) opt out of the automatic required sync by overriding this to false, and own the whole validity flag set instead. @default true */
  autoValidates: boolean;
  form: unknown;
  validity: unknown;
  validationMessage: unknown;
  /** @default false */
  required: boolean;
}

/**
 * `<arc-page-header>`
 */
export declare class ArcPageHeader extends LitElement {
  /** The page title rendered as an <h1>. This is the primary text landmark and should clearly describe the current page or view (e.g. "Team Settings", "Order #4021"). Keep it concise — two to five words is ideal. @default '' */
  heading: string;
  /** Optional supporting text displayed below the title row. Use it to provide a one-line summary of what the page contains or what action the user should take. When empty, the description paragraph is not rendered. @default '' */
  description: string;
  /** When set, renders a subtle bottom border below the header to visually separate it from page content. @default false */
  border: boolean;
}

/**
 * `<arc-page-indicator>`
 * Events: arc-change
 */
export declare class ArcPageIndicator extends LitElement {
  /** Total number of dots to display. @default 0 */
  count: number;
  /** Zero-based index of the active dot. @default 0 */
  value: number;
  /** When true, dots become interactive tap targets that dispatch arc-change on click. @default false */
  clickable: boolean;
}

/**
 * `<arc-page-layout>`
 */
export declare class ArcPageLayout extends LitElement {
  /** Maximum width of the content area when using the centered layout. Accepts any valid CSS length value. Has no effect on sidebar-left, sidebar-right, or wide layouts. Maps to the --max-width CSS custom property. @default '1120px' */
  maxWidth: string;
  /** Gap between the sidebar/aside and main content regions. Accepts any valid CSS length or spacing token. Maps to the --gap CSS custom property and applies to the CSS Grid gap in sidebar layouts. @default 'var(--space-xl)' */
  gap: string;
  /** Controls the column structure of the page. sidebar-left creates a 240px fixed column on the left for navigation. sidebar-right creates a 300px fixed column on the right for contextual content. centered constrains the main area to max-width with auto margins. wide allows content to stretch the full available width. @default 'centered' */
  layout: 'sidebar-left' | 'sidebar-right' | 'centered' | 'wide';
}

/**
 * `<arc-pagination>`
 * Events: arc-change
 */
export declare class ArcPagination extends LitElement {
  /** Total number of pages. At least 1 — a pager with no pages is still a pager showing page 1 of 1. @default 1 */
  total: number;
  /** The currently active page number (1-based). Reflected as an attribute. Clamped to 1..`total`, so a page number past either end lands on the nearest real page rather than stranding the control. @default 1 */
  current: number;
  /** Number of page buttons to show on each side of the current page before ellipsis truncation kicks in. Never negative. @default 1 */
  siblings: number;
  /** Shows only previous/next buttons with a 'current / total' label. Hides individual page numbers. @default false */
  compact: boolean;
}

/**
 * `<arc-password-input>`
 * Events: arc-strength-change, arc-input, arc-change
 */
export declare class ArcPasswordInput extends LitElement {
  /** Runs its own constraint logic — owns the whole validity flag set. @default false */
  autoValidates: boolean;
  /** The `name` attribute sent with form data on submission. Also used by the Form component to track field state. @default '' */
  name: string;
  /** Visible label rendered above the field. Automatically associated with the input via a generated id. @default '' */
  label: string;
  /** Hint text displayed when the field is empty. Use it for guidance, never as a substitute for the label. @default '' */
  placeholder: string;
  /** The current value of the field. Can be set programmatically; updated internally on each keystroke. @default '' */
  value: string;
  /** Prevents interaction (including the visibility toggle) and applies a muted visual treatment. @default false */
  disabled: boolean;
  /** Error message displayed below the field. When set, the border turns red and the message is announced. @default '' */
  error: string;
  /** Passed through to the inner input. Use `new-password` on registration or change-password forms so password managers offer generation. @default 'current-password' */
  autocomplete: string;
  /** Marks the field as required and enables native constraint validation on form submission. @default false */
  required: boolean;
  /** Controls the field size. Options: 'sm', 'md', 'lg'. @default 'md' */
  size: 'sm' | 'md' | 'lg';
  /** Renders a four-segment strength meter with a Weak / Fair / Good / Strong label under the field, scored by a built-in heuristic (length, character variety, common-pattern penalties). @default false */
  showStrength: boolean;
  /** @default true */
  formAssociated: boolean;
  /** Lit merges static properties up the prototype chain, so every consumer gets these without declaring them. `required` participates in constraint validation below; `readonly` reflects for styling and is enforced by each component's interaction handlers (the mixin can't know which gestures mutate state). @default { // flag(), unlike `disabled`. The exclusion in props.js is specifically // about form-associated *platform* semantics: a `disabled` content // attribute that is merely present makes the element actually disabled // per the HTML spec, and formDisabledCallback assigns the property back, // so no converter can win. Neither of these is platform-mapped — // `required` is enforced by _computeValidity() below and `readonly` by // each component's own interaction handlers — so the stock converter buys // nothing here and costs the usual bug: `required="false"` read as true, // blocking submission of a form the author meant to leave optional. // Finding #48's shape, across all 26 form controls at once. required: flag(false), readonly: flag(false), } */
  properties: Record<string, unknown>;
  form: unknown;
  validity: unknown;
  validationMessage: unknown;
  /** @default false */
  readonly: boolean;
}

/**
 * `<arc-pin-input>`
 * Events: arc-input, arc-change, arc-complete
 */
export declare class ArcPinInput extends LitElement {
  /** Number of input boxes to render. Determines the expected code length. @default 4 */
  length: number;
  /** Current combined value across all boxes. Reflected as an attribute. @default '' */
  value: string;
  /** @default '' */
  name: string;
  /** Disables all boxes, reducing opacity to 40% and blocking input. @default false */
  disabled: boolean;
  /** Inserts a visual dash separator every N boxes. Set to 0 to disable separators. @default 0 */
  separator: number;
  /** Label text displayed above the input boxes in uppercase accent font. @default '' */
  label: string;
  /** Character validation mode. `number` allows digits only, `alphanumeric` allows letters and digits, `text` allows any character. @default 'number' */
  type: 'number' | 'alphanumeric' | 'text';
  /** When true, obscures entered characters with dots for sensitive codes. @default false */
  mask: boolean;
  /** Prevents entering, deleting, or pasting characters while the boxes stay focusable and the value still submits. @default false */
  readonly: boolean;
  /** Control size. `md` is the default; `sm` and `lg` scale the digit boxes. @default 'md' */
  size: 'sm' | 'md' | 'lg';
  /** @default true */
  formAssociated: boolean;
  /** Lit merges static properties up the prototype chain, so every consumer gets these without declaring them. `required` participates in constraint validation below; `readonly` reflects for styling and is enforced by each component's interaction handlers (the mixin can't know which gestures mutate state). @default { // flag(), unlike `disabled`. The exclusion in props.js is specifically // about form-associated *platform* semantics: a `disabled` content // attribute that is merely present makes the element actually disabled // per the HTML spec, and formDisabledCallback assigns the property back, // so no converter can win. Neither of these is platform-mapped — // `required` is enforced by _computeValidity() below and `readonly` by // each component's own interaction handlers — so the stock converter buys // nothing here and costs the usual bug: `required="false"` read as true, // blocking submission of a form the author meant to leave optional. // Finding #48's shape, across all 26 form controls at once. required: flag(false), readonly: flag(false), } */
  properties: Record<string, unknown>;
  /** Components that run their own constraint-validation logic (pattern checks, range checks) opt out of the automatic required sync by overriding this to false, and own the whole validity flag set instead. @default true */
  autoValidates: boolean;
  form: unknown;
  validity: unknown;
  validationMessage: unknown;
  /** @default false */
  required: boolean;
}

/**
 * `<arc-popover>`
 * Events: arc-open, arc-close
 */
export declare class ArcPopover extends LitElement {
  /** Reserved for future trigger-mode configuration (click, hover, manual). @default '' */
  trigger: string;
  /** Whether the popover panel is currently visible. Reflected as an attribute. @default false */
  open: boolean;
  /** Placement of the panel relative to the trigger element. @default 'bottom' */
  position: 'top' | 'bottom' | 'left' | 'right';
}

/**
 * `<arc-progress>`
 */
export declare class ArcProgress extends LitElement {
  /** Accessible label text applied as aria-label on the underlying progressbar role element. This is the only way screen readers can convey the purpose of the indicator. Always provide a meaningful label such as "Uploading report.pdf" rather than a generic "Loading". @default '' */
  label: string;
  /** Current completion percentage from 0 to 100. Only meaningful in determinate mode. The bar fills proportionally and aria-valuenow updates to match, giving screen readers a live reading. @default 0 */
  value: number;
  /** Selects the visual shape. Bar renders a horizontal track with a fill that grows from left to right — best for wide containers and known percentages. Spinner renders a circular indicator suited to compact inline or button contexts. @default 'bar' */
  variant: 'bar' | 'spinner';
  /** Controls the thickness of the bar track or the diameter of the spinner. Small (sm) fits inside table cells and tight layouts. Medium (md) is the standard default. Large (lg) is appropriate for page-level or hero loading states. @default 'md' */
  size: 'sm' | 'md' | 'lg';
  /** When true, the bar pulses or the spinner loops without a fixed endpoint. Use this when the total work is unknown. Switch to determinate (indeterminate=false) and set a value as soon as real progress data becomes available. @default false */
  indeterminate: boolean;
  /** Displays the current percentage value next to the label. @default false */
  showValue: boolean;
}

/**
 * `<arc-progress-toast>`
 * Events: arc-complete, arc-cancel
 */
export declare class ArcProgressToast extends LitElement {
  /** Anchors the progress toast stack to a fixed corner of the viewport. @default 'bottom-right' */
  position: 'top-right' | 'bottom-right';
}

/**
 * `<arc-prose>`
 */
export declare class ArcProse extends LitElement {
  /** Controls the base font size of the prose container. Affects paragraph text; headings and code maintain their own scale. @default 'md' */
  size: 'sm' | 'md' | 'lg';
}

/**
 * `<arc-qr-code>`
 */
export declare class ArcQrCode extends LitElement {
  /** The content to encode (URL, text, Wi-Fi string, 2FA URI, …). Empty values render nothing. Values exceeding QR capacity for the chosen level also render nothing. @default '' */
  value: string;
  /** Rendered width and height of the SVG in pixels. The code is vector-based and stays crisp at any size. @default 160 */
  size: number;
  /** Accessible description announced to screen readers (falls back to "QR code"). Describe the purpose, not the encoded value — the value is never exposed by default since it may be a secret. @default '' */
  label: string;
  /** Width of the empty border around the code, measured in modules. Scanners rely on this margin to find the code; keep at least 2 against busy backgrounds. @default 2 */
  quietZone: number;
  /** Error-correction level: L (~7% recovery), M (~15%), Q (~25%), H (~30%). Higher levels tolerate more damage/occlusion but produce denser codes. @default 'M' */
  level: 'L' | 'M' | 'Q' | 'H';
  /** Renders the code on a white rounded card with forced dark modules, guaranteeing dark-on-light scanability in both themes. Overrides --qr-fg/--qr-bg. Recommended for scan-critical codes. @default false */
  contrast: boolean;
}

/**
 * `<arc-radio>`
 */
export declare class ArcRadio extends LitElement {
  label: unknown;
  /** The value submitted when this option is selected. Must be unique within the parent RadioGroup. @default '' */
  value: string;
  /** When true, dims this individual option and removes it from keyboard navigation. The option cannot be selected by click or arrow keys. @default false */
  disabled: boolean;
}

/**
 * `<arc-radio-group>`
 * Events: arc-change
 */
export declare class ArcRadioGroup extends LitElement {
  /** The currently selected value. Must match one of the child arc-radio value attributes. Setting this property programmatically updates the visual selection and the internal aria-checked state. @default '' */
  value: string;
  /** The form field name submitted with the selected value. Required for native form integration — without it, the selection will not appear in FormData. @default '' */
  name: string;
  /** When true, disables all options in the group. The component becomes non-interactive: arrow-key navigation is suppressed, click events are ignored, and the group is excluded from the Tab order. @default false */
  disabled: boolean;
  /** Controls the layout direction of the radio options. Vertical stacks options top-to-bottom and maps Arrow Up/Down to navigation. Horizontal places options in a row and maps Arrow Left/Right. @default 'vertical' */
  orientation: 'vertical' | 'horizontal';
  /** Controls the radio button and label size. @default 'md' */
  size: 'sm' | 'md' | 'lg';
  /** @default true */
  formAssociated: boolean;
  /** Lit merges static properties up the prototype chain, so every consumer gets these without declaring them. `required` participates in constraint validation below; `readonly` reflects for styling and is enforced by each component's interaction handlers (the mixin can't know which gestures mutate state). @default { // flag(), unlike `disabled`. The exclusion in props.js is specifically // about form-associated *platform* semantics: a `disabled` content // attribute that is merely present makes the element actually disabled // per the HTML spec, and formDisabledCallback assigns the property back, // so no converter can win. Neither of these is platform-mapped — // `required` is enforced by _computeValidity() below and `readonly` by // each component's own interaction handlers — so the stock converter buys // nothing here and costs the usual bug: `required="false"` read as true, // blocking submission of a form the author meant to leave optional. // Finding #48's shape, across all 26 form controls at once. required: flag(false), readonly: flag(false), } */
  properties: Record<string, unknown>;
  /** Components that run their own constraint-validation logic (pattern checks, range checks) opt out of the automatic required sync by overriding this to false, and own the whole validity flag set instead. @default true */
  autoValidates: boolean;
  form: unknown;
  validity: unknown;
  validationMessage: unknown;
  /** @default false */
  required: boolean;
  /** @default false */
  readonly: boolean;
}

/**
 * `<arc-rail>`
 * Events: arc-change
 */
export declare class ArcRail extends LitElement {
  /** Array of navigation items, each with an icon name, text label, and value identifier. @default [] */
  items: Array<{icon: string, label: string, value: string}>;
  /** The value of the currently active item. Controls which icon receives the accent glow. @default '' */
  value: string;
  /** When true, the Rail widens to show text labels beside each icon. Can be toggled on hover or set permanently. @default false */
  expanded: boolean;
}

/**
 * `<arc-range-slider>`
 * Events: arc-input, arc-change
 */
export declare class ArcRangeSlider extends LitElement {
  /** Minimum allowed value at the left edge of the track. @default 0 */
  min: number;
  /** Maximum allowed value at the right edge of the track. @default 100 */
  max: number;
  /** Increment granularity. Values snap to multiples of this number. @default 1 */
  step: number;
  /** Lower bound value of the selected range. Reflected as an attribute. @default 0 */
  low: number;
  /** Upper bound value of the selected range. Reflected as an attribute. @default 100 */
  high: number;
  /** @default '' */
  name: string;
  /** Disables interaction, reducing opacity and blocking pointer events. @default false */
  disabled: boolean;
  /** Label text displayed above the slider with the range values shown on the right. @default '' */
  label: string;
  /** Whether to display the numeric "low – high" readout in the header. @default true */
  showValues: boolean;
  /** Control size. `md` is the default; `sm` and `lg` scale the track and thumbs. @default 'md' */
  size: 'sm' | 'md' | 'lg';
  /** @default true */
  formAssociated: boolean;
  /** Lit merges static properties up the prototype chain, so every consumer gets these without declaring them. `required` participates in constraint validation below; `readonly` reflects for styling and is enforced by each component's interaction handlers (the mixin can't know which gestures mutate state). @default { // flag(), unlike `disabled`. The exclusion in props.js is specifically // about form-associated *platform* semantics: a `disabled` content // attribute that is merely present makes the element actually disabled // per the HTML spec, and formDisabledCallback assigns the property back, // so no converter can win. Neither of these is platform-mapped — // `required` is enforced by _computeValidity() below and `readonly` by // each component's own interaction handlers — so the stock converter buys // nothing here and costs the usual bug: `required="false"` read as true, // blocking submission of a form the author meant to leave optional. // Finding #48's shape, across all 26 form controls at once. required: flag(false), readonly: flag(false), } */
  properties: Record<string, unknown>;
  /** Components that run their own constraint-validation logic (pattern checks, range checks) opt out of the automatic required sync by overriding this to false, and own the whole validity flag set instead. @default true */
  autoValidates: boolean;
  form: unknown;
  validity: unknown;
  validationMessage: unknown;
  /** @default false */
  required: boolean;
  /** @default false */
  readonly: boolean;
}

/**
 * `<arc-rating>`
 * Events: arc-change
 */
export declare class ArcRating extends LitElement {
  /** Current rating value, 0 to `max`. **0 means unrated** — it is a legal state of the control, not a rating of zero: it submits nothing, announces as "No rating", and is what Home and a left-arrow at the first star return to. Clicking the star that is already selected also clears back to it. Reflected as an attribute and updated on user interaction. @default 0 */
  value: number;
  /** Maximum number of stars to render. Determines the upper bound of the rating scale. @default 5 */
  max: number;
  /** @default '' */
  name: string;
  /** Accessible name for the control. Several ratings on one page are indistinguishable without it. Defaults to "Rating". @default '' */
  label: string;
  /** Disables interaction, reducing opacity to 40% and blocking pointer events. @default false */
  disabled: boolean;
  /** Prevents interaction while maintaining full visual appearance. Useful for displaying existing ratings. @default false */
  readonly: boolean;
  /** Control size. `md` is the default; `sm` and `lg` scale the star glyphs. @default 'md' */
  size: 'sm' | 'md' | 'lg';
  /** @default true */
  formAssociated: boolean;
  /** Lit merges static properties up the prototype chain, so every consumer gets these without declaring them. `required` participates in constraint validation below; `readonly` reflects for styling and is enforced by each component's interaction handlers (the mixin can't know which gestures mutate state). @default { // flag(), unlike `disabled`. The exclusion in props.js is specifically // about form-associated *platform* semantics: a `disabled` content // attribute that is merely present makes the element actually disabled // per the HTML spec, and formDisabledCallback assigns the property back, // so no converter can win. Neither of these is platform-mapped — // `required` is enforced by _computeValidity() below and `readonly` by // each component's own interaction handlers — so the stock converter buys // nothing here and costs the usual bug: `required="false"` read as true, // blocking submission of a form the author meant to leave optional. // Finding #48's shape, across all 26 form controls at once. required: flag(false), readonly: flag(false), } */
  properties: Record<string, unknown>;
  /** Components that run their own constraint-validation logic (pattern checks, range checks) opt out of the automatic required sync by overriding this to false, and own the whole validity flag set instead. @default true */
  autoValidates: boolean;
  form: unknown;
  validity: unknown;
  validationMessage: unknown;
  /** @default false */
  required: boolean;
}

/**
 * `<arc-resizable>`
 * Events: arc-resize
 */
export declare class ArcResizable extends LitElement {
  /** Minimum allowed size in pixels. The panel cannot be dragged smaller than this value. @default 100 */
  minSize: number;
  /** Maximum allowed size in pixels. The panel cannot be dragged larger than this value. Defaults to no limit. @default Infinity */
  maxSize: number;
  /** Current size of the panel in pixels. Updated in real time during drag. Maps to the --panel-size CSS custom property. @default 300 */
  size: number;
  /** Controls which edge the drag handle appears on. Horizontal places the handle on the right edge and resizes width; vertical places it on the bottom edge and resizes height. @default 'horizontal' */
  direction: 'horizontal' | 'vertical';
}

/**
 * `<arc-responsive-switcher>`
 */
export declare class ArcResponsiveSwitcher extends LitElement {
  /** The container width at which the layout switches between horizontal and vertical. Accepts any CSS length value. When the container is wider than this value, children are in a row; below it, they stack. @default '600px' */
  threshold: string;
  /** Spacing between children in both horizontal and vertical modes, mapped to design system spacing tokens. @default 'md' */
  gap: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

/**
 * `<arc-scroll-area>`
 */
export declare class ArcScrollArea extends LitElement {
  /** CSS max-height value applied to the scrollable container. Use any valid CSS length (e.g. `300px`, `50vh`). @default '' */
  maxHeight: string;
  /** Scroll direction. `vertical` shows a vertical scrollbar, `horizontal` shows a horizontal scrollbar, `both` shows both. @default 'vertical' */
  orientation: 'vertical' | 'horizontal' | 'both';
}

/**
 * `<arc-scroll-indicator>`
 */
export declare class ArcScrollIndicator extends LitElement {
  /** CSS selector for the scroll container to track. Defaults to the window when empty. @default '' */
  target: string;
  /** Which edge the indicator sticks to. @default 'top' */
  position: 'top' | 'bottom';
  /** Bar thickness: sm (2px), md (3px), lg (4px). @default 'sm' */
  size: 'sm' | 'md' | 'lg';
  /** Fill color mode. Accent uses `--accent-primary`. Gradient blends from primary to secondary. @default 'accent' */
  color: 'accent' | 'gradient';
}

/**
 * `<arc-scroll-spy>`
 * Events: arc-change
 */
export declare class ArcScrollSpy extends LitElement {
  /** Ring geometry. r drives the dasharray, so the two cannot drift apart. @default 6 */
  ringRadius: number;
  /** The id of the currently active section. Reflects to an attribute and updates automatically as the user scrolls. @default '' */
  active: string;
  /** Pixel distance from the top of the viewport at which a section counts as current. Increase it to account for taller sticky headers. @default 80 */
  offset: number;
  /** How the reader's position through the document is shown. `ring` draws a progress arc beside the heading; `read` recedes the entries already scrolled past; `both` does each. Defaults to `none`, and an unrecognized value lands there too. @default 'none' */
  progress: 'none' | 'ring' | 'read' | 'both';
}

/**
 * `<arc-scroll-to-top>`
 */
export declare class ArcScrollToTop extends LitElement {
  /** Scroll distance in pixels before the button becomes visible. @default 300 */
  threshold: number;
  /** Distance from viewport edges. Accepts any CSS length value. @default 'var(--space-lg)' */
  offset: string;
  /** Use smooth scrolling animation. Falls back to instant when prefers-reduced-motion is set. @default true */
  smooth: boolean;
  /** Corner placement. @default 'bottom-right' */
  position: 'bottom-right' | 'bottom-left';
}

/**
 * `<arc-search>`
 * Events: arc-input, arc-clear, arc-change, arc-select
 */
export declare class ArcSearch extends LitElement {
  /** Current text content of the search input. @default '' */
  value: string;
  /** Hint text displayed when the input is empty. @default 'Search...' */
  placeholder: string;
  /** Accessible label for the search field. Rendered visually above the input when provided. @default '' */
  label: string;
  /** Disables the input, reducing opacity and blocking interaction. @default false */
  disabled: boolean;
  /** Shows a spinning indicator in place of the clear button to signal in-progress loading. @default false */
  loading: boolean;
  /** Whether the suggestion dropdown is visible. Reflected so it can be opened programmatically or styled from CSS. @default false */
  open: boolean;
}

/**
 * `<arc-section>`
 */
export declare class ArcSection extends LitElement {
  /** Section label displayed in uppercase above content @default '' */
  label: string;
}

/**
 * `<arc-segmented-control>`
 * Events: arc-change
 */
export declare class ArcSegmentedControl extends LitElement {
  /** The value of the currently selected option. Reflected as an attribute and auto-set to the first selectable option if empty. @default '' */
  value: string;
  /** The form field name submitted with the selected value. Required for native form integration — without it, the selection will not appear in FormData. @default '' */
  name: string;
  /** Disables the entire control, reducing opacity to 40% and blocking pointer events. @default false */
  disabled: boolean;
  /** @default true */
  formAssociated: boolean;
  /** Lit merges static properties up the prototype chain, so every consumer gets these without declaring them. `required` participates in constraint validation below; `readonly` reflects for styling and is enforced by each component's interaction handlers (the mixin can't know which gestures mutate state). @default { // flag(), unlike `disabled`. The exclusion in props.js is specifically // about form-associated *platform* semantics: a `disabled` content // attribute that is merely present makes the element actually disabled // per the HTML spec, and formDisabledCallback assigns the property back, // so no converter can win. Neither of these is platform-mapped — // `required` is enforced by _computeValidity() below and `readonly` by // each component's own interaction handlers — so the stock converter buys // nothing here and costs the usual bug: `required="false"` read as true, // blocking submission of a form the author meant to leave optional. // Finding #48's shape, across all 26 form controls at once. required: flag(false), readonly: flag(false), } */
  properties: Record<string, unknown>;
  /** Components that run their own constraint-validation logic (pattern checks, range checks) opt out of the automatic required sync by overriding this to false, and own the whole validity flag set instead. @default true */
  autoValidates: boolean;
  form: unknown;
  validity: unknown;
  validationMessage: unknown;
  /** @default false */
  required: boolean;
  /** @default false */
  readonly: boolean;
}

/**
 * `<arc-select>`
 * Events: arc-change
 */
export declare class ArcSelect extends LitElement {
  /** The currently selected value. Must match one of the child `arc-option` value attributes. Setting this programmatically updates the displayed label and internal selection state. @default '' */
  value: string;
  /** Hint text displayed inside the trigger button when no option is selected. Use it to communicate what kind of choice the user should make, such as "Choose a team member..." or "Pick a status". The placeholder disappears once a value is chosen. @default 'Select...' */
  placeholder: string;
  /** Visible label rendered above the select trigger. Also serves as the accessible name for assistive technologies. Always provide a label for accessibility compliance. @default '' */
  label: string;
  /** Form field name submitted with the selected value. Required for native form integration via ElementInternals. @default '' */
  name: string;
  /** When true, the select trigger becomes non-interactive: it cannot be opened, focused via keyboard, or clicked. The component renders with reduced opacity to visually convey the unavailable state. @default false */
  disabled: boolean;
  /** Error message displayed below the select. When set, the trigger border turns red. @default '' */
  error: string;
  /** Controls the select trigger size. @default 'md' */
  size: 'sm' | 'md' | 'lg';
  /** Controls whether the dropdown is visible. Set programmatically to open or close the dropdown. Automatically set to `false` when an option is selected or the user clicks outside. Held at `false` while `disabled`. @default false */
  open: boolean;
  /** @default true */
  formAssociated: boolean;
  /** Lit merges static properties up the prototype chain, so every consumer gets these without declaring them. `required` participates in constraint validation below; `readonly` reflects for styling and is enforced by each component's interaction handlers (the mixin can't know which gestures mutate state). @default { // flag(), unlike `disabled`. The exclusion in props.js is specifically // about form-associated *platform* semantics: a `disabled` content // attribute that is merely present makes the element actually disabled // per the HTML spec, and formDisabledCallback assigns the property back, // so no converter can win. Neither of these is platform-mapped — // `required` is enforced by _computeValidity() below and `readonly` by // each component's own interaction handlers — so the stock converter buys // nothing here and costs the usual bug: `required="false"` read as true, // blocking submission of a form the author meant to leave optional. // Finding #48's shape, across all 26 form controls at once. required: flag(false), readonly: flag(false), } */
  properties: Record<string, unknown>;
  /** Components that run their own constraint-validation logic (pattern checks, range checks) opt out of the automatic required sync by overriding this to false, and own the whole validity flag set instead. @default true */
  autoValidates: boolean;
  form: unknown;
  validity: unknown;
  validationMessage: unknown;
  /** @default false */
  required: boolean;
  /** @default false */
  readonly: boolean;
}

/**
 * `<arc-separator>`
 */
export declare class ArcSeparator extends LitElement {
  /** Optional text displayed centered between two line segments. Only applies to horizontal orientation. @default '' */
  label: string;
  /** Controls the divider direction. Vertical separators display as inline-flex with full parent height. @default 'horizontal' */
  orientation: 'horizontal' | 'vertical';
  /** Controls the line style. Fade uses a gradient that tapers to transparent at both ends. @default 'line' */
  variant: 'line' | 'dashed' | 'dotted' | 'fade';
}

/**
 * `<arc-settings-layout>`
 */
export declare class ArcSettingsLayout extends LitElement {
  /** Controls whether the navigation panel appears as a left sidebar (220px wide, CSS Grid) or a top bar (full-width, flexbox column). The left layout collapses to stacked on screens narrower than 768px. @default 'left' */
  navPosition: 'left' | 'top';
}

/**
 * `<arc-sheet>`
 * Events: arc-close, arc-open
 */
export declare class ArcSheet extends LitElement {
  /** Text displayed in the header row. Also used as the `aria-label` for the dialog panel. @default '' */
  heading: string;
  /** Controls whether the sheet is visible. Reflected as an attribute and toggleable programmatically. @default false */
  open: boolean;
  /** Which edge the panel slides in from. Bottom sheets have a max-height of 80vh; right sheets are 400px wide. @default 'bottom' */
  side: 'bottom' | 'right';
}

/**
 * `<arc-sidebar>`
 * Events: arc-navigate
 */
export declare class ArcSidebar extends LitElement {
  /** The href of the currently active sidebar link. Used to highlight the matching link with accent styling. @default '' */
  active: string;
  /** Width of the sidebar. Accepts any CSS length value. @default '280px' */
  width: string;
  /** @default 'Sidebar navigation' */
  label: string;
  /** Controls which side the sidebar appears on. Moves the border line to the opposite edge. @default 'left' */
  position: 'left' | 'right';
  /** When true, collapses the sidebar to icon-only mode, hiding labels and reducing width. @default false */
  collapsed: boolean;
  /** Enables an accent glow effect on the active sidebar link for enhanced visual emphasis. @default false */
  glow: boolean;
}

/**
 * `<arc-sidebar-link>`
 */
export declare class ArcSidebarLink extends LitElement {
  /** Destination, preferring the explicit attribute over an anchor child. Authoring `<arc-sidebar-link><a href="/docs">Docs</a></arc-sidebar-link>` leaves a working link in the pre-upgrade markup — arc-sidebar hides this light DOM only once it has re-rendered it into shadow DOM. */
  resolvedHref: unknown;
  /** textContent already reaches through an anchor child, so this needs no special case. */
  label: unknown;
  /** Destination URL for the link. Can be an absolute path, relative path, or hash anchor. The link renders as a standard anchor element for full accessibility and SEO. @default '' */
  href: string;
  /** Nesting depth for visual indentation. Level 0 links render at default size; level 1+ links are indented and use a smaller font size. @default 0 */
  level: number;
  /** Name of an icon to render before the label. Use icons consistently within a section — a sidebar where only some links carry one reads as an oversight rather than a hierarchy. @default '' */
  icon: string;
  /** When true, applies a highlighted style (accent-colored text and a left-edge indicator) to signal that this link corresponds to the currently viewed page. Only one link should be active at a time. @default false */
  active: boolean;
  /** Marks a destination that leaves the surrounding section — an app on its own route, another site, a repository. The link gains a persistent box-arrow glyph in place of the hover chevron, so the departure is legible before the click rather than after it. @default false */
  external: boolean;
}

/**
 * `<arc-sidebar-section>`
 * Events: arc-toggle
 */
export declare class ArcSidebarSection extends LitElement {
  /** Get child arc-sidebar-link elements */
  links: unknown;
  /** Text label displayed above the group of links. Keep it short (one to three words) so the sidebar stays scannable. When omitted, links render without a heading divider. @default '' */
  heading: string;
  /** Name of an icon to render before the heading. Ignored when the section has no heading. @default '' */
  icon: string;
  /** When true, the section heading becomes a toggle button that expands/collapses the child links. @default false */
  collapsible: boolean;
  /** Controls whether a collapsible section is expanded (true) or collapsed (false). Only relevant when collapsible is true. @default true */
  open: boolean;
}

/**
 * `<arc-signature-pad>`
 * Events: arc-clear, arc-input, arc-change
 */
export declare class ArcSignaturePad extends LitElement {
  /** Stroke speed (CSS px per ms) at which the pen reaches its thinnest. @default 1.5 */
  SPEED_FULL: number;
  /** The signature as a PNG data-URL, empty string while the pad is blank. Updated after every completed stroke. Setting it from script draws the image onto the canvas (client-side only). Not reflected — a data-URL is far too large to live in an attribute. @default '' */
  value: string;
  /** Form field name the data-URL submits under. @default '' */
  name: string;
  /** Label text displayed above the pad in the label typography role. Also feeds the canvas's accessible name. @default '' */
  label: string;
  /** Disables interaction, reducing opacity and blocking pointer events. The pad leaves the tab order. @default false */
  disabled: boolean;
  /** Pen color as any CSS color, including a `var()` expression, resolved against the canvas at stroke time. Attribute: `pen-color`. Defaults to the resolved value of `--text-primary`. @default '' */
  penColor: string;
  /** Base pen width in CSS pixels. The drawn line scales with stroke velocity — up to 40% thicker on slow, deliberate movement and 40% thinner on fast flicks. Attribute: `pen-width`. Default 2. @default 2 */
  penWidth: number;
  /** Prevents drawing and hides the clear button while the pad stays focusable and the value still submits. @default false */
  readonly: boolean;
  /** When true and the pad is blank, the control is invalid with `valueMissing`. @default false */
  required: boolean;
  /** @default true */
  formAssociated: boolean;
  /** Lit merges static properties up the prototype chain, so every consumer gets these without declaring them. `required` participates in constraint validation below; `readonly` reflects for styling and is enforced by each component's interaction handlers (the mixin can't know which gestures mutate state). @default { // flag(), unlike `disabled`. The exclusion in props.js is specifically // about form-associated *platform* semantics: a `disabled` content // attribute that is merely present makes the element actually disabled // per the HTML spec, and formDisabledCallback assigns the property back, // so no converter can win. Neither of these is platform-mapped — // `required` is enforced by _computeValidity() below and `readonly` by // each component's own interaction handlers — so the stock converter buys // nothing here and costs the usual bug: `required="false"` read as true, // blocking submission of a form the author meant to leave optional. // Finding #48's shape, across all 26 form controls at once. required: flag(false), readonly: flag(false), } */
  properties: Record<string, unknown>;
  /** Components that run their own constraint-validation logic (pattern checks, range checks) opt out of the automatic required sync by overriding this to false, and own the whole validity flag set instead. @default true */
  autoValidates: boolean;
  form: unknown;
  validity: unknown;
  validationMessage: unknown;
}

/**
 * `<arc-skeleton>`
 */
export declare class ArcSkeleton extends LitElement {
  /** CSS width value (e.g. "200px", "100%") @default '' */
  width: string;
  /** CSS height value; circle auto-matches width when omitted @default '' */
  height: string;
  /** Renders multiple skeleton items stacked vertically with spacing. Useful for placeholder lists. @default 1 */
  count: number;
  /** Shape of the skeleton: text for lines, circle for avatars, rect for blocks @default 'text' */
  variant: 'text' | 'circle' | 'rect';
}

/**
 * `<arc-skip-link>`
 */
export declare class ArcSkipLink extends LitElement {
  /** CSS selector for the element that should receive focus when the skip link is activated. Typically an ID like #main. @default '#main' */
  target: string;
}

/**
 * `<arc-slider>`
 * Events: arc-input, arc-change
 */
export declare class ArcSlider extends LitElement {
  /** Current slider value. Reflected as an attribute and updated on user interaction. @default 0 */
  value: number;
  /** Minimum allowed value at the left edge of the track. @default 0 */
  min: number;
  /** Maximum allowed value at the right edge of the track. @default 100 */
  max: number;
  /** Increment granularity. The value snaps to multiples of this number. @default 1 */
  step: number;
  /** @default '' */
  name: string;
  /** Disables interaction, reducing opacity to 40% and blocking pointer events. @default false */
  disabled: boolean;
  /** Label text displayed above the slider with the current value shown on the right. @default '' */
  label: string;
  /** Prevents dragging and arrow-key changes while the thumb stays focusable and the value still submits. @default false */
  readonly: boolean;
  /** Control size. `md` is the default; `sm` and `lg` scale the track and thumb. @default 'md' */
  size: 'sm' | 'md' | 'lg';
  /** @default true */
  formAssociated: boolean;
  /** Lit merges static properties up the prototype chain, so every consumer gets these without declaring them. `required` participates in constraint validation below; `readonly` reflects for styling and is enforced by each component's interaction handlers (the mixin can't know which gestures mutate state). @default { // flag(), unlike `disabled`. The exclusion in props.js is specifically // about form-associated *platform* semantics: a `disabled` content // attribute that is merely present makes the element actually disabled // per the HTML spec, and formDisabledCallback assigns the property back, // so no converter can win. Neither of these is platform-mapped — // `required` is enforced by _computeValidity() below and `readonly` by // each component's own interaction handlers — so the stock converter buys // nothing here and costs the usual bug: `required="false"` read as true, // blocking submission of a form the author meant to leave optional. // Finding #48's shape, across all 26 form controls at once. required: flag(false), readonly: flag(false), } */
  properties: Record<string, unknown>;
  /** Components that run their own constraint-validation logic (pattern checks, range checks) opt out of the automatic required sync by overriding this to false, and own the whole validity flag set instead. @default true */
  autoValidates: boolean;
  form: unknown;
  validity: unknown;
  validationMessage: unknown;
  /** @default false */
  required: boolean;
}

/**
 * `<arc-snackbar>`
 * Events: arc-action, arc-close
 */
export declare class ArcSnackbar extends LitElement {
  /** Time in milliseconds before the snackbar auto-dismisses. Can be overridden per-show via the duration option. Set to 0 to persist until manually dismissed. @default 5000 */
  duration: number;
  /** Anchors the snackbar to a bottom edge of the viewport. Bottom-center is the conventional position for material-style snackbars. @default 'bottom-center' */
  position: 'bottom-center' | 'bottom-left' | 'bottom-right';
}

/**
 * `<arc-sortable-list>`
 * Events: arc-change
 */
export declare class ArcSortableList extends LitElement {
  /** Disables all interaction, reducing opacity to 40% and blocking pointer events. @default false */
  disabled: boolean;
}

/**
 * `<arc-sparkline>`
 */
export declare class ArcSparkline extends LitElement {
  /** Comma-separated numeric values that define the chart data points (e.g. "10,25,18,30,22,35,28"). Parsed into a number array at render time. Non-numeric entries are silently dropped. @default '' */
  data: string;
  /** CSS color override applied to strokes and fills. Accepts any valid CSS color value. Defaults to var(--accent-primary) when not set. @default '' */
  color: string;
  /** SVG viewport width in pixels. @default 120 */
  width: number;
  /** SVG viewport height in pixels. @default 32 */
  height: number;
  /** Chart type. Line renders a polyline with optional area fill; bar renders evenly spaced rectangles. @default 'line' */
  type: 'line' | 'bar';
  /** When true and type is "line", fills the area beneath the curve with a semi-transparent accent color. @default false */
  fill: boolean;
}

/**
 * `<arc-speed-dial>`
 * Events: arc-close, arc-open, arc-action
 */
export declare class ArcSpeedDial extends LitElement {
  /** Array of secondary action items to display when the speed dial is open. Each item needs an icon and label. @default [] */
  items: Array<{icon: string, label: string, value?: string}>;
  /** Whether the secondary actions are currently visible. @default false */
  open: boolean;
  /** The direction in which child actions fan out from the trigger. @default 'up' */
  direction: 'up' | 'down' | 'left' | 'right';
  /** Fixed viewport corner where the speed dial is anchored. @default 'bottom-right' */
  position: 'bottom-right' | 'bottom-left';
}

/**
 * `<arc-spinner>`
 */
export declare class ArcSpinner extends LitElement {
  /** Spinner dimensions: sm (16px), md (24px), lg (40px) @default 'md' */
  size: 'sm' | 'md' | 'lg';
  /** Color of the spinner ring @default 'primary' */
  variant: 'primary' | 'secondary' | 'white';
}

/**
 * `<arc-split-pane>`
 * Events: arc-resize
 */
export declare class ArcSplitPane extends LitElement {
  /** Minimum allowed ratio. The divider cannot be dragged below this value, preventing the primary pane from collapsing. @default 0.15 */
  minRatio: number;
  /** Maximum allowed ratio. The divider cannot be dragged above this value, preventing the secondary pane from collapsing. @default 0.85 */
  maxRatio: number;
  /** Controls the split direction. Horizontal places panes side by side with a vertical divider. Vertical stacks panes top and bottom with a horizontal divider. @default 'horizontal' */
  orientation: 'horizontal' | 'vertical';
  /** The proportion of space allocated to the primary pane, clamped to `minRatio`..`maxRatio` on every path. The drag handle always honoured those bounds; assigning `ratio` from script used to bypass them entirely. From 0 to 1. A value of 0.4 gives the primary pane 40% of the available width (or height in vertical mode). @default 0.5 */
  ratio: number;
}

/**
 * `<arc-spotlight>`
 * Events: arc-close
 */
export declare class ArcSpotlight extends LitElement {
  /** CSS selector for the element to highlight. The first matching element will be spotlighted with a glow ring and elevated z-index. @default '' */
  target: string;
  /** Padding in pixels around the target element cutout. Increase for larger glow rings or to give the target more breathing room. @default 8 */
  padding: number;
  /** Controls whether the spotlight overlay is visible. Set to true to activate the dimming overlay and highlight the target element. @default false */
  active: boolean;
}

/**
 * `<arc-spy-link>`
 */
export declare class ArcSpyLink extends LitElement {
  label: unknown;
  /** ID of the section to observe @default '' */
  target: string;
  /** Nesting depth for visual indentation. Level 0 links render at default size; level 1+ links are indented and use a smaller font size. @default 0 */
  level: number;
}

/**
 * `<arc-stack>`
 */
export declare class ArcStack extends LitElement {
  /** Flex direction — vertical is column, horizontal is row @default 'vertical' */
  direction: 'vertical' | 'horizontal';
  /** Gap between children, maps to --space-* tokens @default 'md' */
  gap: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  /** Cross-axis alignment (align-items) @default 'stretch' */
  align: 'start' | 'center' | 'end' | 'stretch';
  /** Main-axis alignment (justify-content) @default 'start' */
  justify: 'start' | 'center' | 'end' | 'between' | 'around';
  /** Enable flex-wrap for responsive wrapping @default false */
  wrap: boolean;
}

/**
 * `<arc-stat>`
 */
export declare class ArcStat extends LitElement {
  /** The stat value (e.g. "99%") @default '' */
  value: string;
  /** Label below the value @default '' */
  label: string;
  /** Shows a trend indicator arrow below the label. Empty (the default) shows none; an unrecognised value falls back to empty rather than rendering an uncoloured dash that no `:host([trend=...])` rule matches. @default '' */
  trend: '' | 'up' | 'down' | 'neutral';
  /** Text displayed next to the trend arrow, typically a percentage like '+12%' or '-3.5%'. @default '' */
  change: string;
}

/**
 * `<arc-status-bar>`
 */
export declare class ArcStatusBar extends LitElement {
  /** Controls whether the status bar flows with the document (static) or pins to the bottom of the viewport (fixed). Fixed mode sets bottom: 0, left: 0, right: 0 with z-index: 100. @default 'static' */
  position: 'static' | 'fixed';
}

/**
 * `<arc-step>`
 */
export declare class ArcStep extends LitElement {
  /** Step label text @default '' */
  label: string;
}

/**
 * `<arc-stepper>`
 */
export declare class ArcStepper extends LitElement {
  /** Zero-indexed active step — steps before this index show as completed. Clamped to the range of rendered steps. @default 0 */
  active: number;
}

/**
 * `<arc-stepper-nav>`
 * Events: arc-change, arc-complete
 */
export declare class ArcStepperNav extends LitElement {
  /** Array of step labels displayed along the progress track. @default [] */
  steps: Array<string>;
  /** Zero-based index of the currently active step. Clamped to the steps that exist, so it can never name a step the wizard does not have. @default 0 */
  active: number;
  /** When true, prevents jumping to future steps — the user must complete each step sequentially. @default false */
  linear: boolean;
}

/**
 * `<arc-sticky>`
 * Events: arc-stuck
 */
export declare class ArcSticky extends LitElement {
  /** The CSS `top` value for sticky positioning. Set to "64px" to stick below a 64px top bar, or "0px" to stick flush with the viewport/scroll container edge. @default '0px' */
  offset: string;
  /** Read-only attribute set by the IntersectionObserver when the element is currently stuck. Use the `[stuck]` CSS selector to style the stuck state. @default false */
  stuck: boolean;
}

/**
 * `<arc-suggestion>`
 */
export declare class ArcSuggestion extends LitElement {
  label: unknown;
  /** Suggestion value @default '' */
  value: string;
}

/**
 * `<arc-switch-group>`
 */
export declare class ArcSwitchGroup extends LitElement {
  /** Group heading rendered as a `<legend>` element. @default '' */
  label: string;
  /** Layout direction. Vertical stacks toggles, horizontal arranges them in a row. @default 'vertical' */
  orientation: 'vertical' | 'horizontal';
  /** Size cascaded to all child arc-toggle elements. @default 'md' */
  size: 'sm' | 'md' | 'lg';
  /** Disables all child toggles and dims the group. @default false */
  disabled: boolean;
}

/**
 * `<arc-tab>`
 */
export declare class ArcTab extends LitElement {
  /** Text displayed on the tab button. Keep labels concise — one or two words — to prevent the tab bar from overflowing. @default '' */
  label: string;
  /** When true, the tab button is dimmed, is skipped by the arrow keys and cannot be selected by click. A disabled tab that is already selected stays visible — disabling is not a way to hide a panel. @default false */
  disabled: boolean;
}

/**
 * `<arc-table>`
 */
export declare class ArcTable extends LitElement {
  /** Array of column header strings. @default [] */
  columns: string[];
  /** Array of row arrays. Each inner array contains cell values in column order. @default [] */
  rows: string[][];
  /** Alternating row backgrounds for improved scanability. @default false */
  striped: boolean;
  /** Row density. 'compact' reduces cell padding for dense data displays. @default 'default' */
  density: 'default' | 'compact';
}

/**
 * `<arc-tabs>`
 * Events: arc-change
 */
export declare class ArcTabs extends LitElement {
  /** Zero-based index of the currently active tab. Changing this value programmatically switches the visible panel and updates ARIA attributes. Out-of-range values are clamped to the nearest valid index. @default 0 */
  selected: number;
  /** Aligns the tab list. Options: 'start', 'center', 'end'. @default 'start' */
  align: 'start' | 'center' | 'end';
  /** Visual style of the tabs. Options: 'underline', 'pills'. @default 'underline' */
  variant: 'underline' | 'pills';
  /** Layout direction of the tab list. Use 'vertical' to place tabs in a sidebar column with the panel to the right. Arrow-key navigation automatically switches to up/down in vertical mode. @default 'horizontal' */
  orientation: 'horizontal' | 'vertical';
}

/**
 * `<arc-tag>`
 * Events: arc-remove
 */
export declare class ArcTag extends LitElement {
  /** Custom color as an RGB triplet (e.g. `"77, 126, 247"`). When set, overrides the variant colors for border, text, background, and hover glow. Useful for data-driven category colors. @default '' */
  color: string;
  /** Color variant. Default is neutral. Primary and secondary use accent tints. Success, warning, and error provide semantic status colors. @default 'default' */
  variant: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  /** Controls the tag size. @default 'md' */
  size: 'sm' | 'md' | 'lg';
  /** When true, shows a close button that fires `arc-remove` when clicked. @default false */
  removable: boolean;
  /** Disables the tag, reducing opacity to 40% and blocking pointer events including the remove button. @default false */
  disabled: boolean;
}

/**
 * `<arc-tag-input>`
 * Events: arc-change, arc-input
 */
export declare class ArcTagInput extends LitElement {
  /** Array of current tags. Updated on add/remove and emitted via `arc-change`. @default [] */
  value: string[];
  /** Autocomplete candidates. When non-empty, typing filters them into a dropdown listbox. @default [] */
  suggestions: string[];
  /** Character that commits the current text as a tag when typed; pasted text is split on it. @default ',' */
  delimiter: string;
  /** Maximum number of tags (0 = unlimited). At the limit, entry is disabled with a "-- max reached" hint. @default 0 */
  maxTags: number;
  /** Visible label rendered above the field in a small uppercase style. @default '' */
  label: string;
  /** Hint text shown inside the field when no tags exist and the input is empty. @default '' */
  placeholder: string;
  /** Form field name. Each tag is submitted as its own FormData entry under this name. @default '' */
  name: string;
  /** Disables the control, preventing interaction and reducing opacity to 50%. @default false */
  disabled: boolean;
  /** Error message shown below the field; also applies error styling to the border. @default '' */
  error: string;
  /** When false, only values from `suggestions` can be added; free text is rejected. @default true */
  allowCustom: boolean;
  /** Prevents adding or removing tags while the field stays focusable and the tags still submit with the form. @default false */
  readonly: boolean;
  /** Control size. `md` is the default; `sm` and `lg` scale the field height and padding. @default 'md' */
  size: 'sm' | 'md' | 'lg';
  /** @default true */
  formAssociated: boolean;
  /** Lit merges static properties up the prototype chain, so every consumer gets these without declaring them. `required` participates in constraint validation below; `readonly` reflects for styling and is enforced by each component's interaction handlers (the mixin can't know which gestures mutate state). @default { // flag(), unlike `disabled`. The exclusion in props.js is specifically // about form-associated *platform* semantics: a `disabled` content // attribute that is merely present makes the element actually disabled // per the HTML spec, and formDisabledCallback assigns the property back, // so no converter can win. Neither of these is platform-mapped — // `required` is enforced by _computeValidity() below and `readonly` by // each component's own interaction handlers — so the stock converter buys // nothing here and costs the usual bug: `required="false"` read as true, // blocking submission of a form the author meant to leave optional. // Finding #48's shape, across all 26 form controls at once. required: flag(false), readonly: flag(false), } */
  properties: Record<string, unknown>;
  /** Components that run their own constraint-validation logic (pattern checks, range checks) opt out of the automatic required sync by overriding this to false, and own the whole validity flag set instead. @default true */
  autoValidates: boolean;
  form: unknown;
  validity: unknown;
  validationMessage: unknown;
  /** @default false */
  required: boolean;
}

/**
 * `<arc-terminal>`
 * Events: arc-complete
 */
export declare class ArcTerminal extends LitElement {
  /** The transcript, as objects of shape { type: 'command' | 'output' | 'comment', text: string, delay?: number }. Commands get the prompt glyph and type character-by-character; output lines appear whole; comments render muted. `delay` is milliseconds before the line starts (default 500 for commands, 150 otherwise). Property only — arrays do not survive an attribute. @default [] */
  lines: Array;
  /** Prompt glyph rendered before each command line. @default '$' */
  prompt: string;
  /** Text centered in the window chrome bar. Empty hides it, leaving only the orbs. @default '' */
  title: string;
  /** Milliseconds per character when typing command lines. @default 50 */
  speed: number;
  /** Start the animation when the element scrolls into view. Defaults to true; disable from JS or a framework wrapper with a false property value, then drive it with play(). @default true */
  autoplay: boolean;
  /** Replay the transcript indefinitely, pausing briefly at the end of each cycle. @default false */
  loop: boolean;
}

/**
 * `<arc-text>`
 */
export declare class ArcText extends LitElement {
  /** Typography variant that controls font size, weight, letter-spacing, line-height, and color. @default 'body' */
  variant: 'display' | 'heading' | 'body' | 'muted' | 'ghost' | 'accent' | 'label' | 'wordmark' | 'code';
  /** The HTML element to render. Allows semantic heading hierarchy to be set independently from the visual variant. @default 'p' */
  as: 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'span';
}

/**
 * `<arc-textarea>`
 * Events: arc-input, arc-change
 */
export declare class ArcTextarea extends LitElement {
  /** The current text content of the textarea. Updated on every keystroke and emitted via `arc-input` and `arc-change` events. @default '' */
  value: string;
  /** Form field name submitted with the value. Required for native form integration via ElementInternals. @default '' */
  name: string;
  /** Hint text displayed inside the field when it is empty. Use it to show example input -- never as a substitute for the label. @default '' */
  placeholder: string;
  /** Visible label rendered above the textarea in uppercase. Automatically linked to the field via `aria-labelledby`, ensuring screen readers announce it correctly. @default '' */
  label: string;
  /** The number of visible text rows that set the initial height of the textarea. Does not limit content length -- the user can scroll or resize beyond this height. @default 4 */
  rows: number;
  /** Maximum number of characters allowed. When set to a value greater than 0, a live counter appears below the field showing current length vs. limit, turning red when the limit is reached. @default 0 */
  maxlength: number;
  /** Prevents user interaction and applies a muted visual treatment at 40% opacity. The field value is excluded from form submission when disabled. @default false */
  disabled: boolean;
  /** Error message string. When non-empty, the textarea border turns red and the message is displayed below the field with `role="alert"` for screen reader announcement. @default '' */
  error: string;
  /** Controls whether and in which direction the user can drag to resize the textarea. Defaults to vertical-only resizing. @default 'vertical' */
  resize: 'none' | 'vertical' | 'horizontal' | 'both';
  /** Allows the user to select and copy text but prevents editing. The field has a subtle background change to indicate its read-only state. @default false */
  readonly: boolean;
  /** Controls the textarea size. Options: 'sm', 'md', 'lg'. @default 'md' */
  size: 'sm' | 'md' | 'lg';
  /** Automatically grows the textarea height to fit its content. Disables manual resize when enabled. @default false */
  autoResize: boolean;
  /** @default true */
  formAssociated: boolean;
  /** Lit merges static properties up the prototype chain, so every consumer gets these without declaring them. `required` participates in constraint validation below; `readonly` reflects for styling and is enforced by each component's interaction handlers (the mixin can't know which gestures mutate state). @default { // flag(), unlike `disabled`. The exclusion in props.js is specifically // about form-associated *platform* semantics: a `disabled` content // attribute that is merely present makes the element actually disabled // per the HTML spec, and formDisabledCallback assigns the property back, // so no converter can win. Neither of these is platform-mapped — // `required` is enforced by _computeValidity() below and `readonly` by // each component's own interaction handlers — so the stock converter buys // nothing here and costs the usual bug: `required="false"` read as true, // blocking submission of a form the author meant to leave optional. // Finding #48's shape, across all 26 form controls at once. required: flag(false), readonly: flag(false), } */
  properties: Record<string, unknown>;
  /** Components that run their own constraint-validation logic (pattern checks, range checks) opt out of the automatic required sync by overriding this to false, and own the whole validity flag set instead. @default true */
  autoValidates: boolean;
  form: unknown;
  validity: unknown;
  validationMessage: unknown;
  /** @default false */
  required: boolean;
}

/**
 * `<arc-theme-toggle>`
 * Events: arc-change
 */
export declare class ArcThemeToggle extends LitElement {
  /** The current theme mode. Synced in both directions: changing it — by click, by key, or by assigning the property — writes the document root's `data-theme` and localStorage, and a change to that attribute from anywhere else is adopted back, so every toggle on the page agrees. @default 'auto' */
  theme: 'dark' | 'light' | 'auto';
  /** Prevents cycling and reduces opacity to 40%. @default false */
  disabled: boolean;
  /** Renders the button as a compact square without the theme name label, matching an icon-only arc-icon-button of the same size. Attribute name is `icon-only`. @default false */
  iconOnly: boolean;
  /** Box size when `icon-only`, on the same scale as arc-icon-button: xs=28px, sm=32px, md=36px, lg=44px. Set both controls to the same value when they sit side by side. Ignored by the labeled form, which is sized by its text. @default 'md' */
  size: 'xs' | 'sm' | 'md' | 'lg';
}

/**
 * `<arc-time-ago>`
 */
export declare class ArcTimeAgo extends LitElement {
  /** ISO 8601 date string or any value parseable by new Date(). @default '' */
  datetime: string;
  /** BCP 47 locale tag for Intl.RelativeTimeFormat output. @default 'en-US' */
  locale: string;
  /** Auto-update the relative time on an adaptive interval. @default true */
  live: boolean;
}

/**
 * `<arc-time-picker>`
 * Events: arc-change
 */
export declare class ArcTimePicker extends LitElement {
  /** The selected time in 24-hour "HH:MM" format (e.g. "14:30"). Set this to pre-select a time. Updated when the user picks a time. @default '' */
  value: string;
  /** @default '' */
  name: string;
  /** Minimum selectable time in "HH:MM" 24-hour format. Times before this are visually dimmed and non-interactive. @default '' */
  min: string;
  /** Maximum selectable time in "HH:MM" 24-hour format. Times after this are visually dimmed and non-interactive. @default '' */
  max: string;
  /** Placeholder text displayed in the input when no time is selected. @default 'Select time' */
  placeholder: string;
  /** Disables the time picker, reducing opacity and preventing the dropdown from opening. @default false */
  disabled: boolean;
  /** Label text rendered above the input in uppercase accent font styling. @default '' */
  label: string;
  /** Minute step increment. Controls the granularity of minute options shown in the dropdown. Unrecognised values fall back to 1. @default 1 */
  step: 1 | 5 | 15 | 30;
  /** Display format: "12h" shows hours 1-12 with an AM/PM column, "24h" shows hours 0-23 without AM/PM. Unrecognised values fall back to "12h". @default '12h' */
  format: '12h' | '24h';
  /** Whether the time dropdown is visible. Reflected so it can be opened programmatically or styled from CSS. Held at `false` while `disabled`. @default false */
  open: boolean;
  /** Control size. `md` is the default; `sm` and `lg` scale the field padding. @default 'md' */
  size: 'sm' | 'md' | 'lg';
  /** @default true */
  formAssociated: boolean;
  /** Lit merges static properties up the prototype chain, so every consumer gets these without declaring them. `required` participates in constraint validation below; `readonly` reflects for styling and is enforced by each component's interaction handlers (the mixin can't know which gestures mutate state). @default { // flag(), unlike `disabled`. The exclusion in props.js is specifically // about form-associated *platform* semantics: a `disabled` content // attribute that is merely present makes the element actually disabled // per the HTML spec, and formDisabledCallback assigns the property back, // so no converter can win. Neither of these is platform-mapped — // `required` is enforced by _computeValidity() below and `readonly` by // each component's own interaction handlers — so the stock converter buys // nothing here and costs the usual bug: `required="false"` read as true, // blocking submission of a form the author meant to leave optional. // Finding #48's shape, across all 26 form controls at once. required: flag(false), readonly: flag(false), } */
  properties: Record<string, unknown>;
  /** Components that run their own constraint-validation logic (pattern checks, range checks) opt out of the automatic required sync by overriding this to false, and own the whole validity flag set instead. @default true */
  autoValidates: boolean;
  form: unknown;
  validity: unknown;
  validationMessage: unknown;
  /** @default false */
  required: boolean;
  /** @default false */
  readonly: boolean;
}

/**
 * `<arc-timeline>`
 */
export declare class ArcTimeline extends LitElement {
  /** ARIA heading level for each event title. Clamped to 1 or greater: `aria-level` below 1 is invalid and is dropped by assistive technology. @default 3 */
  headingLevel: number;
}

/**
 * `<arc-timeline-item>`
 */
export declare class ArcTimelineItem extends LitElement {
  /** Description from slotted text content */
  description: unknown;
  /** Event heading @default '' */
  heading: string;
  /** Date string to display @default '' */
  date: string;
}

/**
 * `<arc-toast>`
 * Events: arc-queue-overflow, arc-queue-change, arc-close
 */
export declare class ArcToast extends LitElement {
  /** Time in milliseconds before a toast auto-dismisses. Applies as the default for every show() call but can be overridden per-toast via the duration option in the show() payload. Set to 0 to disable auto-dismiss entirely, requiring the user to click the close button. @default 4000 */
  duration: number;
  /** Maximum toasts on screen at once (attribute: max-visible). Further show() calls queue FIFO and release as visible toasts dismiss. Set to 0 for no cap. @default 3 */
  maxVisible: number;
  /** Maximum queued (not visible) toasts (attribute: queue-limit). Beyond it the oldest queued entries are dropped and arc-queue-overflow fires with the drop count. @default 20 */
  queueLimit: number;
  /** Anchors the toast stack to a fixed edge of the viewport. Top-right is the most conventional position for web applications. Bottom positions work well for media players or editors where the top area is occupied by toolbars. @default 'top-right' */
  position: 'top-right' | 'top-left' | 'top-center' | 'bottom-right' | 'bottom-left' | 'bottom-center';
  /** When true, a show() whose message and variant match a visible or queued toast is coalesced: the existing toast gains a "(×N)" counter and a fresh timer instead of a second toast appearing. Set the property to false from JS to disable. @default true */
  dedupe: boolean;
}

/**
 * `<arc-toggle>`
 * Events: arc-change
 */
export declare class ArcToggle extends LitElement {
  /** Prevents user interaction. The toggle appears at reduced opacity and ignores pointer and keyboard events. @default false */
  disabled: boolean;
  /** Visible text rendered beside the toggle. Clicking the label also toggles the switch, matching native `<label>` behavior. @default '' */
  label: string;
  /** Form field name submitted with the toggle value. When set, the component participates in native `<form>` submission. @default '' */
  name: string;
  /** Whether the toggle is in the on position. When set, the thumb slides to the active side and the track displays the accent glow. @default false */
  checked: boolean;
  /** Controls the toggle size. @default 'md' */
  size: 'sm' | 'md' | 'lg';
  /** @default true */
  formAssociated: boolean;
  /** Lit merges static properties up the prototype chain, so every consumer gets these without declaring them. `required` participates in constraint validation below; `readonly` reflects for styling and is enforced by each component's interaction handlers (the mixin can't know which gestures mutate state). @default { // flag(), unlike `disabled`. The exclusion in props.js is specifically // about form-associated *platform* semantics: a `disabled` content // attribute that is merely present makes the element actually disabled // per the HTML spec, and formDisabledCallback assigns the property back, // so no converter can win. Neither of these is platform-mapped — // `required` is enforced by _computeValidity() below and `readonly` by // each component's own interaction handlers — so the stock converter buys // nothing here and costs the usual bug: `required="false"` read as true, // blocking submission of a form the author meant to leave optional. // Finding #48's shape, across all 26 form controls at once. required: flag(false), readonly: flag(false), } */
  properties: Record<string, unknown>;
  /** Components that run their own constraint-validation logic (pattern checks, range checks) opt out of the automatic required sync by overriding this to false, and own the whole validity flag set instead. @default true */
  autoValidates: boolean;
  form: unknown;
  validity: unknown;
  validationMessage: unknown;
  /** @default false */
  required: boolean;
  /** @default false */
  readonly: boolean;
}

/**
 * `<arc-toolbar>`
 * Events: arc-overflow-change
 */
export declare class ArcToolbar extends LitElement {
  /** When set, the toolbar uses position: sticky with top: 0 and z-index: 50, keeping it visible as the user scrolls through content below. @default false */
  sticky: boolean;
  /** Controls the toolbar height. The default md size is 48px for primary toolbars. The sm size is 36px for secondary or nested toolbars. @default 'md' */
  size: 'md' | 'sm';
  /** Renders a subtle bottom border (--border-subtle) to visually separate the toolbar from the content below. Enabled by default. @default true */
  border: boolean;
  /** Enables responsive overflow collapse. A ResizeObserver measures available width; slotted items that do not fit are collapsed (hidden via the reversible hidden attribute) from the end of the item list, and a "More" trigger opens a menu of proxy items that re-dispatch clicks to the hidden originals. Note: because slotted nodes cannot be moved into the overflow panel, complex custom content is represented in the menu only by its text label (or the label attribute on arc-button / arc-icon-button). @default false */
  overflow: boolean;
}

/**
 * `<arc-tooltip>`
 */
export declare class ArcTooltip extends LitElement {
  /** The plain-text string displayed inside the tooltip popup. Keep this concise — one short phrase that describes the trigger element or provides a supplementary hint. HTML is not supported; for rich content, use the Popover component instead. @default '' */
  content: string;
  /** Time in milliseconds to wait after mouseenter or focusin before the tooltip becomes visible. The default of 200 ms prevents accidental activation during casual pointer movement. Increase to 400-600 ms in dense toolbars; avoid setting to 0 as it creates a jittery experience. @default 200 */
  delay: number;
  /** Controls which side of the trigger the tooltip appears on. Top is the most common default. Switch to bottom, left, or right when the trigger sits near a viewport edge or when the surrounding layout makes another direction more natural. @default 'top' */
  position: 'top' | 'bottom' | 'left' | 'right';
}

/**
 * `<arc-top-bar>`
 * Events: eventName, arc-sidebar-toggle, arc-mobile-menu-toggle
 */
export declare class ArcTopBar extends LitElement {
  /** Brand text displayed in the top-left corner next to the optional logo slot. Rendered uppercase with wide letter-spacing at the wordmark size. Keep this to one or two words that identify the application. @default '' */
  heading: string;
  /** Destination of the brand link. Defaults to `/`; set it when the app is mounted under a sub-path, or to an empty string to render the brand as plain text with no link at all. @default '/' */
  homeHref: string;
  /** Sets a max-width containment on the top bar content area. Accepts any CSS length or named size. @default null */
  contained: string;
  /** Controls the mobile menu behavior. When set to a value like "nav", the hamburger toggles an inline navigation panel instead of triggering sidebar toggle. @default 'sidebar' */
  mobileMenu: string;
  /** Position of the mobile menu panel when mobile-menu is active. @default 'left' */
  menuPosition: string;
  /** Reflects whether the page has scrolled past the bar's threshold. Set by the component, not by you — read it to style a scrolled state from outside, via `arc-top-bar[scrolled]`. @default false */
  scrolled: boolean;
  /** Renders the bar with no background, blur or border until the page is scrolled, so a hero shows through it. Requires `fixed`. Suits marketing pages whose first screen is one composed image; leave it off in an application layout, where the bar should be a fixed edge among the other panels rather than something that appears and disappears. @default false */
  immersive: boolean;
  /** When true, the bar uses position: fixed so it stays at the top of the viewport while content scrolls underneath. Automatically applied when TopBar is placed inside an AppShell. Be sure to add matching top padding to the content below to prevent overlap. @default false */
  fixed: boolean;
  /** Reflects whether the mobile hamburger menu is open. Toggling this value updates the aria-expanded attribute on the menu button. Typically managed by AppShell in response to the arc-sidebar-toggle event rather than set directly. @default false */
  menuOpen: boolean;
  /** Controls the alignment of content in the center slot. Pulls nav toward the brand or actions without reordering DOM. @default 'center' */
  navAlign: 'left' | 'center' | 'right';
}

/**
 * `<arc-transfer-list>`
 * Events: arc-change
 */
export declare class ArcTransferList extends LitElement {
  /** The full universe of items. Items whose value is in `value` render in the Selected pane; the rest render in Available. @default [] */
  options: Array<{value:string,label:string,disabled?:boolean}>;
  /** Values currently in the Selected pane, kept in options order. Updated after every move and emitted via `arc-change`. @default [] */
  value: string[];
  /** Form field name. When set, the component submits one form entry per selected value. @default '' */
  name: string;
  /** Disables the whole control, preventing interaction and reducing opacity. @default false */
  disabled: boolean;
  /** Heading for the left (available) pane. Attribute: `source-label`. @default 'Available' */
  sourceLabel: string;
  /** Heading for the right (selected) pane. Attribute: `target-label`. @default 'Selected' */
  targetLabel: string;
  /** Adds a filter input to each pane that narrows that pane only, case-insensitively. Move-all respects the filter. @default false */
  searchable: boolean;
  /** Prevents moving items between panes while the lists stay focusable and filterable; the selected values still submit with the form. @default false */
  readonly: boolean;
  /** Control size. `md` is the default; `sm` and `lg` scale the row height and list panels. @default 'md' */
  size: 'sm' | 'md' | 'lg';
  /** @default true */
  formAssociated: boolean;
  /** Lit merges static properties up the prototype chain, so every consumer gets these without declaring them. `required` participates in constraint validation below; `readonly` reflects for styling and is enforced by each component's interaction handlers (the mixin can't know which gestures mutate state). @default { // flag(), unlike `disabled`. The exclusion in props.js is specifically // about form-associated *platform* semantics: a `disabled` content // attribute that is merely present makes the element actually disabled // per the HTML spec, and formDisabledCallback assigns the property back, // so no converter can win. Neither of these is platform-mapped — // `required` is enforced by _computeValidity() below and `readonly` by // each component's own interaction handlers — so the stock converter buys // nothing here and costs the usual bug: `required="false"` read as true, // blocking submission of a form the author meant to leave optional. // Finding #48's shape, across all 26 form controls at once. required: flag(false), readonly: flag(false), } */
  properties: Record<string, unknown>;
  /** Components that run their own constraint-validation logic (pattern checks, range checks) opt out of the automatic required sync by overriding this to false, and own the whole validity flag set instead. @default true */
  autoValidates: boolean;
  form: unknown;
  validity: unknown;
  validationMessage: unknown;
  /** @default false */
  required: boolean;
}

/**
 * `<arc-tree-item>`
 */
export declare class ArcTreeItem extends LitElement {
  /** Nested arc-tree-item children */
  items: unknown;
  hasChildren: unknown;
  /** Item label text @default '' */
  label: string;
  /** Icon or emoji @default '' */
  icon: string;
  /** Expand child items @default false */
  expanded: boolean;
}

/**
 * `<arc-tree-select>`
 * Events: arc-change
 */
export declare class ArcTreeSelect extends LitElement {
  /** Recursive tree of nodes. A node with a non-empty `children` array is a group header: it expands and collapses but can never be selected. A node without children is a selectable leaf. `disabled` nodes render but cannot be reached by keyboard or selected, and a disabled group hides its children. @default [] */
  items: Array<{value: string, label: string, children?: Array<object>, disabled?: boolean}>;
  /** The selected leaf's value. Setting it programmatically updates the trigger's breadcrumb label, and the branches containing it auto-expand the next time the panel opens. @default '' */
  value: string;
  /** Values of group nodes to render initially expanded. Attribute: `expanded-values` (JSON array). Branches containing the selected value auto-expand on open regardless of this list. @default [] */
  expandedValues: string[];
  /** Hint text displayed inside the trigger when no leaf is selected. It disappears once a value is chosen. @default 'Select...' */
  placeholder: string;
  /** Visible label rendered above the trigger. Also serves as the accessible name. Always provide one for accessibility compliance. @default '' */
  label: string;
  /** Form field name submitted with the selected leaf value via ElementInternals. @default '' */
  name: string;
  /** When true, the trigger becomes non-interactive: it cannot be opened, focused, or clicked, and renders with reduced opacity. @default false */
  disabled: boolean;
  /** Error message displayed below the trigger. When set, the trigger border turns red. @default '' */
  error: string;
  /** Controls the trigger size. @default 'md' */
  size: 'sm' | 'md' | 'lg';
  /** Controls whether the tree panel is visible. Automatically set to false when a leaf is selected, Escape is pressed, or the user clicks outside. Held at `false` while `disabled`. @default false */
  open: boolean;
  /** @default true */
  formAssociated: boolean;
  /** Lit merges static properties up the prototype chain, so every consumer gets these without declaring them. `required` participates in constraint validation below; `readonly` reflects for styling and is enforced by each component's interaction handlers (the mixin can't know which gestures mutate state). @default { // flag(), unlike `disabled`. The exclusion in props.js is specifically // about form-associated *platform* semantics: a `disabled` content // attribute that is merely present makes the element actually disabled // per the HTML spec, and formDisabledCallback assigns the property back, // so no converter can win. Neither of these is platform-mapped — // `required` is enforced by _computeValidity() below and `readonly` by // each component's own interaction handlers — so the stock converter buys // nothing here and costs the usual bug: `required="false"` read as true, // blocking submission of a form the author meant to leave optional. // Finding #48's shape, across all 26 form controls at once. required: flag(false), readonly: flag(false), } */
  properties: Record<string, unknown>;
  /** Components that run their own constraint-validation logic (pattern checks, range checks) opt out of the automatic required sync by overriding this to false, and own the whole validity flag set instead. @default true */
  autoValidates: boolean;
  form: unknown;
  validity: unknown;
  validationMessage: unknown;
  /** @default false */
  required: boolean;
  /** @default false */
  readonly: boolean;
}

/**
 * `<arc-tree-view>`
 * Events: arc-toggle, arc-select
 */
export declare class ArcTreeView extends LitElement {
}

/**
 * `<arc-truncate>`
 * Events: arc-toggle
 */
export declare class ArcTruncate extends LitElement {
  /** Maximum number of visible lines before clamping @default 3 */
  lines: number;
  /** Whether the text is fully expanded @default false */
  expanded: boolean;
}

/**
 * `<arc-typewriter>`
 * Events: arc-complete
 */
export declare class ArcTypewriter extends LitElement {
  /** The text to type out character by character @default '' */
  text: string;
  /** Milliseconds per character @default 50 */
  speed: number;
  /** Initial delay in milliseconds before typing starts @default 0 */
  delay: number;
  /** Milliseconds to pause at the end before looping @default 2000 */
  pauseEnd: number;
  /** Show a blinking cursor during and after typing @default true */
  cursor: boolean;
  /** Loop the animation indefinitely @default false */
  loop: boolean;
  /** @default false */
  nowrap: boolean;
}

/**
 * `<arc-uptime>`
 */
export declare class ArcUptime extends LitElement {
  /** Uptime fraction at or above `up` reads as up; at or above `degraded`, degraded; below, down. @default { up: 0.99, degraded: 0.95 } */
  thresholds: Record<string, unknown>;
  /** One entry per period, oldest first. A number is an uptime fraction from 0 to 1, mapped to a status by threshold (0.99 and up is "up", 0.95 and up is "degraded", below is "down"). An object may carry an explicit `status` (which wins over any threshold), a `value` used for the summary math, and a `label` shown in the hover detail. An entry with neither a finite value nor a status renders as the neutral "none" track. Property only — set it from script or a framework binding. @default [] */
  data: Array<number | {value?: number, status?: 'up' | 'degraded' | 'down' | 'none', label?: string}>;
  /** Caption under the oldest end of the track (e.g. "90 days ago"). @default '' */
  startLabel: string;
  /** Caption under the newest end of the track (e.g. "Today"). @default '' */
  endLabel: string;
  /** Whether to render the overall percentage above the track (default true; set the attribute to the string "false" to disable from markup). The percentage is the mean of every finite value in the data; when no entry carries a value the line is omitted regardless. @default true */
  summary: boolean;
}

/**
 * `<arc-value-card>`
 */
export declare class ArcValueCard extends LitElement {
  /** Icon text displayed beside content @default '' */
  icon: string;
  /** Card title @default '' */
  heading: string;
  /** Card body text @default '' */
  description: string;
}

/**
 * `<arc-video>`
 * Events: arc-play, arc-pause, arc-ended
 */
export declare class ArcVideo extends LitElement {
  /** Video source URL. A single source only; no multi-format machinery. @default '' */
  src: string;
  /** Poster image URL shown before the first play. @default '' */
  poster: string;
  /** Accessible name for the player region. Falls back to a generic label when empty. @default '' */
  label: string;
  /** Shows the custom control bar once playback has started, and enables the player keyboard shortcuts. Defaults to true; set `controls="false"` for ambient or presentation video. @default true */
  controls: boolean;
  /** Starts playback as soon as the browser allows. Browsers only honor autoplay when the video is muted, so pair it with `muted`; when autoplay is blocked, the play overlay simply remains and the user starts playback themselves. @default false */
  autoplay: boolean;
  /** Restarts playback from the beginning when the video ends. @default false */
  loop: boolean;
  /** Mutes the audio track. Toggled live by the mute button and the M key. @default false */
  muted: boolean;
  /** Passed through to the native video element. The default `metadata` loads dimensions and duration without buffering content. @default 'metadata' */
  preload: 'none' | 'metadata' | 'auto';
}

/**
 * `<arc-virtual-list>`
 * Events: arc-range-change
 */
export declare class ArcVirtualList extends LitElement {
  /** The range of currently rendered indices. `end` is exclusive. */
  visibleRange: unknown;
  /** The full data array. Only the visible slice is rendered at any given time. @default [] */
  items: Array;
  /** `(item, index) => unknown` returning one row's content. Anything Lit can render: a template, a DOM node, a string. When set, rows come from here and the slots are not used. @default null */
  renderItem: Function;
  /** Height in pixels of each row. Must match what actually renders. @default 40 */
  itemHeight: number;
  /** Rows rendered above and below the visible window to cover fast scrolling. @default 5 */
  overscan: number;
}

/**
 * `<arc-waveform>`
 * Events: arc-input, arc-change
 */
export declare class ArcWaveform extends LitElement {
  /** Peak amplitudes as a number array, each value 0 to 1. Property only (no attribute) — set it from script or a framework binding. Values outside the range are clamped. An empty or missing array renders an empty track. @default [] */
  peaks: Array;
  /** Total duration in seconds. Optional; when set, time readouts render below the waveform and the slider announces times instead of percentages. @default null */
  duration: number;
  /** Accessible name for the waveform. Announced as the slider label when interactive, or as the image description otherwise. @default '' */
  label: string;
  /** Current playhead position as a fraction of the total, 0 to 1. Not seconds: multiply by `duration` yourself if you track seconds. Updated by the component during scrubbing and reflected as an attribute. @default 0 */
  position: number;
  /** Enables scrubbing. The waveform becomes a focusable slider: click or drag to seek, arrow keys to nudge, Home/End to jump. Without it the waveform is a static image. @default false */
  interactive: boolean;
  /** Rendering style. `bars` draws discrete bar pairs mirrored around the center line; `mirror` draws a filled min/max envelope. @default 'bars' */
  variant: 'bars' | 'mirror';
}

declare global {
  interface HTMLElementTagNameMap {
    'arc-accordion': ArcAccordion;
    'arc-accordion-item': ArcAccordionItem;
    'arc-activity-heatmap': ArcActivityHeatmap;
    'arc-alert': ArcAlert;
    'arc-anchor-nav': ArcAnchorNav;
    'arc-animated-number': ArcAnimatedNumber;
    'arc-announcement': ArcAnnouncement;
    'arc-app-shell': ArcAppShell;
    'arc-aspect-grid': ArcAspectGrid;
    'arc-aspect-ratio': ArcAspectRatio;
    'arc-auth-shell': ArcAuthShell;
    'arc-avatar': ArcAvatar;
    'arc-avatar-group': ArcAvatarGroup;
    'arc-badge': ArcBadge;
    'arc-banner': ArcBanner;
    'arc-blockquote': ArcBlockquote;
    'arc-bottom-nav': ArcBottomNav;
    'arc-breadcrumb': ArcBreadcrumb;
    'arc-breadcrumb-item': ArcBreadcrumbItem;
    'arc-breadcrumb-menu': ArcBreadcrumbMenu;
    'arc-button': ArcButton;
    'arc-button-group': ArcButtonGroup;
    'arc-calendar': ArcCalendar;
    'arc-callout': ArcCallout;
    'arc-card': ArcCard;
    'arc-carousel': ArcCarousel;
    'arc-center': ArcCenter;
    'arc-chart': ArcChart;
    'arc-checkbox': ArcCheckbox;
    'arc-chip': ArcChip;
    'arc-clock': ArcClock;
    'arc-cluster': ArcCluster;
    'arc-code-block': ArcCodeBlock;
    'arc-collapsible': ArcCollapsible;
    'arc-color-picker': ArcColorPicker;
    'arc-color-swatch': ArcColorSwatch;
    'arc-column': ArcColumn;
    'arc-combobox': ArcCombobox;
    'arc-command-bar': ArcCommandBar;
    'arc-command-group': ArcCommandGroup;
    'arc-command-item': ArcCommandItem;
    'arc-command-palette': ArcCommandPalette;
    'arc-comparison': ArcComparison;
    'arc-comparison-column': ArcComparisonColumn;
    'arc-confirm': ArcConfirm;
    'arc-connection-status': ArcConnectionStatus;
    'arc-container': ArcContainer;
    'arc-context-menu': ArcContextMenu;
    'arc-conversation': ArcConversation;
    'arc-copy-button': ArcCopyButton;
    'arc-countdown-timer': ArcCountdownTimer;
    'arc-cta-banner': ArcCtaBanner;
    'arc-dashboard-grid': ArcDashboardGrid;
    'arc-data-grid': ArcDataGrid;
    'arc-data-table': ArcDataTable;
    'arc-date-picker': ArcDatePicker;
    'arc-date-range-picker': ArcDateRangePicker;
    'arc-description-item': ArcDescriptionItem;
    'arc-description-list': ArcDescriptionList;
    'arc-dialog': ArcDialog;
    'arc-diff': ArcDiff;
    'arc-divider': ArcDivider;
    'arc-dock': ArcDock;
    'arc-drawer': ArcDrawer;
    'arc-dropdown-menu': ArcDropdownMenu;
    'arc-empty-state': ArcEmptyState;
    'arc-event-calendar': ArcEventCalendar;
    'arc-feature-card': ArcFeatureCard;
    'arc-fieldset': ArcFieldset;
    'arc-file-upload': ArcFileUpload;
    'arc-float-bar': ArcFloatBar;
    'arc-footer': ArcFooter;
    'arc-form': ArcForm;
    'arc-gauge': ArcGauge;
    'arc-gradient-text': ArcGradientText;
    'arc-guided-tour': ArcGuidedTour;
    'arc-highlight': ArcHighlight;
    'arc-hotkey': ArcHotkey;
    'arc-hotspot': ArcHotspot;
    'arc-hover-card': ArcHoverCard;
    'arc-icon': ArcIcon;
    'arc-icon-button': ArcIconButton;
    'arc-icon-library': ArcIconLibrary;
    'arc-image': ArcImage;
    'arc-image-compare': ArcImageCompare;
    'arc-image-cropper': ArcImageCropper;
    'arc-image-hotspots': ArcImageHotspots;
    'arc-infinite-scroll': ArcInfiniteScroll;
    'arc-inline-edit': ArcInlineEdit;
    'arc-inline-message': ArcInlineMessage;
    'arc-input': ArcInput;
    'arc-input-group': ArcInputGroup;
    'arc-inset': ArcInset;
    'arc-json-tree': ArcJsonTree;
    'arc-kanban': ArcKanban;
    'arc-kbd': ArcKbd;
    'arc-key-value': ArcKeyValue;
    'arc-keyboard-map': ArcKeyboardMap;
    'arc-knob': ArcKnob;
    'arc-kv-pair': ArcKvPair;
    'arc-label': ArcLabel;
    'arc-level-meter': ArcLevelMeter;
    'arc-lightbox': ArcLightbox;
    'arc-link': ArcLink;
    'arc-list': ArcList;
    'arc-list-item': ArcListItem;
    'arc-loading-overlay': ArcLoadingOverlay;
    'arc-markdown': ArcMarkdown;
    'arc-marquee': ArcMarquee;
    'arc-masked-input': ArcMaskedInput;
    'arc-masonry': ArcMasonry;
    'arc-menu-divider': ArcMenuDivider;
    'arc-menu-item': ArcMenuItem;
    'arc-menubar': ArcMenubar;
    'arc-message': ArcMessage;
    'arc-meter': ArcMeter;
    'arc-modal': ArcModal;
    'arc-multi-select': ArcMultiSelect;
    'arc-nav-item': ArcNavItem;
    'arc-navigation-menu': ArcNavigationMenu;
    'arc-notification-panel': ArcNotificationPanel;
    'arc-number-format': ArcNumberFormat;
    'arc-number-input': ArcNumberInput;
    'arc-option': ArcOption;
    'arc-otp-input': ArcOtpInput;
    'arc-page-header': ArcPageHeader;
    'arc-page-indicator': ArcPageIndicator;
    'arc-page-layout': ArcPageLayout;
    'arc-pagination': ArcPagination;
    'arc-password-input': ArcPasswordInput;
    'arc-pin-input': ArcPinInput;
    'arc-popover': ArcPopover;
    'arc-progress': ArcProgress;
    'arc-progress-toast': ArcProgressToast;
    'arc-prose': ArcProse;
    'arc-qr-code': ArcQrCode;
    'arc-radio': ArcRadio;
    'arc-radio-group': ArcRadioGroup;
    'arc-rail': ArcRail;
    'arc-range-slider': ArcRangeSlider;
    'arc-rating': ArcRating;
    'arc-resizable': ArcResizable;
    'arc-responsive-switcher': ArcResponsiveSwitcher;
    'arc-scroll-area': ArcScrollArea;
    'arc-scroll-indicator': ArcScrollIndicator;
    'arc-scroll-spy': ArcScrollSpy;
    'arc-scroll-to-top': ArcScrollToTop;
    'arc-search': ArcSearch;
    'arc-section': ArcSection;
    'arc-segmented-control': ArcSegmentedControl;
    'arc-select': ArcSelect;
    'arc-separator': ArcSeparator;
    'arc-settings-layout': ArcSettingsLayout;
    'arc-sheet': ArcSheet;
    'arc-sidebar': ArcSidebar;
    'arc-sidebar-link': ArcSidebarLink;
    'arc-sidebar-section': ArcSidebarSection;
    'arc-signature-pad': ArcSignaturePad;
    'arc-skeleton': ArcSkeleton;
    'arc-skip-link': ArcSkipLink;
    'arc-slider': ArcSlider;
    'arc-snackbar': ArcSnackbar;
    'arc-sortable-list': ArcSortableList;
    'arc-sparkline': ArcSparkline;
    'arc-speed-dial': ArcSpeedDial;
    'arc-spinner': ArcSpinner;
    'arc-split-pane': ArcSplitPane;
    'arc-spotlight': ArcSpotlight;
    'arc-spy-link': ArcSpyLink;
    'arc-stack': ArcStack;
    'arc-stat': ArcStat;
    'arc-status-bar': ArcStatusBar;
    'arc-step': ArcStep;
    'arc-stepper': ArcStepper;
    'arc-stepper-nav': ArcStepperNav;
    'arc-sticky': ArcSticky;
    'arc-suggestion': ArcSuggestion;
    'arc-switch-group': ArcSwitchGroup;
    'arc-tab': ArcTab;
    'arc-table': ArcTable;
    'arc-tabs': ArcTabs;
    'arc-tag': ArcTag;
    'arc-tag-input': ArcTagInput;
    'arc-terminal': ArcTerminal;
    'arc-text': ArcText;
    'arc-textarea': ArcTextarea;
    'arc-theme-toggle': ArcThemeToggle;
    'arc-time-ago': ArcTimeAgo;
    'arc-time-picker': ArcTimePicker;
    'arc-timeline': ArcTimeline;
    'arc-timeline-item': ArcTimelineItem;
    'arc-toast': ArcToast;
    'arc-toggle': ArcToggle;
    'arc-toolbar': ArcToolbar;
    'arc-tooltip': ArcTooltip;
    'arc-top-bar': ArcTopBar;
    'arc-transfer-list': ArcTransferList;
    'arc-tree-item': ArcTreeItem;
    'arc-tree-select': ArcTreeSelect;
    'arc-tree-view': ArcTreeView;
    'arc-truncate': ArcTruncate;
    'arc-typewriter': ArcTypewriter;
    'arc-uptime': ArcUptime;
    'arc-value-card': ArcValueCard;
    'arc-video': ArcVideo;
    'arc-virtual-list': ArcVirtualList;
    'arc-waveform': ArcWaveform;
  }
  interface GlobalEventHandlersEventMap {
    'arc-action': CustomEvent;
    'arc-cancel': CustomEvent;
    'arc-card-click': CustomEvent;
    'arc-card-move': CustomEvent;
    'arc-cell-change': CustomEvent;
    'arc-change': CustomEvent;
    'arc-clear': CustomEvent<void>;
    'arc-close': CustomEvent;
    'arc-complete': CustomEvent;
    'arc-confirm': CustomEvent<void>;
    'arc-copy': CustomEvent<{ value: string }>;
    'arc-crop-change': CustomEvent;
    'arc-date-click': CustomEvent;
    'arc-ended': CustomEvent<{ value: number }>;
    'arc-error': CustomEvent<void>;
    'arc-event-click': CustomEvent;
    'arc-expired': CustomEvent<void>;
    'arc-hotkey-trigger': CustomEvent<{ keys: string }>;
    'arc-input': CustomEvent;
    'arc-invalid': CustomEvent;
    'arc-load': CustomEvent<void>;
    'arc-load-more': CustomEvent<void>;
    'arc-mark-click': CustomEvent;
    'arc-mobile-menu-toggle': CustomEvent;
    'arc-month-change': CustomEvent<{ month: number, year: number }>;
    'arc-navigate': CustomEvent;
    'arc-offline': CustomEvent<void>;
    'arc-online': CustomEvent<void>;
    'arc-open': CustomEvent;
    'arc-overflow-change': CustomEvent;
    'arc-pause': CustomEvent<{ value: number }>;
    'arc-period-change': CustomEvent<{ view: 'month' | 'week', date: string }>;
    'arc-play': CustomEvent<{ value: number }>;
    'arc-queue-change': CustomEvent;
    'arc-queue-overflow': CustomEvent;
    'arc-range-change': CustomEvent<{value: {start: number, end: number}, start: number, end: number}>;
    'arc-remove': CustomEvent;
    'arc-reset': CustomEvent<void>;
    'arc-resize': CustomEvent<{ ratio: number }> | CustomEvent<{ size: number }>;
    'arc-scroll-away': CustomEvent<{value: number}>;
    'arc-scroll-return': CustomEvent<{value: number}>;
    'arc-select': CustomEvent;
    'arc-sidebar-toggle': CustomEvent;
    'arc-sort': CustomEvent;
    'arc-strength-change': CustomEvent;
    'arc-stuck': CustomEvent;
    'arc-submit': CustomEvent;
    'arc-toggle': CustomEvent;
  }
}
