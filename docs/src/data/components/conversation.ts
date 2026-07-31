import type { ComponentDef } from './_types';

export const conversation: ComponentDef = {
  name: 'Conversation',
  slug: 'conversation',
  tag: 'arc-conversation',
  tier: 'feedback',
  interactivity: 'interactive',
  description:
    'An AI chat transcript: role-attributed messages in a scrollable column that follows new replies without ever yanking a reader who scrolled up. Built as the assist panel for AI products.',
  searchKeywords: [
    'chat',
    'ai',
    'assistant',
    'transcript',
    'streaming',
    'typing indicator',
    'messages',
  ],

  overview: `Conversation is the transcript surface for an AI assistant panel. Slot \`<arc-message>\` children into it and each one takes a voice from its speaker attribute: user messages align to the inline end on a faint accent tint, assistant messages answer from the inline start on a neutral surface, and system messages run centered and muted for notices in the transcript's own voice. Because alignment is built on logical properties, the whole layout mirrors automatically in RTL.

The container is the scroll area, and it knows the one rule every chat interface lives by: while the reader is near the bottom, new or growing messages keep the view pinned to the latest; the moment they scroll up to re-read, the transcript stays put. The \`arc-scroll-away\` and \`arc-scroll-return\` events report those transitions with the distance from the bottom, so a consumer can float a "jump to latest" chip and wire it to the \`scrollToEnd()\` method.

Streaming needs no API of its own — a message body is its default slot, so appending text to the slot streams the reply in. With the \`markdown\` attribute set, the slotted text renders through the house markdown renderer and re-parses as it grows, and a \`pending\` message shows the typing indicator until the first tokens arrive. The transcript server-renders in full, typing dots included.`,

  features: [
    'Three message voices: user on an accent tint at the inline end, assistant on a neutral surface, system centered and muted',
    'Auto-scroll follows new and growing messages — only while the reader is already near the bottom',
    '`arc-scroll-away` / `arc-scroll-return` events with the distance from the bottom, for a "jump to latest" chip',
    '`scrollToEnd()` method to jump the transcript to its newest message',
    'Streaming-friendly: append text to a message slot and the view keeps up',
    'Markdown rendering of message bodies through `arc-markdown`, re-parsed as streamed text grows',
    'Typing indicator on `pending` messages, replaced by a static ellipsis under `prefers-reduced-motion`',
    'Relative timestamps through `arc-time-ago`, with the absolute date on hover',
    'An `avatar` slot on each message for products that want faces — none are built in',
    'RTL mirrors automatically: alignment is logical-properties only',
    'Server-renders in full, pending dots included',
  ],

  guidelines: {
    do: [
      'Use Conversation for a dialogue between the user and a responder — the role attribution and scroll behavior are the point',
      "Stream a reply by appending to the message's slotted text (for example, updating textContent as tokens arrive); with markdown set it re-renders as it grows",
      'Show a pending assistant message the moment a request is sent, then fill its slot when tokens arrive',
      'Give messages timestamps as ISO strings and let the house relative-time rendering do the rest',
      'Listen for arc-scroll-away to float a "jump to latest" chip, and clear it on arc-scroll-return',
      'Size the transcript with the --conversation-height custom property, or let it fill a sized parent',
    ],
    dont: [
      "Do not use Conversation for an activity feed or event history — that is Timeline's job, where entries mark moments rather than speakers",
      'Do not use it as a general item column — a List handles collections that no one is talking to',
      'Do not scroll the reader to the bottom yourself on new messages — the component already follows, and only when the reader wants it to',
      'Do not put critical status in a system message alone; it scrolls away with the transcript',
      'Do not build avatars into every product by reflex — the avatar slot is there for the products that need one',
    ],
  },

  previewHtml: `<arc-conversation style="--conversation-height: 340px; width: min(560px, 100%)">
  <arc-message speaker="system">Project "Neon Tides" opened — the assistant can see your arrangement.</arc-message>
  <arc-message speaker="user" author="You" id="demo-conv-1">How do I loop the chorus while I try out lead takes?</arc-message>
  <arc-message speaker="assistant" author="daw[n]" markdown id="demo-conv-2">Drag the **loop brace** over bars 17-24, then:

1. Press L to switch looping on
2. Arm the lead track
3. Hit record — every pass lands on its own take lane</arc-message>
  <arc-message speaker="user" author="You" id="demo-conv-3">Can it keep every take, or just the last one?</arc-message>
  <arc-message speaker="assistant" author="daw[n]" pending></arc-message>
</arc-conversation>`,
  previewSetup: `const stamps = [
  ['demo-conv-1', 6 * 60000],
  ['demo-conv-2', 5 * 60000],
  ['demo-conv-3', 60000],
];
for (const [id, ago] of stamps) {
  const msg = el.querySelector('#' + id);
  if (msg) msg.timestamp = new Date(Date.now() - ago).toISOString();
}`,
  previewLayout: 'center',
  previewHeight: '420px',

  subComponents: [
    {
      name: 'Message',
      tag: 'arc-message',
      description:
        'One message in the transcript. The speaker attribute picks the voice (user, assistant, or system), author and timestamp fill the muted meta line, markdown renders the slotted text through the house renderer, and pending shows the typing indicator until a reply arrives.',
    },
  ],

  tabs: [
    {
      label: 'Web Component',
      lang: 'html',
      code: `<arc-conversation style="--conversation-height: 400px">
  <arc-message speaker="user" author="You" timestamp="2026-07-31T14:02:00Z">
    How do I loop the chorus while I try out lead takes?
  </arc-message>
  <arc-message speaker="assistant" author="daw[n]" markdown timestamp="2026-07-31T14:02:04Z">
    Drag the **loop brace** over bars 17-24, press L, then arm the
    lead track — every pass lands on its own take lane.
  </arc-message>
  <arc-message speaker="assistant" author="daw[n]" pending></arc-message>
</arc-conversation>

<script>
  // Streaming: fill the pending message as tokens arrive.
  const reply = document.querySelector('arc-message[pending]');
  function onToken(token) {
    reply.pending = false;
    reply.markdown = true;
    reply.textContent += token;
  }
</script>`,
    },
    {
      label: 'React',
      lang: 'tsx',
      code: `import { Conversation, Message } from '@arclux/arc-ui-react';

export default function AssistPanel({ messages, streaming }) {
  return (
    <Conversation style={{ '--conversation-height': '400px' }}>
      {messages.map((m) => (
        <Message key={m.id} speaker={m.role} author={m.author} timestamp={m.at} markdown>
          {m.text}
        </Message>
      ))}
      {streaming && <Message speaker="assistant" author="daw[n]" pending />}
    </Conversation>
  );
}`,
    },
    {
      label: 'Vue',
      lang: 'html',
      code: `<script setup>
import { Conversation, Message } from '@arclux/arc-ui-vue';
defineProps(['messages', 'streaming']);
</script>

<template>
  <Conversation style="--conversation-height: 400px">
    <Message
      v-for="m in messages"
      :key="m.id"
      :speaker="m.role"
      :author="m.author"
      :timestamp="m.at"
      markdown
    >{{ m.text }}</Message>
    <Message v-if="streaming" speaker="assistant" author="daw[n]" pending />
  </Conversation>
</template>`,
    },
    {
      label: 'Svelte',
      lang: 'html',
      code: `<script>
  import { Conversation, Message } from '@arclux/arc-ui-svelte';
  export let messages = [];
  export let streaming = false;
</script>

<Conversation style="--conversation-height: 400px">
  {#each messages as m (m.id)}
    <Message speaker={m.role} author={m.author} timestamp={m.at} markdown>{m.text}</Message>
  {/each}
  {#if streaming}
    <Message speaker="assistant" author="daw[n]" pending />
  {/if}
</Conversation>`,
    },
    {
      label: 'Angular',
      lang: 'ts',
      code: `import { Component, Input } from '@angular/core';
import { Conversation, Message } from '@arclux/arc-ui-angular';

@Component({
  imports: [Conversation, Message],
  template: \`
    <arc-conversation style="--conversation-height: 400px">
      @for (m of messages; track m.id) {
        <arc-message [attr.speaker]="m.role" [attr.author]="m.author" [attr.timestamp]="m.at" markdown>
          {{ m.text }}
        </arc-message>
      }
      @if (streaming) {
        <arc-message speaker="assistant" author="daw[n]" pending></arc-message>
      }
    </arc-conversation>
  \`,
})
export class AssistPanelComponent {
  @Input() messages: Array<{ id: string; role: string; author: string; at: string; text: string }> = [];
  @Input() streaming = false;
}`,
    },
    {
      label: 'Solid',
      lang: 'tsx',
      code: `import { Conversation, Message } from '@arclux/arc-ui-solid';
import { For, Show } from 'solid-js';

export default function AssistPanel(props) {
  return (
    <Conversation style={{ '--conversation-height': '400px' }}>
      <For each={props.messages}>
        {(m) => (
          <Message speaker={m.role} author={m.author} timestamp={m.at} markdown>
            {m.text}
          </Message>
        )}
      </For>
      <Show when={props.streaming}>
        <Message speaker="assistant" author="daw[n]" pending />
      </Show>
    </Conversation>
  );
}`,
    },
    {
      label: 'Preact',
      lang: 'tsx',
      code: `import { Conversation, Message } from '@arclux/arc-ui-preact';

export default function AssistPanel({ messages, streaming }) {
  return (
    <Conversation style={{ '--conversation-height': '400px' }}>
      {messages.map((m) => (
        <Message key={m.id} speaker={m.role} author={m.author} timestamp={m.at} markdown>
          {m.text}
        </Message>
      ))}
      {streaming && <Message speaker="assistant" author="daw[n]" pending />}
    </Conversation>
  );
}`,
    },
  ],

  seeAlso: ['markdown', 'timeline', 'list', 'time-ago'],
};
