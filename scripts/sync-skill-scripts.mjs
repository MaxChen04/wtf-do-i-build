#!/usr/bin/env node
import { cp, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const copies = [
  ["journal.mjs", "skills/setup/scripts/journal.mjs"],
  ["journal.mjs", "skills/brainstorm/scripts/journal.mjs"],
  ["journal.mjs", "skills/prd/scripts/journal.mjs"],
  ["journal.mjs", "skills/create-projects/scripts/journal.mjs"],
  ["validate-artifacts.mjs", "skills/prd/scripts/validate-artifacts.mjs"],
  ["provision-project.mjs", "skills/create-projects/scripts/provision-project.mjs"]
];

async function matches(source, target) {
  try {
    return (await readFile(source, "utf8")) === (await readFile(target, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") return false;
    throw error;
  }
}

async function main() {
  const check = process.argv.includes("--check");
  const stale = [];
  for (const [sourceRelative, targetRelative] of copies) {
    const source = join(root, "scripts", sourceRelative);
    const target = join(root, targetRelative);
    if (!await matches(source, target)) {
      stale.push(targetRelative);
      if (!check) await cp(source, target, { force: true });
    }
  }
  if (check && stale.length) throw new Error(`Distribution scripts are stale: ${stale.join(", ")}`);
  process.stdout.write(check ? "Distribution scripts match their sources.\n" : `Synced ${stale.length} distribution script(s).\n`);
}

main().catch((error) => {
  process.stderr.write(`${error.message}\n`);
  process.exitCode = 1;
});
