// Generated from custom-elements.json by scripts/generate-types.js — do not edit
import { LitElement } from 'lit';

/**
 * `<arc-accordion>`
 */
export declare class ArcAccordion extends LitElement {
  /** @default false */
  multiple: boolean;
}

/**
 * `<arc-accordion-item>`
 */
export declare class ArcAccordionItem extends LitElement {
  answer: unknown;
  /** @default '' */
  question: string;
}

/**
 * `<arc-alert>`
 * Events: arc-dismiss
 */
export declare class ArcAlert extends LitElement {
  /** @default 'info' */
  variant: string;
  /** @default false */
  compact: boolean;
  /** @default false */
  dismissible: boolean;
  /** @default '' */
  heading: string;
}

/**
 * `<arc-anchor-nav>`
 * Events: arc-change
 */
export declare class ArcAnchorNav extends LitElement {
  /** @default 'horizontal' */
  orientation: string;
  /** @default '' */
  value: string;
  /** @default [] */
  items: unknown[];
}

/**
 * `<arc-animated-number>`
 */
export declare class ArcAnimatedNumber extends LitElement {
  /** @default 0 */
  value: number;
  /** @default 1000 */
  duration: number;
  /** @default 'number' */
  format: string;
  /** @default '' */
  prefix: string;
  /** @default '' */
  suffix: string;
  /** @default 0 */
  decimals: number;
  /** @default 'en-US' */
  locale: string;
}

/**
 * `<arc-announcement>`
 */
export declare class ArcAnnouncement extends LitElement {
  /** @default 'polite' */
  politeness: string;
  /** @default '' */
  message: string;
}

/**
 * `<arc-app-shell>`
 */
export declare class ArcAppShell extends LitElement {
  /** @default false */
  sidebarOpen: boolean;
  /** @default 900 */
  breakpoint: number;
}

/**
 * `<arc-aspect-grid>`
 */
export declare class ArcAspectGrid extends LitElement {
  /** @default 3 */
  columns: number;
  /** @default '1/1' */
  ratio: string;
  /** @default 'md' */
  gap: string;
}

/**
 * `<arc-aspect-ratio>`
 */
export declare class ArcAspectRatio extends LitElement {
  /** @default '16/9' */
  ratio: string;
}

/**
 * `<arc-auth-shell>`
 */
export declare class ArcAuthShell extends LitElement {
  /** @default 'centered' */
  variant: string;
}

/**
 * `<arc-avatar>`
 */
export declare class ArcAvatar extends LitElement {
  /** @default '' */
  src: string;
  /** @default '' */
  name: string;
  /** @default 'md' */
  size: string;
  /** @default 'circle' */
  shape: string;
  /** @default '' */
  status: string;
}

/**
 * `<arc-avatar-group>`
 */
export declare class ArcAvatarGroup extends LitElement {
  /** @default Infinity */
  max: number;
  /** @default 'md' */
  overlap: string;
}

/**
 * `<arc-badge>`
 */
export declare class ArcBadge extends LitElement {
  /** @default 'default' */
  variant: string;
  /** @default 'md' */
  size: string;
  /** @default '' */
  color: string;
}

/**
 * `<arc-banner>`
 * Events: arc-dismiss
 */
export declare class ArcBanner extends LitElement {
  /** @default 'info' */
  variant: string;
  /** @default false */
  dismissible: boolean;
  /** @default false */
  sticky: boolean;
}

/**
 * `<arc-blockquote>`
 */
export declare class ArcBlockquote extends LitElement {
  /** @default '' */
  cite: string;
  /** @default 'default' */
  variant: string;
}

/**
 * `<arc-bottom-nav>`
 * Events: arc-change
 */
export declare class ArcBottomNav extends LitElement {
  /** @default [] */
  items: unknown[];
  /** @default '' */
  value: string;
}

/**
 * `<arc-breadcrumb>`
 * Events: arc-navigate
 */
export declare class ArcBreadcrumb extends LitElement {
  /** @default '/' */
  separator: string;
  /** @default 'Breadcrumb' */
  label: string;
}

/**
 * `<arc-breadcrumb-item>`
 */
export declare class ArcBreadcrumbItem extends LitElement {
  label: unknown;
  /** @default '' */
  href: string;
}

/**
 * `<arc-breadcrumb-menu>`
 * Events: arc-navigate
 */
export declare class ArcBreadcrumbMenu extends LitElement {
  /** @default 'Breadcrumb' */
  label: string;
  /** @default [] */
  items: unknown[];
}

/**
 * `<arc-button>`
 */
export declare class ArcButton extends LitElement {
  /** @default 'primary' */
  variant: string;
  /** @default 'md' */
  size: string;
  /** @default '' */
  href: string;
  /** @default false */
  disabled: boolean;
  /** @default false */
  loading: boolean;
  /** @default 'button' */
  type: string;
}

/**
 * `<arc-button-group>`
 */
export declare class ArcButtonGroup extends LitElement {
  /** @default 'horizontal' */
  orientation: string;
  /** @default 'md' */
  size: string;
  /** @default '' */
  variant: string;
}

/**
 * `<arc-calendar>`
 * Events: arc-navigate, arc-change
 */
export declare class ArcCalendar extends LitElement {
  /** @default '' */
  value: string;
  /** @default '' */
  min: string;
  /** @default '' */
  max: string;
  month: number;
  year: number;
}

/**
 * `<arc-callout>`
 * Events: arc-dismiss
 */
export declare class ArcCallout extends LitElement {
  /** @default 'info' */
  variant: string;
  /** @default false */
  dismissible: boolean;
}

/**
 * `<arc-card>`
 */
export declare class ArcCard extends LitElement {
  /** @default '' */
  href: string;
  /** @default 'md' */
  padding: string;
  /** @default false */
  interactive: boolean;
}

/**
 * `<arc-carousel>`
 * Events: arc-change
 */
export declare class ArcCarousel extends LitElement {
  /** @default false */
  autoPlay: boolean;
  /** @default 5000 */
  interval: number;
  /** @default true */
  loop: boolean;
  /** @default true */
  showDots: boolean;
  /** @default true */
  showArrows: boolean;
}

/**
 * `<arc-center>`
 */
export declare class ArcCenter extends LitElement {
  /** @default '60ch' */
  maxWidth: string;
  /** @default false */
  intrinsic: boolean;
  /** @default false */
  text: boolean;
}

/**
 * `<arc-chart>`
 * Events: arc-mark-click
 */
export declare class ArcChart extends LitElement {
  /** @default 'line' */
  type: string;
  /** @default [] */
  series: unknown[];
  /** @default [] */
  labels: unknown[];
  /** @default false */
  stacked: boolean;
  /** @default false */
  hideLegend: boolean;
  /** @default false */
  hideAxis: boolean;
  /** @default 260 */
  height: number;
  /** @default 'number' */
  valueFormat: string;
  /** @default 'USD' */
  currency: string;
}

/**
 * `<arc-checkbox>`
 * Events: arc-change
 */
