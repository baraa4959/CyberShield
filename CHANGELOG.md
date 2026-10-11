# Changelog

## 2.1.2 — Poster viewport and landscape refinement

- Clamp the active poster to the screen on the very first portrait frame; remove content-driven minimum heights.
- Refit the poster on viewport, container, and font readiness changes, without requiring a manual window resize.
- Balance landscape typography, card padding, inter-section gaps, and grid rows in Arabic and English.

## 2.1.1 — Dev server and documentation

- Avoid an uncaught `EADDRINUSE` crash: automatically try ports 4174–4182 when the default 4173 is occupied.
- Support `PORT` in `.env` and `npm run dev -- --port XXXX`; provide actionable errors for explicitly occupied ports.
- Preserve CyberShield identity and simplify README contribution/license sections with repository-relative links.
- Add integration tests for local-server startup behavior.

## 2.1.0 — CyberShield infographic and experience improvements

- Rebuilt the approved single infographic using dedicated 720×1280 and 1280×720 coordinate systems, with fixed-layout scaling to eliminate clipped text and overlapped sections.
- Preserved the final user-provided Arabic copy and supplied an English translation; aligned both LTR/RTL layouts and kept paragraph spacing in threats.
- Rebuilt the end-of-scenario review: per-decision good/risky labels, explanations, summary, and specific security advice.
- Fixed QR handoff: browser-side SVG generation, configurable `PUBLIC_SITE_URL`, automatic HTTPS URL fallback, and explicit setup guidance when not available.
- Added two interactive security stories in both languages (fake technical support and friend impersonation), bringing the total to ten.
- Restored CyberShield project identity and documentation links. Documentation previews use English.

## 2.0.0

- Single infographic and phone-native branching stories.
