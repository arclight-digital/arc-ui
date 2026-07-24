#!/usr/bin/env node
/**
 * Generates editor integration data from custom-elements.json:
 *   - vscode.html-custom-data.json / vscode.css-custom-data.json (VS Code)
 *   - web-types.json (JetBrains — referenced by the "web-types" package field)
 *
 * Consumers get tag/attribute/value autocomplete + hover docs:
 *   VS Code:  "html.customData": ["./node_modules/@arclux/arc-ui/vscode.html-custom-data.json"]
 *   JetBrains: automatic via the web-types field.
 *
 * (Called automatically by `pnpm generate`, after generate-manifest.js)
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { generateVsCodeCustomElementData } from 'custom-element-vs-code-integration';
import { generateJetBrainsWebTypes } from 'custom-element-jet-brains-integration';

const __dirname = dirname(fileURLToPath(import.meta.url));
const wcDir = resolve(__dirname, '../packages/web-components');
const manifest = JSON.parse(readFileSync(resolve(wcDir, 'custom-elements.json'), 'utf-8'));

generateVsCodeCustomElementData(manifest, {
  outdir: wcDir,
  htmlFileName: 'vscode.html-custom-data.json',
  cssFileName: 'vscode.css-custom-data.json',
});

generateJetBrainsWebTypes(manifest, {
  outdir: wcDir,
  fileName: 'web-types.json',
});

// Slots/parts without descriptions render as "… - undefined" in hover docs —
// strip the placeholder.
for (const file of ['vscode.html-custom-data.json', 'vscode.css-custom-data.json', 'web-types.json']) {
  const path = resolve(wcDir, file);
  writeFileSync(path, readFileSync(path, 'utf-8').replaceAll(' - undefined', ''));
}

console.log('✓ vscode.html-custom-data.json + vscode.css-custom-data.json + web-types.json');
