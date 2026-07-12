import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));

test("bundles discovery validation and requires every discovery-template heading", async () => {
  const skill = await readFile(join(root, "skills", "brainstorm", "SKILL.md"), "utf8");
  assert.match(skill, /Preserve every heading from the discovery template exactly/);
  assert.match(skill, /Markdown `###` headings/);
  assert.match(skill, /\.claude\/skills\/brainstorm\/scripts\/validate-artifacts\.mjs/);
  await access(join(root, "skills", "brainstorm", "scripts", "validate-artifacts.mjs"));
});

test("bundles the same fresh memory source reader with setup and brainstorm", async () => {
  const source = await readFile(join(root, "scripts", "memory-sources.mjs"), "utf8");
  const setupCopy = await readFile(join(root, "skills", "setup", "scripts", "memory-sources.mjs"), "utf8");
  const brainstormCopy = await readFile(join(root, "skills", "brainstorm", "scripts", "memory-sources.mjs"), "utf8");

  assert.equal(setupCopy, source);
  assert.equal(brainstormCopy, source);
});
