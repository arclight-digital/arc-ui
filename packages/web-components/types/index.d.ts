/**
 * @arclux/arc-ui — TypeScript declarations
 * Auto-generated type declarations for ARC UI web components.
 */

import { LitElement } from 'lit';

// ─────────────────────────────────────────────
// Content Tier
// ─────────────────────────────────────────────

export declare class ArcCard extends LitElement {
  href: string;
}

export declare class ArcFeatureCard extends LitElement {
  icon: string;
  heading: string;
  description: string;
  href: string;
}

export declare class ArcValueCard extends LitElement {
  icon: string;
  heading: string;
  description: string;
}

export declare class ArcText extends LitElement {
  variant: 'display' | 'heading' | 'body' | 'muted' | 'ghost' | 'accent' | 'label' | 'wordmark' | 'code';
  as: 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'span';
}

export declare class ArcDivider extends LitElement {
  variant: string;
}

export declare class ArcStat extends LitElement {
  value: string;
  label: string;
}

export declare class ArcBadge extends LitElement {
  variant: string;
}

export declare class ArcCodeBlock extends LitElement {
  language: string;
  filename: string;
  code: string;
}

export declare class ArcIcon extends LitElement {
  name: string;
  size: string;
  label: string;
}

export declare class ArcIconLibrary extends LitElement {
  name: string;
}

export declare class ArcLink extends LitElement {
  href: string;
  variant: string;
  active: boolean;
  external: boolean;
}

export declare class ArcTable extends LitElement {
  striped: boolean;
  compact: boolean;
}

export declare class ArcAvatar extends LitElement {
  src: string;
  name: string;
  size: string;
}

export declare class ArcAvatarGroup extends LitElement {
  max: number;
  overlap: string;
}

export declare class ArcCallout extends LitElement {
  variant: string;
}

export declare class ArcColorSwatch extends LitElement {
  color: string;
  label: string;
  size: string;
}

export declare class ArcEmptyState extends LitElement {
  heading: string;
  description: string;
}

export declare class ArcKbd extends LitElement {}

export declare class ArcSkeleton extends LitElement {
  variant: string;
  width: string;
  height: string;
}

export declare class ArcSpinner extends LitElement {
  size: string;
  variant: string;
}

export declare class ArcStepper extends LitElement {
  active: number;
}

export declare class ArcTimeline extends LitElement {}

export declare class ArcStep extends LitElement {
  label: string;
}

export declare class ArcTimelineItem extends LitElement {
  heading: string;
  date: string;
}

// ─────────────────────────────────────────────
// Reactive Tier
// ─────────────────────────────────────────────

export declare class ArcButton extends LitElement {
  variant: string;
  size: string;
  href: string;
  disabled: boolean;
  type: string;
}

export declare class ArcIconButton extends LitElement {
  name: string;
  text: string;
  variant: string;
  size: string;
  label: string;
  href: string;
  disabled: boolean;
  type: string;
}

export declare class ArcInput extends LitElement {
  type: string;
  name: string;
  label: string;
  placeholder: string;
  value: string;
  disabled: boolean;
  required: boolean;
  multiline: boolean;
  rows: number;
}

export declare class ArcAccordion extends LitElement {}

export declare class ArcAccordionItem extends LitElement {
  question: string;
}

export declare class ArcTab extends LitElement {
  label: string;
}

export declare class ArcTabs extends LitElement {
  items: Array<{ label: string; content: string }>;
  selected: number;
}

export declare class ArcToggle extends LitElement {
  checked: boolean;
  disabled: boolean;
  label: string;
  name: string;
}

export declare class ArcCheckbox extends LitElement {
  checked: boolean;
  indeterminate: boolean;
  disabled: boolean;
  label: string;
  name: string;
  value: string;
}

export declare class ArcRadioGroup extends LitElement {
  value: string;
  name: string;
  disabled: boolean;
  orientation: string;
}

export declare class ArcRadio extends LitElement {
  value: string;
  disabled: boolean;
}

export declare class ArcSelect extends LitElement {
  value: string;
  placeholder: string;
  label: string;
  name: string;
  disabled: boolean;
  open: boolean;
}

export declare class ArcAlert extends LitElement {
  variant: string;
  dismissible: boolean;
  heading: string;
}

export declare class ArcProgress extends LitElement {
  value: number;
  variant: string;
  size: string;
  indeterminate: boolean;
  label: string;
}

export declare class ArcModal extends LitElement {
  open: boolean;
  heading: string;
  size: string;
  closable: boolean;
}

