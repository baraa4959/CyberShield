import test from "node:test";
import assert from "node:assert/strict";
import { createQRCodeURL } from "../src/qr-generator.js";
import { posterCopy } from "../src/single-infographic.js";

test("browser-side QR generation is self-contained and offline", () => {
  const url = createQRCodeURL("https://www.university.edu/booth/");
  assert.ok(url.startsWith("data:image/svg+xml;charset=utf-8,"));
  const svg = decodeURIComponent(url.split(",")[1]);
  assert.match(svg, /viewBox="0 0 \d+ \d+"/);
  assert.ok((svg.match(/<rect/g) || []).length > 150);
  assert.match(svg, /<g fill="#1c4379">/);
});
test("approved Arabic infographic retains supplied text and only one item", () => {
  const ar = posterCopy.ar;
  assert.deepEqual(ar.heading, ["هاتفك يحمل حياتك.", "تأكد من حمايته."]);
  assert.equal(ar.sections.length, 4);
  assert.equal(ar.sections[0].cards.length, 4);
  assert.equal(ar.footer, "توقف • تحقق • ثم قرر");
  assert.equal(ar.sections[2].cards[0][0], "حدث نظامك وتطبيقاتك");
});
