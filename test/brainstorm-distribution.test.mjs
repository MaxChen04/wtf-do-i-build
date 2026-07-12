import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { join } from "node:path";
import test from "node:test";

const root = new URL("..", import.meta.url).pathname;

test("bundles discovery validation and requires every discovery-template heading", async () => {
  const skill = await readFile(join(root, "skills", "brainstorm", "SKILL.md"), "utf8");
  assert.match(skill, /Preserve every heading from the discovery template exactly/);
  assert.match(skill, /Markdown `###` headings/);
  assert.match(skill, /\.claude\/skills\/brainstorm\/scripts\/validate-artifacts\.mjs/);
  await access(join(root, "skills", "brainstorm", "scripts", "validate-artifacts.mjs"));
});
