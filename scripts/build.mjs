import fs from "node:fs";
import path from "node:path";
import { ROOT, getConfig, makeQR } from "./config.mjs";
const config = getConfig();
if (!config.visitorEnabled && !config.presentationEnabled)
  console.warn("WARNING: Both modes are disabled in this build.");
const dist = path.join(ROOT, "dist");
fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist, { recursive: true });
for (const entry of [
  "index.html",
  "styles.css",
  "poster-sheet.css",
  "favicon.svg",
])
  fs.copyFileSync(path.join(ROOT, entry), path.join(dist, entry));
for (const dir of ["src", "branding", "assets"])
  fs.cpSync(path.join(ROOT, dir), path.join(dist, dir), { recursive: true });
fs.writeFileSync(
  path.join(dist, "config.json"),
  JSON.stringify(config, null, 2) + "\n",
);
const qr = makeQR(config);
if (qr) fs.writeFileSync(path.join(dist, "qr.svg"), qr);
fs.writeFileSync(path.join(dist, ".nojekyll"), "");
console.log(
  `CyberShield built in ${dist}\nModes: visitor=${config.visitorEnabled} presentation=${config.presentationEnabled}\nQR: ${qr ? "generated" : "disabled or URL not configured"}`,
);