export declare class ArcToast extends LitElement {
  position: string;
  duration: number;
  show(opts: { message: string; variant?: string; duration?: number }): void;
}

export declare class ArcTooltip extends LitElement {
  content: string;
  position: string;
  delay: number;
}

export declare class ArcDrawer extends LitElement {
  open: boolean;
  position: string;
  heading: string;
}

export declare class ArcCommandPalette extends LitElement {
  open: boolean;
  placeholder: string;
}

export declare class ArcCopyButton extends LitElement {
  value: string;
  disabled: boolean;
}

export declare class ArcDropdownMenu extends LitElement {
  open: boolean;
}

export declare class ArcPagination extends LitElement {
  total: number;
  current: number;
  siblings: number;
}

export declare class ArcPopover extends LitElement {
  open: boolean;
  position: string;
  trigger: string;
}

export declare class ArcSlider extends LitElement {
  value: number;
  min: number;
  max: number;
  step: number;
  disabled: boolean;
  label: string;
}

export declare class ArcTag extends LitElement {
  variant: string;
  removable: boolean;
  disabled: boolean;
}

export declare class ArcThemeToggle extends LitElement {
  theme: 'dark' | 'light' | 'auto';
  disabled: boolean;
  iconOnly: boolean;
}

export declare class ArcCalendar extends LitElement {
  value: string;
  min: string;
  max: string;
  month: number;
  year: number;
}

export declare class ArcCombobox extends LitElement {
  value: string;
  placeholder: string;
  label: string;
  disabled: boolean;
}

export declare class ArcContextMenu extends LitElement {
  open: boolean;
}

export declare class ArcDataTable extends LitElement {
  rows: any[];
  sortable: boolean;
  selectable: boolean;
  sortColumn: string;
  sortDirection: string;
}

export declare class ArcDatePicker extends LitElement {
  value: string;
  min: string;
  max: string;
  placeholder: string;
  disabled: boolean;
  label: string;
}

export declare class ArcFileUpload extends LitElement {
  accept: string;
  multiple: boolean;
  maxSize: number;
  disabled: boolean;
}

export declare class ArcForm extends LitElement {
  novalidate: boolean;
  submit(): void;
  reset(): void;
}

export declare class ArcHoverCard extends LitElement {
  position: string;
  openDelay: number;
  closeDelay: number;
}

export declare class ArcMultiSelect extends LitElement {
  value: string[];
  placeholder: string;
  label: string;
  disabled: boolean;
}

export declare class ArcSearch extends LitElement {
  value: string;
  placeholder: string;
  label: string;
  disabled: boolean;
  loading: boolean;
}

export declare class ArcTextarea extends LitElement {
  value: string;
  placeholder: string;
  label: string;
  rows: number;
  maxlength: number;
  disabled: boolean;
  readonly: boolean;
  resize: string;
  error: string;
}

export declare class ArcTreeView extends LitElement {}

export declare class ArcCommandItem extends LitElement {
  label: string;
  shortcut: string;
}

export declare class ArcSuggestion extends LitElement {
  value: string;
}

export declare class ArcTreeItem extends LitElement {
  label: string;
  icon: string;
  expanded: boolean;
}

export declare class ArcColumn extends LitElement {
  key: string;
  label: string;
  sortable: boolean;
  width: string;
}

// ─────────────────────────────────────────────
// Application Tier
// ─────────────────────────────────────────────

export declare class ArcAppShell extends LitElement {
  sidebarOpen: boolean;
}

export declare class ArcBreadcrumb extends LitElement {}

export declare class ArcContainer extends LitElement {
  narrow: boolean;
}

export declare class ArcNavigationMenu extends LitElement {}

export declare class ArcResizable extends LitElement {
  direction: string;
  minSize: number;
  maxSize: number;
  size: number;
}

export declare class ArcScrollSpy extends LitElement {
  active: string;
  offset: number;
}

export declare class ArcSection extends LitElement {
  label: string;
}

export declare class ArcSidebar extends LitElement {
  active: string;
  collapsed: boolean;
  width: string;
}

export declare class ArcTopBar extends LitElement {
  heading: string;
  fixed: boolean;
  menuOpen: boolean;
}

export declare class ArcAuthShell extends LitElement {
  variant: string;
}

export declare class ArcDashboardGrid extends LitElement {
  columns: number;
  gap: string;
  minColumnWidth: string;
}

export declare class ArcFooter extends LitElement {
  compact: boolean;
  border: boolean;
}

