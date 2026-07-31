import type { ComponentDef } from './_types';

export const knob: ComponentDef = {
  name: 'Knob',
  slug: 'knob',
  tag: 'arc-knob',
  tier: 'input',
  interactivity: 'interactive',
  description:
    'Rotary knob input for continuous parameters, with a glowing 270-degree arc fill, vertical-drag interaction, magnetic detents, and a monospace value readout.',
  searchKeywords: ['dial', 'rotary', 'potentiometer', 'synth', 'gain', 'volume'],

  overview: `Knob is the input a slider cannot be: a rotary control that packs a full parameter range into a compact circular footprint, so a rack of channel strips or a synth panel can put a dozen of them side by side. A 270-degree arc track fills from \`min\` to the current value, a glowing indicator line marks the position, and the readout below renders in the monospace role with tabular digits so it never shifts width while turning.

Interaction follows audio-software convention. Dragging vertically turns the knob — the full range covers about 150 pixels of travel, and holding Shift slows the drag to a tenth for fine adjustment. The mouse wheel and arrow keys step by \`step\`, Page Up and Page Down jump by ten steps, and Home and End go straight to the rails. The optional \`detents\` prop names snap values (an array from script, or a comma-separated attribute): each renders as a tick mark around the dial, and a drag snaps magnetically when it lands close — the centre detent on a pan knob, unity on a gain knob. Keyboard and wheel stepping ignore detents, so precise entry is never fought.

Knob follows the v3 edit/commit contract: \`arc-input\` fires continuously while the knob turns and \`arc-change\` fires once when the turn commits, so a live preview and an expensive save can listen separately. The component participates in forms through ElementInternals, submitting its value under \`name\`, and the dial is a keyboard-operable \`role="slider"\` with the full ARIA value set — \`format\` shapes both the visible readout and the accessible value text, so a screen reader hears "440 Hz" rather than a bare number.`,

  features: [
    'A 270-degree SVG arc track with an accent fill from `min` to the current value and a glowing indicator line',
    'Synth-style vertical drag with pointer capture; Shift slows the drag to a tenth for fine adjustment',
    'Mouse wheel and arrow keys step by `step`, Page Up/Down by ten steps, Home/End to the rails',
    'Optional `detents` render tick marks and snap the drag magnetically to named values',
    '`format` callback shapes the readout and the ARIA value text, e.g. adding a unit suffix',
    'The v3 event contract: `arc-input` continuously while turning, `arc-change` once on commit',
    'Form participation via ElementInternals — the value submits under `name` and restores on `form.reset()`',
    'Keyboard-operable `role="slider"` dial with `aria-valuemin`, `aria-valuemax`, `aria-valuenow`, and `aria-valuetext`',
  ],

  guidelines: {
    do: [
      'Use Knob where horizontal space is scarce and controls sit in columns — mixer strips, effect panels, tool palettes',
      'Provide a `label`; a bare dial gives no clue what parameter it turns',
      'Set `format` to include the unit, so both the readout and screen readers announce "440 Hz" rather than "440"',
      'Put a detent at the neutral position of a bipolar parameter — 0 on a pan knob, unity on a gain knob',
      'Listen to `arc-input` for live audible or visible preview and to `arc-change` for persisting the committed value',
    ],
    dont: [
      'Do not use Knob for a wide-layout single value where a slider fits — a slider shows its whole range at a size a knob cannot',
      'Do not use Knob for exact numeric entry — pair it with or replace it by Number Input when users need to type a value',
      'Do not scatter detents densely across the range; a magnet every few units makes smooth dragging impossible',
      'Do not rely on the dial alone to convey the value — the readout below it is part of the control, so leave it visible',
    ],
  },

  previewHtml: `<div style="display:flex; align-items:center; gap:40px; flex-wrap:wrap; justify-content:center;">
  <arc-knob id="knob-demo-cutoff" label="Cutoff" value="8000" min="200" max="16000" step="100"></arc-knob>
  <arc-knob id="knob-demo-reso" label="Resonance" value="35" min="0" max="100" detents="0,50,100"></arc-knob>
  <div id="knob-demo-lamp" style="width:64px; height:64px; border-radius:50%; background:rgba(var(--accent-primary-rgb),0.35); border:1px solid var(--border-default);"></div>
</div>`,

  previewSetup: `const cutoff = document.getElementById('knob-demo-cutoff');
const reso = document.getElementById('knob-demo-reso');
const lamp = document.getElementById('knob-demo-lamp');
cutoff.format = (v) => v >= 1000 ? (v / 1000).toFixed(1) + ' kHz' : v + ' Hz';
const paint = () => {
  const brightness = (cutoff.value - 200) / 15800;
  const spread = reso.value / 100;
  lamp.style.opacity = String(0.35 + brightness * 0.65);
  lamp.style.boxShadow = '0 0 ' + Math.round(8 + spread * 40) + 'px rgba(var(--accent-primary-rgb), ' + (0.2 + spread * 0.6).toFixed(2) + ')';
};
paint();
cutoff.addEventListener('arc-input', paint);
reso.addEventListener('arc-input', paint);`,

  tabs: [
    {
      label: 'Web Component',
      lang: 'html',
      code: `<script type="module" src="@arclux/arc-ui"></script>

<!-- Basic labeled knob -->
<arc-knob label="Volume" value="75" min="0" max="100"></arc-knob>

<!-- Bipolar pan knob with a centre detent -->
<arc-knob label="Pan" value="0" min="-50" max="50" detents="0"></arc-knob>

<!-- Filter cutoff with a formatted readout -->
<arc-knob id="cutoff" label="Cutoff" value="8000" min="200" max="16000" step="100"></arc-knob>

<!-- Disabled state -->
<arc-knob label="Locked" value="30" disabled></arc-knob>

<script>
  const cutoff = document.getElementById('cutoff');
  cutoff.format = (v) => v >= 1000 ? (v / 1000).toFixed(1) + ' kHz' : v + ' Hz';

  // Real-time preview while turning
  cutoff.addEventListener('arc-input', (e) => {
    filterNode.frequency.value = e.detail.value;
  });

  // Commit final value on release
  cutoff.addEventListener('arc-change', (e) => {
    savePatch({ cutoff: e.detail.value });
  });
</script>`,
    },
    {
      label: 'React',
      lang: 'tsx',
      code: `import { Knob } from '@arclux/arc-ui-react';
import { useState } from 'react';

function ChannelStrip() {
  const [gain, setGain] = useState(0);
  const [pan, setPan] = useState(0);

  return (
    <div style={{ display: 'flex', gap: 32 }}>
      <Knob
        label="Gain"
        value={gain}
        min={-24}
        max={12}
        step={0.5}
        detents={[0]}
        format={(v) => \`\${v > 0 ? '+' : ''}\${v} dB\`}
        onArcInput={(e) => setGain(e.detail.value)}
        onArcChange={(e) => saveGain(e.detail.value)}
      />
      <Knob
        label="Pan"
        value={pan}
        min={-50}
        max={50}
        detents={[0]}
        format={(v) => (v === 0 ? 'C' : v < 0 ? \`L\${-v}\` : \`R\${v}\`)}
        onArcInput={(e) => setPan(e.detail.value)}
      />
    </div>
  );
}`,
    },
    {
      label: 'Vue',
      lang: 'html',
      code: `<script setup>
import { Knob } from '@arclux/arc-ui-vue';
import { ref } from 'vue';

const cutoff = ref(8000);
const resonance = ref(35);

const hz = (v) => (v >= 1000 ? (v / 1000).toFixed(1) + ' kHz' : v + ' Hz');
</script>

<template>
  <div style="display:flex; gap:32px;">
    <Knob label="Cutoff" :value="cutoff" :min="200" :max="16000" :step="100"
      :format="hz"
      @arc-input="cutoff = $event.detail.value" />
    <Knob label="Resonance" :value="resonance" :min="0" :max="100"
      :detents="[0, 50, 100]"
      @arc-input="resonance = $event.detail.value" />
  </div>
</template>`,
    },
    {
      label: 'Svelte',
      lang: 'html',
      code: `<script>
  import { Knob } from '@arclux/arc-ui-svelte';

  let attack = 12;
  let decay = 240;
  let sustain = 70;
  let release = 480;

  const ms = (v) => v + ' ms';
</script>

<div style="display:flex; gap:24px;">
  <Knob label="Attack" value={attack} min={0} max={2000} step={4} format={ms}
    on:arc-input={(e) => attack = e.detail.value} />
  <Knob label="Decay" value={decay} min={0} max={2000} step={4} format={ms}
    on:arc-input={(e) => decay = e.detail.value} />
  <Knob label="Sustain" value={sustain} min={0} max={100}
    on:arc-input={(e) => sustain = e.detail.value} />
  <Knob label="Release" value={release} min={0} max={4000} step={8} format={ms}
    on:arc-input={(e) => release = e.detail.value} />
</div>`,
    },
    {
      label: 'Angular',
      lang: 'ts',
      code: `import { Component } from '@angular/core';
import { Knob } from '@arclux/arc-ui-angular';

@Component({
  imports: [Knob],
  template: \`
    <div style="display:flex; gap:32px;">
      <arc-knob label="Drive" [value]="drive" [min]="0" [max]="100"
        (arc-input)="drive = $event.detail.value"></arc-knob>

      <arc-knob label="Mix" [value]="mix" [min]="0" [max]="100"
        [detents]="[50]"
        (arc-input)="onMixPreview($event.detail.value)"
        (arc-change)="onMixCommit($event.detail.value)"></arc-knob>
    </div>
  \`,
})
export class EffectPanelComponent {
  drive = 40;
  mix = 50;

  onMixPreview(val: number) { /* live wet/dry preview */ }
  onMixCommit(val: number) { /* persist to the patch */ }
}`,
    },
    {
      label: 'Solid',
      lang: 'tsx',
      code: `import { Knob } from '@arclux/arc-ui-solid';
import { createSignal } from 'solid-js';

function MasterSection() {
  const [volume, setVolume] = createSignal(75);

  return (
    <div>
      <Knob
        label="Master"
        value={volume()}
        min={0}
        max={100}
        format={(v) => v + '%'}
        onArcInput={(e) => setVolume(e.detail.value)}
        onArcChange={(e) => persistVolume(e.detail.value)}
      />
    </div>
  );
}`,
    },
    {
      label: 'Preact',
      lang: 'tsx',
      code: `import { Knob } from '@arclux/arc-ui-preact';
import { useState } from 'preact/hooks';

function SendControls() {
  const [reverb, setReverb] = useState(20);
  const [delay, setDelay] = useState(0);

  return (
    <div style={{ display: 'flex', gap: 24 }}>
      <Knob label="Reverb" value={reverb} min={0} max={100}
        onArcInput={(e) => setReverb(e.detail.value)} />
      <Knob label="Delay" value={delay} min={0} max={100}
        onArcInput={(e) => setDelay(e.detail.value)} />
    </div>
  );
}`,
    },
    {
      label: 'HTML',
      lang: 'html',
      code: `<!-- arc-knob is interactive — requires JS -->
<arc-knob></arc-knob>`,
    },
    {
      label: 'HTML (Inline)',
      lang: 'html',
      code: `<!-- arc-knob is interactive — requires JS -->
<arc-knob></arc-knob>`,
    },
  ],

  seeAlso: ['slider', 'range-slider', 'number-input'],
};
