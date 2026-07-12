import assert from "node:assert/strict";
import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import { appendJournalEvent, buildProjectsRollup, readJournal } from "../scripts/journal.mjs";

test("appends schema-checked events and builds a deterministic project rollup", async () => {
  const home = await mkdtemp(join(tmpdir(), "aviator-hamster-"));

  await appendJournalEvent({
    home,
    event: {
      timestamp: "2026-07-11T12:00:00.000Z",
      skill: "setup",
      event: "setup_completed",
      session_slug: "first-lead",
      details: { host: "Codex" }
    }
  });
  await appendJournalEvent({
    home,
    event: {
      timestamp: "2026-07-11T12:01:00.000Z",
      skill: "create-projects",
      event: "repository_created",
      session_slug: "first-lead",
      project_slug: "workflow-map",
      details: { path: "~/Projects/workflow-map", next_step: "P0.1" }
    }
  });
  await appendJournalEvent({
    home,
    event: {
      timestamp: "2026-07-11T12:02:00.000Z",
      skill: "build-project",
      event: "build_step_completed",
      session_slug: "first-lead",
      project_slug: "workflow-map",
      details: { step_id: "P0.1", next_step: "P0.2" }
    }
  });

  const entries = await readJournal(home);
  assert.equal(entries.length, 3);
  assert.equal(entries[0].schema_version, 1);

  const rollup = await buildProjectsRollup(home);
  assert.match(rollup, /workflow-map/);
  assert.match(rollup, /P0\.2/);
  assert.equal(await readFile(join(home, "projects.md"), "utf8"), rollup);
});

test("rejects an event with an unknown lifecycle name", async () => {
  const home = await mkdtemp(join(tmpdir(), "aviator-hamster-"));
  await assert.rejects(
    appendJournalEvent({
      home,
      event: {
        timestamp: "2026-07-11T12:00:00.000Z",
        skill: "setup",
        event: "made_up_event",
        session_slug: "first-lead",
        details: {}
      }
    }),
    /Unsupported journal event/
  );
});
