import type { APIRoute } from 'astro';
import { components } from '../data/components/index';
import fs from 'node:fs';

const pkg = JSON.parse(fs.readFileSync(new URL('../../../packages/web-components/package.json', import.meta.url), 'utf-8'));
const tokensCss = fs.readFileSync(new URL('../../../shared/tokens.css', import.meta.url), 'utf-8');

export const prerender = true;

function renderComponent(c: typeof components[number]): string {
  const lines: string[] = [];

  lines.push(`## ${c.name}`);
  lines.push('');
  lines.push(`- Tag: \`<${c.tag}>\``);
  lines.push(`- Tier: ${c.tier}`);
  lines.push(`- Interactivity: ${c.interactivity}`);
  if (c.status) lines.push(`- Status: ${c.status}`);
  lines.push('');
  lines.push(c.description);

  if (c.overview) {
    lines.push('');
    lines.push('### Overview');
    lines.push('');
    lines.push(c.overview);
  }

  if (c.features?.length) {
    lines.push('');
    lines.push('### Features');
    lines.push('');
    for (const f of c.features) {
      lines.push(`- ${f}`);
    }
  }

  // Props
  lines.push('');
  lines.push('### Props');
  lines.push('');
  lines.push('| Prop | Type | Default | Description |');
  lines.push('|------|------|---------|-------------|');
  for (const p of c.props) {
    const def = p.default ?? '—';
    const desc = p.description.replace(/\|/g, '\\|').replace(/\n/g, ' ');
    lines.push(`| \`${p.name}\` | \`${p.type.replace(/\|/g, '\\|')}\` | ${def} | ${desc} |`);
  }

  // Events
  if (c.events?.length) {
    lines.push('');
    lines.push('### Events');
    lines.push('');
    for (const e of c.events) {
      lines.push(`- \`${e.name}\` — ${e.description}`);
    }
  }

  // Sub-components
  if (c.subComponents?.length) {
    for (const sub of c.subComponents) {
      lines.push('');
      lines.push(`### Sub-component: ${sub.name} (\`<${sub.tag}>\`)`);
      lines.push('');
      lines.push(sub.description);
      lines.push('');
      lines.push('| Prop | Type | Default | Description |');
      lines.push('|------|------|---------|-------------|');
      for (const p of sub.props) {
        const def = p.default ?? '—';
        const desc = p.description.replace(/\|/g, '\\|').replace(/\n/g, ' ');
        lines.push(`| \`${p.name}\` | \`${p.type.replace(/\|/g, '\\|')}\` | ${def} | ${desc} |`);
      }
    }
  }

  // Guidelines
  if (c.guidelines) {
    lines.push('');
    lines.push('### Guidelines');
    lines.push('');
    lines.push('**Do:**');
    for (const d of c.guidelines.do) {
      lines.push(`- ${d}`);
    }
    if (c.guidelines.dont?.length) {
      lines.push('');
      lines.push("**Don't:**");
      for (const d of c.guidelines.dont) {
        lines.push(`- ${d}`);
      }
    }
  }

  // Code examples — first WC tab and first React tab
  const wcTab = c.tabs.find((t) => t.label === 'Web Component' || t.label === 'WC');
  const reactTab = c.tabs.find((t) => t.label === 'React');

  if (wcTab) {
    lines.push('');
    lines.push('### Example (Web Component)');
    lines.push('');
    lines.push(`\`\`\`${wcTab.lang}`);
    lines.push(wcTab.code.trim());
    lines.push('```');
  }

  if (reactTab) {
    lines.push('');
    lines.push('### Example (React)');
    lines.push('');
    lines.push(`\`\`\`${reactTab.lang}`);
    lines.push(reactTab.code.trim());
    lines.push('```');
  }

  lines.push('');
  lines.push('---');

  return lines.join('\n');
}

function extractTokenSection(css: string, sectionName: string): string[] {
  const tokens: string[] = [];
  const regex = new RegExp(`\\/\\*.*${sectionName}.*\\*\\/([\\s\\S]*?)(?=\\/\\*|\\})`);
  const match = css.match(regex);
  if (match) {
    const varRegex = /--([\w-]+)\s*:/g;
    let m;
    while ((m = varRegex.exec(match[1])) !== null) {
      tokens.push(`--${m[1]}`);
    }
  }
  return tokens;
}

export const GET: APIRoute = async () => {
  const tiers = ['layout', 'navigation', 'content', 'input', 'feedback'] as const;

  // Token categories from CSS comments
  const tokenCategories = [
    'Accent',
    'Typography',
    'Spacing',
    'Radius',
    'Interactive',
    'Borders',
    'Text Colors',
    'Backgrounds',
    'Transitions',
    'Shadows',
    'Gradients',
    'Focus',
    'Layout',
  ];

  // Extract all CSS custom properties from tokens.css
  const allTokens: string[] = [];
  const varRegex = /--([\w-]+)\s*:/g;
  let m;
  while ((m = varRegex.exec(tokensCss)) !== null) {
    if (!allTokens.includes(`--${m[1]}`)) {
      allTokens.push(`--${m[1]}`);
    }
  }

  const sections: string[] = [];

  // Header
  sections.push(`# ARC UI — Full Component & Token Reference`);
  sections.push('');
  sections.push(`> Version ${pkg.version} | ${components.length} components | 7 framework targets`);
  sections.push('');
  sections.push('This is the complete reference for LLM consumption. For a concise overview, see /llms.txt.');
  sections.push('');

  // Token reference
  sections.push('# Design Tokens');
  sections.push('');
  sections.push(`ARC UI defines ${allTokens.length} CSS custom properties. Override the base accent tokens to theme everything:`);
  sections.push('');
  sections.push('```css');
  sections.push(':root {');
  sections.push('  --accent-primary: #4d7ef7;');
  sections.push('  --accent-primary-rgb: 77, 126, 247;');
  sections.push('  --accent-secondary: #8b5cf6;');
  sections.push('  --accent-secondary-rgb: 139, 92, 246;');
  sections.push('}');
  sections.push('```');
  sections.push('');
  sections.push('### All Token Names');
  sections.push('');
  sections.push(allTokens.map((t) => `\`${t}\``).join(', '));
  sections.push('');

  // Components by tier
  for (const tier of tiers) {
    const items = components.filter((c) => c.tier === tier);
    if (!items.length) continue;

    sections.push('---');
    sections.push('');
    sections.push(`# ${tier.charAt(0).toUpperCase() + tier.slice(1)} Components (${items.length})`);
    sections.push('');

    for (const comp of items) {
      sections.push(renderComponent(comp));
      sections.push('');
    }
  }

  const body = sections.join('\n');

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
