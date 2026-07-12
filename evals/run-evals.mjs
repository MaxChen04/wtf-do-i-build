#!/usr/bin/env node
import { readdir, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const fixturesDirectory = join(dirname(fileURLToPath(import.meta.url)), "fixtures");

export function validateFixture(fixture) {
  const issues = [];
  for (const field of ["name", "scenario", "input", "expected_behaviors"]) {
    if (!(field in fixture)) issues.push(`Missing ${field}.`);
  }
  if (!Array.isArray(fixture.expected_behaviors) || !fixture.expected_behaviors.length) {
    issues.push("expected_behaviors must be a non-empty array.");
  }
  return issues;
}

export async function loadFixtures() {
  const files = (await readdir(fixturesDirectory)).filter((file) => file.endsWith(".json")).sort();
  return Promise.all(files.map(async (file) => JSON.parse(await readFile(join(fixturesDirectory, file), "utf8"))));
}

async function main() {
  const fixtures = await loadFixtures();
  const failures = fixtures.flatMap((fixture) => validateFixture(fixture).map((issue) => `${fixture.name}: ${issue}`));
  if (failures.length) {
    process.stderr.write(`${failures.join("\n")}\n`);
    process.exitCode = 1;
    return;
  }
  process.stdout.write(`Validated ${fixtures.length} behavior fixtures. Human or host runs must score the behaviors in expected-behaviors.md, not exact wording.\n`);
}

if (import.meta.url === `file://${process.argv[1]}`) main();