export declare class ArcCheckbox extends LitElement {
  /** @default false */
  checked: boolean;
  /** @default false */
  indeterminate: boolean;
  /** @default false */
  disabled: boolean;
  /** @default 'md' */
  size: string;
  /** @default '' */
  label: string;
  /** @default '' */
  name: string;
  /** @default '' */
  value: string;
  /** @default true */
  formAssociated: boolean;
  form: unknown;
  validity: unknown;
  validationMessage: unknown;
}

/**
 * `<arc-chip>`
 * Events: arc-change
 */
export declare class ArcChip extends LitElement {
  /** @default false */
  selected: boolean;
  /** @default false */
  disabled: boolean;
  /** @default '' */
  value: string;
}

/**
 * `<arc-cluster>`
 */
export declare class ArcCluster extends LitElement {
  /** @default 'sm' */
  gap: string;
  /** @default 'center' */
  align: string;
  /** @default 'start' */
  justify: string;
}

/**
 * `<arc-code-block>`
 */
export declare class ArcCodeBlock extends LitElement {
  /** @default '' */
  language: string;
  /** @default '' */
  filename: string;
  /** @default '' */
  code: string;
  /** @default 'default' */
  variant: string;
}

/**
 * `<arc-collapsible>`
 * Events: arc-toggle
 */
export declare class ArcCollapsible extends LitElement {
  /** @default false */
  open: boolean;
  /** @default '' */
  heading: string;
}

/**
 * `<arc-color-picker>`
 * Events: arc-change
 */
export declare class ArcColorPicker extends LitElement {
  /** @default '#4d7ef7' */
  value: string;
  /** @default '' */
  name: string;
  /** @default [] */
  presets: unknown[];
  /** @default false */
  disabled: boolean;
  /** @default '' */
  label: string;
  /** @default true */
  formAssociated: boolean;
  form: unknown;
  validity: unknown;
  validationMessage: unknown;
}

/**
 * `<arc-color-swatch>`
 */
export declare class ArcColorSwatch extends LitElement {
  /** @default '#4d7ef7' */
  color: string;
  /** @default '' */
  label: string;
  /** @default 'md' */
  size: string;
}

/**
 * `<arc-column>`
 */
export declare class ArcColumn extends LitElement {
  /** @default '' */
  key: string;
  /** @default '' */
  label: string;
  /** @default false */
  sortable: boolean;
  /** @default '' */
  width: string;
}

/**
 * `<arc-combobox>`
 * Events: arc-change
 */
export declare class ArcCombobox extends LitElement {
  /** @default '' */
  value: string;
  /** @default '' */
  placeholder: string;
  /** @default '' */
  label: string;
  /** @default '' */
  name: string;
  /** @default false */
  disabled: boolean;
  /** @default true */
  formAssociated: boolean;
  form: unknown;
  validity: unknown;
  validationMessage: unknown;
}

/**
 * `<arc-command-bar>`
 * Events: arc-input, arc-submit
 */
export declare class ArcCommandBar extends LitElement {
  /** @default 'Search…' */
  placeholder: string;
  /** @default '' */
  value: string;
  /** @default 'magnifying-glass' */
  icon: string;
}

/**
 * `<arc-command-item>`
 */
export declare class ArcCommandItem extends LitElement {
  label: unknown;
  /** @default '' */
  shortcut: string;
  /** @default '' */
  icon: string;
}

/**
 * `<arc-command-palette>`
 * Events: arc-select, arc-close
 */
export declare class ArcCommandPalette extends LitElement {
  /** @default false */
  open: boolean;
  /** @default 'Type a command...' */
  placeholder: string;
}

/**
 * `<arc-comparison>`
 */
export declare class ArcComparison extends LitElement {
  /** @default '[]' */
  features: string;
}

/**
 * `<arc-comparison-column>`
 */
export declare class ArcComparisonColumn extends LitElement {
  /** @default '' */
  heading: string;
  /** @default false */
  highlight: boolean;
  /** @default '[]' */
  values: string;
}

/**
 * `<arc-confirm>`
 * Events: arc-confirm, arc-cancel
 */
export declare class ArcConfirm extends LitElement {
  /** @default false */
  open: boolean;
  /** @default '' */
  heading: string;
  /** @default '' */
  message: string;
  /** @default 'Cancel' */
  undefined: string;
  /** @default 'default' */
  variant: string;
  'confirm-label': string;
  'cancel-label': string;
}

/**
 * `<arc-connection-status>`
 * Events: arc-online, arc-offline
 */
export declare class ArcConnectionStatus extends LitElement {
  online: unknown;
}

/**
 * `<arc-container>`
 */
export declare class ArcContainer extends LitElement {
  /** @default false */
  narrow: boolean;
  /** @default 'md' */
  size: string;
  /** @default 'md' */
  padding: string;
}

/**
 * `<arc-context-menu>`
 * Events: arc-open, arc-close, arc-select
 */
export declare class ArcContextMenu extends LitElement {
  /** @default false */
  open: boolean;
}

/**
 * `<arc-copy-button>`
 * Events: arc-copy
 */
export declare class ArcCopyButton extends LitElement {
  /** @default '' */
  value: string;
  /** @default false */
  disabled: boolean;
}

/**
 * `<arc-countdown-timer>`
 * Events: arc-expired
 */
export declare class ArcCountdownTimer extends LitElement {
  /** @default '' */
  target: string;
  /** @default '' */
  label: string;
  /** @default 'Expired' */
  expired: string;
  /** @default false */
  hideZeroSegments: boolean;
}

/**
 * `<arc-cta-banner>`
 */
export declare class ArcCtaBanner extends LitElement {
  /** @default '' */
  eyebrow: string;
  /** @default '' */
  headline: string;
  /** @default false */
  nogradient: boolean;
}

/**
 * `<arc-dashboard-grid>`
 */
export declare class ArcDashboardGrid extends LitElement {
  /** @default 0 */
  columns: number;
  /** @default 'var(--space-lg)' */
  gap: string;
  /** @default '280px' */
  minColumnWidth: string;
}

/**
 * `<arc-data-grid>`
 * Events: arc-sort, arc-selection-change, arc-cell-change
 */
export declare class ArcDataGrid extends LitElement {
  /** @default [] */
  columns: unknown[];
  /** @default [] */
  rows: unknown[];
  /** @default [] */
  sort: unknown[];
  /** @default false */
  manualSort: boolean;
  /** @default false */
  selectable: boolean;
  /** @default false */
  virtual: boolean;
  /** @default 40 */
  rowHeight: number;
}

/**
 * `<arc-data-table>`
 * Events: arc-sort, arc-select-all, arc-row-select
 */
export declare class ArcDataTable extends LitElement {
  /** @default [] */
  rows: unknown[];
  /** @default false */
  sortable: boolean;
  /** @default false */
  selectable: boolean;
  /** @default '' */
  sortColumn: string;
  /** @default 'asc' */
  sortDirection: string;
  /** @default false */
  virtual: boolean;
  /** @default 40 */
  rowHeight: number;
}

/**
 * `<arc-date-picker>`
 * Events: arc-change
 */
