// Offline browser-side QR generation, from the locally bundled Kazuhiko Arase MIT code.
import QRCode from "./qr-runtime/index.js";
export function createQRCodeURL(value) {
  const qr = new QRCode(-1, 0);
  qr.addData(value);
  qr.make();
  const n = qr.getModuleCount(),
    quiet = 4,
    full = n + quiet * 2;
  const rects = [];
  for (let y = 0; y < n; y++)
    for (let x = 0; x < n; x++)
      if (qr.isDark(y, x))
        rects.push(
          `<rect x="${x + quiet}" y="${y + quiet}" width="1" height="1"/>`,
        );
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${full} ${full}" shape-rendering="crispEdges"><rect width="${full}" height="${full}" fill="white"/><g fill="#1c4379">${rects.join("")}</g></svg>`;
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}
