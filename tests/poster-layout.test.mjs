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

test("poster viewport is bounded rather than content-sized", () => {
  const css = fs.readFileSync(
    new URL("../poster-sheet.css", import.meta.url),
    "utf8",
  );
  const app = fs.readFileSync(
    new URL("../src/app.js", import.meta.url),
    "utf8",
  );
  assert.match(css, /html:has\(\.shell-poster\), body:has\(\.shell-poster\)/);
  assert.match(css, /#app:has\(\.shell-poster\) > \.stage\{/);
  assert.match(css, /height:100dvh;min-height:0;overflow:hidden/);
  assert.match(css, /\.poster-stage\{width:100%;height:100%;min-height:0/);
  assert.match(app, /new ResizeObserver\(schedulePosterFit\)/);
  assert.match(app, /document\.fonts\.ready\.then\(schedulePosterFit\)/);
});
