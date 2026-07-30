import '@arclux/arc-ui/feature-card';
import type { Snippet } from 'svelte';
interface Props {
    icon?: string;
    heading?: string;
    description?: string;
    href?: string;
    action?: string;
    /** <slot name="icon"> — put slot="icon" on the element inside. */
    icon_?: Snippet;
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
declare const FeatureCard: import("svelte").Component<Props, {}, "">;
type FeatureCard = ReturnType<typeof FeatureCard>;
export default FeatureCard;
