import '@arclux/arc-ui/footer';
import type { Snippet } from 'svelte';
interface Props {
    compact?: boolean;
    border?: boolean;
    contained?: string;
    align?: 'left' | 'center';
    /** <slot name="logo"> — put slot="logo" on the element inside. */
    logo?: Snippet;
    /** <slot name="social"> — put slot="social" on the element inside. */
    social?: Snippet;
    /** <slot name="legal"> — put slot="legal" on the element inside. */
    legal?: Snippet;
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
declare const Footer: import("svelte").Component<Props, {}, "">;
type Footer = ReturnType<typeof Footer>;
export default Footer;