export declare class ArcNotificationPanel extends LitElement {
  open: boolean;
  position: string;
  maxHeight: string;
}

export declare class ArcPageHeader extends LitElement {
  heading: string;
  description: string;
}

export declare class ArcPageLayout extends LitElement {
  layout: string;
  maxWidth: string;
  gap: string;
}

export declare class ArcSettingsLayout extends LitElement {
  navPosition: string;
}

export declare class ArcSplitPane extends LitElement {
  orientation: string;
  ratio: number;
  minRatio: number;
  maxRatio: number;
}

export declare class ArcStatusBar extends LitElement {
  position: string;
}

export declare class ArcToolbar extends LitElement {
  sticky: boolean;
  size: string;
  border: boolean;
}

export declare class ArcBreadcrumbItem extends LitElement {
  href: string;
}

export declare class ArcSidebarSection extends LitElement {
  heading: string;
}

export declare class ArcSidebarLink extends LitElement {
  href: string;
  active: boolean;
}

export declare class ArcNavItem extends LitElement {
  href: string;
  active: boolean;
  description: string;
}

export declare class ArcSpyLink extends LitElement {
  target: string;
}

// ─────────────────────────────────────────────
// Shared
// ─────────────────────────────────────────────

export declare class ArcOption extends LitElement {
  value: string;
  disabled: boolean;
  selected: boolean;
}

export declare class ArcMenuItem extends LitElement {
  shortcut: string;
  disabled: boolean;
  icon: string;
}

export declare class ArcMenuDivider extends LitElement {}

// ─────────────────────────────────────────────
// Icon Registry
// ─────────────────────────────────────────────

export declare const iconRegistry: {
  use(library: string): void;
  set(icons: Record<string, string>): void;
  get(name: string): string | null;
};

// ─────────────────────────────────────────────
// HTMLElementTagNameMap augmentation
// ─────────────────────────────────────────────

declare global {
  interface HTMLElementTagNameMap {
    // Content
    'arc-card': ArcCard;
    'arc-feature-card': ArcFeatureCard;
    'arc-value-card': ArcValueCard;
    'arc-text': ArcText;
    'arc-divider': ArcDivider;
    'arc-stat': ArcStat;
    'arc-badge': ArcBadge;
    'arc-code-block': ArcCodeBlock;
    'arc-icon': ArcIcon;
    'arc-icon-library': ArcIconLibrary;
    'arc-link': ArcLink;
    'arc-table': ArcTable;
    'arc-avatar': ArcAvatar;
    'arc-avatar-group': ArcAvatarGroup;
    'arc-callout': ArcCallout;
    'arc-color-swatch': ArcColorSwatch;
    'arc-empty-state': ArcEmptyState;
    'arc-kbd': ArcKbd;
    'arc-skeleton': ArcSkeleton;
    'arc-spinner': ArcSpinner;
    'arc-stepper': ArcStepper;
    'arc-timeline': ArcTimeline;
    'arc-step': ArcStep;
    'arc-timeline-item': ArcTimelineItem;

    // Reactive
    'arc-button': ArcButton;
    'arc-icon-button': ArcIconButton;
    'arc-input': ArcInput;
    'arc-accordion': ArcAccordion;
    'arc-accordion-item': ArcAccordionItem;
    'arc-tab': ArcTab;
    'arc-tabs': ArcTabs;
    'arc-toggle': ArcToggle;
    'arc-checkbox': ArcCheckbox;
    'arc-radio-group': ArcRadioGroup;
    'arc-radio': ArcRadio;
    'arc-select': ArcSelect;
    'arc-alert': ArcAlert;
    'arc-progress': ArcProgress;
    'arc-modal': ArcModal;
    'arc-toast': ArcToast;
    'arc-tooltip': ArcTooltip;
    'arc-drawer': ArcDrawer;
    'arc-command-palette': ArcCommandPalette;
    'arc-copy-button': ArcCopyButton;
    'arc-dropdown-menu': ArcDropdownMenu;
    'arc-pagination': ArcPagination;
    'arc-popover': ArcPopover;
    'arc-slider': ArcSlider;
    'arc-tag': ArcTag;
    'arc-theme-toggle': ArcThemeToggle;
    'arc-calendar': ArcCalendar;
    'arc-combobox': ArcCombobox;
    'arc-context-menu': ArcContextMenu;
    'arc-data-table': ArcDataTable;
    'arc-date-picker': ArcDatePicker;
    'arc-file-upload': ArcFileUpload;
    'arc-form': ArcForm;
    'arc-hover-card': ArcHoverCard;
    'arc-multi-select': ArcMultiSelect;
    'arc-search': ArcSearch;
    'arc-textarea': ArcTextarea;
    'arc-tree-view': ArcTreeView;
    'arc-command-item': ArcCommandItem;
    'arc-suggestion': ArcSuggestion;
    'arc-tree-item': ArcTreeItem;
    'arc-column': ArcColumn;

    // Application
    'arc-app-shell': ArcAppShell;
    'arc-breadcrumb': ArcBreadcrumb;
    'arc-container': ArcContainer;
    'arc-navigation-menu': ArcNavigationMenu;
    'arc-resizable': ArcResizable;
    'arc-scroll-spy': ArcScrollSpy;
    'arc-section': ArcSection;
    'arc-sidebar': ArcSidebar;
    'arc-top-bar': ArcTopBar;
    'arc-auth-shell': ArcAuthShell;
    'arc-dashboard-grid': ArcDashboardGrid;
    'arc-footer': ArcFooter;
    'arc-notification-panel': ArcNotificationPanel;
    'arc-page-header': ArcPageHeader;
    'arc-page-layout': ArcPageLayout;
    'arc-settings-layout': ArcSettingsLayout;
    'arc-split-pane': ArcSplitPane;
    'arc-status-bar': ArcStatusBar;
    'arc-toolbar': ArcToolbar;
    'arc-breadcrumb-item': ArcBreadcrumbItem;
    'arc-sidebar-section': ArcSidebarSection;
    'arc-sidebar-link': ArcSidebarLink;
    'arc-nav-item': ArcNavItem;
    'arc-spy-link': ArcSpyLink;

    // Shared
    'arc-option': ArcOption;
    'arc-menu-item': ArcMenuItem;
    'arc-menu-divider': ArcMenuDivider;
  }
}

