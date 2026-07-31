import '@arclux/arc-ui/uptime';
interface Props {
    data?: Array<number | {
        value?: number;
        status?: 'up' | 'degraded' | 'down' | 'none';
        label?: string;
    }>;
    startLabel?: string;
    endLabel?: string;
    summary?: string;
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
declare const Uptime: import("svelte").Component<Props, {}, "">;
type Uptime = ReturnType<typeof Uptime>;
export default Uptime;
