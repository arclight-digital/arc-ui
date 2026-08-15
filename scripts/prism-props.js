/**
 * Reads the declared-props vocabulary for prism's `config.propsFrom` hook.
 *
 * Prism reads `name: { ... }` object literals and `@property()` decorators. Our
 * declarations are *built* — `showDots: flag(true, { negative: 'no-dots' })` —
 * which is a third shape it cannot follow, and in 2.11.1 that silently dropped
 * every prop of an adopted component from all six framework wrappers.
 *
 * 2.12.0 asks the repo that owns the vocabulary to answer instead, which is the
 * right side of the line: the semantics of `flag`/`oneOf`/`num` live in
 * src/shared/props.js, and a copy of them inside prism would drift from it.
 *
 * This deliberately answers only `name`, `type`, `reflect` and `state`. Prism
 * layers constructor defaults, documented `@prop` unions and documented types
 * on top, and every component in this library assigns its defaults in its
 * constructor — so restating them here would be a second source of truth for
 * exactly the thing the vocabulary exists to unify.
 */

/** Helper name → the Lit type it produces. Mirrors src/shared/props.js. */
const HELPER_TYPES = {
  flag: 'Boolean',
  oneOf: 'String',
  num: 'Number',
  int: 'Number',
  list: 'Array',
};

/** `reflect` when the helper is called without an explicit override. */
const HELPER_REFLECT_DEFAULT = {
  flag: true,
  oneOf: true,
  num: false,
  int: false,
  list: false,
};

/** The balanced `{ ... }` beginning at `start`, braces included. */
function balanced(source, start) {
  let depth = 0;
  for (let i = start; i < source.length; i += 1) {
    if (source[i] === '{') depth += 1;
    else if (source[i] === '}') {
      depth -= 1;
      if (depth === 0) return source.slice(start, i + 1);
    }
  }
  return '';
}

/**
 * Remove comments, leaving string literals intact.
 *
 * Done before splitting because prose contains commas: the comment
 * "…exact-match CSS selectors, so an unrecognised position…" split
 * arc-speed-dial's block mid-sentence and lost `direction` from six wrappers.
 */
function stripComments(source) {
  let out = '';
  let quote = null;
  for (let i = 0; i < source.length; i += 1) {
    const c = source[i];
    if (quote) {
      out += c;
      if (c === quote && source[i - 1] !== '\\') quote = null;
      continue;
    }
    if (c === "'" || c === '"' || c === '`') {
      quote = c;
      out += c;
      continue;
    }
    if (c === '/' && source[i + 1] === '/') {
      while (i < source.length && source[i] !== '\n') i += 1;
      out += '\n';
      continue;
    }
    if (c === '/' && source[i + 1] === '*') {
      i += 2;
      while (i < source.length && !(source[i] === '*' && source[i + 1] === '/')) i += 1;
      i += 1;
      continue;
    }
    out += c;
  }
  return out;
}

/**
 * Split a properties block into `[name, valueSource]` pairs at depth 1.
 *
 * Done by depth rather than by regex because a value may itself contain braces,
 * parens, brackets, strings or arrow functions — the truncation bug prism fixed
 * in 2.12.0 was the same mistake made with `[^}]*`.
 */
function entries(block) {
  const out = [];
  const body = stripComments(block.slice(1, -1));
  let depth = 0;
  let quote = null;
  let start = 0;

  const parts = [];
  for (let i = 0; i < body.length; i += 1) {
    const c = body[i];
    if (quote) {
      if (c === quote && body[i - 1] !== '\\') quote = null;
      continue;
    }
    if (c === "'" || c === '"' || c === '`') quote = c;
    else if ('{(['.includes(c)) depth += 1;
    else if ('})]'.includes(c)) depth -= 1;
    else if (c === ',' && depth === 0) {
      parts.push(body.slice(start, i));
      start = i + 1;
    }
  }
  parts.push(body.slice(start));

  for (const part of parts) {
    // Strip leading comments before looking for `name:`. A `//` line comment
    // above a declaration is the normal way to explain it in this codebase, and
    // missing it silently drops the prop from all six wrappers — which is
    // exactly the failure this hook exists to prevent. It cost arc-speed-dial's
    // `direction` once already.
    const code = part.trim();
    const match = code.match(/^(\w+)\s*:\s*([\s\S]+)$/);
    if (match) {
      out.push([match[1], match[2].trim()]);
      continue;
    }
    // Anything else in a properties block is unexpected. Throwing is the point:
    // prism reports a hook that throws as `invalid-props-from`, a strict
    // failure, and falls back to its own reader. Returning quietly would drop
    // the prop from six wrappers with a green exit code.
    if (code.trim() && !code.trim().startsWith('...')) {
      throw new Error(`unreadable entry in static properties: ${code.trim().slice(0, 60)}`);
    }
  }
  return out;
}

/** Read `key: value` out of a helper's options object, if it has one. */
function option(argsSource, key) {
  const match = argsSource.match(new RegExp(`\\b${key}\\s*:\\s*([^,}]+)`));
  return match ? match[1].trim() : undefined;
}

/**
 * Answer for one component source, or undefined to fall through to prism.
 *
 * Only files that actually use the vocabulary are answered — everything else
 * stays on prism's own reader, which is the better-tested path.
 */
export function propsFrom(source) {
  const blockStart = source.match(/static\s+properties\s*=\s*\{/);
  if (!blockStart) return undefined;

  const block = balanced(source, blockStart.index + blockStart[0].length - 1);
  if (!block) return undefined;

  const pairs = entries(block);
  const usesVocabulary = pairs.some(([, value]) =>
    new RegExp(`^(${Object.keys(HELPER_TYPES).join('|')})\\s*\\(`).test(value),
  );
  if (!usesVocabulary) return undefined;

  const props = [];
  for (const [name, value] of pairs) {
    const helper = value.match(/^(\w+)\s*\(/)?.[1];

    if (helper && HELPER_TYPES[helper]) {
      const args = value.slice(value.indexOf('(') + 1, value.lastIndexOf(')'));
      const attribute = option(args, 'attribute');
      const reflect = option(args, 'reflect');
      props.push({
        name,
        // `oneOf` is the one helper whose Lit type depends on its arguments: a
        // set of numbers produces `type: Number`. Read from the first member, so
        // `oneOf([1, 5, 15, 30])` does not reach the wrappers typed as a string.
        type: helper === 'oneOf' && /^\[\s*-?\d/.test(args.trim())
          ? 'Number'
          : HELPER_TYPES[helper],
        reflect: reflect === undefined ? HELPER_REFLECT_DEFAULT[helper] : reflect === 'true',
        // `attribute: false` keeps a prop off the attribute surface; anything
        // else is a rename prism derives from the name itself.
        ...(attribute === 'false' ? { state: true } : {}),
      });
      continue;
    }

    if (value.startsWith('{')) {
      // A plain literal in the same block — read it the way prism would, so a
      // partially-adopted component does not lose its unadopted props.
      props.push({
        name,
        type: value.match(/\btype\s*:\s*(\w+)/)?.[1] ?? 'String',
        reflect: /\breflect\s*:\s*true/.test(value),
        state: /\bstate\s*:\s*true/.test(value),
      });
    }
  }

  return props.length ? props : undefined;
}
