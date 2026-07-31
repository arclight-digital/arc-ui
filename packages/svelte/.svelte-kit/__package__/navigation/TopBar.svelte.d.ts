import '@arclux/arc-ui/top-bar';
import type { Snippet } from 'svelte';
interface Props {
    heading?: string;
    homeHref?: string;
    scrolled?: boolean;
    immersive?: boolean;
    fixed?: boolean;
    contained?: string;
    menuOpen?: boolean;
    mobileMenu?: string;
    menuPosition?: string;
    navAlign?: 'left' | 'center' | 'right';
    /** <slot name="logo"> — put slot="logo" on the element inside. */
    logo?: Snippet;
    /** <slot name="subtitle"> — put slot="subtitle" on the element inside. */
    subtitle?: Snippet;
    /** <slot name="center"> — put slot="center" on the element inside. */
    center?: Snippet;
    /** <slot name="actions"> — put slot="actions" on the element inside. */
    actions?: Snippet;
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
declare const TopBar: import("svelte").Component<Props, {}, "">;
type TopBar = ReturnType<typeof TopBar>;
export default TopBar;
