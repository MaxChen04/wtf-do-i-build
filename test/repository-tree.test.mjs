import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));

test("keeps internal documentation and evaluations out of the public tree", async () => {
  const [gitignore, packageJson, workflow, plugin] = await Promise.all([
    readFile(path.join(root, ".gitignore"), "utf8"),
    readFile(path.join(root, "package.json"), "utf8").then(JSON.parse),
    readFile(path.join(root, ".github", "workflows", "validate.yml"), "utf8"),
    readFile(path.join(root, ".claude-plugin", "plugin.json"), "utf8").then(JSON.parse)
  ]);

  assert.match(gitignore, /^\/projects\/$/m);
  assert.doesNotMatch(gitignore, /^\/docs\/$/m);
  assert.match(gitignore, /^\/evals\/$/m);
  assert.equal(packageJson.name, "wtfdoibuild");
  assert.equal(plugin.name, "wtfdoibuild");
  assert.equal("evals" in packageJson.scripts, false);
  assert.doesNotMatch(workflow, /npm run evals/);
});