export declare class ArcDatePicker extends LitElement {
  /** @default '' */
  value: string;
  /** @default '' */
  name: string;
  /** @default '' */
  min: string;
  /** @default '' */
  max: string;
  /** @default 'Select date' */
  placeholder: string;
  /** @default false */
  disabled: boolean;
  /** @default '' */
  label: string;
  /** @default true */
  formAssociated: boolean;
  form: unknown;
  validity: unknown;
  validationMessage: unknown;
}

/**
 * `<arc-date-range-picker>`
 * Events: arc-change
 */
export declare class ArcDateRangePicker extends LitElement {
  value: unknown;
  /** @default '' */
  start: string;
  /** @default '' */
  end: string;
  /** @default '' */
  name: string;
  /** @default '' */
  min: string;
  /** @default '' */
  max: string;
  /** @default 2 */
  months: number;
  /** @default [] */
  presets: unknown[];
  /** @default 'Select date range' */
  placeholder: string;
  /** @default false */
  disabled: boolean;
  /** @default false */
  required: boolean;
  /** @default '' */
  label: string;
  /** @default true */
  formAssociated: boolean;
  form: unknown;
  validity: unknown;
  validationMessage: unknown;
}

/**
 * `<arc-description-item>`
 */
export declare class ArcDescriptionItem extends LitElement {
  /** @default '' */
  term: string;
}

/**
 * `<arc-description-list>`
 */
export declare class ArcDescriptionList extends LitElement {
  /** @default 1 */
  columns: number;
  /** @default true */
  dividers: boolean;
}

/**
 * `<arc-dialog>`
 * Events: arc-confirm, arc-cancel
 */
export declare class ArcDialog extends LitElement {
  /** @default false */
  open: boolean;
  /** @default '' */
  heading: string;
  /** @default '' */
  message: string;
  /** @default 'Cancel' */
  undefined: string;
  /** @default 'default' */
  variant: string;
  'confirm-label': string;
  'cancel-label': string;
}

/**
 * `<arc-diff>`
 */
export declare class ArcDiff extends LitElement {
  /** @default '' */
  before: string;
  /** @default '' */
  after: string;
  /** @default 'inline' */
  mode: string;
}

/**
 * `<arc-divider>`
 */
export declare class ArcDivider extends LitElement {
  /** @default 'subtle' */
  variant: string;
  /** @default false */
  vertical: boolean;
  /** @default '' */
  label: string;
  align: string;
}

/**
 * `<arc-dock>`
 */
export declare class ArcDock extends LitElement {
  /** @default 'bottom' */
  position: string;
  /** @default false */
  autoHide: boolean;
  /** @default false */
  open: boolean;
}

/**
 * `<arc-drawer>`
 * Events: arc-close
 */
export declare class ArcDrawer extends LitElement {
  /** @default false */
  open: boolean;
  /** @default 'left' */
  position: string;
  /** @default '' */
  heading: string;
}

/**
 * `<arc-dropdown-menu>`
 * Events: arc-close, arc-select
 */
export declare class ArcDropdownMenu extends LitElement {
  /** @default false */
  open: boolean;
}

/**
 * `<arc-empty-state>`
 */
export declare class ArcEmptyState extends LitElement {
  /** @default '' */
  heading: string;
  /** @default '' */
  description: string;
}

/**
 * `<arc-event-calendar>`
 * Events: arc-period-change, arc-date-click, arc-event-click
 */
export declare class ArcEventCalendar extends LitElement {
  /** @default [] */
  events: unknown[];
  /** @default 'month' */
  view: string;
  /** @default '' */
  date: string;
}

/**
 * `<arc-feature-card>`
 */
export declare class ArcFeatureCard extends LitElement {
  /** @default '' */
  icon: string;
  /** @default '' */
  heading: string;
  /** @default '' */
  description: string;
  /** @default '' */
  href: string;
  /** @default '' */
  action: string;
}

/**
 * `<arc-fieldset>`
 */
export declare class ArcFieldset extends LitElement {
  /** @default '' */
  legend: string;
  /** @default '' */
  description: string;
  /** @default false */
  disabled: boolean;
  /** @default '' */
  error: string;
  /** @default 'default' */
  variant: string;
}

/**
 * `<arc-file-upload>`
 * Events: arc-change, arc-remove
 */
export declare class ArcFileUpload extends LitElement {
  /** @default '' */
  accept: string;
  /** @default false */
  multiple: boolean;
  /** @default 0 */
  maxSize: number;
  /** @default false */
  disabled: boolean;
}

/**
 * `<arc-float-bar>`
 */
export declare class ArcFloatBar extends LitElement {
  /** @default false */
  open: boolean;
  /** @default 'bottom' */
  position: string;
}

/**
 * `<arc-footer>`
 */
export declare class ArcFooter extends LitElement {
  /** @default false */
  compact: boolean;
  /** @default true */
  border: boolean;
  /** @default null */
  contained: null;
  /** @default 'left' */
  align: string;
}

/**
 * `<arc-form>`
 * Events: arc-invalid, arc-submit, arc-reset
 */
export declare class ArcForm extends LitElement {
  /** @default '' */
  action: string;
  /** @default '' */
  method: string;
  /** @default false */
  novalidate: boolean;
  /** @default false */
  loading: boolean;
  /** @default false */
  disabled: boolean;
  /** @default true */
  errorSummary: boolean;
}

/**
 * `<arc-gradient-text>`
 */
export declare class ArcGradientText extends LitElement {
  /** @default 'accent' */
  variant: string;
  /** @default '' */
  gradient: string;
  /** @default false */
  animate: boolean;
}

/**
 * `<arc-guided-tour>`
 * Events: arc-change, arc-complete, arc-dismiss
 */
export declare class ArcGuidedTour extends LitElement {
  /** @default [] */
  steps: unknown[];
  /** @default 0 */
  active: number;
  /** @default false */
  open: boolean;
}

/**
 * `<arc-highlight>`
 */
export declare class ArcHighlight extends LitElement {
  /** @default '' */
  text: string;
  /** @default '' */
  query: string;
  /** @default false */
  caseSensitive: boolean;
}

/**
 * `<arc-hotkey>`
 * Events: arc-hotkey-trigger
 */
export declare class ArcHotkey extends LitElement {
  /** @default '' */
  keys: string;
  /** @default false */
  disabled: boolean;
  /** @default false */
  global: boolean;
}

/**
 * `<arc-hover-card>`
 * Events: arc-open, arc-close
 */
export declare class ArcHoverCard extends LitElement {
  /** @default 'bottom' */
  position: string;
  /** @default 400 */
  openDelay: number;
  /** @default 300 */
  closeDelay: number;
}

/**
 * `<arc-icon>`
 */
export declare class ArcIcon extends LitElement {
  /** @default '' */
  name: string;
  /** @default 'sm' */
  size: string;
  /** @default '' */
  label: string;
}

/**
 * `<arc-icon-button>`
 */
