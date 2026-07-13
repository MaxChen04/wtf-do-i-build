import assert from "node:assert/strict";
import { lstat, mkdtemp, mkdir, readFile, rm, symlink, unlink, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { checkHostSkills, syncHostSkills } from "../scripts/sync-host-skills.mjs";

const repositoryRoot = fileURLToPath(new URL("..", import.meta.url));
const expectedSkills = ["brainstorm", "build-project", "create-projects", "prd", "setup"];

async function put(file, content) {
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, content, "utf8");
}

async function fixtureRoot(t) {
  const root = await mkdtemp(path.join(os.tmpdir(), "wtfdoibuild-host-skills-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  await put(path.join(root, "skills", "setup", "SKILL.md"), "setup\n");
  await put(path.join(root, "skills", "setup", "references", "policy.md"), "policy\n");
  await put(path.join(root, "skills", "brainstorm", "SKILL.md"), "brainstorm\n");
  return root;
}

test("reports and repairs missing, changed, and extra host files idempotently", async (t) => {
  const root = await fixtureRoot(t);
  await mkdir(path.join(root, ".agents", "skills"), { recursive: true });

  const missing = await checkHostSkills(root);
  assert.ok(missing.some((issue) => issue.includes(".agents/skills") && issue.includes("missing")));
  assert.ok(missing.some((issue) => issue.includes(".claude/skills") && issue.includes("missing")));

  const firstSync = await syncHostSkills(root);
  assert.equal(firstSync.updated_hosts, 2);
  assert.deepEqual(await checkHostSkills(root), []);

  await writeFile(path.join(root, ".agents", "skills", "setup", "SKILL.md"), "changed\n", "utf8");
  await put(path.join(root, ".claude", "skills", "extra", "SKILL.md"), "extra\n");
  await mkdir(path.join(root, ".agents", "skills", "empty-extra"), { recursive: true });
  await unlink(path.join(root, ".claude", "skills", "setup", "references", "policy.md"));

  const drift = await checkHostSkills(root);
  assert.ok(drift.some((issue) => issue.includes("changed file setup/SKILL.md")));
  assert.ok(drift.some((issue) => issue.includes("extra file extra/SKILL.md")));
  assert.ok(drift.some((issue) => issue.includes("extra directory empty-extra")));
  assert.ok(drift.some((issue) => issue.includes("missing file setup/references/policy.md")));

  const repair = await syncHostSkills(root);
  assert.equal(repair.updated_hosts, 2);
  assert.deepEqual(await checkHostSkills(root), []);
  assert.equal((await syncHostSkills(root)).updated_hosts, 0);
});

test("replaces a host skill-root symlink with real copied files", async (t) => {
  const root = await fixtureRoot(t);
  await syncHostSkills(root);

  const hostRoot = path.join(root, ".agents", "skills");
  await rm(hostRoot, { recursive: true, force: true });
  await symlink(path.join(root, "skills"), hostRoot, process.platform === "win32" ? "junction" : "dir");

  const drift = await checkHostSkills(root);
  assert.ok(drift.some((issue) => issue.includes(".agents/skills") && issue.includes("root is a symbolic link")));

  await syncHostSkills(root);
  assert.equal((await lstat(hostRoot)).isSymbolicLink(), false);
  assert.deepEqual(await checkHostSkills(root), []);
});

test("repository commits all five canonical skills as identical Codex and Claude copies", async () => {
  const issues = await checkHostSkills(repositoryRoot);
  assert.deepEqual(issues, []);

  for (const skill of expectedSkills) {
    const canonical = await readFile(path.join(repositoryRoot, "skills", skill, "SKILL.md"));
    const codex = await readFile(path.join(repositoryRoot, ".agents", "skills", skill, "SKILL.md"));
    const claude = await readFile(path.join(repositoryRoot, ".claude", "skills", skill, "SKILL.md"));
    assert.deepEqual(codex, canonical, `${skill} Codex copy drifted`);
    assert.deepEqual(claude, canonical, `${skill} Claude copy drifted`);
  }
});

test("synchronization never deletes an entire host skill tree before copying", async () => {
  const synchronizer = await readFile(path.join(repositoryRoot, "scripts", "sync-host-skills.mjs"), "utf8");
  assert.doesNotMatch(synchronizer, /rm\(hostRoot/);
});
