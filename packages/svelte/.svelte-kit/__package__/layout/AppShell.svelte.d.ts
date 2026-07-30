import '@arclux/arc-ui/app-shell';
import type { Snippet } from 'svelte';
interface Props {
    sidebarOpen?: boolean;
    breakpoint?: number;
    /** <slot name="topbar"> — put slot="topbar" on the element inside. */
    topbar?: Snippet;
    /** <slot name="sidebar"> — put slot="sidebar" on the element inside. */
    sidebar?: Snippet;
    /** <slot name="toc"> — put slot="toc" on the element inside. */
    toc?: Snippet;
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
declare const AppShell: import("svelte").Component<Props, {}, "">;
type AppShell = ReturnType<typeof AppShell>;
export default AppShell;
