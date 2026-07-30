import '@arclux/arc-ui/card';
import type { Snippet } from 'svelte';
interface Props {
    href?: string;
    padding?: 'none' | 'sm' | 'md' | 'lg';
    interactive?: boolean;
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
declare const Card: import("svelte").Component<Props, {}, "">;
type Card = ReturnType<typeof Card>;
export default Card;
