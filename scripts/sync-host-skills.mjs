#!/usr/bin/env node

import { cp, lstat, mkdir, readdir, readFile, rm, unlink } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

const defaultRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const hostSkillRoots = [".agents/skills", ".claude/skills"];

function manifestPath(prefix, name) {
  return prefix ? path.posix.join(prefix, name) : name;
}

function localPath(root, relative) {
  return path.join(root, ...relative.split("/"));
}

async function listTree(directory, prefix = "") {
  let entries;
  try {
    entries = await readdir(directory, { withFileTypes: true });
  } catch (error) {
    if (error.code === "ENOENT") return { directories: [], files: [], links: [] };
    throw error;
  }

  const tree = { directories: [], files: [], links: [] };
  for (const entry of entries.sort((left, right) => left.name.localeCompare(right.name))) {
    const relative = manifestPath(prefix, entry.name);
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      tree.directories.push(relative);
      const nested = await listTree(absolute, relative);
      tree.directories.push(...nested.directories);
      tree.files.push(...nested.files);
      tree.links.push(...nested.links);
    } else if (entry.isFile()) {
      tree.files.push(relative);
    } else if (entry.isSymbolicLink()) {
      tree.links.push(relative);
    }
  }
  return tree;
}

async function rootBoundaryIssue(directory, label) {
  try {
    const status = await lstat(directory);
    if (status.isSymbolicLink()) return `${label}: root is a symbolic link and must be a real directory`;
    if (!status.isDirectory()) return `${label}: root is not a directory`;
    return null;
  } catch (error) {
    if (error.code === "ENOENT") return null;
    throw error;
  }
}

async function hostIssues(root, hostRelative) {
  const canonicalRoot = path.join(root, "skills");
  const hostRoot = path.join(root, hostRelative);
  const [canonical, boundaryIssue] = await Promise.all([
    listTree(canonicalRoot),
    rootBoundaryIssue(hostRoot, hostRelative)
  ]);
  const copied = boundaryIssue
    ? { directories: [], files: [], links: [] }
    : await listTree(hostRoot);
  const canonicalDirectories = new Set(canonical.directories);
  const copiedDirectories = new Set(copied.directories);
  const canonicalFiles = new Set(canonical.files);
  const copiedFiles = new Set(copied.files);
  const issues = boundaryIssue ? [boundaryIssue] : [];

  for (const directory of canonical.directories) {
    if (!copiedDirectories.has(directory)) issues.push(`${hostRelative}: missing directory ${directory}`);
  }
  for (const directory of copied.directories) {
    if (!canonicalDirectories.has(directory)) issues.push(`${hostRelative}: extra directory ${directory}`);
  }
  for (const file of canonical.files) {
    if (!copiedFiles.has(file)) {
      issues.push(`${hostRelative}: missing file ${file}`);
      continue;
    }
    const [canonicalContent, copiedContent] = await Promise.all([
      readFile(localPath(canonicalRoot, file)),
      readFile(localPath(hostRoot, file))
    ]);
    if (!canonicalContent.equals(copiedContent)) issues.push(`${hostRelative}: changed file ${file}`);
  }
  for (const file of copied.files) {
    if (!canonicalFiles.has(file)) issues.push(`${hostRelative}: extra file ${file}`);
  }
  for (const link of copied.links) issues.push(`${hostRelative}: symbolic link ${link} must be a real copy`);
  for (const link of canonical.links) issues.push(`skills: symbolic link ${link} cannot be mirrored as a real copy`);
  return issues;
}

export async function checkHostSkills(root = defaultRoot) {
  const results = await Promise.all(hostSkillRoots.map((hostRoot) => hostIssues(root, hostRoot)));
  return results.flat();
}

async function copyCanonicalEntries(canonicalRoot, hostRoot) {
  await mkdir(hostRoot, { recursive: true });
  const entries = await readdir(canonicalRoot, { withFileTypes: true });
  for (const entry of entries) {
    await cp(path.join(canonicalRoot, entry.name), path.join(hostRoot, entry.name), {
      recursive: entry.isDirectory(),
      force: true
    });
  }
}

async function repairHostTree(root, hostRelative) {
  const canonicalRoot = path.join(root, "skills");
  const hostRoot = path.join(root, hostRelative);
  const boundaryIssue = await rootBoundaryIssue(hostRoot, hostRelative);
  if (boundaryIssue) await unlink(hostRoot);
  const [canonical, copiedBefore] = await Promise.all([listTree(canonicalRoot), listTree(hostRoot)]);
  const canonicalDirectories = new Set(canonical.directories);
  const canonicalFiles = new Set(canonical.files);

  for (const link of copiedBefore.links) await rm(localPath(hostRoot, link), { force: true });
  for (const file of copiedBefore.files) {
    if (canonicalDirectories.has(file)) await rm(localPath(hostRoot, file), { force: true });
  }
  for (const directory of [...copiedBefore.directories].sort((left, right) => right.length - left.length)) {
    if (canonicalFiles.has(directory)) await rm(localPath(hostRoot, directory), { recursive: true, force: true });
  }

  await copyCanonicalEntries(canonicalRoot, hostRoot);

  const copiedAfter = await listTree(hostRoot);
  for (const file of copiedAfter.files) {
    if (!canonicalFiles.has(file)) await rm(localPath(hostRoot, file), { force: true });
  }
  for (const link of copiedAfter.links) await rm(localPath(hostRoot, link), { force: true });
  for (const directory of [...copiedAfter.directories].sort((left, right) => right.length - left.length)) {
    if (!canonicalDirectories.has(directory)) await rm(localPath(hostRoot, directory), { recursive: true, force: true });
  }
}

export async function syncHostSkills(root = defaultRoot) {
  let updatedHosts = 0;
  for (const hostRelative of hostSkillRoots) {
    if (!(await hostIssues(root, hostRelative)).length) continue;
    await repairHostTree(root, hostRelative);
    updatedHosts += 1;
  }
  return { updated_hosts: updatedHosts };
}

async function main() {
  if (process.argv.includes("--check")) {
    const issues = await checkHostSkills();
    if (issues.length) {
      throw new Error(`Host skill copies are stale. Edit skills/ and run npm run sync-host-skills.\n${issues.join("\n")}`);
    }
    process.stdout.write("Codex and Claude skill copies match skills/.\n");
    return;
  }

  const result = await syncHostSkills();
  process.stdout.write(`Synced ${result.updated_hosts} host skill tree(s).\n`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  });
}
