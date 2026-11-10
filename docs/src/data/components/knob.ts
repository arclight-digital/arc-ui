import type { ComponentDef } from './_types';

export const knob: ComponentDef = {
  name: 'Knob',
  slug: 'knob',
  tag: 'arc-knob',
  tier: 'input',
  interactivity: 'interactive',
  description:
    'A rotary knob you drag up or down to set a number, like a gain or volume control on a synth.',
  searchKeywords: ['dial', 'rotary', 'potentiometer', 'synth', 'gain', 'volume'],

  overview: `Knob is a rotary control that fits a full parameter range into a small circle, so a rack of channel strips or a synth panel can put a dozen side by side. A 270-degree arc fills from \`min\` to the current value, a glowing line marks the position, and the readout below uses tabular monospace digits so its width doesn't change as you turn.

It works like the knobs in audio software. Drag vertically to turn it: the full range takes about 150 pixels of travel, and holding Shift slows the drag to a tenth. The mouse wheel and arrow keys move by \`step\`, Page Up and Page Down by ten steps, and Home and End go to \`min\` and \`max\`. \`detents\` lists values to snap to. Each gets a tick mark around the dial, and a drag snaps to one when it comes within 2.5% of the range. The wheel and keys ignore detents.

\`arc-input\` fires on every change while the knob turns. \`arc-change\` fires when a drag is released and after each wheel notch or key step, so a live preview and an expensive save can listen separately.`,

  features: [
    'Pointer capture keeps a drag going when the pointer leaves the dial',
    '`format` shapes both the readout and the accessible value text',
    'Takes part in forms through ElementInternals. The value submits under `name` and is restored on `form.reset()`',
    'Keyboard-operable `role="slider"` with `aria-valuemin`, `aria-valuemax`, `aria-valuenow` and `aria-valuetext`',
  ],

  guidelines: {
    do: [
      'Use it where horizontal space is short and controls stack in columns: mixer strips, effect panels, tool palettes',
      'Give it a `label`. A bare dial doesn\'t say what it controls',
      'Set `format` to include the unit, so the readout and screen readers say "440 Hz" and not "440"',
      'Put a detent at the neutral point of a two-sided parameter: 0 on a pan knob, unity on a gain knob',
    ],
    dont: [
      'Don\'t use a knob for a single value in a wide layout. A slider shows its whole range at a size a knob can\'t',
      'Don\'t use it for exact numbers. Pair it with Number Input, or use Number Input alone, when people need to type a value',
      'Don\'t put a detent every few units. Smooth dragging becomes impossible',
      'Don\'t hide the readout. It\'s part of the control',
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
