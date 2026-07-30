import '@arclux/arc-ui/split-pane';
import type { Snippet } from 'svelte';
interface Props {
    orientation?: 'horizontal' | 'vertical';
    ratio?: number;
    minRatio?: number;
    maxRatio?: number;
    /** <slot name="primary"> — put slot="primary" on the element inside. */
    primary?: Snippet;
    /** <slot name="secondary"> — put slot="secondary" on the element inside. */
    secondary?: Snippet;
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
declare const SplitPane: import("svelte").Component<Props, {}, "ratio">;
type SplitPane = ReturnType<typeof SplitPane>;
export default SplitPane;
