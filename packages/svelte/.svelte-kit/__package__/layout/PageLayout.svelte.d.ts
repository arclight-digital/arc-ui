import '@arclux/arc-ui/page-layout';
import type { Snippet } from 'svelte';
interface Props {
    layout?: 'sidebar-left' | 'sidebar-right' | 'centered' | 'wide';
    maxWidth?: string;
    gap?: string;
    /** <slot name="sidebar"> — put slot="sidebar" on the element inside. */
    sidebar?: Snippet;
    /** <slot name="aside"> — put slot="aside" on the element inside. */
    aside?: Snippet;
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
declare const PageLayout: import("svelte").Component<Props, {}, "">;
type PageLayout = ReturnType<typeof PageLayout>;
export default PageLayout;