export declare class ArcIconButton extends LitElement {
  /** @default '' */
  name: string;
  /** @default '' */
  text: string;
  /** @default 'ghost' */
  variant: string;
  /** @default 'md' */
  size: string;
  /** @default '' */
  label: string;
  /** @default '' */
  href: string;
  /** @default false */
  disabled: boolean;
  /** @default 'button' */
  type: string;
}

/**
 * `<arc-icon-library>`
 */
export declare class ArcIconLibrary extends LitElement {
  /** @default 'phosphor' */
  name: string;
}

/**
 * `<arc-image>`
 * Events: arc-load, arc-error
 */
export declare class ArcImage extends LitElement {
  /** @default '' */
  src: string;
  /** @default '' */
  alt: string;
  /** @default '' */
  aspect: string;
  /** @default 'cover' */
  fit: string;
  /** @default 'lazy' */
  loading: string;
  /** @default '' */
  fallback: string;
}

/**
 * `<arc-image-cropper>`
 * Events: arc-crop-change
 */
export declare class ArcImageCropper extends LitElement {
  /** @default '' */
  src: string;
  /** @default 320 */
  height: number;
  /** @default 0 */
  aspect: number;
  /** @default 1 */
  zoom: number;
}

/**
 * `<arc-infinite-scroll>`
 * Events: arc-load-more
 */
export declare class ArcInfiniteScroll extends LitElement {
  /** @default 200 */
  threshold: number;
  /** @default false */
  loading: boolean;
  /** @default false */
  finished: boolean;
  /** @default false */
  disabled: boolean;
}

/**
 * `<arc-inline-message>`
 */
export declare class ArcInlineMessage extends LitElement {
  /** @default 'info' */
  variant: string;
}

/**
 * `<arc-input>`
 * Events: arc-input, arc-change
 */
export declare class ArcInput extends LitElement {
  /** @default 'text' */
  type: string;
  /** @default '' */
  name: string;
  /** @default '' */
  label: string;
  /** @default '' */
  placeholder: string;
  /** @default '' */
  value: string;
  /** @default false */
  disabled: boolean;
  /** @default false */
  required: boolean;
  /** @default '' */
  error: string;
  /** @default 'md' */
  size: string;
  /** @default false */
  multiline: boolean;
  /** @default 5 */
  rows: number;
  /** @default true */
  formAssociated: boolean;
  form: unknown;
  validity: unknown;
  validationMessage: unknown;
}

/**
 * `<arc-input-group>`
 */
export declare class ArcInputGroup extends LitElement {
  /** @default 'md' */
  size: string;
}

/**
 * `<arc-inset>`
 */
export declare class ArcInset extends LitElement {
  /** @default 'md' */
  space: string;
  /** @default false */
  bleed: boolean;
}

/**
 * `<arc-kanban>`
 * Events: arc-card-move, arc-card-click
 */
export declare class ArcKanban extends LitElement {
  /** @default [] */
  columns: unknown[];
  /** @default false */
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
  /** @default 'horizontal' */
  layout: string;
  /** @default true */
  dividers: boolean;
}

/**
 * `<arc-kv-pair>`
 */
export declare class ArcKvPair extends LitElement {
  /** @default '' */
  label: string;
}

/**
 * `<arc-label>`
 */
export declare class ArcLabel extends LitElement {
  /** @default '' */
  for: string;
  /** @default false */
  required: boolean;
  /** @default 'md' */
  size: string;
  /** @default false */
  disabled: boolean;
}

/**
 * `<arc-link>`
 */
export declare class ArcLink extends LitElement {
  /** @default '' */
  href: string;
  /** @default 'default' */
  variant: string;
  /** @default 'hover' */
  underline: string;
  /** @default false */
  active: boolean;
  /** @default false */
  external: boolean;
}

/**
 * `<arc-list>`
 */
export declare class ArcList extends LitElement {
  /** @default 'default' */
  variant: string;
  /** @default 'md' */
  size: string;
  /** @default false */
  selectable: boolean;
  /** @default false */
  multiple: boolean;
  /** @default '' */
  value: string;
  /** @default '' */
  label: string;
}

/**
 * `<arc-list-item>`
 * Events: arc-item-select
 */
export declare class ArcListItem extends LitElement {
  /** @default '' */
  value: string;
  /** @default false */
  selected: boolean;
  /** @default false */
  disabled: boolean;
  /** @default '' */
  href: string;
}

/**
 * `<arc-loading-overlay>`
 */
export declare class ArcLoadingOverlay extends LitElement {
  /** @default false */
  active: boolean;
  /** @default '' */
  message: string;
  /** @default false */
  global: boolean;
}

/**
 * `<arc-markdown>`
 */
export declare class ArcMarkdown extends LitElement {
  /** @default '' */
  content: string;
}

/**
 * `<arc-marquee>`
 */
export declare class ArcMarquee extends LitElement {
  /** @default 40 */
  speed: number;
  /** @default 'left' */
  direction: string;
  /** @default true */
  undefined: boolean;
  /** @default 'var(--space-xl)' */
  gap: string;
  'pause-on-hover': boolean;
}

/**
 * `<arc-masonry>`
 */
export declare class ArcMasonry extends LitElement {
  /** @default 3 */
  columns: number;
  /** @default 'md' */
  gap: string;
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
  label: unknown;
  /** @default '' */
  shortcut: string;
  /** @default false */
  disabled: boolean;
  /** @default '' */
  icon: string;
}

/**
 * `<arc-menubar>`
 * Events: arc-select
 */
export declare class ArcMenubar extends LitElement {
  /** @default [] */
  items: unknown[];
}

/**
 * `<arc-meter>`
 */
export declare class ArcMeter extends LitElement {
  /** @default 0 */
  value: number;
  /** @default 0 */
  min: number;
  /** @default 100 */
  max: number;
  /** @default undefined */
  low: number;
  /** @default undefined */
  high: number;
  /** @default undefined */
  optimum: number;
  /** @default '' */
  label: string;
}

/**
 * `<arc-modal>`
 * Events: arc-close, arc-open
 */
export declare class ArcModal extends LitElement {
  /** @default false */
  open: boolean;
  /** @default '' */
  heading: string;
  /** @default 'md' */
  size: string;
  /** @default false */
  fullscreen: boolean;
  /** @default true */
  closable: boolean;
}

/**
 * `<arc-multi-select>`
 * Events: arc-change
 */
export declare class ArcMultiSelect extends LitElement {
  /** @default [] */
  value: unknown[];
  /** @default '' */
  placeholder: string;
  /** @default '' */
  label: string;
  /** @default '' */
  name: string;
  /** @default false */
  disabled: boolean;
  /** @default true */
  formAssociated: boolean;
  form: unknown;
  validity: unknown;
  validationMessage: unknown;
}

/**
 * `<arc-nav-item>`
 */
export declare class ArcNavItem extends LitElement {
  label: unknown;
  children: unknown;
  hasChildren: unknown;
  /** @default '' */
  href: string;
  /** @default false */
  active: boolean;
  /** @default 'default' */
  variant: string;
  /** @default '' */
  description: string;
}

