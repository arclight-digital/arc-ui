import type { ComponentDef } from './_types';

const demoSrc = `data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20width='480'%20height='320'%3E%3Cdefs%3E%3ClinearGradient%20id='g'%20x1='0'%20y1='0'%20x2='1'%20y2='1'%3E%3Cstop%20offset='0'%20stop-color='%231c2b4a'/%3E%3Cstop%20offset='1'%20stop-color='%234d7ef7'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect%20width='480'%20height='320'%20fill='url(%23g)'/%3E%3Ccircle%20cx='340'%20cy='110'%20r='70'%20fill='%238fb0ff'%20opacity='0.6'/%3E%3Ccircle%20cx='150'%20cy='230'%20r='90'%20fill='%230e1526'%20opacity='0.55'/%3E%3C/svg%3E`;

export const imageCropper: ComponentDef = {
    name: 'Image Cropper',
    slug: 'image-cropper',
    tag: 'arc-image-cropper',
    tier: 'input',
    interactivity: 'interactive',
    status: 'beta',
    description: 'Crop-before-upload control with a draggable, resizable crop rectangle, aspect-ratio locking, zoom, and canvas export at natural image resolution.',

    overview: `Image Cropper renders an image letterboxed inside a fixed-height stage and overlays a crop rectangle that users drag to reposition and resize via eight handles (four corners, four edges). Everything outside the rectangle is darkened, and rule-of-thirds guides inside the rectangle aid composition. A labeled zoom slider below the stage scales the image around its center (1x-4x) while the crop rectangle stays put, letting users crop into fine detail.

Setting the \`aspect\` prop (width/height, e.g. \`1\` for square avatars or \`16/9\`) locks the rectangle to that ratio through every drag, resize, and keyboard interaction. Leave it at \`0\` for free-form cropping. The rectangle is always clamped to the visible image and never shrinks below 32px.

The component exposes three methods: \`getCrop()\` returns \`{ x, y, width, height }\` in natural image pixel coordinates (letterbox scale and zoom are accounted for precisely); \`getCroppedBlob(type, quality)\` and \`getCroppedDataUrl(type, quality)\` draw the crop to an offscreen canvas at natural resolution. Canvas export requires \`src\` to be same-origin or served with CORS headers -- a cross-origin image taints the canvas and the methods throw a descriptive error. The \`arc-crop-change\` event fires with natural-pixel coordinates, debounced to animation frames during drags.`,

    features: [
      'Draggable crop rectangle with 8 resize handles (corners + edges) and touch-friendly hit areas',
      'Aspect-ratio locking via the `aspect` prop, enforced through drag, resize, zoom, and keyboard',
      'Zoom slider (1x-4x) scales the image around its center under a stationary crop rectangle',
      'Rule-of-thirds guide lines inside the crop rectangle for composition',
      'Darkened overlay outside the crop area with the image letterboxed in a fixed-height stage',
      '`getCrop()` returns natural image pixel coordinates; `getCroppedBlob()` / `getCroppedDataUrl()` export at full resolution',
      'Full keyboard support: focus the rectangle, arrows move 2px, Shift+arrows resize from the bottom-right',
      'Position and size announced to screen readers on keyup via a polite live region',
      'Skeleton shimmer while the image loads; inline error state on load failure',
      'Crop rectangle clamped to image bounds at all times with a 32px minimum size'
    ],

    guidelines: {
      do: [
        'Set `aspect="1"` for avatar flows so the exported crop is always square',
        'Use an object URL (`URL.createObjectURL(file)`) as `src` when cropping a just-picked file from `arc-file-upload`',
        'Listen for `arc-crop-change` to show a live preview or persist crop coordinates',
        'Call `getCroppedBlob()` at upload time to send the cropped region at natural resolution',
        'Serve remote images from the same origin or with CORS headers so canvas export works'
      ],
      dont: [
        'Do not pass a cross-origin `src` without CORS headers if you need `getCroppedBlob()` / `getCroppedDataUrl()` -- the canvas will be tainted and the methods throw',
        'Do not read crop coordinates from the rectangle position on screen -- always use `getCrop()`, which converts to natural image pixels',
        'Do not set `height` smaller than ~160px -- the crop rectangle and handles need room to operate',
        'Do not use Image Cropper for simple display-only image framing -- use CSS `object-fit` or an aspect-ratio container instead'
      ],
    },

    previewLayout: 'block',

    previewHtml: `<arc-image-cropper
  src="${demoSrc}"
  aspect="1"
  height="280"
></arc-image-cropper>`,

    props: [
      { name: 'src', type: 'string', default: "''", description: 'Image URL, object URL, or data URL to crop. Must be same-origin or CORS-enabled for canvas export.' },
      { name: 'height', type: 'number', default: '320', description: 'Fixed stage height in pixels. The image is letterboxed to fit.' },
      { name: 'aspect', type: 'number', default: '0', description: 'Crop aspect ratio as width/height (e.g. `1`, `16/9`). `0` allows free-form cropping.' },
      { name: 'zoom', type: 'number', default: '1', description: 'Image zoom factor, clamped to 1-4. Scales the image around its center; also settable via the built-in slider.' }
    ],
    events: [
      { name: 'arc-crop-change', description: 'Fired when the crop changes (drag, resize, keyboard, zoom, stage resize). `event.detail` is `{ x, y, width, height }` in natural image pixels, debounced to animation frames.' }
    ],
    tabs: [
    {
        label: 'Web Component',
        lang: 'html',
        code: `<arc-image-cropper
  src="/uploads/avatar-original.jpg"
  aspect="1"
  height="320"
></arc-image-cropper>

<script>
  const cropper = document.querySelector('arc-image-cropper');

  cropper.addEventListener('arc-crop-change', (e) => {
    console.log('Crop (natural px):', e.detail);
  });

  // At upload time — natural-resolution export:
  async function upload() {
    const blob = await cropper.getCroppedBlob('image/jpeg', 0.9);
    const body = new FormData();
    body.append('avatar', blob, 'avatar.jpg');
    await fetch('/api/avatar', { method: 'POST', body });
  }
</script>`,
      },
    {
        label: 'React',
        lang: 'tsx',
        code: `import { useRef } from 'react';
import { ImageCropper } from '@arclux/arc-ui-react';

function AvatarEditor({ src }: { src: string }) {
  const ref = useRef<HTMLElementTagNameMap['arc-image-cropper']>(null);

  const save = async () => {
    const blob = await ref.current!.getCroppedBlob('image/jpeg', 0.9);
    // ...upload blob
  };

  return (
    <>
      <ImageCropper
        ref={ref}
        src={src}
        aspect={1}
        height={320}
        onArcCropChange={(e) => console.log(e.detail)}
      />
      <button onClick={save}>Save avatar</button>
    </>
  );
}`,
      },
  ],

  seeAlso: ['file-upload', 'avatar', 'slider'],
};
