#!/usr/bin/env node

import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { lstat, readdir, readFile, realpath } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { pathToFileURL } from "node:url";

const execFileAsync = promisify(execFile);
const MAX_INLINE_MEMORY_BYTES = 25 * 1024;
const SCHEMA_VERSION = 1;

function pathApiFor(platform) {
  return platform === "win32" ? path.win32 : path.posix;
}

export function resolveMemoryLocations({
  homeDir = os.homedir(),
  env = process.env,
  platform = process.platform
} = {}) {
  const pathApi = pathApiFor(platform);
  const defaultCodexDirectory = pathApi.join(homeDir, ".codex", "memories");
  const codexHome = env.CODEX_HOME || pathApi.join(homeDir, ".codex");
  return {
    codexDirectory: pathApi.join(codexHome, "memories"),
    codexFallbackDirectory: defaultCodexDirectory,
    codexOverride: env.AVIATOR_CODEX_MEMORY_PATH || null,
    claudeConfigDirectory: env.CLAUDE_CONFIG_DIR || pathApi.join(homeDir, ".claude"),
    homeDirectory: homeDir
  };
}

function sourceId(provider, sourcePath) {
  const digest = createHash("sha256").update(`${provider}\0${sourcePath}`).digest("hex").slice(0, 16);
  return `${provider}:${digest}`;
}

async function fileSource({ provider, kind, sourcePath, label, project = null, currentProject = null }, diagnostics) {
  try {
    const details = await lstat(sourcePath);
    if (details.isSymbolicLink()) {
      diagnostics.push(`Refused symbolic link memory source ${sourcePath}.`);
      return null;
    }
    if (!details.isFile()) return null;
    return {
      id: sourceId(provider, sourcePath),
      provider,
      kind,
      label,
      project,
      current_project: currentProject,
      path: sourcePath,
      size_bytes: details.size,
      modified_at: details.mtime.toISOString()
    };
  } catch (error) {
    if (error.code !== "ENOENT") diagnostics.push(`Could not inspect ${sourcePath}: ${error.message}`);
    return null;
  }
}

async function directoryEntries(directory, diagnostics) {
  try {
    return await readdir(directory, { withFileTypes: true });
  } catch (error) {
    if (error.code !== "ENOENT") diagnostics.push(`Could not inspect ${directory}: ${error.message}`);
    return [];
  }
}

async function codexDirectorySources(directory, pathApi, diagnostics) {
  const candidates = [
    [pathApi.join(directory, "MEMORY.md"), "entrypoint", "Codex memory"],
    [pathApi.join(directory, "memory_summary.md"), "summary", "Codex memory summary"]
  ];
  const sources = [];
  for (const [sourcePath, kind, label] of candidates) {
    const source = await fileSource({ provider: "codex", kind, sourcePath, label }, diagnostics);
    if (source) sources.push(source);
  }
  return sources;
}

async function discoverCodex(locations, pathApi, diagnostics) {
  if (locations.codexOverride) {
    try {
      const details = await lstat(locations.codexOverride);
      if (details.isSymbolicLink()) {
        diagnostics.push(`Refused symbolic link Codex memory override ${locations.codexOverride}.`);
      } else if (details.isDirectory()) {
        const sources = await codexDirectorySources(locations.codexOverride, pathApi, diagnostics);
        if (sources.length) return sources;
      } else if (details.isFile()) {
        const source = await fileSource({
          provider: "codex",
          kind: "entrypoint",
          sourcePath: locations.codexOverride,
          label: "Codex memory override"
        }, diagnostics);
        if (source) return [source];
      }
    } catch (error) {
      diagnostics.push(`Could not inspect Codex memory override ${locations.codexOverride}: ${error.message}`);
    }
  }

  for (const directory of [...new Set([locations.codexDirectory, locations.codexFallbackDirectory])]) {
    const sources = await codexDirectorySources(directory, pathApi, diagnostics);
    if (sources.length) return sources;
  }
  return [];
}