/**
 * `<arc-navigation-menu>`
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
  /** @default false */
  open: boolean;
  /** @default 'top-right' */
  position: string;
  /** @default '400px' */
  maxHeight: string;
}

/**
 * `<arc-number-format>`
 */
export declare class ArcNumberFormat extends LitElement {
  /** @default 0 */
  value: number;
  /** @default 'number' */
  type: string;
  /** @default 'en-US' */
  locale: string;
  /** @default 'USD' */
  currency: string;
  /** @default undefined */
  decimals: number;
  /** @default 'standard' */
  notation: string;
}

/**
 * `<arc-number-input>`
 * Events: arc-change
 */
export declare class ArcNumberInput extends LitElement {
  /** @default 0 */
  value: number;
  /** @default undefined */
  min: number;
  /** @default undefined */
  max: number;
  /** @default 1 */
  step: number;
  /** @default '' */
  label: string;
  /** @default '' */
  name: string;
  /** @default false */
  disabled: boolean;
  /** @default true */
  formAssociated: boolean;
  form: unknown;
  validity: unknown;
  validationMessage: unknown;
}

/**
 * `<arc-option>`
 */
export declare class ArcOption extends LitElement {
  label: unknown;
  /** @default '' */
  value: string;
  /** @default false */
  disabled: boolean;
  /** @default false */
  selected: boolean;
}

/**
 * `<arc-otp-input>`
 * Events: arc-change
 */
export declare class ArcOtpInput extends LitElement {
  /** @default 6 */
  length: number;
  /** @default '' */
  value: string;
  /** @default '' */
  name: string;
  /** @default false */
  disabled: boolean;
  /** @default 'number' */
  type: string;
  /** @default true */
  formAssociated: boolean;
  form: unknown;
  validity: unknown;
  validationMessage: unknown;
}

/**
 * `<arc-page-header>`
 */
export declare class ArcPageHeader extends LitElement {
  /** @default '' */
  heading: string;
  /** @default '' */
  description: string;
  /** @default false */
  border: boolean;
}

/**
 * `<arc-page-indicator>`
 * Events: arc-change
 */
export declare class ArcPageIndicator extends LitElement {
  /** @default 0 */
  count: number;
  /** @default 0 */
  value: number;
  /** @default false */
  clickable: boolean;
}

/**
 * `<arc-page-layout>`
 */
export declare class ArcPageLayout extends LitElement {
  /** @default 'centered' */
  layout: string;
  /** @default '1120px' */
  maxWidth: string;
  /** @default 'var(--space-xl)' */
  gap: string;
}

/**
 * `<arc-pagination>`
 * Events: arc-change
 */
export declare class ArcPagination extends LitElement {
  /** @default 1 */
  total: number;
  /** @default 1 */
  current: number;
  /** @default 1 */
  siblings: number;
  /** @default false */
  compact: boolean;
}

/**
 * `<arc-password-input>`
 * Events: arc-strength-change, arc-input, arc-change
 */
export declare class ArcPasswordInput extends LitElement {
  /** @default '' */
  name: string;
  /** @default '' */
  label: string;
  /** @default '' */
  placeholder: string;
  /** @default '' */
  value: string;
  /** @default false */
  disabled: boolean;
  /** @default false */
  required: boolean;
  /** @default '' */
  error: string;
  /** @default 'md' */
  size: string;
  /** @default 'current-password' */
  autocomplete: string;
  /** @default false */
  showStrength: boolean;
  /** @default true */
  formAssociated: boolean;
  form: unknown;
  validity: unknown;
  validationMessage: unknown;
}

/**
 * `<arc-pin-input>`
 * Events: arc-change, arc-complete
 */
export declare class ArcPinInput extends LitElement {
  /** @default 4 */
  length: number;
  /** @default '' */
  value: string;
  /** @default '' */
  name: string;
  /** @default false */
  disabled: boolean;
  /** @default false */
  mask: boolean;
  /** @default 'number' */
  type: string;
  /** @default 0 */
  separator: number;
  /** @default '' */
  label: string;
  /** @default true */
  formAssociated: boolean;
  form: unknown;
  validity: unknown;
  validationMessage: unknown;
}

/**
 * `<arc-popover>`
 * Events: arc-close
 */
export declare class ArcPopover extends LitElement {
  /** @default false */
  open: boolean;
  /** @default 'bottom' */
  position: string;
  /** @default '' */
  trigger: string;
}

/**
 * `<arc-progress>`
 */
export declare class ArcProgress extends LitElement {
  /** @default 0 */
  value: number;
  /** @default 'bar' */
  variant: string;
  /** @default 'md' */
  size: string;
  /** @default false */
  indeterminate: boolean;
  /** @default false */
  showValue: boolean;
  /** @default '' */
  label: string;
}

/**
 * `<arc-progress-toast>`
 * Events: arc-complete, arc-cancel
 */
export declare class ArcProgressToast extends LitElement {
  /** @default 'bottom-right' */
  position: string;
}

/**
 * `<arc-prose>`
 */
export declare class ArcProse extends LitElement {
  /** @default 'md' */
  size: string;
}

/**
 * `<arc-qr-code>`
 */
export declare class ArcQrCode extends LitElement {
  /** @default '' */
  value: string;
  /** @default 160 */
  size: number;
  /** @default 'M' */
  level: string;
  /** @default '' */
  label: string;
  /** @default 2 */
  quietZone: number;
  /** @default false */
  contrast: boolean;
}

/**
 * `<arc-radio>`
 */
export declare class ArcRadio extends LitElement {
  label: unknown;
  /** @default '' */
  value: string;
  /** @default false */
  disabled: boolean;
}

/**
 * `<arc-radio-group>`
 * Events: arc-change
 */
export declare class ArcRadioGroup extends LitElement {
  /** @default '' */
  value: string;
  /** @default '' */
  name: string;
  /** @default false */
  disabled: boolean;
  /** @default 'md' */
  size: string;
  /** @default 'vertical' */
  orientation: string;
  /** @default true */
  formAssociated: boolean;
  form: unknown;
  validity: unknown;
  validationMessage: unknown;
}

/**
 * `<arc-rail>`
 * Events: arc-change
 */
export declare class ArcRail extends LitElement {
  /** @default [] */
  items: unknown[];
  /** @default '' */
  value: string;
  /** @default false */
  expanded: boolean;
}

/**
 * `<arc-range-slider>`
 * Events: arc-input, arc-change
 */
export declare class ArcRangeSlider extends LitElement {
  /** @default 0 */
  min: number;
  /** @default 100 */
  max: number;
  /** @default 1 */
  step: number;
  /** @default 0 */
  low: number;
  /** @default 100 */
  high: number;
  /** @default '' */
  name: string;
  /** @default false */
  disabled: boolean;
  /** @default '' */
  label: string;
  /** @default true */
  showValues: boolean;
  /** @default true */
  formAssociated: boolean;
  form: unknown;
  validity: unknown;
  validationMessage: unknown;
}

/**
 * `<arc-rating>`
 * Events: arc-change
 */
