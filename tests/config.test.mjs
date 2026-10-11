import test from "node:test";
import assert from "node:assert/strict";
import { getConfig, makeQR } from "../scripts/config.mjs";
test("feature flags and duration values are parsed", () => {
  const c = getConfig({
    ENABLE_VISITOR_MODE: "false",
    ENABLE_PRESENTATION_MODE: "true",
    POSTER_DURATION_SECONDS: "240",
    EXPERIENCE_IDLE_SECONDS: "45",
    POSTER_RANDOM_ORDER: "false",
  });
  assert.equal(c.visitorEnabled, false);
  assert.equal(c.presentationEnabled, true);
  assert.equal(c.posterDurationSeconds, 240);
  assert.equal(c.experienceIdleSeconds, 45);
  assert.equal(c.posterRandomOrder, false);
});
test("placeholder or invalid public URLs never create QR codes", () => {
  assert.equal(
    makeQR(
      getConfig({
        PUBLIC_SITE_URL: "https://example.org/",
        ENABLE_VISITOR_MODE: "true",
      }),
    ),
    null,
  );
  assert.equal(
    makeQR(
      getConfig({
        PUBLIC_SITE_URL: "javascript:alert(1)",
        ENABLE_VISITOR_MODE: "true",
      }),
    ),
    null,
  );
});
test("valid public site URL creates a real matrix-based SVG QR", () => {
  const qr = makeQR(
    getConfig({
      PUBLIC_SITE_URL: "https://cyber.example.edu/explore/",
      ENABLE_VISITOR_MODE: "true",
    }),
  );
  assert.match(qr, /viewBox="0 0 \d+ \d+"/);
  assert.ok((qr.match(/<rect/g) || []).length > 100);
});
test("PNG infographic logos are supported safely", () => {
  const c = getConfig({ POSTER_LOGO_PATH: "branding/university-logo.png" });
  assert.equal(c.posterLogoPath, "branding/university-logo.png");
  const unsafe = getConfig({
    POSTER_LOGO_PATH: "https://example.org/fake.png",
  });
  assert.equal(unsafe.posterLogoPath, "branding/university-logo-poster.svg");
});
test("unsafe brand tokens are rejected", () => {
  const c = getConfig({
    BRAND_PRIMARY: "red; background:url(x)",
    UNIVERSITY_LOGO_PATH: "https://evil.example/logo.svg",
  });
  assert.equal(c.primary, "#1c4379");
  assert.equal(c.universityLogoPath, "branding/university-logo.svg");
});

test("brand-name visibility defaults to off and can be enabled independently of the logo", () => {
  const hidden = getConfig({});
  assert.equal(hidden.showBrandName, false);
  const visible = getConfig({
    SHOW_BRAND_NAME: "true",
    SHOW_UNIVERSITY_LOGO: "false",
    SITE_NAME: "University Week",
  });
  assert.equal(visible.showBrandName, true);
  assert.equal(visible.showUniversityLogo, false);
  assert.equal(visible.siteName, "University Week");
});
