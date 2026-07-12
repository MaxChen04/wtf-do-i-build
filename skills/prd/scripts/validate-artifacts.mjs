#!/usr/bin/env node
import { readdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";

const REQUIRED_PRD_HEADINGS = [
  "Before you build",
  "Resume here",
  "Plain-English digest",
  "How it works",
  "Problem & why-you",
  "User & JTBD",
  "What you'll build",
  "What you'll learn",
  "Success criteria & evals",
  "Scope & non-goals",
  "Architecture & framework",
  "Decisions to elaborate",
  "Build plan",
  "Failure modes & mitigations",
  "Anti-hallucination contract",
  "References"
];

const REQUIRED_DISCOVERY_HEADINGS = [
  "Resume here",
  "Stated lead and goal",
  "Source ledger",
  "Questions and answers",
  "Prior builds and access",
  "Evidence, inference, conflicts, and gaps",
  "Readiness verdict",
  "Candidate directions",
  "Recommendation",
  "Selected directions"
];

function hasHeading(text, heading) {
  return new RegExp(`^#{1,3} .*${heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`, "mi").test(text);
}

function validateDiscovery(text) {
  const issues = [];
  if (!/^Status:\s*(gathering|candidates-ready|directions-selected)\s*$/m.test(text)) {
    issues.push("Missing or invalid discovery Status metadata.");
  }
  for (const heading of REQUIRED_DISCOVERY_HEADINGS) {
    if (!hasHeading(text, heading)) issues.push(`Missing required discovery heading: ${heading}.`);
  }
  for (const heading of ["Direct evidence", "Bounded inference", "Conflicts", "Gaps"]) {
    if (!hasHeading(text, heading)) issues.push(`Missing required evidence heading: ${heading}.`);
  }
  const candidateCount = [...text.matchAll(/^### D\d+\s+—/gm)].length;
  if (candidateCount < 1 || candidateCount > 6) {
    issues.push("Discovery must contain between one and six stable candidate directions.");
  }
  if (/^Status:\s*directions-selected\s*$/m.test(text) && !/^[-*]\s+\*{0,2}D\d+\s+—/m.test(text)) {
    issues.push("A directions-selected discovery must record at least one selected direction ID.");
  }
  return issues;
}

function validatePrd(text) {
  const issues = [];
  for (const heading of REQUIRED_PRD_HEADINGS) {
    if (!hasHeading(text, heading)) issues.push(`Missing required heading: ${heading}.`);
  }
  if (!/```mermaid\s*[\s\S]+?```/i.test(text)) issues.push("Missing conceptual Mermaid diagram.");
  if (!/\[[ x~!]\]\s+P\d+\.\d+(?:\.\d+)?:/m.test(text)) {
    issues.push("Missing a stable-ID build step with a valid status marker.");
  }
  if (/\[[^ x~!]\]/.test(text)) issues.push("Found an unsupported status marker; use [ ], [~], [x], or [!].");
  return issues;
}

export async function validateArtifact(path) {
  const text = await readFile(path, "utf8");
  const issues = [];
  if (!/^Schema-Version:\s*\d+\s*$/m.test(text)) issues.push("Missing Schema-Version metadata.");
  const isDiscovery = /^Status:\s*(gathering|candidates-ready|directions-selected)\s*$/m.test(text) || hasHeading(text, "Candidate directions");
  issues.push(...(isDiscovery ? validateDiscovery(text) : validatePrd(text)));
  const malformedLinks = [...text.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)]
    .map((match) => match[1])
    .filter((href) => /\s/.test(href) || href === "#" || /^javascript:/i.test(href));
  for (const href of malformedLinks) issues.push(`Malformed or unsafe link: ${href}`);
  return issues;
}

async function findMarkdownFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory() && !entry.name.startsWith(".")) files.push(...await findMarkdownFiles(path));
    if (entry.isFile() && /(?:^|\/)(?:prd|discovery)\.md$/i.test(path)) files.push(path);
  }
  return files;
}

async function main() {
  const [target] = process.argv.slice(2);
  const files = target === "--all" ? await findMarkdownFiles(process.cwd()) : target ? [resolve(target)] : [];
  if (!target) throw new Error("Provide a prd.md path or --all.");
  if (!files.length && target === "--all") {
    process.stdout.write("No generated PRD artifacts to validate.\n");
    return;
  }
  let failed = false;
  for (const file of files) {
    const issues = await validateArtifact(file);
    if (issues.length) {
      failed = true;
      process.stderr.write(`${file}\n${issues.map((issue) => `- ${issue}`).join("\n")}\n`);
    } else {
      process.stdout.write(`${file}: valid\n`);
    }
  }
  if (failed) process.exitCode = 1;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  });
}