export declare class ArcRating extends LitElement {
  /** @default 0 */
  value: number;
  /** @default 5 */
  max: number;
  /** @default '' */
  name: string;
  /** @default false */
  disabled: boolean;
  /** @default false */
  readonly: boolean;
  /** @default true */
  formAssociated: boolean;
  form: unknown;
  validity: unknown;
  validationMessage: unknown;
}

/**
 * `<arc-resizable>`
 * Events: arc-resize
 */
export declare class ArcResizable extends LitElement {
  /** @default 'horizontal' */
  direction: string;
  /** @default 100 */
  minSize: number;
  /** @default Infinity */
  maxSize: number;
  /** @default 300 */
  size: number;
}

/**
 * `<arc-responsive-switcher>`
 */
export declare class ArcResponsiveSwitcher extends LitElement {
  /** @default '600px' */
  threshold: string;
  /** @default 'md' */
  gap: string;
}

/**
 * `<arc-scroll-area>`
 */
export declare class ArcScrollArea extends LitElement {
  /** @default '' */
  maxHeight: string;
  /** @default 'vertical' */
  orientation: string;
}

/**
 * `<arc-scroll-indicator>`
 */
export declare class ArcScrollIndicator extends LitElement {
  /** @default '' */
  target: string;
  /** @default 'top' */
  position: string;
  /** @default 'sm' */
  size: string;
  /** @default 'accent' */
  color: string;
}

/**
 * `<arc-scroll-spy>`
 * Events: arc-change
 */
export declare class ArcScrollSpy extends LitElement {
  /** @default '' */
  active: string;
  /** @default 80 */
  offset: number;
}

/**
 * `<arc-scroll-to-top>`
 */
export declare class ArcScrollToTop extends LitElement {
  /** @default 300 */
  threshold: number;
  /** @default true */
  smooth: boolean;
  /** @default 'bottom-right' */
  position: string;
  /** @default 'var(--space-lg)' */
  offset: string;
}

/**
 * `<arc-search>`
 * Events: arc-input, arc-clear, arc-change, arc-select
 */
export declare class ArcSearch extends LitElement {
  /** @default '' */
  value: string;
  /** @default 'Search...' */
  placeholder: string;
  /** @default '' */
  label: string;
  /** @default false */
  disabled: boolean;
  /** @default false */
  loading: boolean;
}

/**
 * `<arc-section>`
 */
export declare class ArcSection extends LitElement {
  /** @default '' */
  label: string;
}

/**
 * `<arc-segmented-control>`
 * Events: arc-change
 */
export declare class ArcSegmentedControl extends LitElement {
  /** @default '' */
  value: string;
  /** @default false */
  disabled: boolean;
}

/**
 * `<arc-select>`
 * Events: arc-change
 */
export declare class ArcSelect extends LitElement {
  /** @default '' */
  value: string;
  /** @default 'Select...' */
  placeholder: string;
  /** @default '' */
  label: string;
  /** @default '' */
  name: string;
  /** @default false */
  disabled: boolean;
  /** @default 'md' */
  size: string;
  /** @default '' */
  error: string;
  /** @default false */
  open: boolean;
  /** @default true */
  formAssociated: boolean;
  form: unknown;
  validity: unknown;
  validationMessage: unknown;
}

/**
 * `<arc-separator>`
 */
export declare class ArcSeparator extends LitElement {
  /** @default 'horizontal' */
  orientation: string;
  /** @default '' */
  label: string;
  /** @default 'line' */
  variant: string;
}

/**
 * `<arc-settings-layout>`
 */
export declare class ArcSettingsLayout extends LitElement {
  /** @default 'left' */
  navPosition: string;
}

/**
 * `<arc-sheet>`
 * Events: arc-close, arc-open
 */
export declare class ArcSheet extends LitElement {
  /** @default false */
  open: boolean;
  /** @default 'bottom' */
  side: string;
  /** @default '' */
  heading: string;
}

/**
 * `<arc-sidebar>`
 */
export declare class ArcSidebar extends LitElement {
  /** @default '' */
  active: string;
  /** @default false */
  collapsed: boolean;
  /** @default 'left' */
  position: string;
  /** @default '280px' */
  width: string;
  /** @default false */
  glow: boolean;
  /** @default 'Sidebar navigation' */
  label: string;
}

/**
 * `<arc-sidebar-link>`
 */
export declare class ArcSidebarLink extends LitElement {
  label: unknown;
  /** @default '' */
  href: string;
  /** @default false */
  active: boolean;
  /** @default 0 */
  level: number;
}

/**
 * `<arc-sidebar-section>`
 * Events: arc-toggle
 */
export declare class ArcSidebarSection extends LitElement {
  links: unknown;
  /** @default '' */
  heading: string;
  /** @default false */
  collapsible: boolean;
  /** @default true */
  open: boolean;
}

/**
 * `<arc-skeleton>`
 */
export declare class ArcSkeleton extends LitElement {
  /** @default 'text' */
  variant: string;
  /** @default '' */
  width: string;
  /** @default '' */
  height: string;
  /** @default 1 */
  count: number;
}

/**
 * `<arc-skip-link>`
 */
export declare class ArcSkipLink extends LitElement {
  /** @default '#main' */
  target: string;
}

/**
 * `<arc-slider>`
 * Events: arc-input, arc-change
 */
export declare class ArcSlider extends LitElement {
  /** @default 0 */
  value: number;
  /** @default 0 */
  min: number;
  /** @default 100 */
  max: number;
  /** @default 1 */
  step: number;
  /** @default '' */
  name: string;
  /** @default false */
  disabled: boolean;
  /** @default '' */
  label: string;
  /** @default true */
  formAssociated: boolean;
  form: unknown;
  validity: unknown;
  validationMessage: unknown;
}

/**
 * `<arc-snackbar>`
 * Events: arc-action, arc-dismiss
 */
export declare class ArcSnackbar extends LitElement {
  /** @default 'bottom-center' */
  position: string;
  /** @default 5000 */
  duration: number;
}

/**
 * `<arc-sortable-list>`
 * Events: arc-change
 */
export declare class ArcSortableList extends LitElement {
  /** @default false */
  disabled: boolean;
}

/**
 * `<arc-sparkline>`
 */
export declare class ArcSparkline extends LitElement {
  /** @default '' */
  data: string;
  /** @default 'line' */
  type: string;
  /** @default '' */
  color: string;
  /** @default 120 */
  width: number;
  /** @default 32 */
  height: number;
  /** @default false */
  fill: boolean;
}

/**
 * `<arc-speed-dial>`
 * Events: arc-action, arc-close
 */
export declare class ArcSpeedDial extends LitElement {
  /** @default false */
  open: boolean;
  /** @default 'up' */
  direction: string;
  /** @default 'bottom-right' */
  position: string;
  /** @default [] */
  items: unknown[];
}

/**
 * `<arc-spinner>`
 */
export declare class ArcSpinner extends LitElement {
  /** @default 'md' */
  size: string;
  /** @default 'primary' */
  variant: string;
}

/**
 * `<arc-split-pane>`
 * Events: arc-resize
 */
