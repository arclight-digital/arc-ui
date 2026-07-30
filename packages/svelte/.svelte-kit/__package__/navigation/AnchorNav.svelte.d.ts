import '@arclux/arc-ui/anchor-nav';
import type { Snippet } from 'svelte';
interface Props {
    orientation?: 'vertical' | 'horizontal';
    value?: string;
    items?: Array<{
        label: string;
        value: string;
    }>;
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
declare const AnchorNav: import("svelte").Component<Props, {}, "value">;
type AnchorNav = ReturnType<typeof AnchorNav>;
export default AnchorNav;
