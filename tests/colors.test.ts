/**
 * Colour resolution.
 *
 * An agent building a map reached for `background="paper-sunken"` — a token the reference
 * teaches as a Tailwind utility — and every continent rendered as a solid black inkblot.
 * Unrecognised values used to pass straight through to SVG, where an invalid presentation
 * attribute is ignored and the initial fill is black. So the worst possible colour was the
 * failure mode, with nothing in the build or the class linter to mention it.
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import { INK, PAPER_SUNKEN, resolveColor } from "../src/sketch/colors.ts";

test("an Ivy palette name resolves", () => {
  assert.equal(resolveColor("Destructive"), "#b04a3f");
});

test("the theme tokens the docs teach as utilities resolve too", () => {
  // The whole point of the fix: these are the names `agent-readme` puts in front of an agent.
  assert.equal(resolveColor("paper-sunken"), PAPER_SUNKEN);
  assert.equal(resolveColor("ink-muted"), "#8b8b8b");
  assert.equal(resolveColor("highlight"), "#fff6c8");
});

test("a real CSS colour still passes through", () => {
  for (const value of [
    "#efe9dd",
    "#fff",
    "#ffffffcc",
    "rgb(12 34 56)",
    "rgba(1,2,3,.5)",
    "oklch(0.7 0.1 250)",
    "var(--something)",
    "rebeccapurple",
    "transparent",
    "currentColor",
  ]) {
    assert.equal(resolveColor(value), value, `${value} should pass through`);
  }
});

test("an unresolvable value falls back instead of painting black", () => {
  // This is the regression. "black" is what SVG does with an invalid attribute, so passing
  // the bad value through was the one outcome guaranteed to wreck the drawing.
  assert.equal(resolveColor("bg-paper-sunken"), INK);
  assert.equal(resolveColor("paper-sunk"), INK);
  assert.equal(resolveColor("not a colour"), INK);
});

test("the caller's own fallback is honoured", () => {
  assert.equal(resolveColor("nonsense", "#123456"), "#123456");
  assert.equal(resolveColor(undefined, "#123456"), "#123456");
  assert.equal(resolveColor(null, "#123456"), "#123456");
  assert.equal(resolveColor("", "#123456"), "#123456");
});

test("a bad value is reported once, not once per render", () => {
  // A wireframe redraws on every measurement; warning each time would bury the console.
  const original = console.warn;
  let calls = 0;
  console.warn = () => {
    calls++;
  };
  try {
    resolveColor("repeated-nonsense");
    resolveColor("repeated-nonsense");
    resolveColor("repeated-nonsense");
  } finally {
    console.warn = original;
  }
  assert.equal(calls, 1);
});
