import assert from "node:assert/strict";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import test from "node:test";

import { provisionProject } from "../scripts/provision-project.mjs";

const execFileAsync = promisify(execFile);

test("creates an idempotent local PRD repository with a project-local execution skill", async () => {
  const home = await mkdtemp(join(tmpdir(), "wtfdoibuild-project-"));
  const prd = join(home, "approved-prd.md");
  const target = join(home, "workflow-map");
  await writeFile(prd, "# Workflow Map\n\nSchema-Version: 1\n", "utf8");

  const first = await provisionProject({ projectPath: target, prdPath: prd, projectName: "Workflow Map" });
  const second = await provisionProject({ projectPath: target, prdPath: prd, projectName: "Workflow Map" });

  assert.equal(first.created, true);
  assert.equal(second.created, false);
  assert.match(await readFile(join(target, "README.md"), "utf8"), /Workflow Map/);
  assert.match(await readFile(join(target, "AGENTS.md"), "utf8"), /PRD\.md/);
  assert.match(await readFile(join(target, ".agents", "skills", "build-project", "SKILL.md"), "utf8"), /Build an approved project/);
  assert.match(await readFile(join(target, ".agents", "skills", "build-project", "references", "locked-skill-routing.md"), "utf8"), /smallest relevant subset/);
  assert.match(await readFile(join(target, ".agents", "skills", "build-project", "scripts", "journal.mjs"), "utf8"), /appendJournalEvent/);
  const { stdout } = await execFileAsync("git", ["-C", target, "log", "--oneline"]);
  assert.equal(stdout.trim().split("\n").length, 1);
});
