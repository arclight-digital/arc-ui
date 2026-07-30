import '@arclux/arc-ui/context-menu';
import type { Snippet } from 'svelte';
interface Props {
    open?: boolean;
    /** <slot name="content"> — put slot="content" on the element inside. */
    content?: Snippet;
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
declare const ContextMenu: import("svelte").Component<Props, {}, "">;
type ContextMenu = ReturnType<typeof ContextMenu>;
export default ContextMenu;
