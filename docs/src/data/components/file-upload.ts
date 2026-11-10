import type { ComponentDef } from './_types';

export const fileUpload: ComponentDef = {
  name: 'File Upload',
  slug: 'file-upload',
  tag: 'arc-file-upload',
  tier: 'input',
  interactivity: 'interactive',
  description: 'Drag-and-drop file picker that lists the chosen files.',

  overview: `FileUpload is a dashed dropzone for choosing files. People drop files on it, or click it (or press Enter or Space on it) to open the native file picker. Chosen files appear in a list below with their name, size in B, KB, MB or GB, and a remove button. It only selects files: uploading them, and showing progress, is up to you.

\`accept\` is passed to the native picker, which filters what can be chosen there. Dropped files aren't checked against it, so check the type yourself before uploading. \`max-size\` is in bytes. Larger files are left out, with an error under the dropzone naming them, and \`0\` (the default) means no limit. The dropzone shows both limits as hints.

With \`multiple\`, each drop or browse adds to the list. Without it, a new file replaces the old one, and only the first of several dropped files is kept. \`arc-change\` fires with the whole file array whenever the list changes, and removing a file also fires \`arc-remove\` with that file and its \`index\`. It isn't a form control, so the files don't submit with a form. Read them from \`arc-change\`.`,

  features: [
    'The border turns the accent color and the background tints while files are dragged over it',
    '`disabled` lowers the opacity and blocks clicks, drops and the keyboard',
  ],

  guidelines: {
    do: [
      'Set `accept` to say which file types you want, such as `accept="image/*"`',
      'Set `max-size` so oversized files are stopped before they reach your server',
      'Set `multiple` when people need to add several files, as for a photo gallery',
      'Give it enough width for the hint text and the file names',
    ],
    dont: [
      "Don't rely on `accept` to block other file types. It only filters the native picker",
      "Don't set `max-size` to 0 and expect a limit. 0 means no limit",
    ],
  },

  previewHtml: `<arc-file-upload accept=".png,.jpg,.svg" multiple max-size="5242880" style="width:100%; max-width:480px;"></arc-file-upload>`,

  tabs: [
    {
      label: 'Web Component',
      lang: 'html',
      code: `<arc-file-upload id="uploader" accept="image/*" multiple></arc-file-upload>

<script>
  const uploader = document.getElementById('uploader');

  uploader.addEventListener('arc-change', (e) => {
    const files = e.detail.value;
    files.forEach(file => {
      console.log(file.name, file.size, file.type);
    });

    // Example: upload via FormData
    const form = new FormData();
    files.forEach(f => form.append('files', f));
    fetch('/api/upload', { method: 'POST', body: form });
  });

  uploader.addEventListener('arc-remove', (e) => {
    console.log('Removed:', e.detail.value.name);
  });
</script>`,
    },
    {
      label: 'React',
      lang: 'tsx',
      code: `import { FileUpload } from '@arclux/arc-ui-react';

function Upload() {
  function handleChange(e) {
    const files = e.detail.value;
    const form = new FormData();
    files.forEach(f => form.append('files', f));
    fetch('/api/upload', { method: 'POST', body: form });
  }

  return (
    <FileUpload
      accept="image/*"
      multiple
      onArcChange={handleChange}
    />
  );
}`,
    },
    {
      label: 'Vue',
      lang: 'html',
      code: `<script setup>
import { FileUpload } from '@arclux/arc-ui-vue';
</script>

<template>
  <FileUpload accept="image/*" multiple />
</template>`,
    },
    {
      label: 'Svelte',
      lang: 'html',
      code: `<script>
  import { FileUpload } from '@arclux/arc-ui-svelte';
</script>

<FileUpload accept="image/*" multiple />`,
    },
    {
      label: 'Angular',
      lang: 'ts',
      code: `import { Component } from '@angular/core';
import { FileUpload } from '@arclux/arc-ui-angular';

@Component({
  imports: [FileUpload],
  template: \`
    <arc-file-upload accept="image/*" multiple></arc-file-upload>
  \`,
})
export class MyComponent {}`,
    },
    {
      label: 'Solid',
      lang: 'tsx',
      code: `import { FileUpload } from '@arclux/arc-ui-solid';

export default function Example() {
  return (
    <FileUpload accept="image/*" multiple />
  );
}`,
    },
    {
      label: 'Preact',
      lang: 'tsx',
      code: `import { FileUpload } from '@arclux/arc-ui-preact';

export default function Example() {
  return (
    <FileUpload accept="image/*" multiple />
  );
}`,
    },
  ],

  seeAlso: ['input', 'button', 'progress'],
};
