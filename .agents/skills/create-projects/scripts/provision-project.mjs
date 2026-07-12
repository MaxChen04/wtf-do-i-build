#!/usr/bin/env node
import { cp, mkdir, readFile, stat, symlink, writeFile } from "node:fs/promises";
import { execFile } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const packageRoot = dirname(scriptDirectory);

async function exists(path) {
  try {
    await stat(path);
    return true;
  } catch (error) {
    if (error.code === "ENOENT") return false;
    throw error;
  }
}

async function firstExisting(candidates, label) {
  for (const candidate of candidates) if (await exists(candidate)) return candidate;
  throw new Error(`Cannot locate ${label}.`);
}

async function locateBuildSkill() {
  return firstExisting([
    join(packageRoot, "skills", "build-project"),
    join(scriptDirectory, "..", "..", "build-project")
  ], "the build-project skill");
}

async function locateJournalScript() {
  return firstExisting([
    join(packageRoot, "scripts", "journal.mjs"),
    join(scriptDirectory, "..", "..", "setup", "scripts", "journal.mjs")
  ], "the journal script");
}

async function runGit(path, args) {
  return execFileAsync("git", ["-C", path, ...args], {
    env: {
      ...process.env,
      GIT_AUTHOR_NAME: process.env.GIT_AUTHOR_NAME ?? "Aviator Hamster",
      GIT_AUTHOR_EMAIL: process.env.GIT_AUTHOR_EMAIL ?? "aviator-hamster@local",
      GIT_COMMITTER_NAME: process.env.GIT_COMMITTER_NAME ?? "Aviator Hamster",
      GIT_COMMITTER_EMAIL: process.env.GIT_COMMITTER_EMAIL ?? "aviator-hamster@local"
    }
  });
}

async function copyIfAbsent(source, destination) {
  if (!await exists(destination)) await cp(source, destination, { recursive: true });
}

export async function provisionProject({ projectPath, prdPath, projectName }) {
  const gitPath = join(projectPath, ".git");
  const created = !await exists(gitPath);
  await mkdir(projectPath, { recursive: true });
  if (created) await execFileAsync("git", ["init", "-b", "main", projectPath]);

  await copyIfAbsent(prdPath, join(projectPath, "PRD.md"));
  if (!await exists(join(projectPath, "README.md"))) {
    await writeFile(join(projectPath, "README.md"), `# ${projectName}\n\nRead [PRD.md](PRD.md) before changing code. It is the source of truth for this project.\n\n## Continue\n\nUse the project-local \`build-project\` skill to resume the first unfinished PRD step.\n`, "utf8");
  }
  if (!await exists(join(projectPath, "AGENTS.md"))) {
    await writeFile(join(projectPath, "AGENTS.md"), "# Project agent routing\n\nRead all of `PRD.md` before making changes. Resume at the first non-`[x]` step, prove behavior on the real product surface, update the PRD, then commit the completed unit.\n", "utf8");
  }
  if (!await exists(join(projectPath, ".gitignore"))) {
    await writeFile(join(projectPath, ".gitignore"), ".DS_Store\nnode_modules/\n.env\n.env.*\n", "utf8");
  }

  const canonicalSkill = join(projectPath, ".agents", "skills", "build-project");
  await mkdir(dirname(canonicalSkill), { recursive: true });
  await copyIfAbsent(await locateBuildSkill(), canonicalSkill);
  await mkdir(join(canonicalSkill, "scripts"), { recursive: true });
  await copyIfAbsent(await locateJournalScript(), join(canonicalSkill, "scripts", "journal.mjs"));

  const claudeSkill = join(projectPath, ".claude", "skills", "build-project");
  await mkdir(dirname(claudeSkill), { recursive: true });
  if (!await exists(claudeSkill)) {
    try {
      await symlink("../../.agents/skills/build-project", claudeSkill, "dir");
    } catch (error) {
      if (error.code !== "EEXIST") await cp(canonicalSkill, claudeSkill, { recursive: true });
    }
  }
  if (!await exists(join(projectPath, "skills-lock.json"))) {
    await writeFile(join(projectPath, "skills-lock.json"), JSON.stringify({ schema_version: 1, skills: [{ name: "build-project", source: "aviator-hamster-skills", scope: "project", rationale: "Executes the approved PRD in verified units." }] }, null, 2) + "\n", "utf8");
  }

  const { stdout } = await runGit(projectPath, ["status", "--porcelain"]);
  let committed = false;
  if (stdout.trim()) {
    await runGit(projectPath, ["add", "."]);
    await runGit(projectPath, ["commit", "-m", "chore: add approved project handoff"]);
    committed = true;
  }
  return { created, committed, projectPath };
}

async function main() {
  const args = process.argv.slice(2);
  const value = (key) => args[args.indexOf(key) + 1];
  const projectPath = value("--path");
  const prdPath = value("--prd");
  const projectName = value("--name");
  if (!projectPath || !prdPath || !projectName) throw new Error("Usage: provision-project.mjs --path <project-path> --prd <approved-prd.md> --name <project-name>");
  const result = await provisionProject({ projectPath, prdPath, projectName });
  process.stdout.write(`${JSON.stringify(result)}\n`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  });
}
