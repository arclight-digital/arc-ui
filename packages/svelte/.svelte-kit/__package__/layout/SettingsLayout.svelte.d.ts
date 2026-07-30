import '@arclux/arc-ui/settings-layout';
import type { Snippet } from 'svelte';
interface Props {
    navPosition?: 'left' | 'top';
    /** <slot name="nav"> — put slot="nav" on the element inside. */
    nav?: Snippet;
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
declare const SettingsLayout: import("svelte").Component<Props, {}, "">;
type SettingsLayout = ReturnType<typeof SettingsLayout>;
export default SettingsLayout;
