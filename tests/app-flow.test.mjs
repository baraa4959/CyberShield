import test from "node:test";
import assert from "node:assert/strict";
import { getConfig } from "../scripts/config.mjs";

test("only handset during story, natural branches, analysis and presentation QR after completion", async () => {
  const original = {
    fetch: globalThis.fetch,
    setInterval: globalThis.setInterval,
    window: globalThis.window,
    document: globalThis.document,
  };
  const listeners = {};
  let palette = null,
    tickFn;
  const app = {
    innerHTML: "",
    addEventListener(type, handler) {
      listeners[`app:${type}`] = handler;
    },
  };
  const doc = {
    documentElement: { lang: "en", dir: "ltr", style: { setProperty() {} } },
    body: {
      appendChild(el) {
        if (el.id === "command-palette") palette = el;
      },
    },
    getElementById(id) {
      if (id === "app") return app;
      if (id === "command-palette") return palette;
      return null;
    },
    createElement() {
      const input = { value: "", focus() {} };
      return {
        id: "",
        className: "",
        innerHTML: "",
        attrs: {},
        setAttribute(k, v) {
          this.attrs[k] = v;
        },
        addEventListener(type, fn) {
          this[type] = fn;
        },
        querySelector() {
          return input;
        },
        remove() {
          palette = null;
        },
      };
    },
  };
  try {
    globalThis.window = {
      addEventListener(type, fn) {
        listeners[`window:${type}`] = fn;
      },
    };
    globalThis.document = doc;
    globalThis.setInterval = (fn) => {
      tickFn = fn;
      return 0;
    };
    globalThis.fetch = async () => ({
      ok: true,
      json: async () =>
        getConfig({
          PUBLIC_SITE_URL: "https://campus.edu/booth/",
          ENABLE_VISITOR_MODE: "true",
          ENABLE_PRESENTATION_MODE: "true",
        }),
    });
    await import("../src/app.js");
    await new Promise((resolve) => setImmediate(resolve));
    assert.match(app.innerHTML, /Choose a language/);
    const click = (dataset) =>
      listeners["app:click"]({ target: { closest: () => ({ dataset }) } });
    click({ action: "language", lang: "ar" });
    assert.match(app.innerHTML, /اختر تجربة/);
    click({ action: "experience", id: "sms" });
    assert.match(app.innerHTML, /real-phone/);
    assert.match(app.innerHTML, /تعذر تسليم شحنتك/);
    assert.doesNotMatch(
      app.innerHTML,
      /ماذا حدث|review-list|SIMULATED SCENARIO|quiz-score/,
    );
    click({ action: "answer", index: "1" });
    assert.match(app.innerHTML, /لا يوجد طلب لتعديل العنوان/);
    assert.doesNotMatch(app.innerHTML, /review-list/);
    click({ action: "answer", index: "0" });
    assert.match(app.innerHTML, /review-list/);
    assert.match(app.innerHTML, /مراجعة قراراتك/);
    assert.doesNotMatch(app.innerHTML, /qr-panel/);
    const key = (key, mods = {}) =>
      listeners["window:keydown"]({
        key,
        code: key === "k" ? "KeyK" : key,
        ctrlKey: false,
        shiftKey: false,
        altKey: false,
        metaKey: false,
        preventDefault() {},
        ...mods,
      });
    const command = (cmd) => {
      key("k", { altKey: true });
      assert.ok(palette);
      palette.querySelector("input").value = cmd;
      palette.submit({ preventDefault() {} });
    };
    command("present");
    assert.match(app.innerHTML, /poster-sheet/);
    assert.match(app.innerHTML, /هاتفك يحمل حياتك/);
    assert.equal((app.innerHTML.match(/sheet-title/g) || []).length, 4);
    command("en");
    assert.equal(doc.documentElement.lang, "en");
    assert.match(app.innerHTML, /Your phone holds your life/);
    command("ar");
    assert.equal(doc.documentElement.lang, "ar");
    listeners["window:pointerdown"]({ pointerType: "touch" });
    assert.match(app.innerHTML, /hub-main/);
    click({ action: "experience", id: "sms" });
    click({ action: "answer", index: "0" });
    click({ action: "answer", index: "1" });
    assert.match(app.innerHTML, /review-list/);
    assert.match(app.innerHTML, /qr-panel/);
    assert.match(app.innerHTML, /https:\/\/campus\.edu\/booth\//);
    command("back");
    assert.match(app.innerHTML, /poster-sheet/);
    listeners["window:pointerdown"]({ pointerType: "touch" });
    assert.match(app.innerHTML, /hub-main/);
    const now = Date.now;
    Date.now = () => now() + 62000;
    try {
      tickFn();
    } finally {
      Date.now = now;
    }
    assert.match(app.innerHTML, /poster-sheet/);
    command("stop");
    assert.match(app.innerHTML, /hub-main/);
  } finally {
    Object.assign(globalThis, original);
  }
});
