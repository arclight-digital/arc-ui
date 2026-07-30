import '@arclux/arc-ui/modal';
import type { Snippet } from 'svelte';
interface Props {
    open?: boolean;
    heading?: string;
    size?: 'sm' | 'md' | 'lg';
    fullscreen?: boolean;
    closable?: boolean;
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
declare const Modal: import("svelte").Component<Props, {}, "">;
type Modal = ReturnType<typeof Modal>;
export default Modal;
