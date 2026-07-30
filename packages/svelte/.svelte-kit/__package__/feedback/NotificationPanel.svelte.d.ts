import '@arclux/arc-ui/notification-panel';
import type { Snippet } from 'svelte';
interface Props {
    open?: boolean;
    position?: 'top-right' | 'top-left';
    maxHeight?: string;
    /** <slot name="trigger"> — put slot="trigger" on the element inside. */
    trigger?: Snippet;
    /** <slot name="header"> — put slot="header" on the element inside. */
    header?: Snippet;
    /** <slot name="footer"> — put slot="footer" on the element inside. */
    footer?: Snippet;
    children?: Snippet;
    class?: string;
    id?: string;
    style?: string;
    title?: string;
    role?: string;
    slot?: string;
    part?: string;
    exportparts?: string;
    dir?: string;
    lang?: string;
    translate?: string;
    accesskey?: string;
    enterkeyhint?: string;
    inputmode?: string;
    popover?: string;
    contenteditable?: boolean | string;
    tabindex?: number;
    hidden?: boolean;
    inert?: boolean;
    draggable?: boolean;
    spellcheck?: boolean;
    autofocus?: boolean;
    [key: `data-${string}`]: unknown;
    [key: `aria-${string}`]: unknown;
    [key: `on${string}`]: unknown;
}
declare const NotificationPanel: import("svelte").Component<Props, {}, "">;
type NotificationPanel = ReturnType<typeof NotificationPanel>;
export default NotificationPanel;