export declare class ArcSplitPane extends LitElement {
  /** @default 'horizontal' */
  orientation: string;
  /** @default 0.5 */
  ratio: number;
  /** @default 0.15 */
  minRatio: number;
  /** @default 0.85 */
  maxRatio: number;
}

/**
 * `<arc-spotlight>`
 * Events: arc-dismiss
 */
export declare class ArcSpotlight extends LitElement {
  /** @default '' */
  target: string;
  /** @default false */
  active: boolean;
  /** @default 8 */
  padding: number;
}

/**
 * `<arc-spy-link>`
 */
export declare class ArcSpyLink extends LitElement {
  label: unknown;
  /** @default '' */
  target: string;
  /** @default 0 */
  level: number;
}

/**
 * `<arc-stack>`
 */
export declare class ArcStack extends LitElement {
  /** @default 'vertical' */
  direction: string;
  /** @default 'md' */
  gap: string;
  /** @default 'stretch' */
  align: string;
  /** @default 'start' */
  justify: string;
  /** @default false */
  wrap: boolean;
}

/**
 * `<arc-stat>`
 */
export declare class ArcStat extends LitElement {
  /** @default '' */
  value: string;
  /** @default '' */
  label: string;
  /** @default '' */
  trend: string;
  /** @default '' */
  change: string;
}

/**
 * `<arc-status-bar>`
 */
export declare class ArcStatusBar extends LitElement {
  /** @default 'static' */
  position: string;
}

/**
 * `<arc-step>`
 */
export declare class ArcStep extends LitElement {
  /** @default '' */
  label: string;
}

/**
 * `<arc-stepper>`
 */
export declare class ArcStepper extends LitElement {
  /** @default 0 */
  active: number;
}

/**
 * `<arc-stepper-nav>`
 * Events: arc-change, arc-complete
 */
export declare class ArcStepperNav extends LitElement {
  /** @default [] */
  steps: unknown[];
  /** @default 0 */
  active: number;
  /** @default false */
  linear: boolean;
}

/**
 * `<arc-sticky>`
 * Events: arc-stuck
 */
export declare class ArcSticky extends LitElement {
  /** @default '0px' */
  offset: string;
  /** @default false */
  stuck: boolean;
}

/**
 * `<arc-suggestion>`
 */
export declare class ArcSuggestion extends LitElement {
  label: unknown;
  /** @default '' */
  value: string;
}

/**
 * `<arc-switch-group>`
 */
export declare class ArcSwitchGroup extends LitElement {
  /** @default '' */
  label: string;
  /** @default 'vertical' */
  orientation: string;
  /** @default 'md' */
  size: string;
  /** @default false */
  disabled: boolean;
}

/**
 * `<arc-tab>`
 */
export declare class ArcTab extends LitElement {
  /** @default '' */
  label: string;
}

/**
 * `<arc-table>`
 */
export declare class ArcTable extends LitElement {
  /** @default [] */
  columns: unknown[];
  /** @default [] */
  rows: unknown[];
  /** @default false */
  striped: boolean;
  /** @default false */
  compact: boolean;
}

/**
 * `<arc-tabs>`
 * Events: arc-change
 */
export declare class ArcTabs extends LitElement {
  /** @default 0 */
  selected: number;
  /** @default 'start' */
  align: string;
  /** @default 'underline' */
  variant: string;
  /** @default 'horizontal' */
  orientation: string;
}

/**
 * `<arc-tag>`
 * Events: arc-remove
 */
export declare class ArcTag extends LitElement {
  /** @default 'default' */
  variant: string;
  /** @default 'md' */
  size: string;
  /** @default false */
  removable: boolean;
  /** @default false */
  disabled: boolean;
  /** @default '' */
  color: string;
}

/**
 * `<arc-tag-input>`
 * Events: arc-change, arc-input
 */
export declare class ArcTagInput extends LitElement {
  /** @default [] */
  value: unknown[];
  /** @default [] */
  suggestions: unknown[];
  /** @default ',' */
  delimiter: string;
  /** @default 0 */
  maxTags: number;
  /** @default true */
  allowCustom: boolean;
  /** @default '' */
  label: string;
  /** @default '' */
  placeholder: string;
  /** @default '' */
  name: string;
  /** @default false */
  disabled: boolean;
  /** @default '' */
  error: string;
  /** @default true */
  formAssociated: boolean;
  form: unknown;
  validity: unknown;
  validationMessage: unknown;
}

/**
 * `<arc-text>`
 */
export declare class ArcText extends LitElement {
  /** @default 'body' */
  variant: string;
  /** @default 'p' */
  as: string;
}

/**
 * `<arc-textarea>`
 * Events: arc-input, arc-change
 */
export declare class ArcTextarea extends LitElement {
  /** @default '' */
  value: string;
  /** @default '' */
  placeholder: string;
  /** @default '' */
  label: string;
  /** @default 4 */
  rows: number;
  /** @default 0 */
  maxlength: number;
  /** @default false */
  disabled: boolean;
  /** @default false */
  readonly: boolean;
  /** @default 'vertical' */
  resize: string;
  /** @default 'md' */
  size: string;
  /** @default false */
  autoResize: boolean;
  /** @default '' */
  error: string;
  /** @default true */
  formAssociated: boolean;
  form: unknown;
  validity: unknown;
  validationMessage: unknown;
}

/**
 * `<arc-theme-toggle>`
 * Events: arc-change
 */
export declare class ArcThemeToggle extends LitElement {
  /** @default 'auto' */
  theme: string;
  /** @default false */
  disabled: boolean;
  /** @default false */
  iconOnly: boolean;
}

/**
 * `<arc-time-ago>`
 */
export declare class ArcTimeAgo extends LitElement {
  /** @default '' */
  datetime: string;
  /** @default true */
  live: boolean;
  /** @default 'en-US' */
  locale: string;
}

/**
 * `<arc-time-picker>`
 * Events: arc-change
 */
export declare class ArcTimePicker extends LitElement {
  /** @default '' */
  value: string;
  /** @default '' */
  name: string;
  /** @default '' */
  min: string;
  /** @default '' */
  max: string;
  /** @default 1 */
  step: number;
  /** @default '12h' */
  format: string;
  /** @default 'Select time' */
  placeholder: string;
  /** @default false */
  disabled: boolean;
  /** @default '' */
  label: string;
  /** @default true */
  formAssociated: boolean;
  form: unknown;
  validity: unknown;
  validationMessage: unknown;
}

/**
 * `<arc-timeline>`
 */
export declare class ArcTimeline extends LitElement {
  /** @default 3 */
  headingLevel: number;
}

/**
 * `<arc-timeline-item>`
 */
export declare class ArcTimelineItem extends LitElement {
  description: unknown;
  /** @default '' */
  heading: string;
  /** @default '' */
  date: string;
}

/**
 * `<arc-toast>`
 * Events: arc-dismiss
 */
export declare class ArcToast extends LitElement {
  /** @default 'top-right' */
  position: string;
  /** @default 4000 */
  duration: number;
}

