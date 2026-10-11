import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { measurePosterLayout } from "../src/poster-layout.js";

test("direct portrait entry fits the physical screen on the first render", () => {
  for (const [width, height] of [
    [1080, 1920],
    [390, 844],
    [800, 1280],
  ]) {
    const layout = measurePosterLayout(width, height);
    assert.equal(layout.landscape, false);
    assert.ok(layout.artboardWidth * layout.scale <= width + 0.001);
    assert.ok(layout.artboardHeight * layout.scale <= height + 0.001);
  }
});

test("landscape fits without oversized artboard or clipped text", () => {
  for (const [width, height] of [
    [1920, 1080],
    [844, 390],
    [1024, 768],
  ]) {
    const layout = measurePosterLayout(width, height);
    assert.equal(layout.landscape, true);
    assert.ok(layout.artboardWidth * layout.scale <= width + 0.001);
    assert.ok(layout.artboardHeight * layout.scale <= height + 0.001);
  }
});

test("explicit orientation and zero-sized early layouts are handled", () => {
  assert.equal(measurePosterLayout(390, 844, "landscape").landscape, true);
  assert.equal(measurePosterLayout(1920, 1080, "portrait").landscape, false);
  assert.equal(measurePosterLayout(1920, 1080, "upside-down").landscape, false);
  assert.equal(measurePosterLayout(800, 0), null);
  assert.equal(measurePosterLayout(0, 800), null);
});

// Assert the actual CSS declarations, not minified whitespace formatting.
// Formatting the stylesheet must not break the GitHub Pages deployment.
function declarationsFor(css, selector) {
  const escaped = selector.replace(/[.*+?^$()|[\]{}\\]/g, "\\$&").replace(/\s+>\s+/g, "\\s*>\\s*");
  const rule = css.match(new RegExp(escaped + "\\s*\\{([^}]*)\\}", "s"));
  assert.ok(rule, "Expected CSS rule for " + selector);
  return rule[1];
}

function assertDeclaration(cssBlock, property, value) {
  const pattern = new RegExp(
    "(?:^|;)\\s*" + property + "\\s*:\\s*" + value + "\\s*(?:;|$)",
  );
  assert.match(cssBlock, pattern, "Expected " + property + ": " + value);
}

test("poster viewport is bounded rather than content-sized", () => {
  const css = fs.readFileSync(
    new URL("../poster-sheet.css", import.meta.url),
    "utf8",
  );
  const app = fs.readFileSync(
    new URL("../src/app.js", import.meta.url),
    "utf8",
  );
  assert.match(css, /html:has\(\.shell-poster\),\s*body:has\(\.shell-poster\)/);
  const stage = declarationsFor(css, "#app:has(.shell-poster) > .stage");
  assertDeclaration(stage, "height", "100dvh");
  assertDeclaration(stage, "min-height", "0");
  assertDeclaration(stage, "overflow", "hidden");
  const poster = declarationsFor(css, ".poster-stage");
  assertDeclaration(poster, "width", "100%");
  assertDeclaration(poster, "height", "100%");
  assertDeclaration(poster, "min-height", "0");
  assert.match(app, /new ResizeObserver\(schedulePosterFit\)/);
  assert.match(app, /document\.fonts\.ready\.then\(schedulePosterFit\)/);
});

test("portrait sections are fitted inside the artboard, preserving the final section", () => {
  const css = fs.readFileSync(new URL("../poster-sheet.css", import.meta.url), "utf8");
  const app = fs.readFileSync(new URL("../src/app.js", import.meta.url), "utf8");
  assert.match(css, /\.poster-sheet\.sheet-portrait \.sheet-main-content/);
  assert.match(app, /class="sheet-main-content"/);
  assert.match(app, /function fitPortraitPosterText\(sheet, landscape\)/);
  assert.match(app, /content\.scrollHeight \* candidate <= available/);
  assert.match(app, /fitPortraitPosterText\(sheet, layout\.landscape\)/);
});
