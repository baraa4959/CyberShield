import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

export const ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
export function readEnv() {
  const out = {};
  for (const filename of [".env.example", ".env"]) {
    const loc = path.join(ROOT, filename);
    if (!fs.existsSync(loc)) continue;
    for (const line of fs.readFileSync(loc, "utf8").split(/\r?\n/)) {
      const match = line.match(/^\s*([A-Z][A-Z0-9_]*)\s*=\s*(.*?)\s*$/);
      if (!match) continue;
      let value = match[2];
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      )
        value = value.slice(1, -1);
      out[match[1]] = value;
    }
  }
  // Environment variables from host providers override .env.
  for (const name of Object.keys(out)) {
    if (process.env[name] !== undefined) out[name] = process.env[name];
  }
  return out;
}
const bool = (v, defaultValue) =>
  v === undefined ? defaultValue : /^(true|1|yes|on)$/i.test(String(v));
const seconds = (v, fallback) => {
  const n = Number(v);
  return Number.isFinite(n) && n >= 1 && n <= 86400 ? n : fallback;
};
const safeColor = (v, backup) =>
  /^#[0-9a-fA-F]{6}$/.test(v || "") ? v : backup;
export function getConfig(env = readEnv()) {
  const visitor = bool(env.ENABLE_VISITOR_MODE, true),
    presentation = bool(env.ENABLE_PRESENTATION_MODE, true);
  let publicSiteUrl = "";
  try {
    const u = new URL(env.PUBLIC_SITE_URL || "");
    if (
      ["https:", "http:"].includes(u.protocol) &&
      !["example.org", "example.com", "localhost", "127.0.0.1"].includes(
        u.hostname,
      )
    ) {
      u.hash = "";
      u.search = "";
      publicSiteUrl = u.toString();
    }
  } catch {}
  const logo = env.UNIVERSITY_LOGO_PATH || "branding/university-logo.svg";
  return {
    visitorEnabled: visitor,
    presentationEnabled: presentation,
    publicSiteUrl,
    showUniversityLogo: bool(env.SHOW_UNIVERSITY_LOGO, true),
    showBrandName: bool(env.SHOW_BRAND_NAME, false),
    universityLogoPath:
      /^(?!\/|https?:|\.)(?:[\w-]+\/)*[\w.-]+\.(?:svg|png|webp)$/i.test(logo)
        ? logo
        : "branding/university-logo.svg",
    posterLogoPath:
      /^(?!\/|https?:|\.)(?:[\w-]+\/)*[\w.-]+\.(?:svg|png|webp)$/i.test(
        env.POSTER_LOGO_PATH || "",
      )
        ? env.POSTER_LOGO_PATH
        : "branding/university-logo-poster.svg",
    posterDurationSeconds: seconds(env.POSTER_DURATION_SECONDS, 180),
    experienceIdleSeconds: seconds(env.EXPERIENCE_IDLE_SECONDS, 60),
    posterRandomOrder: bool(env.POSTER_RANDOM_ORDER, true),
    showQR: bool(env.SHOW_QR_AFTER_EXPERIENCE, true),
    defaultLanguage: /^[a-z]{2}(?:-[A-Z]{2})?$/i.test(
      env.DEFAULT_LANGUAGE || "",
    )
      ? env.DEFAULT_LANGUAGE
      : "ar",
    primary: safeColor(env.BRAND_PRIMARY, "#1c4379"),
    secondary: safeColor(env.BRAND_SECONDARY, "#28b6ba"),
    siteName: String(env.SITE_NAME || "CyberShield").slice(0, 60),
  };
}
export function makeQR(config) {
  if (!config.publicSiteUrl || !config.visitorEnabled || !config.showQR)
    return null;
  const require = createRequire(import.meta.url),
    QRCode = require(path.join(ROOT, "vendor/QRCode/index.js"));
  const qr = new QRCode(-1, 0); // medium error correction; no external QR service
  qr.addData(config.publicSiteUrl);
  qr.make();
  const count = qr.getModuleCount(),
    quiet = 4,
    size = count + quiet * 2;
  const pieces = [];
  for (let y = 0; y < count; y++)
    for (let x = 0; x < count; x++)
      if (qr.isDark(y, x))
        pieces.push(
          `<rect x="${x + quiet}" y="${y + quiet}" width="1" height="1"/>`,
        );
  return `<svg xmlns="http://www.w3.org/2000/svg" role="img" viewBox="0 0 ${size} ${size}" shape-rendering="crispEdges"><rect width="${size}" height="${size}" fill="#fff"/><g fill="#101b2c">${pieces.join("")}</g></svg>`;
}
