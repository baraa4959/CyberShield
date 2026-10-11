import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { ROOT, getConfig, makeQR, readEnv } from "./config.mjs";

const useDist = process.argv.includes("--dist");
const directory = useDist ? path.join(ROOT, "dist") : ROOT;
const MAX_FALLBACK_PORTS = 10;
const mime = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".webp": "image/webp",
};

function send(res, status, type, data) {
  res.writeHead(status, {
    "content-type": type,
    "cache-control": "no-store",
    "x-content-type-options": "nosniff",
  });
  res.end(data);
}

function serve(req, res) {
  let pathname;
  try {
    pathname = decodeURIComponent(
      new URL(req.url || "/", "http://localhost").pathname,
    );
  } catch {
    return send(res, 400, "text/plain", "Bad request");
  }
  if (!useDist && pathname === "/config.json") {
    return send(res, 200, mime[".json"], JSON.stringify(getConfig()));
  }
  if (!useDist && pathname === "/qr.svg") {
    const svg = makeQR(getConfig());
    return svg
      ? send(res, 200, mime[".svg"], svg)
      : send(res, 404, "text/plain", "QR unavailable");
  }

  let relative = pathname.replace(/^\/+/, "") || "index.html";
  let resolved = path.resolve(directory, relative);
  if (!resolved.startsWith(directory + path.sep) && resolved !== directory) {
    return send(res, 403, "text/plain", "Forbidden");
  }
  if (
    relative.split("/").some((segment) => segment.startsWith(".")) &&
    relative !== ".nojekyll"
  ) {
    return send(res, 404, "text/plain", "Not found");
  }
  if (
    !useDist &&
    (/^(?:scripts|vendor|tests|docs|\.github)\//.test(relative) ||
      relative === "package.json")
  ) {
    return send(res, 404, "text/plain", "Not found");
  }
  try {
    let stat = fs.statSync(resolved);
    if (stat.isDirectory()) {
      resolved = path.join(resolved, "index.html");
      stat = fs.statSync(resolved);
    }
    if (!stat.isFile()) throw new Error("Not a file");
    res.writeHead(200, {
      "content-type":
        mime[path.extname(resolved)] || "application/octet-stream",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
    });
    fs.createReadStream(resolved).pipe(res);
  } catch {
    send(res, 404, "text/plain", "Not found");
  }
}

const cliIndex = process.argv.indexOf("--port");
if (cliIndex >= 0 && !process.argv[cliIndex + 1]) {
  console.error(
    "CyberShield: --port requires a number (example: --port 4174).",
  );
  process.exit(1);
}
const envPort = readEnv().PORT;
const chosen =
  cliIndex >= 0
    ? process.argv[cliIndex + 1]
    : process.env.PORT || envPort || "4173";
const requestedPort = Number(chosen);
if (
  !Number.isInteger(requestedPort) ||
  requestedPort < 1 ||
  requestedPort > 65535
) {
  console.error(
    `CyberShield: invalid port ${JSON.stringify(chosen)}. Choose a port from 1 to 65535.`,
  );
  process.exit(1);
}
// An explicit custom port should be respected, not silently substituted.
const fallback = cliIndex < 0 && requestedPort === 4173;
let currentPort = requestedPort;
let attempts = 0;
const server = http.createServer(serve);

server.on("error", (error) => {
  if (
    error.code === "EADDRINUSE" &&
    fallback &&
    attempts < MAX_FALLBACK_PORTS - 1
  ) {
    const previous = currentPort;
    currentPort += 1;
    attempts += 1;
    console.warn(
      `CyberShield: port ${previous} is busy; trying ${currentPort}...`,
    );
    return server.listen(currentPort);
  }
  if (error.code === "EADDRINUSE") {
    console.error(`CyberShield: port ${currentPort} is already in use.`);
    console.error(
      `Try: PORT=${currentPort + 1} npm run ${useDist ? "preview" : "dev"}`,
    );
    console.error(
      `To inspect the process on macOS: lsof -nP -iTCP:${currentPort} -sTCP:LISTEN`,
    );
  } else {
    console.error(`CyberShield: could not start server (${error.message}).`);
  }
  process.exitCode = 1;
});

server.listen(currentPort, () => {
  console.log(
    `CyberShield ${useDist ? "preview" : "development"}: http://localhost:${currentPort}`,
  );
  if (currentPort !== requestedPort) {
    console.warn(
      `NOTE: port ${requestedPort} is still occupied by another process. Open port ${currentPort} to see this version.`,
    );
  }
});
