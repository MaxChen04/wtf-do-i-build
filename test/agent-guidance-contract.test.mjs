import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("root agent guidance routes discovery through skills, connectors, and research", async () => {
  const guidance = await readFile(new URL("../AGENTS.md", import.meta.url), "utf8");
  for (const skill of ["setup", "brainstorm", "prd", "create-projects", "build-project"]) {
    assert.match(guidance, new RegExp(`\\b${skill}\\b`));
  }
  assert.match(guidance, /Google Calendar/i);
  assert.match(guidance, /other calendar/i);
  assert.match(guidance, /MCP|connector/i);
  assert.match(guidance, /web/i);
  assert.match(guidance, /ambiguous|ambiguity/i);
  assert.match(guidance, /consent/i);
});

test("model guidance recommends separate questioning and PRD synthesis routes", async () => {
  const guidance = await readFile(new URL("../skills/setup/references/model-guidance.md", import.meta.url), "utf8");
  assert.match(guidance, /GPT 5\.6.*Medium/i);
  assert.match(guidance, /Luna.*Max/i);
  assert.match(guidance, /Sol.*PRD synthesis/i);
  assert.match(guidance, /Opus 4\.8.*Low/i);
  assert.match(guidance, /Fable 5.*High/i);
  assert.match(guidance, /closest available/i);
});
