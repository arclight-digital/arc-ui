import type { ComponentDef } from './_types';

export const fileUpload: ComponentDef = {
    name: 'File Upload',
    slug: 'file-upload',
    tag: 'arc-file-upload',
    tier: 'input',
    interactivity: 'interactive',
    description: 'Drag-and-drop file upload zone with preview.',

    overview: `FileUpload provides a drag-and-drop zone for selecting files, with a built-in file list that displays each selected file's name, size, and a remove button. Users can either drag files onto the dashed-border dropzone or click "browse" to open the native file picker. The component handles both interaction methods identically, validating files against the \`accept\` and \`max-size\` constraints before adding them to the list.

When \`multiple\` is enabled, users can add several files across multiple interactions -- each drop or browse appends to the existing list. In single-file mode (the default), selecting a new file replaces the previous one. Files that exceed the \`max-size\` limit are rejected with an inline error message below the dropzone, while accepted files are displayed in a styled list with their formatted size (B, KB, MB, GB). Each file item has a remove button that dispatches an \`arc-remove\` event and updates the file list.

The component dispatches an \`arc-change\` event whenever the file list changes -- on add or remove -- with the current file array in the detail. The dropzone provides visual feedback during drag operations: the border color shifts to the accent blue and the background gains a subtle tint. The disabled state reduces opacity and blocks all pointer events. Keyboard users can activate the file picker by pressing Enter or Space while the dropzone is focused.`,

    features: [
      'Drag-and-drop zone with visual feedback (border color and background change) during drag-over',
      'Click-to-browse fallback that opens the native file picker dialog',
      'File type filtering via the accept attribute (e.g., "image/*", ".pdf,.docx")',
      'Maximum file size validation with automatic rejection and inline error message',
      'Multiple file selection mode that appends files across interactions',
      'Styled file list showing name, formatted size, and a remove button per file',
      'arc-change event on every file list mutation and arc-remove event on individual file removal',
      'Keyboard accessible: Enter and Space activate the file picker from the focused dropzone'
    ],

    guidelines: {
      do: [
        'Set the accept attribute to restrict file types and communicate expectations (e.g., accept="image/*")',
        'Set max-size to prevent oversized uploads before they reach the server',
        'Use the multiple attribute when the use case requires batch uploads (e.g., photo galleries)',
        'Listen to arc-change to sync the file list with your form state or upload handler',
        'Display the upload zone at a reasonable width so the hint text and file list are readable'
      ],
      dont: [
        'Use FileUpload as a general file manager -- it handles selection, not uploading or progress',
        'Set max-size to 0 and expect it to enforce a limit; 0 means no limit',
        'Forget to handle the arc-change event -- without it, selected files are not captured by your application',
        'Place FileUpload inside a container with overflow: hidden, as the error message may be clipped',
        'Disable the component without explaining why uploads are unavailable'
      ],
    },

    previewHtml: `<arc-file-upload accept=".png,.jpg,.svg" multiple max-size="5242880" style="width:100%; max-width:480px;"></arc-file-upload>`,

    props: [
      { name: 'accept', type: 'string', default: "''", description: 'Comma-separated list of accepted file types, passed directly to the native file input accept attribute. Examples: "image/*", ".pdf,.docx", "audio/mp3".' },
      { name: 'multiple', type: 'boolean', default: 'false', description: 'When true, allows selecting multiple files. Each drop or browse interaction appends to the existing file list rather than replacing it.' },
      { name: 'max-size', type: 'number', default: '0', description: 'Maximum file size in bytes. Files exceeding this limit are rejected with an inline error message. Set to 0 for no limit.' },
      { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables the dropzone, preventing drag-and-drop and click interactions. Reduces opacity to 0.4.' }
    ],
    events: [
      { name: 'arc-change', description: 'Fired when files are added or dropped' },
      { name: 'arc-remove', description: 'Fired when a file is removed from the list' }
    ],
    tabs: [
    {
        label: 'Web Component',
        lang: 'html',
        code: `<arc-file-upload id="uploader" accept="image/*" multiple></arc-file-upload>

<script>
  const uploader = document.getElementById('uploader');

  uploader.addEventListener('arc-change', (e) => {
    const files = e.detail.files;
    files.forEach(file => {
      console.log(file.name, file.size, file.type);
    });

    // Example: upload via FormData
    const form = new FormData();
    files.forEach(f => form.append('files', f));
    fetch('/api/upload', { method: 'POST', body: form });
  });

  uploader.addEventListener('arc-remove', (e) => {
    console.log('Removed:', e.detail.file.name);
  });
</script>`,
      },
    {
        label: 'React',
        lang: 'tsx',
        code: `import { FileUpload } from '@arclux/arc-ui-react';

function Upload() {
  function handleChange(e) {
    const files = e.detail.files;
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
  <FileUpload accept="image/*" multiple></FileUpload>
</template>`,
      },
    {
        label: 'Svelte',
        lang: 'html',
        code: `<script>
  import { FileUpload } from '@arclux/arc-ui-svelte';
</script>

<FileUpload accept="image/*" multiple></FileUpload>`,
      },
    {
        label: 'Angular',
        lang: 'ts',
        code: `import { Component } from '@angular/core';
import { FileUpload } from '@arclux/arc-ui-angular';

@Component({
  imports: [FileUpload],
  template: \`
    <FileUpload accept="image/*" multiple></FileUpload>
  \`,
})
export class MyComponent {}`,
      },
    {
        label: 'Solid',
        lang: 'tsx',
        code: `import { FileUpload } from '@arclux/arc-ui-solid';

<FileUpload accept="image/*" multiple></FileUpload>`,
      },
    {
        label: 'Preact',
        lang: 'tsx',
        code: `import { FileUpload } from '@arclux/arc-ui-preact';

<FileUpload accept="image/*" multiple></FileUpload>`,
      },
  ],
  
  seeAlso: ["input","button","progress"],
};
