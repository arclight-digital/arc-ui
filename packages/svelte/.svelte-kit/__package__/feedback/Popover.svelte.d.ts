import '@arclux/arc-ui/popover';
import type { Snippet } from 'svelte';
interface Props {
    open?: boolean;
    position?: 'top' | 'bottom' | 'left' | 'right';
    trigger?: string;
    /** <slot name="trigger"> — put slot="trigger" on the element inside. */
    trigger_?: Snippet;
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
declare const Popover: import("svelte").Component<Props, {}, "">;
type Popover = ReturnType<typeof Popover>;
export default Popover;
