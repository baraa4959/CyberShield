import test from "node:test";
import assert from "node:assert/strict";
import net from "node:net";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
function spawnDev(args = [], port) {
  const env = { ...process.env };
  delete env.PORT;
  if (port !== undefined) env.PORT = String(port);
  const child = spawn(process.execPath, ["scripts/dev.mjs", ...args], {
    cwd: root,
    env,
    stdio: ["ignore", "pipe", "pipe"],
  });
  const exited = new Promise((resolve) =>
    child.once("exit", (code, signal) => resolve({ code, signal })),
  );
  let output = "";
  child.stdout.on("data", (d) => {
    output += d.toString();
  });
  child.stderr.on("data", (d) => {
    output += d.toString();
  });
  return {
    child,
    exited,
    get output() {
      return output;
    },
  };
}
async function waitFor(getter, matcher, timeoutMs = 4500) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const m = getter().match(matcher);
    if (m) return m;
    await new Promise((resolve) => setTimeout(resolve, 25));
  }
  throw new Error("Timed out waiting for " + matcher + "; output: " + getter());
}
async function listen(port) {
  const server = net.createServer();
  try {
    server.listen(port);
    await once(server, "listening");
    return server;
  } catch (e) {
    server.close();
    throw e;
  }
}
async function close(server) {
  return new Promise((resolve) => server.close(resolve));
}
async function shutdown(child) {
  if (child.exitCode === null && child.signalCode === null) {
    child.kill("SIGTERM");
    await Promise.race([
      once(child, "exit"),
      new Promise((resolve) => setTimeout(resolve, 1000)),
    ]);
  }
}

test(
  "default port falls back cleanly if 4173 is occupied",
  { timeout: 10000 },
  async () => {
    let occupied = null;
    try {
      occupied = await listen(4173);
    } catch (error) {
      if (error.code !== "EADDRINUSE") throw error;
    }
    const instance = spawnDev([], "4173");
    try {
      const found = await waitFor(
        () => instance.output,
        /CyberShield development: http:\/\/localhost:(\d+)/,
      );
      const actualPort = Number(found[1]);
      assert.ok(actualPort >= 4174 && actualPort <= 4182, instance.output);
      assert.match(instance.output, /port 4173 is busy/);
      const response = await fetch(`http://127.0.0.1:${actualPort}/`);
      assert.equal(response.status, 200);
      assert.match(await response.text(), /CyberShield|<html/i);
    } finally {
      await shutdown(instance.child);
      if (occupied) await close(occupied);
    }
  },
);

test(
  "explicit busy port prints actionable error instead of an unhandled stack trace",
  { timeout: 10000 },
  async () => {
    const occupied = await listen(0);
    const port = occupied.address().port;
    const instance = spawnDev(["--port", String(port)]);
    try {
      await waitFor(() => instance.output, /already in use/);
      const exit = await instance.exited;
      assert.equal(exit.code, 1);
      assert.match(instance.output, /Try: PORT=/);
      assert.doesNotMatch(instance.output, /Unhandled 'error' event/);
    } finally {
      await shutdown(instance.child);
      await close(occupied);
    }
  },
);
