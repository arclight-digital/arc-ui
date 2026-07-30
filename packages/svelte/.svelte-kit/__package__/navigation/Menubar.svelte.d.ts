import '@arclux/arc-ui/menubar';
interface Props {
    items?: Array<{
        label: string;
        disabled?: boolean;
        items: Array<{
            label?: string;
            shortcut?: string;
            disabled?: boolean;
            divider?: boolean;
            items?: Array<{
                label: string;
                shortcut?: string;
                disabled?: boolean;
            }>;
        }>;
    }>;
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
declare const Menubar: import("svelte").Component<Props, {}, "">;
type Menubar = ReturnType<typeof Menubar>;
export default Menubar;
