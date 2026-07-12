import assert from "node:assert/strict";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import { validateArtifact } from "../scripts/validate-artifacts.mjs";

test("accepts a resumable PRD with the required handoff structure", async () => {
  const folder = await mkdtemp(join(tmpdir(), "aviator-hamster-prd-"));
  const file = join(folder, "prd.md");
  await writeFile(file, `# Project\n\nSchema-Version: 1\n\n## Before you build\nRead this document before coding.\n\n## ▸ Resume here\nCurrent step: P0.1\n\n## Plain-English digest\nA clear product summary.\n\n## How it works\n\`\`\`mermaid\nflowchart LR\n  A --> B\n\`\`\`\n\n## Problem & why-you\nA real problem.\n\n## User & JTBD\nA user and job.\n\n## What you'll build\nA concrete first experience.\n\n## What you'll learn\nA learning outcome.\n\n## Success criteria & evals\n- [ ] P0.1: Prove the first behavior. Acceptance: a user completes it. Ref: verified source.\n  > Teaches: how to verify user-facing value.\n\n## Scope & non-goals\nDo not build unrelated work.\n\n## Architecture & framework (ADR)\nDecision, context, consequences.\n\n## Decisions to elaborate\nDecision · Context · Options · Open questions\n\n## Build plan\n### Phase P0\n- [ ] P0.1: Prove the first behavior.\n\n## Failure modes & mitigations\n| Risk | Mitigation |\n| --- | --- |\n| Drift | Review |\n\n## Anti-hallucination contract\nUse only retrieved sources.\n\n## References\n- Source ledger: none yet.\n`, "utf8");

  assert.deepEqual(await validateArtifact(file), []);
});

test("reports a missing resume header and malformed build step", async () => {
  const folder = await mkdtemp(join(tmpdir(), "aviator-hamster-prd-"));
  const file = join(folder, "prd.md");
  await writeFile(file, "# Project\n\nSchema-Version: 1\n\n## Before you build\n", "utf8");

  const issues = await validateArtifact(file);
  assert.ok(issues.some((issue) => issue.includes("Resume here")));
  assert.ok(issues.some((issue) => issue.includes("Plain-English digest")));
});
