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
const wcDir = resolve(__dirname, '../../packages/web-components');
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

// The JetBrains generator reads `package.json` from process.cwd() — the
// monorepo root — so it stamps web-types.json with the private root package's
// name and version. JetBrains keys web-types association off `name`, so the
// wrong name breaks the integration outright, and the root version stamp is
// what let a bump land without a regenerate and fail the v2.11.1 release
// gate. Stamp both from the package that actually ships the file.
const webTypesPath = resolve(wcDir, 'web-types.json');
const wcPkg = JSON.parse(readFileSync(resolve(wcDir, 'package.json'), 'utf-8'));
const webTypes = JSON.parse(readFileSync(webTypesPath, 'utf-8'));
webTypes.name = wcPkg.name;
webTypes.version = wcPkg.version;
writeFileSync(webTypesPath, JSON.stringify(webTypes, null, 2) + '\n');

console.log('✓ vscode.html-custom-data.json + vscode.css-custom-data.json + web-types.json');
