import type { ComponentDef } from './_types';

export const conversation: ComponentDef = {
  name: 'Conversation',
  slug: 'conversation',
  tag: 'arc-conversation',
  tier: 'feedback',
  interactivity: 'interactive',
  description:
    'Chat transcript for an AI assistant panel. It follows new replies, but leaves a reader who scrolled up where they are.',
  searchKeywords: [
    'chat',
    'ai',
    'assistant',
    'transcript',
    'streaming',
    'typing indicator',
    'messages',
  ],

  overview: `Conversation is the scrolling transcript for an AI assistant panel. Its children are \`<arc-message>\` elements, and each one's \`speaker\` sets how it looks: \`user\` messages align to the inline end on a faint accent tint, \`assistant\` messages to the inline start on a neutral surface, and \`system\` messages are centered and muted, for notices from the app itself. Alignment uses logical properties, so the layout mirrors in right-to-left text.

While the reader is within 100px of the bottom, new or growing messages keep the view pinned to the latest. Once they scroll up to reread, the view stays put. \`arc-scroll-away\` and \`arc-scroll-return\` fire when the reader leaves that zone and comes back, with the distance from the bottom, so you can show a "jump to latest" chip that calls \`scrollToEnd()\`. Set the \`autoScroll\` property to \`false\` to handle scrolling yourself.

There's no streaming API. A message's body is its default slot, so you stream a reply by appending text to it. With \`markdown\` set, the text renders through the markdown renderer and re-parses as it grows. A \`pending\` message shows a typing indicator in place of its body until you remove \`pending\`. The transcript renders in full on the server, typing dots included.`,

  features: [
    'Under `prefers-reduced-motion`, the typing dots become a static ellipsis',
    'Timestamps render as relative time through `arc-time-ago`, with the absolute date on hover',
    'Each message has an `avatar` slot. None are built in',
  ],

  guidelines: {
    do: [
      'Use it for a dialogue between the user and a responder, where who said what and the scroll behavior matter',
      'Stream a reply by updating the message\'s text, for example its `textContent`, as tokens arrive',
      'Add a `pending` assistant message as soon as the request goes out, then fill its slot and remove `pending` when tokens arrive',
      'Pass timestamps as ISO strings',
      'Set the height with the `--conversation-height` custom property, or let it fill a parent that has a height',
    ],
    dont: [
      'Don\'t use it for an activity feed or event history. Use Timeline, where entries mark moments, not speakers',
      'Don\'t use it as a general list of items. Use List',
      'Don\'t scroll to the bottom yourself on new messages. The component already follows, and only while the reader is at the bottom',
      'Don\'t put critical status in a system message alone. It scrolls away with the transcript',
      'Don\'t add avatars by reflex. The slot is there for products that need them',
    ],
  },

  previewHtml: `<arc-conversation style="--conversation-height: 340px; width: min(560px, 100%)">
  <arc-message speaker="system">Project "Neon Tides" opened. The assistant can see your arrangement.</arc-message>
  <arc-message speaker="user" author="You" id="demo-conv-1">How do I loop the chorus while I try out lead takes?</arc-message>
  <arc-message speaker="assistant" author="daw[n]" markdown id="demo-conv-2">Drag the **loop brace** over bars 17-24, then:

1. Press L to switch looping on
2. Arm the lead track
3. Hit record. Each pass lands on its own take lane</arc-message>
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
        'One message in the transcript. `speaker` picks the look (user, assistant or system), `author` and `timestamp` fill the muted line above it, `markdown` renders the slotted text as Markdown, and `pending` shows the typing indicator.',
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