/**
 * `<arc-toast-manager>`
 * Events: arc-queue-overflow, arc-dismiss, arc-queue-change
 */
export declare class ArcToastManager extends LitElement {
  /** @default 'top-right' */
  position: string;
  /** @default 4000 */
  duration: number;
  /** @default 3 */
  maxVisible: number;
  /** @default true */
  dedupe: boolean;
  /** @default 20 */
  queueLimit: number;
}

/**
 * `<arc-toggle>`
 * Events: arc-change
 */
export declare class ArcToggle extends LitElement {
  /** @default false */
  checked: boolean;
  /** @default false */
  disabled: boolean;
  /** @default 'md' */
  size: string;
  /** @default '' */
  label: string;
  /** @default '' */
  name: string;
  /** @default true */
  formAssociated: boolean;
  form: unknown;
  validity: unknown;
  validationMessage: unknown;
}

/**
 * `<arc-toolbar>`
 * Events: arc-overflow-change
 */
export declare class ArcToolbar extends LitElement {
  /** @default false */
  sticky: boolean;
  /** @default 'md' */
  size: string;
  /** @default true */
  border: boolean;
  /** @default false */
  overflow: boolean;
}

/**
 * `<arc-tooltip>`
 */
export declare class ArcTooltip extends LitElement {
  /** @default '' */
  content: string;
  /** @default 'top' */
  position: string;
  /** @default 200 */
  delay: number;
}

/**
 * `<arc-top-bar>`
 * Events: eventName
 */
export declare class ArcTopBar extends LitElement {
  /** @default '' */
  heading: string;
  /** @default false */
  fixed: boolean;
  /** @default null */
  contained: null;
  /** @default false */
  menuOpen: boolean;
  /** @default 'sidebar' */
  mobileMenu: string;
  /** @default 'left' */
  menuPosition: string;
  /** @default 'center' */
  navAlign: string;
}

/**
 * `<arc-transfer-list>`
 * Events: arc-change
 */
export declare class ArcTransferList extends LitElement {
  /** @default [] */
  options: unknown[];
  /** @default [] */
  value: unknown[];
  /** @default '' */
  name: string;
  /** @default false */
  disabled: boolean;
  /** @default false */
  searchable: boolean;
  /** @default 'Available' */
  sourceLabel: string;
  /** @default 'Selected' */
  targetLabel: string;
  /** @default true */
  formAssociated: boolean;
  form: unknown;
  validity: unknown;
  validationMessage: unknown;
}

/**
 * `<arc-tree-item>`
 */
export declare class ArcTreeItem extends LitElement {
  items: unknown;
  hasChildren: unknown;
  /** @default '' */
  label: string;
  /** @default '' */
  icon: string;
  /** @default false */
  expanded: boolean;
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
  /** @default 3 */
  lines: number;
  /** @default false */
  expanded: boolean;
}

/**
 * `<arc-typewriter>`
 * Events: arc-complete
 */
export declare class ArcTypewriter extends LitElement {
  /** @default '' */
  text: string;
  /** @default 50 */
  speed: number;
  /** @default 0 */
  delay: number;
  /** @default true */
  cursor: boolean;
  /** @default false */
  nowrap: boolean;
  /** @default false */
  loop: boolean;
  /** @default 2000 */
  undefined: number;
  'pause-end': number;
}

/**
 * `<arc-value-card>`
 */
export declare class ArcValueCard extends LitElement {
  /** @default '' */
  icon: string;
  /** @default '' */
  heading: string;
  /** @default '' */
  description: string;
}

/**
 * `<arc-virtual-list>`
 */
export declare class ArcVirtualList extends LitElement {
  visibleRange: unknown;
  /** @default [] */
  items: unknown[];
  /** @default 40 */
  itemHeight: number;
  /** @default 5 */
  overscan: number;
}

declare global {
  interface HTMLElementTagNameMap {
    'arc-accordion': ArcAccordion;
    'arc-accordion-item': ArcAccordionItem;
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
    'arc-cluster': ArcCluster;
    'arc-code-block': ArcCodeBlock;
    'arc-collapsible': ArcCollapsible;
    'arc-color-picker': ArcColorPicker;
    'arc-color-swatch': ArcColorSwatch;
    'arc-column': ArcColumn;
    'arc-combobox': ArcCombobox;
    'arc-command-bar': ArcCommandBar;
    'arc-command-item': ArcCommandItem;
    'arc-command-palette': ArcCommandPalette;
    'arc-comparison': ArcComparison;
    'arc-comparison-column': ArcComparisonColumn;
    'arc-confirm': ArcConfirm;
    'arc-connection-status': ArcConnectionStatus;
    'arc-container': ArcContainer;
    'arc-context-menu': ArcContextMenu;
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
    'arc-gradient-text': ArcGradientText;
    'arc-guided-tour': ArcGuidedTour;
    'arc-highlight': ArcHighlight;
    'arc-hotkey': ArcHotkey;
    'arc-hover-card': ArcHoverCard;
    'arc-icon': ArcIcon;
    'arc-icon-button': ArcIconButton;
    'arc-icon-library': ArcIconLibrary;
    'arc-image': ArcImage;
    'arc-image-cropper': ArcImageCropper;
    'arc-infinite-scroll': ArcInfiniteScroll;
    'arc-inline-message': ArcInlineMessage;
    'arc-input': ArcInput;
    'arc-input-group': ArcInputGroup;
    'arc-inset': ArcInset;
    'arc-kanban': ArcKanban;
    'arc-kbd': ArcKbd;
    'arc-key-value': ArcKeyValue;
    'arc-kv-pair': ArcKvPair;
    'arc-label': ArcLabel;
    'arc-link': ArcLink;
    'arc-list': ArcList;
    'arc-list-item': ArcListItem;
    'arc-loading-overlay': ArcLoadingOverlay;
    'arc-markdown': ArcMarkdown;
    'arc-marquee': ArcMarquee;
    'arc-masonry': ArcMasonry;
    'arc-menu-divider': ArcMenuDivider;
    'arc-menu-item': ArcMenuItem;
    'arc-menubar': ArcMenubar;
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
    'arc-text': ArcText;
    'arc-textarea': ArcTextarea;
    'arc-theme-toggle': ArcThemeToggle;
    'arc-time-ago': ArcTimeAgo;
    'arc-time-picker': ArcTimePicker;
    'arc-timeline': ArcTimeline;
    'arc-timeline-item': ArcTimelineItem;
    'arc-toast': ArcToast;
    'arc-toast-manager': ArcToastManager;
    'arc-toggle': ArcToggle;
    'arc-toolbar': ArcToolbar;
    'arc-tooltip': ArcTooltip;
    'arc-top-bar': ArcTopBar;
    'arc-transfer-list': ArcTransferList;
    'arc-tree-item': ArcTreeItem;
    'arc-tree-view': ArcTreeView;
    'arc-truncate': ArcTruncate;
    'arc-typewriter': ArcTypewriter;
    'arc-value-card': ArcValueCard;
    'arc-virtual-list': ArcVirtualList;
  }
}
