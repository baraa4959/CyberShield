/** Generate static HTML fixtures for visual regression snapshots; not part of runtime. */
import fs from "node:fs";
import { getConfig } from "./config.mjs";
const listeners = {};
let bar;
const app = {
  innerHTML: "",
  addEventListener(type, fn) {
    listeners["app:" + type] = fn;
  },
};
const elements = { app };
const document = {
  documentElement: { lang: "en", dir: "ltr", style: { setProperty() {} } },
  body: {
    appendChild(el) {
      bar = el;
    },
  },
  getElementById(id) {
    return elements[id] || null;
  },
  createElement() {
    const input = { value: "", focus() {} };
    return {
      id: "",
      innerHTML: "",
      setAttribute() {},
      addEventListener(type, fn) {
        this[type] = fn;
      },
      querySelector() {
        return input;
      },
      remove() {
        bar = null;
      },
    };
  },
};
globalThis.document = document;
globalThis.window = {
  addEventListener(t, fn) {
    listeners["window:" + t] = fn;
  },
};
globalThis.fetch = async () => ({
  ok: true,
  json: async () =>
    getConfig({
      PUBLIC_SITE_URL: "https://cybershield.university.edu/",
      ENABLE_VISITOR_MODE: "true",
      ENABLE_PRESENTATION_MODE: "true",
    }),
});
globalThis.setInterval = () => 0;
await import("../src/app.js");
await new Promise((r) => setImmediate(r));
const click = (data) =>
  listeners["app:click"]({ target: { closest: () => ({ dataset: data }) } });
const command = (cmd) => {
  listeners["window:keydown"]({
    key: "k",
    code: "KeyK",
    altKey: true,
    ctrlKey: false,
    metaKey: false,
    shiftKey: false,
    preventDefault() {},
  });
  bar.querySelector("input").value = cmd;
  bar.submit({ preventDefault() {} });
};
for (const lang of ["en", "ar"]) {
  click({ action: "language", lang });
  command("present");
  fs.writeFileSync(
    `docs/screenshots/fixture-poster-${lang}.html`,
    app.innerHTML,
  );
  click({ action: "experience", id: "sms" });
  fs.writeFileSync(
    `docs/screenshots/fixture-experience-${lang}.html`,
    app.innerHTML,
  );
  click({ action: "answer", index: "0" });
  click({ action: "answer", index: "0" });
  fs.writeFileSync(
    `docs/screenshots/fixture-review-${lang}.html`,
    app.innerHTML,
  );
  command("back");
}
