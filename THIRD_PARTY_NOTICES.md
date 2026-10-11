# Third-party notices

## Kazuhiko Arase's QRCode for JavaScript

The QR generator under `vendor/QRCode/` (used for build-time SVG generation) and the ES-module conversion under `src/qr-runtime/` (used to produce QR codes entirely in visitors' browsers) are based on **Kazuhiko Arase's QRCode for JavaScript (2009)**, released under MIT. Some bundled code originated from the `qrcode-terminal` packaging and corresponding upstream license; see [`vendor/UPSTREAM-APACHE-LICENSE.txt`](vendor/UPSTREAM-APACHE-LICENSE.txt).

The ES-module conversion adapts the local imports/exports but does not change the QR algorithm. No QR-encoding web service is used.

## Font Awesome Free

The infographic icon SVG files under `assets/icons/` are from **Font Awesome Free** and are licensed under **CC BY 4.0**; see [`branding/FONT-AWESOME-LICENSE.txt`](branding/FONT-AWESOME-LICENSE.txt). They remain credited and unmodified where possible.

## Cairo typeface

The Cairo web typeface is requested from Google Fonts when online. The project does not bundle or redistribute font files. Devices offline use available system fallback fonts.

## CyberShield

The rest of the project is covered by [`LICENSE`](LICENSE) unless indicated otherwise.
