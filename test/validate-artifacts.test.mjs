import assert from "node:assert/strict";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import { validateArtifact } from "../scripts/validate-artifacts.mjs";

test("accepts a selected discovery brief with separate evidence and inference", async () => {
  const folder = await mkdtemp(join(tmpdir(), "wtfdoibuild-discovery-"));
  const file = join(folder, "discovery.md");
  await writeFile(file, `# Discovery brief\n\nSchema-Version: 1\nStatus: directions-selected\n\n## Resume here\nNext action: invoke /prd.\n\n## Stated lead and goal\nA real lead.\n\n## Source ledger\n| Source | Consent | What it established | Provenance |\n| --- | --- | --- | --- |\n| Conversation | yes | A repeated handoff problem | direct statement |\n\n## Questions and answers\n| ID | Question | Answer | Why it mattered |\n| --- | --- | --- | --- |\n| Q1 | Who is affected? | Coordinators | Defines the user |\n\n## Prior builds and access\nThe user has access to coordinators.\n\n## Evidence, inference, conflicts, and gaps\n### Direct evidence\n- Coordinators lose handoff details.\n\n### Bounded inference\n- Medium confidence: a narrow handoff flow may help.\n\n### Conflicts\n- None.\n\n### Gaps\n- Current workaround.\n\n## Readiness verdict\nReady because the workflow and access are specific.\n\n## Candidate directions\n### D1 — Handoff Builder\n- Status: build-worthy\n### D2 — Incoming Briefing\n- Status: build-worthy\n### D3 — Open Loop Board\n- Status: build-worthy\n### D4 — Quality Review\n- Status: build-worthy\n\n## Recommendation\nRecommend D1.\n\n## Selected directions\n- D1 — Handoff Builder — explicitly selected.\n\nNext action: invoke /prd.\n`, "utf8");

  assert.deepEqual(await validateArtifact(file), []);
});

test("reports a discovery brief that collapses direct evidence and inference", async () => {
  const folder = await mkdtemp(join(tmpdir(), "wtfdoibuild-discovery-"));
  const file = join(folder, "discovery.md");
  await writeFile(file, "# Discovery brief\n\nSchema-Version: 1\nStatus: directions-selected\n\n## Resume here\n", "utf8");

  const issues = await validateArtifact(file);
  assert.ok(issues.some((issue) => issue.includes("Direct evidence")));
  assert.ok(issues.some((issue) => issue.includes("Candidate directions")));
});

test("accepts a resumable PRD with the required handoff structure", async () => {
  const folder = await mkdtemp(join(tmpdir(), "wtfdoibuild-prd-"));
  const file = join(folder, "prd.md");
  await writeFile(file, `# Project\n\nSchema-Version: 1\n\n## Before you build\nRead this document before coding.\n\n## ▸ Resume here\nCurrent step: P0.1\n\n## Plain-English digest\nA clear product summary.\n\n## How it works\n\`\`\`mermaid\nflowchart LR\n  A --> B\n\`\`\`\n\n## Problem & why-you\nA real problem.\n\n## User & JTBD\nA user and job.\n\n## What you'll build\nA concrete first experience.\n\n## What you'll learn\nA learning outcome.\n\n## Success criteria & evals\n- [ ] P0.1: Prove the first behavior. Acceptance: a user completes it. Ref: verified source.\n  > Teaches: how to verify user-facing value.\n\n## Scope & non-goals\nDo not build unrelated work.\n\n## Architecture & framework (ADR)\nDecision, context, consequences.\n\n## Decisions to elaborate\nDecision · Context · Options · Open questions\n\n## Build plan\n### Phase P0\n- [ ] P0.1: Prove the first behavior.\n\n## Failure modes & mitigations\n| Risk | Mitigation |\n| --- | --- |\n| Drift | Review |\n\n## Anti-hallucination contract\nUse only retrieved sources.\n\n## References\n- Source ledger: none yet.\n`, "utf8");

  assert.deepEqual(await validateArtifact(file), []);
});

test("reports a missing resume header and malformed build step", async () => {
  const folder = await mkdtemp(join(tmpdir(), "wtfdoibuild-prd-"));
  const file = join(folder, "prd.md");
  await writeFile(file, "# Project\n\nSchema-Version: 1\n\n## Before you build\n", "utf8");

  const issues = await validateArtifact(file);
  assert.ok(issues.some((issue) => issue.includes("Resume here")));
  assert.ok(issues.some((issue) => issue.includes("Plain-English digest")));
});
