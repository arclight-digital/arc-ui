import '@arclux/arc-ui/toolbar';
import type { Snippet } from 'svelte';
interface Props {
    sticky?: boolean;
    size?: 'md' | 'sm';
    border?: boolean;
    overflow?: boolean;
    /** <slot name="start"> — put slot="start" on the element inside. */
    start?: Snippet;
    /** <slot name="end"> — put slot="end" on the element inside. */
    end?: Snippet;
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
declare const Toolbar: import("svelte").Component<Props, {}, "">;
type Toolbar = ReturnType<typeof Toolbar>;
export default Toolbar;
