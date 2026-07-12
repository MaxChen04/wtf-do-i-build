import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));

async function text(relativePath) {
  return readFile(join(root, relativePath), "utf8");
}

test("setup distinguishes clone-local availability from an approved active-host global install", async () => {
  const [skill, profile, capabilities] = await Promise.all([
    text("skills/setup/SKILL.md"),
    text("skills/setup/assets/setup-profile-template.md"),
    text("skills/setup/references/host-capabilities.md")
  ]);

  assert.match(skill, /repository-local/i);
  assert.match(skill, /Aviator Hamster currently works inside this folder\. Make it available in all your projects\?/);
  assert.match(skill, /only after explicit approval/i);
  assert.match(skill, /active host only/i);
  assert.match(skill, /npx skills@latest add <repo-root> --global --agent <codex\|claude-code>/);
  assert.match(skill, /npx skills@latest list --global --agent <codex\|claude-code> --json/);
  assert.match(skill, /Declining.*does not block setup or brainstorming/i);
  assert.match(profile, /## Installation/);
  assert.match(profile, /Availability scope:/);
  assert.match(profile, /Global installation:/);
  assert.match(capabilities, /Repository-local skills/);
});

test("README starts with clone-local use and separates shell commands from in-agent invocation", async () => {
  const readme = await text("README.md");

  assert.match(readme, /git clone <repository-url>/);
  assert.match(readme, /cd aviator-hamster-skills/);
  assert.match(readme, /Launch Codex or Claude Code from inside this folder/i);
  assert.match(readme, /Inside Codex.*`\$setup`/is);
  assert.match(readme, /Inside Claude Code.*`\/setup`/is);
  assert.match(readme, /Do not enter.*normal shell prompt/i);
  assert.match(readme, /Optional global installation/i);
});

test("CI verifies the host copies on Windows as well as Linux", async () => {
  const workflow = await text(".github/workflows/validate.yml");
  assert.match(workflow, /matrix\.os/);
  assert.match(workflow, /windows-latest/);
  assert.match(workflow, /ubuntu-latest/);
});
