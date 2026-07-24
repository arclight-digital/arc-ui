// Generated from custom-elements.json by scripts/generate-types.js — do not edit
// Opt-in JSX typings for using ARC UI custom elements directly in React 19
// (no wrapper). Enable via tsconfig:
//   { "compilerOptions": { "types": ["@arclux/arc-ui/react-jsx"] } }
// or per file:
//   /// <reference types="@arclux/arc-ui/react-jsx" />

export {};

type ArcBaseAttributes = {
  children?: unknown;
  key?: string | number | null;
  ref?: unknown;
  class?: string;
  className?: string;
  style?: unknown;
  id?: string;
  slot?: string;
  part?: string;
  hidden?: boolean;
  title?: string;
  role?: string;
  tabIndex?: number;
} & { [attr: `data-${string}`]: unknown } & { [attr: `aria-${string}`]: unknown } & {
  [attr: `on${string}`]: unknown;
};

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'arc-accordion': ArcBaseAttributes & {
        multiple?: boolean;
      };
      'arc-accordion-item': ArcBaseAttributes & {
        question?: string;
      };
      'arc-alert': ArcBaseAttributes & {
        variant?: 'info' | 'success' | 'warning' | 'error';
        compact?: boolean;
        dismissible?: boolean;
        heading?: string;
      };
      'arc-anchor-nav': ArcBaseAttributes & {
        orientation?: 'vertical' | 'horizontal';
        value?: string;
        items?: string;
      };
      'arc-animated-number': ArcBaseAttributes & {
        value?: number | string;
        duration?: number | string;
        format?: 'number' | 'currency' | 'percent';
        prefix?: string;
        suffix?: string;
        decimals?: number | string;
        locale?: string;
      };
      'arc-announcement': ArcBaseAttributes & {
        politeness?: 'polite' | 'assertive';
        message?: string;
      };
      'arc-app-shell': ArcBaseAttributes & {
        'sidebar-open'?: boolean;
        breakpoint?: number | string;
      };
      'arc-aspect-grid': ArcBaseAttributes & {
        columns?: number | string;
        ratio?: '1/1' | '16/9' | '4/3';
        gap?: 'sm' | 'md' | 'lg';
      };
      'arc-aspect-ratio': ArcBaseAttributes & {
        ratio?: string;
      };
      'arc-auth-shell': ArcBaseAttributes & {
        variant?: 'centered' | 'split';
      };
      'arc-avatar': ArcBaseAttributes & {
        src?: string;
        name?: string;
        size?: 'sm' | 'md' | 'lg';
        shape?: 'circle' | 'square' | 'rounded';
        status?: 'online' | 'offline' | 'busy' | 'away';
      };
      'arc-avatar-group': ArcBaseAttributes & {
        max?: number | string;
        overlap?: 'sm' | 'md' | 'lg';
      };
      'arc-badge': ArcBaseAttributes & {
        variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
        size?: 'sm' | 'md' | 'lg';
        color?: string;
      };
      'arc-banner': ArcBaseAttributes & {
        variant?: 'info' | 'success' | 'warning' | 'error';
        dismissible?: boolean;
        sticky?: boolean;
      };
      'arc-blockquote': ArcBaseAttributes & {
        cite?: string;
        variant?: 'default' | 'accent';
      };
      'arc-bottom-nav': ArcBaseAttributes & {
        items?: string;
        value?: string;
      };
      'arc-breadcrumb': ArcBaseAttributes & {
        separator?: string;
        label?: string;
      };
      'arc-breadcrumb-item': ArcBaseAttributes & {
        href?: string;
      };
      'arc-breadcrumb-menu': ArcBaseAttributes & {
        items?: string;
        label?: string;
      };
      'arc-button': ArcBaseAttributes & {
        variant?: 'primary' | 'secondary' | 'ghost';
        size?: 'sm' | 'md' | 'lg';
        href?: string;
        disabled?: boolean;
        loading?: boolean;
        type?: 'button' | 'submit' | 'reset';
      };
      'arc-button-group': ArcBaseAttributes & {
        orientation?: 'horizontal' | 'vertical';
        size?: 'sm' | 'md' | 'lg';
        variant?: string;
      };
      'arc-calendar': ArcBaseAttributes & {
        value?: string;
        min?: string;
        max?: string;
        month?: number | string;
        year?: number | string;
      };
      'arc-callout': ArcBaseAttributes & {
        variant?: 'info' | 'warning' | 'tip' | 'danger';
        dismissible?: boolean;
      };
      'arc-card': ArcBaseAttributes & {
        href?: string;
        padding?: 'none' | 'sm' | 'md' | 'lg';
        interactive?: boolean;
      };
      'arc-carousel': ArcBaseAttributes & {
        'auto-play'?: boolean;
        interval?: number | string;
        loop?: boolean;
        'show-dots'?: boolean;
        'show-arrows'?: boolean;
      };
      'arc-center': ArcBaseAttributes & {
        'max-width'?: string;
        intrinsic?: boolean;
        text?: boolean;
      };
      'arc-chart': ArcBaseAttributes & {
        type?: 'line' | 'area' | 'bar' | 'donut';
        series?: string;
        labels?: string;
        stacked?: boolean;
        'hide-legend'?: boolean;
        'hide-axis'?: boolean;
        height?: number | string;
        'value-format'?: 'number' | 'percent' | 'currency';
        currency?: string;
      };
      'arc-checkbox': ArcBaseAttributes & {
        checked?: boolean;
        indeterminate?: boolean;
        disabled?: boolean;
        size?: string;
        label?: string;
        name?: string;
        value?: string;
      };
      'arc-chip': ArcBaseAttributes & {
        selected?: boolean;
        disabled?: boolean;
        value?: string;
      };
      'arc-cluster': ArcBaseAttributes & {
        gap?: 'xs' | 'sm' | 'md' | 'lg';
        align?: 'start' | 'center' | 'end';
        justify?: 'start' | 'center' | 'end' | 'between';
      };
      'arc-code-block': ArcBaseAttributes & {
        language?: string;
        filename?: string;
        code?: string;
        variant?: 'default' | 'window' | 'basic';
      };
      'arc-collapsible': ArcBaseAttributes & {
        open?: boolean;
        heading?: string;
      };
      'arc-color-picker': ArcBaseAttributes & {
        value?: string;
        name?: string;
        presets?: string;
        disabled?: boolean;
        label?: string;
      };
      'arc-color-swatch': ArcBaseAttributes & {
        color?: string;
        label?: string;
        size?: 'sm' | 'md' | 'lg';
      };
      'arc-column': ArcBaseAttributes & {
        key?: string;
        label?: string;
        sortable?: boolean;
        width?: string;
      };
      'arc-combobox': ArcBaseAttributes & {
        value?: string;
        placeholder?: string;
        label?: string;
        name?: string;
        disabled?: boolean;
      };
      'arc-command-bar': ArcBaseAttributes & {
        placeholder?: string;
        value?: string;
        icon?: string;
      };
      'arc-command-group': ArcBaseAttributes & {
        heading?: string;
      };
      'arc-command-item': ArcBaseAttributes & {
        shortcut?: string;
        icon?: string;
        keywords?: string;
      };
      'arc-command-palette': ArcBaseAttributes & {
        open?: boolean;
        placeholder?: string;
      };
      'arc-comparison': ArcBaseAttributes & {
        features?: string;
      };
      'arc-comparison-column': ArcBaseAttributes & {
        heading?: string;
        highlight?: boolean;
        values?: string;
      };
      'arc-confirm': ArcBaseAttributes & {
        open?: boolean;
        heading?: string;
        message?: string;
        'confirm-label'?: string;
        'cancel-label'?: string;
        variant?: 'default' | 'danger';
      };
      'arc-connection-status': ArcBaseAttributes & {
        online?: string;
      };
      'arc-container': ArcBaseAttributes & {
        narrow?: boolean;
        size?: string;
        padding?: string;
      };
      'arc-context-menu': ArcBaseAttributes & {
        open?: boolean;
      };
      'arc-copy-button': ArcBaseAttributes & {
        value?: string;
        disabled?: boolean;
      };
      'arc-countdown-timer': ArcBaseAttributes & {
        target?: string;
        label?: string;
        expired?: string;
        'hide-zero-segments'?: boolean;
      };
      'arc-cta-banner': ArcBaseAttributes & {
        eyebrow?: string;
        headline?: string;
        nogradient?: boolean;
      };
      'arc-dashboard-grid': ArcBaseAttributes & {
        columns?: number | string;
        gap?: string;
        'min-column-width'?: string;
      };
      'arc-data-grid': ArcBaseAttributes & {
        columns?: string;
        rows?: string;
        sort?: string;
        'manual-sort'?: boolean;
        selectable?: boolean;
        virtual?: boolean;
        'row-height'?: number | string;
      };
      'arc-data-table': ArcBaseAttributes & {
        rows?: string;
        sortable?: boolean;
        selectable?: boolean;
        'sort-column'?: string;
        'sort-direction'?: 'asc' | 'desc';
        virtual?: boolean;
        'row-height'?: number | string;
      };
      'arc-date-picker': ArcBaseAttributes & {
        value?: string;
        name?: string;
        min?: string;
        max?: string;
        placeholder?: string;
        disabled?: boolean;
        label?: string;
      };
      'arc-date-range-picker': ArcBaseAttributes & {
        start?: string;
        end?: string;
        name?: string;
        min?: string;
        max?: string;
        months?: number | string;
        presets?: string;
        placeholder?: string;
        disabled?: boolean;
        required?: boolean;
        label?: string;
      };
      'arc-description-item': ArcBaseAttributes & {
        term?: string;
      };
      'arc-description-list': ArcBaseAttributes & {
        columns?: number | string;
        dividers?: boolean;
      };
      'arc-dialog': ArcBaseAttributes & {
        open?: boolean;
        heading?: string;
        message?: string;
        'confirm-label'?: string;
        'cancel-label'?: string;
        variant?: 'default' | 'danger';
      };
      'arc-diff': ArcBaseAttributes & {
        before?: string;
        after?: string;
        mode?: string;
      };
      'arc-divider': ArcBaseAttributes & {
        variant?: 'subtle' | 'glow' | 'line-white' | 'line-primary' | 'line-gradient';
        align?: 'left' | 'right';
        vertical?: boolean;
        label?: string;
      };
      'arc-dock': ArcBaseAttributes & {
        position?: 'bottom' | 'left' | 'right';
        'auto-hide'?: boolean;
        open?: boolean;
      };
      'arc-drawer': ArcBaseAttributes & {
        open?: boolean;
        position?: 'left' | 'right';
        heading?: string;
      };
      'arc-dropdown-menu': ArcBaseAttributes & {
        open?: boolean;
      };
      'arc-empty-state': ArcBaseAttributes & {
        heading?: string;
        description?: string;
      };
      'arc-event-calendar': ArcBaseAttributes & {
        events?: string;
        view?: 'month' | 'week';
        date?: string;
      };
      'arc-feature-card': ArcBaseAttributes & {
        icon?: string;
        heading?: string;
        description?: string;
        href?: string;
        action?: string;
      };
      'arc-fieldset': ArcBaseAttributes & {
        legend?: string;
        description?: string;
        disabled?: boolean;
        error?: string;
        variant?: 'default' | 'card';
      };
      'arc-file-upload': ArcBaseAttributes & {
        accept?: string;
        multiple?: boolean;
        'max-size'?: number | string;
        disabled?: boolean;
      };
      'arc-float-bar': ArcBaseAttributes & {
        open?: boolean;
        position?: 'bottom' | 'top';
      };
      'arc-footer': ArcBaseAttributes & {
        compact?: boolean;
        border?: boolean;
        contained?: string;
        align?: string;
      };
      'arc-form': ArcBaseAttributes & {
        action?: string;
        method?: string;
        novalidate?: boolean;
        loading?: boolean;
        disabled?: boolean;
        'error-summary'?: boolean;
      };
      'arc-gradient-text': ArcBaseAttributes & {
        variant?: 'accent' | 'display' | 'sunset' | 'ocean' | 'custom';
        gradient?: string;
        animate?: boolean;
      };
      'arc-guided-tour': ArcBaseAttributes & {
        steps?: string;
        active?: number | string;
        open?: boolean;
      };
      'arc-highlight': ArcBaseAttributes & {
        text?: string;
        query?: string;
        'case-sensitive'?: boolean;
      };
      'arc-hotkey': ArcBaseAttributes & {
        keys?: string;
        disabled?: boolean;
        global?: boolean;
      };
      'arc-hover-card': ArcBaseAttributes & {
        position?: 'bottom' | 'top' | 'left' | 'right';
        'open-delay'?: number | string;
        'close-delay'?: number | string;
      };
      'arc-icon': ArcBaseAttributes & {
        name?: string;
        size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
        label?: string;
      };
      'arc-icon-button': ArcBaseAttributes & {
        name?: string;
        text?: string;
        variant?: 'ghost' | 'secondary' | 'primary';
        size?: 'xs' | 'sm' | 'md' | 'lg';
        label?: string;
        href?: string;
        disabled?: boolean;
        type?: string;
      };
      'arc-icon-library': ArcBaseAttributes & {
        name?: string;
      };
      'arc-image': ArcBaseAttributes & {
        src?: string;
        alt?: string;
        aspect?: '1/1' | '4/3' | '16/9' | '21/9' | '3/4' | '9/16';
        fit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
        loading?: 'lazy' | 'eager';
        fallback?: string;
      };
      'arc-image-cropper': ArcBaseAttributes & {
        src?: string;
        height?: number | string;
        aspect?: number | string;
        zoom?: number | string;
      };
      'arc-infinite-scroll': ArcBaseAttributes & {
        threshold?: number | string;
        loading?: boolean;
        finished?: boolean;
        disabled?: boolean;
      };
      'arc-inline-message': ArcBaseAttributes & {
        variant?: 'info' | 'success' | 'warning' | 'error';
      };
      'arc-input': ArcBaseAttributes & {
        type?: 'text' | 'email' | 'tel' | 'url' | 'password';
        name?: string;
        label?: string;
        placeholder?: string;
        value?: string;
        disabled?: boolean;
        required?: boolean;
        error?: string;
        size?: 'sm' | 'md' | 'lg';
        multiline?: boolean;
        rows?: number | string;
      };
      'arc-input-group': ArcBaseAttributes & {
        size?: 'sm' | 'md' | 'lg';
      };
      'arc-inset': ArcBaseAttributes & {
        space?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
        bleed?: boolean;
      };
      'arc-kanban': ArcBaseAttributes & {
        columns?: string;
        disabled?: boolean;
      };
      'arc-kbd': ArcBaseAttributes;
      'arc-key-value': ArcBaseAttributes & {
        layout?: 'horizontal' | 'stacked';
        dividers?: boolean;
      };
      'arc-kv-pair': ArcBaseAttributes & {
        label?: string;
      };
      'arc-label': ArcBaseAttributes & {
        for?: string;
        required?: boolean;
        size?: 'sm' | 'md' | 'lg';
        disabled?: boolean;
      };
      'arc-link': ArcBaseAttributes & {
        href?: string;
        variant?: 'default' | 'muted' | 'nav';
        underline?: string;
        active?: boolean;
        external?: boolean;
      };
      'arc-list': ArcBaseAttributes & {
        variant?: 'default' | 'bordered' | 'separated';
        size?: 'sm' | 'md' | 'lg';
        selectable?: boolean;
        multiple?: boolean;
        value?: string;
        label?: string;
      };
      'arc-list-item': ArcBaseAttributes & {
        value?: string;
        selected?: boolean;
        disabled?: boolean;
        href?: string;
      };
      'arc-loading-overlay': ArcBaseAttributes & {
        active?: boolean;
        message?: string;
        global?: boolean;
      };
      'arc-markdown': ArcBaseAttributes & {
        content?: string;
      };
      'arc-marquee': ArcBaseAttributes & {
        speed?: number | string;
        direction?: 'left' | 'right';
        'pause-on-hover'?: boolean;
        gap?: string;
      };
      'arc-masonry': ArcBaseAttributes & {
        columns?: number | string;
        gap?: 'sm' | 'md' | 'lg';
      };
      'arc-menu-divider': ArcBaseAttributes;
      'arc-menu-item': ArcBaseAttributes & {
        shortcut?: string;
        disabled?: boolean;
        icon?: string;
      };
      'arc-menubar': ArcBaseAttributes & {
        items?: string;
      };
      'arc-meter': ArcBaseAttributes & {
        value?: number | string;
        min?: number | string;
        max?: number | string;
        low?: number | string;
        high?: number | string;
        optimum?: number | string;
        label?: string;
      };
      'arc-modal': ArcBaseAttributes & {
        open?: boolean;
        heading?: string;
        size?: 'sm' | 'md' | 'lg';
        fullscreen?: boolean;
        closable?: boolean;
      };
      'arc-multi-select': ArcBaseAttributes & {
        value?: string;
        placeholder?: string;
        label?: string;
        name?: string;
        disabled?: boolean;
      };
      'arc-nav-item': ArcBaseAttributes & {
        href?: string;
        active?: boolean;
        variant?: 'default' | 'primary' | 'muted';
        description?: string;
      };
      'arc-navigation-menu': ArcBaseAttributes & {
        label?: string;
      };
      'arc-notification-panel': ArcBaseAttributes & {
        open?: boolean;
        position?: 'top-right' | 'top-left';
        'max-height'?: string;
      };
      'arc-number-format': ArcBaseAttributes & {
        value?: number | string;
        type?: 'number' | 'currency' | 'percent' | 'compact';
        locale?: string;
        currency?: string;
        decimals?: number | string;
        notation?: 'standard' | 'compact';
      };
      'arc-number-input': ArcBaseAttributes & {
        value?: number | string;
        min?: number | string;
        max?: number | string;
        step?: number | string;
        label?: string;
        name?: string;
        disabled?: boolean;
      };
      'arc-option': ArcBaseAttributes & {
        value?: string;
        disabled?: boolean;
        selected?: boolean;
      };
      'arc-otp-input': ArcBaseAttributes & {
        length?: number | string;
        value?: string;
        name?: string;
        disabled?: boolean;
        type?: 'number' | 'text';
      };
      'arc-page-header': ArcBaseAttributes & {
        heading?: string;
        description?: string;
        border?: boolean;
      };
      'arc-page-indicator': ArcBaseAttributes & {
        count?: number | string;
        value?: number | string;
        clickable?: boolean;
      };
      'arc-page-layout': ArcBaseAttributes & {
        layout?: 'sidebar-left' | 'sidebar-right' | 'centered' | 'wide';
        'max-width'?: string;
        gap?: string;
      };
      'arc-pagination': ArcBaseAttributes & {
        total?: number | string;
        current?: number | string;
        siblings?: number | string;
        compact?: boolean;
      };
      'arc-password-input': ArcBaseAttributes & {
        name?: string;
        label?: string;
        placeholder?: string;
        value?: string;
        disabled?: boolean;
        required?: boolean;
        error?: string;
        size?: 'sm' | 'md' | 'lg';
        autocomplete?: string;
        'show-strength'?: boolean;
      };
      'arc-pin-input': ArcBaseAttributes & {
        length?: number | string;
        value?: string;
        name?: string;
        disabled?: boolean;
        mask?: boolean;
        type?: 'number' | 'alphanumeric' | 'text';
        separator?: number | string;
        label?: string;
      };
      'arc-popover': ArcBaseAttributes & {
        open?: boolean;
        position?: 'top' | 'bottom' | 'left' | 'right';
        trigger?: string;
      };
      'arc-progress': ArcBaseAttributes & {
        value?: number | string;
        variant?: 'bar' | 'spinner';
        size?: 'sm' | 'md' | 'lg';
        indeterminate?: boolean;
        'show-value'?: boolean;
        label?: string;
      };
      'arc-progress-toast': ArcBaseAttributes & {
        position?: 'top-right' | 'bottom-right';
      };
      'arc-prose': ArcBaseAttributes & {
        size?: 'sm' | 'md' | 'lg';
      };
      'arc-qr-code': ArcBaseAttributes & {
        value?: string;
        size?: number | string;
        level?: 'L' | 'M' | 'Q' | 'H';
        label?: string;
        'quiet-zone'?: number | string;
        contrast?: boolean;
      };
      'arc-radio': ArcBaseAttributes & {
        value?: string;
        disabled?: boolean;
      };
      'arc-radio-group': ArcBaseAttributes & {
        value?: string;
        name?: string;
        disabled?: boolean;
        size?: string;
        orientation?: 'vertical' | 'horizontal';
      };
      'arc-rail': ArcBaseAttributes & {
        items?: string;
        value?: string;
        expanded?: boolean;
      };
      'arc-range-slider': ArcBaseAttributes & {
        min?: number | string;
        max?: number | string;
        step?: number | string;
        low?: number | string;
        high?: number | string;
        name?: string;
        disabled?: boolean;
        label?: string;
        'show-values'?: boolean;
      };
      'arc-rating': ArcBaseAttributes & {
        value?: number | string;
        max?: number | string;
        name?: string;
        disabled?: boolean;
        readonly?: boolean;
      };
      'arc-resizable': ArcBaseAttributes & {
        direction?: 'horizontal' | 'vertical';
        'min-size'?: number | string;
        'max-size'?: number | string;
        size?: number | string;
      };
      'arc-responsive-switcher': ArcBaseAttributes & {
        threshold?: string;
        gap?: 'sm' | 'md' | 'lg';
      };
      'arc-scroll-area': ArcBaseAttributes & {
        'max-height'?: string;
        orientation?: 'vertical' | 'horizontal' | 'both';
      };
      'arc-scroll-indicator': ArcBaseAttributes & {
        target?: string;
        position?: 'top' | 'bottom';
        size?: 'sm' | 'md' | 'lg';
        color?: 'accent' | 'gradient';
      };
      'arc-scroll-spy': ArcBaseAttributes & {
        active?: string;
        offset?: number | string;
      };
      'arc-scroll-to-top': ArcBaseAttributes & {
        threshold?: number | string;
        smooth?: boolean;
        position?: string;
        offset?: string;
      };
      'arc-search': ArcBaseAttributes & {
        value?: string;
        placeholder?: string;
        label?: string;
        disabled?: boolean;
        loading?: boolean;
      };
      'arc-section': ArcBaseAttributes & {
        label?: string;
      };
      'arc-segmented-control': ArcBaseAttributes & {
        value?: string;
        disabled?: boolean;
      };
      'arc-select': ArcBaseAttributes & {
        value?: string;
        placeholder?: string;
        label?: string;
        name?: string;
        disabled?: boolean;
        size?: string;
        error?: string;
        open?: boolean;
      };
      'arc-separator': ArcBaseAttributes & {
        orientation?: 'horizontal' | 'vertical';
        label?: string;
        variant?: 'line' | 'dashed' | 'dotted' | 'fade';
      };
      'arc-settings-layout': ArcBaseAttributes & {
        'nav-position'?: 'left' | 'top';
      };
      'arc-sheet': ArcBaseAttributes & {
        open?: boolean;
        side?: 'bottom' | 'right';
        heading?: string;
      };
      'arc-sidebar': ArcBaseAttributes & {
        active?: string;
        collapsed?: boolean;
        position?: string;
        width?: string;
        glow?: boolean;
        label?: string;
      };
      'arc-sidebar-link': ArcBaseAttributes & {
        href?: string;
        active?: boolean;
        level?: number | string;
      };
      'arc-sidebar-section': ArcBaseAttributes & {
        heading?: string;
        collapsible?: boolean;
        open?: boolean;
      };
      'arc-skeleton': ArcBaseAttributes & {
        variant?: 'text' | 'circle' | 'rect';
        width?: string;
        height?: string;
        count?: number | string;
      };
      'arc-skip-link': ArcBaseAttributes & {
        target?: string;
      };
      'arc-slider': ArcBaseAttributes & {
        value?: number | string;
        min?: number | string;
        max?: number | string;
        step?: number | string;
        name?: string;
        disabled?: boolean;
        label?: string;
      };
      'arc-snackbar': ArcBaseAttributes & {
        position?: 'bottom-center' | 'bottom-left' | 'bottom-right';
        duration?: number | string;
      };
      'arc-sortable-list': ArcBaseAttributes & {
        disabled?: boolean;
      };
      'arc-sparkline': ArcBaseAttributes & {
        data?: string;
        type?: 'line' | 'bar';
        color?: string;
        width?: number | string;
        height?: number | string;
        fill?: boolean;
      };
      'arc-speed-dial': ArcBaseAttributes & {
        open?: boolean;
        direction?: 'up' | 'down' | 'left' | 'right';
        position?: 'bottom-right' | 'bottom-left';
        items?: string;
      };
      'arc-spinner': ArcBaseAttributes & {
        size?: 'sm' | 'md' | 'lg';
        variant?: 'primary' | 'secondary' | 'white';
      };
      'arc-split-pane': ArcBaseAttributes & {
        orientation?: 'horizontal' | 'vertical';
        ratio?: number | string;
        'min-ratio'?: number | string;
        'max-ratio'?: number | string;
      };
      'arc-spotlight': ArcBaseAttributes & {
        target?: string;
        active?: boolean;
        padding?: number | string;
      };
      'arc-spy-link': ArcBaseAttributes & {
        target?: string;
        level?: number | string;
      };
      'arc-stack': ArcBaseAttributes & {
        direction?: 'vertical' | 'horizontal';
        gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
        align?: 'start' | 'center' | 'end' | 'stretch';
        justify?: 'start' | 'center' | 'end' | 'between' | 'around';
        wrap?: boolean;
      };
      'arc-stat': ArcBaseAttributes & {
        value?: string;
        label?: string;
        trend?: string;
        change?: string;
      };
      'arc-status-bar': ArcBaseAttributes & {
        position?: 'static' | 'fixed';
      };
      'arc-step': ArcBaseAttributes & {
        label?: string;
      };
      'arc-stepper': ArcBaseAttributes & {
        active?: number | string;
      };
      'arc-stepper-nav': ArcBaseAttributes & {
        steps?: string;
        active?: number | string;
        linear?: boolean;
      };
      'arc-sticky': ArcBaseAttributes & {
        offset?: string;
        stuck?: boolean;
      };
      'arc-suggestion': ArcBaseAttributes & {
        value?: string;
      };
      'arc-switch-group': ArcBaseAttributes & {
        label?: string;
        orientation?: 'vertical' | 'horizontal';
        size?: 'sm' | 'md' | 'lg';
        disabled?: boolean;
      };
      'arc-tab': ArcBaseAttributes & {
        label?: string;
      };
      'arc-table': ArcBaseAttributes & {
        columns?: string;
        rows?: string;
        striped?: boolean;
        compact?: boolean;
      };
      'arc-tabs': ArcBaseAttributes & {
        selected?: number | string;
        align?: 'start' | 'center' | 'end';
        variant?: 'underline' | 'pills';
        orientation?: 'horizontal' | 'vertical';
      };
      'arc-tag': ArcBaseAttributes & {
        variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
        size?: string;
        removable?: boolean;
        disabled?: boolean;
        color?: string;
      };
      'arc-tag-input': ArcBaseAttributes & {
        value?: string;
        suggestions?: string;
        delimiter?: string;
        'max-tags'?: number | string;
        'allow-custom'?: boolean;
        label?: string;
        placeholder?: string;
        name?: string;
        disabled?: boolean;
        error?: string;
      };
      'arc-text': ArcBaseAttributes & {
        variant?: 'display' | 'heading' | 'body' | 'muted' | 'ghost' | 'accent' | 'label' | 'wordmark' | 'code';
        as?: 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'span';
      };
      'arc-textarea': ArcBaseAttributes & {
        value?: string;
        placeholder?: string;
        label?: string;
        rows?: number | string;
        maxlength?: number | string;
        disabled?: boolean;
        readonly?: boolean;
        resize?: 'none' | 'vertical' | 'horizontal' | 'both';
        size?: 'sm' | 'md' | 'lg';
        'auto-resize'?: boolean;
        error?: string;
      };
      'arc-theme-toggle': ArcBaseAttributes & {
        theme?: 'dark' | 'light' | 'auto';
        disabled?: boolean;
        'icon-only'?: boolean;
      };
      'arc-time-ago': ArcBaseAttributes & {
        datetime?: string;
        live?: boolean;
        locale?: string;
      };
      'arc-time-picker': ArcBaseAttributes & {
        value?: string;
        name?: string;
        min?: string;
        max?: string;
        step?: number | string;
        format?: string;
        placeholder?: string;
        disabled?: boolean;
        label?: string;
      };
      'arc-timeline': ArcBaseAttributes & {
        'heading-level'?: number | string;
      };
      'arc-timeline-item': ArcBaseAttributes & {
        heading?: string;
        date?: string;
      };
      'arc-toast': ArcBaseAttributes & {
        position?: 'top-right' | 'top-left' | 'top-center' | 'bottom-right' | 'bottom-left' | 'bottom-center';
        duration?: number | string;
      };
      'arc-toast-manager': ArcBaseAttributes & {
        position?: 'top-right' | 'top-left' | 'top-center' | 'bottom-right' | 'bottom-left' | 'bottom-center';
        duration?: number | string;
        'max-visible'?: number | string;
        dedupe?: boolean;
        'queue-limit'?: number | string;
      };
      'arc-toggle': ArcBaseAttributes & {
        checked?: boolean;
        disabled?: boolean;
        size?: string;
        label?: string;
        name?: string;
      };
      'arc-toolbar': ArcBaseAttributes & {
        sticky?: boolean;
        size?: 'md' | 'sm';
        border?: boolean;
        overflow?: boolean;
      };
      'arc-tooltip': ArcBaseAttributes & {
        content?: string;
        position?: 'top' | 'bottom' | 'left' | 'right';
        delay?: number | string;
      };
      'arc-top-bar': ArcBaseAttributes & {
        heading?: string;
        fixed?: boolean;
        contained?: string;
        'menu-open'?: boolean;
        'mobile-menu'?: string;
        'menu-position'?: string;
        'nav-align'?: string;
      };
      'arc-transfer-list': ArcBaseAttributes & {
        options?: string;
        value?: string;
        name?: string;
        disabled?: boolean;
        searchable?: boolean;
        'source-label'?: string;
        'target-label'?: string;
      };
      'arc-tree-item': ArcBaseAttributes & {
        label?: string;
        icon?: string;
        expanded?: boolean;
      };
      'arc-tree-view': ArcBaseAttributes;
      'arc-truncate': ArcBaseAttributes & {
        lines?: number | string;
        expanded?: boolean;
      };
      'arc-typewriter': ArcBaseAttributes & {
        text?: string;
        speed?: number | string;
        delay?: number | string;
        cursor?: boolean;
        loop?: boolean;
        nowrap?: boolean;
        'pause-end'?: number | string;
      };
      'arc-value-card': ArcBaseAttributes & {
        icon?: string;
        heading?: string;
        description?: string;
      };
      'arc-virtual-list': ArcBaseAttributes & {
        items?: string;
        'item-height'?: number | string;
        overscan?: number | string;
      };
    }
  }
}
