import '@arclux/arc-ui/speed-dial';
import type { Snippet } from 'svelte';
interface Props {
    open?: boolean;
    direction?: 'up' | 'down' | 'left' | 'right';
    position?: 'bottom-right' | 'bottom-left';
    items?: Array<{
        icon: string;
        label: string;
        value?: string;
    }>;
    /** <slot name="trigger"> — put slot="trigger" on the element inside. */
    trigger?: Snippet;
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
declare const SpeedDial: import("svelte").Component<Props, {}, "">;
type SpeedDial = ReturnType<typeof SpeedDial>;
export default SpeedDial;