async function readClaudeSettings(configDirectory, pathApi, diagnostics) {
  const settingsPath = pathApi.join(configDirectory, "settings.json");
  try {
    return JSON.parse(await readFile(settingsPath, "utf8"));
  } catch (error) {
    if (error.code !== "ENOENT") diagnostics.push(`Could not parse Claude settings at ${settingsPath}: ${error.message}`);
    return {};
  }
}

function comparableProjectKey(value) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function expandHomePath(value, homeDirectory, pathApi) {
  if (value === "~") return homeDirectory;
  if (value.startsWith("~/") || value.startsWith("~\\")) return pathApi.join(homeDirectory, value.slice(2));
  return value;
}

async function discoverClaude(locations, pathApi, diagnostics, projectRoot, env) {
  const environmentDisabled = ["1", "true"].includes(String(env.CLAUDE_CODE_DISABLE_AUTO_MEMORY || "").toLowerCase());
  if (environmentDisabled) {
    diagnostics.push("Claude auto memory is disabled by CLAUDE_CODE_DISABLE_AUTO_MEMORY.");
    return [];
  }

  const settings = await readClaudeSettings(locations.claudeConfigDirectory, pathApi, diagnostics);
  if (settings.autoMemoryEnabled === false) {
    diagnostics.push("Claude auto memory is disabled in settings.");
    return [];
  }

  const candidates = [];
  if (typeof settings.autoMemoryDirectory === "string" && settings.autoMemoryDirectory.trim()) {
    const configured = expandHomePath(settings.autoMemoryDirectory.trim(), locations.homeDirectory, pathApi);
    const memoryDirectory = pathApi.isAbsolute(configured)
      ? configured
      : pathApi.resolve(locations.claudeConfigDirectory, configured);
    candidates.push({
      sourcePath: pathApi.join(memoryDirectory, "MEMORY.md"),
      project: pathApi.basename(memoryDirectory) || "custom",
      label: "Claude custom memory",
      currentProject: true
    });
    for (const entry of (await directoryEntries(memoryDirectory, diagnostics)).filter((item) => item.isDirectory()).sort((a, b) => a.name.localeCompare(b.name))) {
      candidates.push({
        sourcePath: pathApi.join(memoryDirectory, entry.name, "MEMORY.md"),
        project: entry.name,
        label: `Claude memory: ${entry.name}`,
        currentProject: comparableProjectKey(entry.name) === comparableProjectKey(projectRoot)
      });
    }
  } else {
    const projectsDirectory = pathApi.join(locations.claudeConfigDirectory, "projects");
    for (const entry of (await directoryEntries(projectsDirectory, diagnostics)).filter((item) => item.isDirectory()).sort((a, b) => a.name.localeCompare(b.name))) {
      candidates.push({
        sourcePath: pathApi.join(projectsDirectory, entry.name, "memory", "MEMORY.md"),
        project: entry.name,
        label: `Claude project memory: ${entry.name}`,
        currentProject: comparableProjectKey(entry.name) === comparableProjectKey(projectRoot)
      });
    }
  }

  const sources = [];
  for (const candidate of candidates) {
    const source = await fileSource({
      provider: "claude",
      kind: "project-entrypoint",
      sourcePath: candidate.sourcePath,
      label: candidate.label,
      project: candidate.project,
      currentProject: candidate.currentProject
    }, diagnostics);
    if (source) sources.push(source);
  }
  return sources;
}

async function discoverImported(additionalMemoryPaths, pathApi, diagnostics) {
  const sources = [];
  for (const sourcePath of [...new Set(additionalMemoryPaths)].sort()) {
    const source = await fileSource({
      provider: "imported",
      kind: "manual",
      sourcePath,
      label: `Imported memory: ${pathApi.basename(sourcePath)}`
    }, diagnostics);
    if (source) sources.push(source);
  }
  return sources;
}

