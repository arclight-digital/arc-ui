#!/usr/bin/env node
/**
 * Give the Angular wrappers a ControlValueAccessor.
 *
 * `formControlName`, `formControl` and `ngModel` work on zero of them today,
 * which is most of the reason an Angular wrapper package exists at all: an
 * Angular team reaching for a component library reaches for reactive forms in
 * the same breath, and `<arc-input formControlName="email">` currently binds
 * nothing, reports nothing, and fails silently — the control stays pristine and
 * empty while the element on screen holds the user's text. V4-PLAN 4.6.
 *
 * ── Why this is a post-processing step ──
 *
 * These files are prism's output and say so. prism has one extension point,
 * `config.propsFrom`, and it answers "what props does this component have" —
 * there is no hook for "and emit this alongside". So the choice was to wait for
 * an upstream feature or to write the pass here, and the row is required for
 * the v4 tag. It runs immediately after prism in the same pipeline, is
 * deterministic, and is idempotent against its own output, so `pnpm generate`
 * stays diff-clean and prism's `--prune` still owns file lifetimes. The shape
 * it produces is recorded in prism-feedback.md as what the generator should
 * emit itself.
 *
 * ── Which components ──
 *
 * The plan said "the 46 write-back controls", which was the count of components
 * emitting `arc-change` — it includes arc-tabs, arc-theme-toggle, arc-waveform
 * and arc-sortable-list, none of which is a form control. The library already
 * has a precise answer: `FormControlMixin` is what makes a component
 * form-associated, and 27 components extend it. Those are the ones a form can
 * bind to, so those are the ones that get an accessor. Derived from the source
 * every run rather than listed here, so a 28th control is covered by writing it.
 *
 * ── The four methods, and the one that is easy to get wrong ──
 *
 * `writeValue` is the form writing *into* the element and must not echo back:
 * the commit listener below calls Angular's `onChange`, so an echo would make
 * every programmatic `setValue` mark the control dirty. It assigns the DOM
 * property directly and nothing else. The listener is attached in the
 * constructor rather than through the `host` metadata because prism already
 * maps `(arc-change)` there to the component's own `@Output`, and a host object
 * cannot carry two handlers for one event.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..', '..');
const WC_SRC = path.join(ROOT, 'packages', 'web-components', 'src');
const NG_SRC = path.join(ROOT, 'packages', 'angular', 'src');

/**
 * The two controls whose value is a pair.
 *
 * A ControlValueAccessor binds one form value, and these bind two: a date range
 * is `start`/`end` and a range slider is `low`/`high`, with no single `value`
 * property between them. Rather than leave the pair unbindable — which would
 * mean `formControlName` working on 25 of 27 controls, the kind of gap a
 * consumer discovers rather than reads — the accessor carries an object, which
 * is what a reactive form holds for a compound value anyway.
 *
 * The alternative was a FormGroup with a control per @Input. That works today
 * without any of this and is the better shape for a form that wants to validate
 * the two ends separately; it just cannot be reached from `[(ngModel)]`.
 */
const COMPOSITE = {
  'input/date-range-picker': ['start', 'end'],
  'input/range-slider': ['low', 'high'],
};

/** The empty value a form reset writes, by the property's declared type. */
function emptyFor(type) {
  if (/\[\]$|^Array</.test(type)) return '[]';
  if (type === 'boolean') return 'false';
  if (type === 'number') return '0';
  return "''";
}

/** Every component that extends FormControlMixin, as `tier/name`. */
function formControls() {
  const found = [];
  (function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name !== 'generated' && entry.name !== 'icons') walk(full);
      } else if (entry.name.endsWith('.js') && !entry.name.endsWith('.register.js')) {
        const src = fs.readFileSync(full, 'utf-8');
        // The call, not the identifier: the mixin's own file and props.js both
        // name it in prose.
        if (!/FormControlMixin\(/.test(src)) continue;
        found.push(path.relative(WC_SRC, full).replace(/\.js$/, ''));
      }
    }
  })(WC_SRC);
  return found;
}

/** `input/date-picker` → `DatePicker`, matching prism's file naming. */
const className = (rel) =>
  path
    .basename(rel)
    .split('-')
    .map((p) => p[0].toUpperCase() + p.slice(1))
    .join('');

const failures = [];
let written = 0;

