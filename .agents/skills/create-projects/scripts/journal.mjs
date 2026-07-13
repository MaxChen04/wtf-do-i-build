#!/usr/bin/env node
import { appendFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, join } from "node:path";

export const JOURNAL_EVENTS = new Set([
  "setup_completed",
  "brainstorm_started",
  "brainstorm_resumed",
  "directions_generated",
  "direction_selected",
  "direction_rejected",
  "prd_generated",
  "prd_approved",
  "prd_rejected",
  "repository_created",
  "skills_installed",
  "github_publication_result",
  "build_step_completed",
  "project_abandoned"
]);

export function resolveProductHome(home, env = process.env, homeDirectory = homedir()) {
  return home ?? env.WTFDOIBUILD_HOME ?? join(homeDirectory, ".wtfdoibuild");
}

function assertEvent(event) {
  if (!event || typeof event !== "object") throw new Error("Journal event must be an object.");
  for (const field of ["timestamp", "skill", "event", "session_slug", "details"]) {
    if (!(field in event)) throw new Error(`Journal event is missing ${field}.`);
  }
  if (!JOURNAL_EVENTS.has(event.event)) throw new Error(`Unsupported journal event: ${event.event}`);
  if (typeof event.details !== "object" || Array.isArray(event.details) || event.details === null) {
    throw new Error("Journal event details must be an object.");
  }
  if (event.project_slug !== undefined && typeof event.project_slug !== "string") {
    throw new Error("Journal project_slug must be a string when provided.");
  }
}

async function journalPath(home) {
  const root = resolveProductHome(home);
  await mkdir(root, { recursive: true });
  return join(root, "journal.jsonl");
}

export async function readJournal(home) {
  const path = await journalPath(home);
  try {
    const contents = await readFile(path, "utf8");
    return contents.split("\n").filter(Boolean).map((line, index) => {
      try {
        return JSON.parse(line);
      } catch {
        throw new Error(`Invalid JSONL entry at journal line ${index + 1}.`);
      }
    });
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }
}

export async function appendJournalEvent({ home, event }) {
  assertEvent(event);
  const path = await journalPath(home);
  const record = { schema_version: 1, ...event };
  await appendFile(path, `${JSON.stringify(record)}\n`, "utf8");
  await buildProjectsRollup(home);
  return record;
}

function projectState(entry, current) {
  const details = entry.details ?? {};
  const state = { ...current, slug: entry.project_slug };
  if (details.path) state.path = details.path;
  if (details.next_step) state.nextStep = details.next_step;
  if (details.step_id) state.completedStep = details.step_id;
  if (entry.event === "repository_created") state.status = "ready to build";
  if (entry.event === "build_step_completed") state.status = "in progress";
  if (entry.event === "project_abandoned") state.status = "abandoned";
  if (entry.event === "github_publication_result") state.publication = details.result ?? "recorded";
  return state;
}

export async function buildProjectsRollup(home) {
  const root = resolveProductHome(home);
  const entries = await readJournal(root);
  const projects = new Map();
  for (const entry of entries) {
    if (!entry.project_slug) continue;
    projects.set(entry.project_slug, projectState(entry, projects.get(entry.project_slug) ?? {}));
  }
  const rows = [...projects.values()]
    .sort((a, b) => a.slug.localeCompare(b.slug))
    .map((project) => `- **${project.slug}** — ${project.status ?? "planned"}; next: ${project.nextStep ?? "confirm next step"}${project.path ? `; path: ${project.path}` : ""}${project.publication ? `; GitHub: ${project.publication}` : ""}`);
  const rollup = [
    "# WTF Do I Build projects",
    "",
    "This local-only rollup is regenerated from `journal.jsonl`. The PRD remains the source of truth.",
    "",
    ...(rows.length ? rows : ["No projects have been created yet."]),
    ""
  ].join("\n");
  await mkdir(dirname(join(root, "projects.md")), { recursive: true });
  await writeFile(join(root, "projects.md"), rollup, "utf8");
  return rollup;
}

function cliValue(args, key) {
  const index = args.indexOf(key);
  return index === -1 ? undefined : args[index + 1];
}

async function main() {
  const [command, ...args] = process.argv.slice(2);
  const home = cliValue(args, "--home");
  if (command === "append") {
    const raw = cliValue(args, "--event");
    if (!raw) throw new Error("Use --event with one JSON object.");
    const event = JSON.parse(raw);
    if (!event.timestamp) event.timestamp = new Date().toISOString();
    await appendJournalEvent({ home, event });
    return;
  }
  if (command === "rollup") {
    process.stdout.write(await buildProjectsRollup(home));
    return;
  }
  if (command === "read") {
    process.stdout.write(`${JSON.stringify(await readJournal(home), null, 2)}\n`);
    return;
  }
  throw new Error("Usage: journal.mjs append --event '<json>' | rollup | read [--home <directory>]");
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  });
}
