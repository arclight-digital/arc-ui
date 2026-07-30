import '@arclux/arc-ui/breadcrumb-menu';
interface Props {
    items?: Array<{
        label: string;
        href?: string;
        siblings?: Array<{
            label: string;
            href?: string;
        }>;
    }>;
    label?: string;
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
declare const BreadcrumbMenu: import("svelte").Component<Props, {}, "">;
type BreadcrumbMenu = ReturnType<typeof BreadcrumbMenu>;
export default BreadcrumbMenu;