// ─────────────────────────────────────────────
// Module declarations for subpath exports
// ─────────────────────────────────────────────

declare module '@arclux/arc-ui' {
  export {
    // Content
    ArcCard,
    ArcFeatureCard,
    ArcValueCard,
    ArcText,
    ArcDivider,
    ArcStat,
    ArcBadge,
    ArcCodeBlock,
    ArcIcon,
    ArcIconLibrary,
    ArcLink,
    ArcTable,
    ArcAvatar,
    ArcAvatarGroup,
    ArcCallout,
    ArcColorSwatch,
    ArcEmptyState,
    ArcKbd,
    ArcSkeleton,
    ArcSpinner,
    ArcStepper,
    ArcTimeline,
    ArcStep,
    ArcTimelineItem,
    // Reactive
    ArcButton,
    ArcIconButton,
    ArcInput,
    ArcAccordion,
    ArcAccordionItem,
    ArcTab,
    ArcTabs,
    ArcToggle,
    ArcCheckbox,
    ArcRadioGroup,
    ArcRadio,
    ArcSelect,
    ArcAlert,
    ArcProgress,
    ArcModal,
    ArcToast,
    ArcTooltip,
    ArcDrawer,
    ArcCommandPalette,
    ArcCopyButton,
    ArcDropdownMenu,
    ArcPagination,
    ArcPopover,
    ArcSlider,
    ArcTag,
    ArcThemeToggle,
    ArcCalendar,
    ArcCombobox,
    ArcContextMenu,
    ArcDataTable,
    ArcDatePicker,
    ArcFileUpload,
    ArcForm,
    ArcHoverCard,
    ArcMultiSelect,
    ArcSearch,
    ArcTextarea,
    ArcTreeView,
    ArcCommandItem,
    ArcSuggestion,
    ArcTreeItem,
    ArcColumn,
    // Application
    ArcAppShell,
    ArcBreadcrumb,
    ArcContainer,
    ArcNavigationMenu,
    ArcResizable,
    ArcScrollSpy,
    ArcSection,
    ArcSidebar,
    ArcTopBar,
    ArcAuthShell,
    ArcDashboardGrid,
    ArcFooter,
    ArcNotificationPanel,
    ArcPageHeader,
    ArcPageLayout,
    ArcSettingsLayout,
    ArcSplitPane,
    ArcStatusBar,
    ArcToolbar,
    ArcBreadcrumbItem,
    ArcSidebarSection,
    ArcSidebarLink,
    ArcNavItem,
    ArcSpyLink,
    // Shared
    ArcOption,
    ArcMenuItem,
    ArcMenuDivider,
    // Icon Registry
    iconRegistry,
  };
}

