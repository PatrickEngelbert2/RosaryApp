import { spawn } from "node:child_process";
import { platform } from "node:os";

const host = process.env.HOST ?? "localhost";
const port = process.env.PORT ?? "3000";
const url = `http://${host}:${port}`;

function openBrowser(targetUrl) {
  const opener =
    platform() === "win32"
      ? { command: "cmd", args: ["/c", "start", "", targetUrl] }
      : platform() === "darwin"
        ? { command: "open", args: [targetUrl] }
        : { command: "xdg-open", args: [targetUrl] };

  const child = spawn(opener.command, opener.args, {
    detached: true,
    stdio: "ignore",
    shell: false,
  });

  child.unref();
}

const nextBin = "node_modules/next/dist/bin/next";

const server = spawn(
  process.execPath,
  [nextBin, "dev", "--hostname", host, "--port", port],
  {
    stdio: "inherit",
    shell: false,
  },
);

const openDelayMs = Number(process.env.OPEN_DELAY_MS ?? "1800");
const shouldOpen = process.env.NO_OPEN !== "1";

if (shouldOpen) {
  setTimeout(() => openBrowser(url), openDelayMs);
}

console.log(`Starting Catholic Rosary Walks at ${url}`);
console.log("Set NO_OPEN=1 to start without opening a browser.");

function stop() {
  if (!server.killed) {
    server.kill("SIGINT");
  }
}

process.on("SIGINT", stop);
process.on("SIGTERM", stop);
server.on("exit", (code) => process.exit(code ?? 0));
