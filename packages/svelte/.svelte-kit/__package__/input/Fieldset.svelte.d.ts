import '@arclux/arc-ui/fieldset';
import type { Snippet } from 'svelte';
interface Props {
    legend?: string;
    description?: string;
    disabled?: boolean;
    error?: string;
    variant?: 'default' | 'card';
    /** <slot name="legend"> — put slot="legend" on the element inside. */
    legend_?: Snippet;
    /** <slot name="actions"> — put slot="actions" on the element inside. */
    actions?: Snippet;
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
declare const Fieldset: import("svelte").Component<Props, {}, "">;
type Fieldset = ReturnType<typeof Fieldset>;
export default Fieldset;
