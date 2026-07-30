import '@arclux/arc-ui/dropdown-menu';
import type { Snippet } from 'svelte';
interface Props {
    open?: boolean;
    /** <slot name="trigger"> — put slot="trigger" on the element inside. */
    trigger?: Snippet;
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
declare const DropdownMenu: import("svelte").Component<Props, {}, "">;
type DropdownMenu = ReturnType<typeof DropdownMenu>;
export default DropdownMenu;