declare module '@arclux/arc-ui/content' {
  export {
    ArcCard,
    ArcFeatureCard,
    ArcValueCard,
    ArcText,
    ArcDivider,
    ArcStat,
    ArcBadge,
    ArcCodeBlock,
    ArcIcon,
    ArcIconLibrary,
    ArcLink,
    ArcTable,
    ArcAvatar,
    ArcAvatarGroup,
    ArcCallout,
    ArcColorSwatch,
    ArcEmptyState,
    ArcKbd,
    ArcSkeleton,
    ArcSpinner,
    ArcStepper,
    ArcTimeline,
    ArcStep,
    ArcTimelineItem,
    iconRegistry,
  };
}

declare module '@arclux/arc-ui/reactive' {
  export {
    ArcButton,
    ArcIconButton,
    ArcInput,
    ArcAccordion,
    ArcAccordionItem,
    ArcTab,
    ArcTabs,
    ArcToggle,
    ArcCheckbox,
    ArcRadioGroup,
    ArcRadio,
    ArcSelect,
    ArcAlert,
    ArcProgress,
    ArcModal,
    ArcToast,
    ArcTooltip,
    ArcDrawer,
    ArcCommandPalette,
    ArcCopyButton,
    ArcDropdownMenu,
    ArcPagination,
    ArcPopover,
    ArcSlider,
    ArcTag,
    ArcThemeToggle,
    ArcCalendar,
    ArcCombobox,
    ArcContextMenu,
    ArcDataTable,
    ArcDatePicker,
    ArcFileUpload,
    ArcForm,
    ArcHoverCard,
    ArcMultiSelect,
    ArcSearch,
    ArcTextarea,
    ArcTreeView,
    ArcCommandItem,
    ArcSuggestion,
    ArcTreeItem,
    ArcColumn,
  };
}

declare module '@arclux/arc-ui/application' {
  export {
    ArcAppShell,
    ArcBreadcrumb,
    ArcContainer,
    ArcNavigationMenu,
    ArcResizable,
    ArcScrollSpy,
    ArcSection,
    ArcSidebar,
    ArcTopBar,
    ArcAuthShell,
    ArcDashboardGrid,
    ArcFooter,
    ArcNotificationPanel,
    ArcPageHeader,
    ArcPageLayout,
    ArcSettingsLayout,
    ArcSplitPane,
    ArcStatusBar,
    ArcToolbar,
    ArcBreadcrumbItem,
    ArcSidebarSection,
    ArcSidebarLink,
    ArcNavItem,
    ArcSpyLink,
  };
}

declare module '@arclux/arc-ui/icon-registry' {
  export { iconRegistry };
}

declare module '@arclux/arc-ui/button' {
  export { ArcButton };
}

declare module '@arclux/arc-ui/input' {
  export { ArcInput };
}

declare module '@arclux/arc-ui/accordion' {
  export { ArcAccordion };
}

declare module '@arclux/arc-ui/tabs' {
  export { ArcTabs };
}

declare module '@arclux/arc-ui/toggle' {
  export { ArcToggle };
}

declare module '@arclux/arc-ui/checkbox' {
  export { ArcCheckbox };
}

declare module '@arclux/arc-ui/radio-group' {
  export { ArcRadioGroup };
}

declare module '@arclux/arc-ui/select' {
  export { ArcSelect };
}

declare module '@arclux/arc-ui/alert' {
  export { ArcAlert };
}

declare module '@arclux/arc-ui/progress' {
  export { ArcProgress };
}

declare module '@arclux/arc-ui/modal' {
  export { ArcModal };
}

declare module '@arclux/arc-ui/toast' {
  export { ArcToast };
}

declare module '@arclux/arc-ui/tooltip' {
  export { ArcTooltip };
}

declare module '@arclux/arc-ui/card' {
  export { ArcCard };
}

declare module '@arclux/arc-ui/feature-card' {
  export { ArcFeatureCard };
}

declare module '@arclux/arc-ui/value-card' {
  export { ArcValueCard };
}

declare module '@arclux/arc-ui/container' {
  export { ArcContainer };
}

declare module '@arclux/arc-ui/section' {
  export { ArcSection };
}

declare module '@arclux/arc-ui/text' {
  export { ArcText };
}

declare module '@arclux/arc-ui/divider' {
  export { ArcDivider };
}

declare module '@arclux/arc-ui/stat' {
  export { ArcStat };
}

declare module '@arclux/arc-ui/badge' {
  export { ArcBadge };
}

declare module '@arclux/arc-ui/tokens' {
  export const tokens: Record<string, string>;
}