for (const rel of formControls()) {
  const file = path.join(NG_SRC, `${path.dirname(rel)}/${className(rel)}.ts`);
  if (!fs.existsSync(file)) {
    failures.push(`${rel}: expected an Angular wrapper at ${path.relative(ROOT, file)}`);
    continue;
  }

  const original = fs.readFileSync(file, 'utf-8');
  const cls = /export class (\w+)/.exec(original)?.[1];
  if (!cls) {
    failures.push(`${rel}: no exported class`);
    continue;
  }

  /* The property a form binds to, and its type, read from the wrapper prism
     already wrote — so the accessor cannot disagree with the @Input beside it.
     `checked` for the two boolean controls, `value` for the rest. */
  const decorator = String.raw`@(?:NgInput|Input)\(\)`;
  const typeOf = (name) => {
    const m = new RegExp(`${decorator} set ${name}\\(value: ([^)]+)\\)`).exec(original);
    return m ? m[1].trim() : null;
  };

  const pair = COMPOSITE[rel];
  const parts = (pair ?? ['checked', 'value'])
    .map((name) => {
      const type = typeOf(name);
      return type ? { name, type } : null;
    })
    .filter(Boolean);

  const prop = pair
    ? parts.length === pair.length
      ? {
          composite: parts,
          type: `{ ${parts.map((p) => `${p.name}: ${p.type}`).join('; ')} }`,
        }
      : null
    : parts[0];

  if (!prop) {
    failures.push(
      pair
        ? `${rel}: expected @Inputs for ${pair.join(' and ')}`
        : `${rel}: no @Input for \`value\` or \`checked\` to bind a form to`,
    );
    continue;
  }

  const hasDisabled = new RegExp(`${decorator} set disabled\\(`).test(original);

  let out = original;

  // 1. forwardRef, for the provider's self-reference.
  out = out.replace(
    /^(import \{ Component, ElementRef, )inject/m,
    '$1forwardRef, inject',
  );

  // 2. The forms import, after the core one.
  out = out.replace(
    /^(import \{ Component[^\n]*'@angular\/core';\n)/m,
    "$1import { NG_VALUE_ACCESSOR, type ControlValueAccessor } from '@angular/forms';\n",
  );

  // 3. Register as the accessor for this element.
  out = out.replace(
    /^(\}\)\nexport class )/m,
    `  providers: [\n` +
      `    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => ${cls}), multi: true },\n` +
      `  ],\n$1`,
  );

  // 4. Declare it.
  out = out.replace(
    new RegExp(`^export class ${cls} \\{`, 'm'),
    `export class ${cls} implements ControlValueAccessor {`,
  );

  // 5. The accessor itself, appended inside the class.
  const empty = prop.composite
    ? `{ ${prop.composite.map((p) => `${p.name}: ${emptyFor(p.type)}`).join(', ')} }`
    : emptyFor(prop.type);
  const bound = prop.composite
    ? prop.composite.map((p) => p.name).join(' / ')
    : prop.name;
  const readBack = prop.composite
    ? `{ ${prop.composite.map((p) => `${p.name}: this._el.${p.name}`).join(', ')} }`
    : `this._el.${prop.name}`;
  const writeBack = prop.composite
    ? prop.composite.map(
        (p) => `    this._el.${p.name} = next.${p.name};`,
      )
    : [`    this._el.${prop.name} = next;`];
  const body = [
    '',
    '  /* ── ControlValueAccessor ──',
    '',
    `     Bound to \`${bound}\`, committed on \`arc-change\`. The listener is`,
    '     attached here rather than through the host metadata, which already maps',
    '     that event to this component’s own @Output and cannot carry two',
    '     handlers for one event.',
    '',
    '     writeValue deliberately does not call _onChangeFn: it is the form',
    '     writing into the element, and echoing it back would mark the control',
    '     dirty on every programmatic setValue. */',
    `  private _onChangeFn: (value: ${prop.type}) => void = () => {};`,
    '  private _onTouchedFn: () => void = () => {};',
    '',
    '  constructor() {',
    "    this._el.addEventListener('arc-change', () => {",
    `      this._onChangeFn(${readBack});`,
    '      this._onTouchedFn();',
    '    });',
    '  }',
    '',
    `  writeValue(value: ${prop.type} | null | undefined): void {`,
    `    const next = value ?? ${empty};`,
    ...writeBack,
    '  }',
    '',
    `  registerOnChange(fn: (value: ${prop.type}) => void): void {`,
    '    this._onChangeFn = fn;',
    '  }',
    '',
    '  registerOnTouched(fn: () => void): void {',
    '    this._onTouchedFn = fn;',
    '  }',
    '',
    ...(hasDisabled
      ? [
          '  setDisabledState(isDisabled: boolean): void {',
          '    this._el.disabled = isDisabled;',
          '  }',
        ]
      : [
          '  /* No `disabled` on this element, so a disabled form control cannot be',
          '     expressed here. Angular tolerates the method being absent. */',
        ]),
    '}',
    '',
  ].join('\n');

  out = out.replace(/\}\n$/, body);

  if (out === original) {
    failures.push(`${rel}: nothing was rewritten — the wrapper's shape has changed`);
    continue;
  }

  fs.writeFileSync(file, out);
  written++;
}

if (failures.length > 0) {
  console.error(`\n✗ ${failures.length} Angular control(s) could not take an accessor:\n`);
  for (const f of failures) console.error(`  ${f}`);
  console.error(
    `\n  This pass rewrites prism's output, so it is coupled to the shape prism\n` +
      `  emits. If that shape moved, the patterns in this file move with it.\n`,
  );
  process.exit(1);
}

console.log(`✓ ${written} Angular form controls implement ControlValueAccessor`);
