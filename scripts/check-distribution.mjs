#!/usr/bin/env node

import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const scriptsDirectory = path.dirname(fileURLToPath(import.meta.url));
const checks = ["sync-skill-scripts.mjs", "sync-host-skills.mjs"];

function runNodeCheck(script) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [path.join(scriptsDirectory, script), "--check"], {
      stdio: "inherit"
    });
    child.once("error", reject);
    child.once("exit", (code) => resolve(code ?? 1));
  });
}

export async function runDistributionChecks(run = runNodeCheck) {
  const exitCodes = await Promise.all(checks.map((script) => run(script)));
  return exitCodes.some((code) => code !== 0) ? 1 : 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  runDistributionChecks().then((exitCode) => {
    process.exitCode = exitCode;
  }).catch((error) => {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  });
}
