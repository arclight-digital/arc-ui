import '@arclux/arc-ui/kanban';
import type { Snippet } from 'svelte';
interface Props {
    columns?: Array<{
        id: string;
        title?: string;
        limit?: number;
        items: Array<{
            id: string;
            label: string;
            description?: string;
            tag?: string;
            variant?: string;
        }>;
    }>;
    disabled?: boolean;
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
declare const Kanban: import("svelte").Component<Props, {}, "">;
type Kanban = ReturnType<typeof Kanban>;
export default Kanban;
