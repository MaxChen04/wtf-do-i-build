import assert from "node:assert/strict";
import test from "node:test";

import { loadFixtures, validateFixture } from "../evals/run-evals.mjs";

test("ships every behavior fixture required by the skill-first contract", async () => {
  const fixtures = await loadFixtures();
  const names = new Set(fixtures.map((fixture) => fixture.name));
  for (const required of [
    "technical-lead",
    "domain-expert",
    "vague-premise",
    "resume-intent-conflict",
    "github-enriched",
    "no-mcp",
    "connector-failure",
    "malicious-external-source",
    "memory-context",
    "returning-user",
    "reference-adherence"
  ]) assert.ok(names.has(required), `Missing ${required} fixture.`);
  for (const fixture of fixtures) assert.deepEqual(validateFixture(fixture), []);
});
