import '@arclux/arc-ui/callout';
import type { Snippet } from 'svelte';
interface Props {
    variant?: 'info' | 'tip' | 'warning' | 'error';
    dismissible?: boolean;
    /** <slot name="icon"> — put slot="icon" on the element inside. */
    icon?: Snippet;
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
declare const Callout: import("svelte").Component<Props, {}, "">;
type Callout = ReturnType<typeof Callout>;
export default Callout;
