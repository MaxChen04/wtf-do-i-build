import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));

async function text(relativePath) {
  return readFile(path.join(root, relativePath), "utf8");
}

test("build-project routes each PRD step through the approved relevant skills", async () => {
  const skill = await text("skills/build-project/SKILL.md");
  assert.match(skill, /skills-lock\.json/);
  assert.match(skill, /locked-skill-routing\.md/);

  const routing = await text("skills/build-project/references/locked-skill-routing.md");
  assert.match(routing, /verify.*actually available/is);
  assert.match(routing, /smallest relevant subset/i);
  assert.match(routing, /before editing/i);
  assert.match(routing, /explicit approval.*install/is);
  assert.match(routing, /do not invoke every/i);
  assert.match(routing, /user.*PRD.*AGENTS\.md.*optional skill/is);
  assert.match(routing, /no optional skill is relevant.*continue/is);
});