async function gitProjectRoot(cwd, pathApi) {
  try {
    const { stdout } = await execFileAsync("git", ["rev-parse", "--path-format=absolute", "--git-common-dir"], { cwd });
    return pathApi.dirname(stdout.trim());
  } catch {
    try {
      const { stdout } = await execFileAsync("git", ["rev-parse", "--show-toplevel"], { cwd });
      return stdout.trim();
    } catch {
      return cwd;
    }
  }
}

export async function discoverMemorySources(options = {}) {
  const platform = options.platform || process.platform;
  const pathApi = pathApiFor(platform);
  const locations = resolveMemoryLocations(options);
  const diagnostics = [];
  const cwd = options.cwd || process.cwd();
  const projectRoot = options.projectRoot || await gitProjectRoot(cwd, pathApi);
  const additionalMemoryPaths = options.additionalMemoryPaths || [];
  const [codex, claude, imported] = await Promise.all([
    discoverCodex(locations, pathApi, diagnostics),
    discoverClaude(locations, pathApi, diagnostics, projectRoot, options.env || process.env),
    discoverImported(additionalMemoryPaths, pathApi, diagnostics)
  ]);
  return {
    schema_version: SCHEMA_VERSION,
    sources: [...codex, ...claude, ...imported],
    diagnostics
  };
}

async function loadMemorySource(id, options, allowLarge) {
  const discovery = await discoverMemorySources(options);
  const source = discovery.sources.find((candidate) => candidate.id === id);
  if (!source) throw new Error(`Memory source ${id} is not available in the fresh discovery result.`);
  const details = await lstat(source.path);
  if (details.isSymbolicLink()) throw new Error(`Memory source ${id} became a symbolic link and was refused.`);
  if (!allowLarge && details.size > MAX_INLINE_MEMORY_BYTES) {
    throw new Error(`Memory source ${id} is larger than 25 KB; use search --source <id> --query <text>.`);
  }
  const content = await readFile(source.path, "utf8");
  return {
    schema_version: SCHEMA_VERSION,
    source: {
      ...source,
      size_bytes: details.size,
      modified_at: details.mtime.toISOString(),
      sha256: createHash("sha256").update(content).digest("hex")
    },
    content
  };
}

export async function readMemorySource(id, options = {}) {
  return loadMemorySource(id, options, false);
}

