/**
 * Keep a failing assertion about a DOM node a failure, not a hang.
 *
 * When `expect(node).to.equal(other)` fails, web-test-runner serializes the
 * error's `actual` and `expected` to send them from the browser to the runner
 * for its diff. A live DOM node does not serialize in any useful time: the run
 * sits for 120 seconds and ends in "Browser tests did not finish", naming no
 * test. It only happens when the assertion fails, which is the one time it
 * matters. Found twice in the 4.5 batch (test-findings #119–#124), where it
 * was first blamed on chai printing the node. Chai prints nodes in under a
 * millisecond; the serialization is the hang.
 *
 * Loaded before every test file (web-test-runner.config.mjs), so every
 * assertion in the suite is covered, including forms a grep would miss. The
 * message chai already wrote is untouched; only the two values the runner would
 * serialize are replaced with a short description of each node.
 */
import { Assertion, AssertionError } from '@esm-bundle/chai';

const describeNode = (n) => {
  if (!(n instanceof Node)) return n;
  if (n.nodeType !== Node.ELEMENT_NODE) return `[${n.nodeName}]`;
  const id = n.id ? `#${n.id}` : '';
  const cls = typeof n.className === 'string' && n.className ? `.${n.className.trim().split(/\s+/).join('.')}` : '';
  const part = n.getAttribute('part') ? `[part="${n.getAttribute('part')}"]` : '';
  return `<${n.localName}${id}${cls}${part}>`;
};

const safe = (v) => (Array.isArray(v) ? v.map(describeNode) : describeNode(v));
const hasNode = (v) => v instanceof Node || (Array.isArray(v) && v.some((x) => x instanceof Node));

const assert = Assertion.prototype.assert;
Assertion.prototype.assert = function (...args) {
  try {
    return assert.apply(this, args);
  } catch (error) {
    if (error instanceof AssertionError && (hasNode(error.actual) || hasNode(error.expected))) {
      error.actual = safe(error.actual);
      error.expected = safe(error.expected);
    }
    throw error;
  }
};
