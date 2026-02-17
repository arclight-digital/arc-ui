#!/usr/bin/env node
/**
 * Generate favicon PNGs from the Arclight favicon SVG.
 *
 * Supports the same customization props as <arclight-favicon>:
 *   --dark        Lock to dark-mode colors
 *   --bg <color>  Background color override
 *   --fg <color>  Foreground/stroke color override
 *   --out <dir>   Output directory (default: ./favicons)
 *
 * Usage:
 *   node scripts/generate-favicons.js
 *   node scripts/generate-favicons.js --dark --bg "#1a1a2e" --out dist/icons
 */

import { mkdir, writeFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { buildFaviconSvg } from '../src/favicon-svg.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ---------- Parse CLI args ----------

const args = process.argv.slice(2);
function flag(name) { return args.includes(`--${name}`); }
function opt(name) {
  const i = args.indexOf(`--${name}`);
  return i !== -1 && i + 1 < args.length ? args[i + 1] : '';
}

const dark = flag('dark');
const bg = opt('bg');
const fg = opt('fg');
const outDir = resolve(opt('out') || resolve(__dirname, '..', 'favicons'));

// ---------- Standard favicon sizes ----------

const SIZES = [
  { size: 16,  name: 'favicon-16x16.png' },
  { size: 32,  name: 'favicon-32x32.png' },
  { size: 48,  name: 'favicon-48x48.png' },
  { size: 180, name: 'apple-touch-icon.png' },
  { size: 192, name: 'android-chrome-192x192.png' },
  { size: 512, name: 'android-chrome-512x512.png' },
];

// ---------- Generate ----------

const svgStr = buildFaviconSvg({ dark, bg, fg });
const svgBuffer = Buffer.from(svgStr);

await mkdir(outDir, { recursive: true });

await writeFile(resolve(outDir, 'favicon.svg'), svgStr);

for (const { size, name } of SIZES) {
  await sharp(svgBuffer, { density: Math.round(72 * (size / 1600) * 10) || 72 })
    .resize(size, size)
    .png()
    .toFile(resolve(outDir, name));

  console.log(`  ${name} (${size}x${size})`);
}

console.log(`\nFavicons written to ${outDir}`);