function markdownSections(content) {
  const headings = [...content.matchAll(/^#{1,6}\s+.*$/gm)];
  if (!headings.length) return [{ heading: null, content }];
  const sections = [];
  if (headings[0].index > 0 && content.slice(0, headings[0].index).trim()) {
    sections.push({ heading: null, content: content.slice(0, headings[0].index) });
  }
  for (let index = 0; index < headings.length; index += 1) {
    const start = headings[index].index;
    const end = headings[index + 1]?.index ?? content.length;
    sections.push({ heading: headings[index][0], content: content.slice(start, end) });
  }
  return sections;
}

export async function searchMemorySource(id, query, options = {}) {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) throw new Error("search requires a non-empty query.");
  const terms = [...new Set(normalizedQuery.match(/[\p{L}\p{N}]+/gu) || [])];
  const read = await loadMemorySource(id, options, true);
  const sections = markdownSections(read.content).filter((section) => {
    const candidate = section.content.toLowerCase();
    return terms.some((term) => candidate.includes(term));
  });
  return {
    schema_version: SCHEMA_VERSION,
    source: read.source,
    query,
    sections
  };
}

function isInsideDirectory(baseDirectory, candidate, pathApi) {
  const relative = pathApi.relative(baseDirectory, candidate);
  return relative !== ".." && !relative.startsWith(`..${pathApi.sep}`) && !pathApi.isAbsolute(relative);
}

export async function readMemoryTopic(id, topicPath, query = null, options = {}) {
  const discovery = await discoverMemorySources(options);
  const source = discovery.sources.find((candidate) => candidate.id === id);
  if (!source) throw new Error(`Memory source ${id} is not available in the fresh discovery result.`);
  if (source.provider !== "claude") throw new Error("Linked topic files are supported only for an approved Claude memory source.");

  const platform = options.platform || process.platform;
  const pathApi = pathApiFor(platform);
  const baseDirectory = pathApi.dirname(source.path);
  const candidate = pathApi.resolve(baseDirectory, topicPath);
  if (pathApi.isAbsolute(topicPath) || !isInsideDirectory(baseDirectory, candidate, pathApi)) {
    throw new Error("Linked topic file must remain inside the approved memory directory.");
  }

  const details = await lstat(candidate);
  if (details.isSymbolicLink()) throw new Error("Linked topic file is a symbolic link and was refused.");
  if (!details.isFile()) throw new Error("Linked topic path is not a file.");
  const [realBaseDirectory, realCandidate] = await Promise.all([realpath(baseDirectory), realpath(candidate)]);
  if (!isInsideDirectory(realBaseDirectory, realCandidate, pathApi)) {
    throw new Error("Linked topic file must remain inside the approved memory directory.");
  }

  if (query === null && details.size > MAX_INLINE_MEMORY_BYTES) {
    throw new Error("Linked topic file is larger than 25 KB; repeat topic with --query <text>.");
  }

  const content = await readFile(candidate, "utf8");
  const topic = {
    path: topicPath,
    size_bytes: details.size,
    modified_at: details.mtime.toISOString(),
    sha256: createHash("sha256").update(content).digest("hex")
  };
  if (query !== null) {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) throw new Error("topic search requires a non-empty query.");
    const terms = [...new Set(normalizedQuery.match(/[\p{L}\p{N}]+/gu) || [])];
    return {
      schema_version: SCHEMA_VERSION,
      source,
      topic,
      query,
      sections: markdownSections(content).filter((section) => {
        const sectionText = section.content.toLowerCase();
        return terms.some((term) => sectionText.includes(term));
      })
    };
  }
  return { schema_version: SCHEMA_VERSION, source, topic, content };
}

function argumentValue(args, name) {
  const index = args.indexOf(name);
  return index === -1 ? null : args[index + 1];
}

function argumentValues(args, name) {
  return args.flatMap((value, index) => value === name && args[index + 1] ? [args[index + 1]] : []);
}

export async function runCli(args = process.argv.slice(2), options = {}) {
  const command = args[0] || "discover";
  const runtimeOptions = {
    ...options,
    additionalMemoryPaths: [
      ...(options.additionalMemoryPaths || []),
      ...argumentValues(args, "--include")
    ]
  };
  let result;
  if (command === "discover") {
    result = await discoverMemorySources(runtimeOptions);
  } else if (command === "read") {
    const id = argumentValue(args, "--source");
    if (!id) throw new Error("read requires --source <source-id> from a fresh discover result.");
    result = await readMemorySource(id, runtimeOptions);
  } else if (command === "search") {
    const id = argumentValue(args, "--source");
    const query = argumentValue(args, "--query");
    if (!id || !query) throw new Error("search requires --source <source-id> and --query <text>.");
    result = await searchMemorySource(id, query, runtimeOptions);
  } else if (command === "topic") {
    const id = argumentValue(args, "--source");
    const topicPath = argumentValue(args, "--file");
    const query = argumentValue(args, "--query");
    if (!id || !topicPath) throw new Error("topic requires --source <source-id> and --file <relative-path>.");
    result = await readMemoryTopic(id, topicPath, query, runtimeOptions);
  } else {
    throw new Error("Usage: memory-sources.mjs discover [--include <path>] | read --source <id> | search --source <id> --query <text> | topic --source <id> --file <relative-path> [--query <text>]");
  }
  const spacing = args.includes("--pretty") ? 2 : 0;
  process.stdout.write(`${JSON.stringify(result, null, spacing)}\n`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  runCli().catch((error) => {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  });
}
