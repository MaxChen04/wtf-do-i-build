import assert from "node:assert/strict";
import { chmod, mkdtemp, mkdir, rm, symlink, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import {
  discoverMemorySources,
  readMemorySource,
  readMemoryTopic,
  resolveMemoryLocations,
  searchMemorySource
} from "../scripts/memory-sources.mjs";

async function temporaryHome(t) {
  const directory = await mkdtemp(path.join(os.tmpdir(), "aviator-memory-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  return directory;
}

async function put(file, content) {
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, content, "utf8");
}

test("resolves default and overridden locations with operating-system path rules", () => {
  assert.deepEqual(
    resolveMemoryLocations({ homeDir: "/Users/Ada", env: {}, platform: "darwin" }),
    {
      codexDirectory: "/Users/Ada/.codex/memories",
      codexFallbackDirectory: "/Users/Ada/.codex/memories",
      codexOverride: null,
      claudeConfigDirectory: "/Users/Ada/.claude",
      homeDirectory: "/Users/Ada"
    }
  );

  assert.deepEqual(
    resolveMemoryLocations({
      homeDir: "C:\\Users\\Ada",
      env: {
        CODEX_HOME: "D:\\Agent Data\\codex",
        CLAUDE_CONFIG_DIR: "D:\\Agent Data\\claude"
      },
      platform: "win32"
    }),
    {
      codexDirectory: "D:\\Agent Data\\codex\\memories",
      codexFallbackDirectory: "C:\\Users\\Ada\\.codex\\memories",
      codexOverride: null,
      claudeConfigDirectory: "D:\\Agent Data\\claude",
      homeDirectory: "C:\\Users\\Ada"
    }
  );
});

test("discovers Codex entrypoint and summary without scanning unrelated memory files", async (t) => {
  const homeDir = await temporaryHome(t);
  const entrypoint = path.join(homeDir, ".codex", "memories", "MEMORY.md");
  const summary = path.join(homeDir, ".codex", "memories", "memory_summary.md");
  await put(entrypoint, "# Registry\n");
  await put(summary, "# Summary\n");
  await put(path.join(homeDir, ".codex", "automations", "weekly", "memory.md"), "private automation\n");

  const result = await discoverMemorySources({ homeDir, env: {}, platform: process.platform });
  const codex = result.sources.filter((source) => source.provider === "codex");

  assert.deepEqual(codex.map((source) => source.kind), ["entrypoint", "summary"]);
  assert.deepEqual(codex.map((source) => source.path), [entrypoint, summary]);
  assert.ok(codex.every((source) => source.id.startsWith("codex:")));
  assert.ok(result.sources.every((source) => !source.path.includes("automations")));
});

test("Codex explicit file override replaces the default location", async (t) => {
  const homeDir = await temporaryHome(t);
  const override = path.join(homeDir, "chosen", "profile.md");
  await put(override, "chosen\n");
  await put(path.join(homeDir, ".codex", "memories", "MEMORY.md"), "default\n");

  const result = await discoverMemorySources({
    homeDir,
    env: { AVIATOR_CODEX_MEMORY_PATH: override },
    platform: process.platform
  });

  const codex = result.sources.filter((source) => source.provider === "codex");
  assert.equal(codex.length, 1);
  assert.equal(codex[0].path, override);
  assert.equal(codex[0].kind, "entrypoint");
});

test("falls back to default Codex memory when configured locations are unavailable", async (t) => {
  const homeDir = await temporaryHome(t);
  const fallback = path.join(homeDir, ".codex", "memories", "MEMORY.md");
  await put(fallback, "fallback\n");

  const result = await discoverMemorySources({
    homeDir,
    env: {
      AVIATOR_CODEX_MEMORY_PATH: path.join(homeDir, "missing.md"),
      CODEX_HOME: path.join(homeDir, "missing-codex-home")
    },
    platform: process.platform
  });

  assert.equal(result.sources.find((source) => source.provider === "codex").path, fallback);
});

test("discovers each standard Claude project memory as a separate source", async (t) => {
  const homeDir = await temporaryHome(t);
  const alpha = path.join(homeDir, ".claude", "projects", "alpha", "memory", "MEMORY.md");
  const beta = path.join(homeDir, ".claude", "projects", "beta", "memory", "MEMORY.md");
  await put(alpha, "alpha\n");
  await put(beta, "beta\n");
  await put(path.join(homeDir, ".claude", "projects", "alpha", "memory", "topic.md"), "topic\n");

  const result = await discoverMemorySources({ homeDir, env: {}, platform: process.platform });
  const claude = result.sources.filter((source) => source.provider === "claude");

  assert.deepEqual(claude.map((source) => source.project), ["alpha", "beta"]);
  assert.deepEqual(claude.map((source) => source.path), [alpha, beta]);
  assert.ok(claude.every((source) => source.kind === "project-entrypoint"));
});

test("marks the Claude source whose generated project label matches the current directory", async (t) => {
  const homeDir = await temporaryHome(t);
  const cwd = path.join(homeDir, "Work", "Visual Project");
  const generatedLabel = cwd.replace(/[^a-zA-Z0-9]/g, "-");
  const memory = path.join(homeDir, ".claude", "projects", generatedLabel, "memory", "MEMORY.md");
  await put(memory, "current\n");

  const result = await discoverMemorySources({ homeDir, env: {}, platform: process.platform, cwd });

  assert.equal(result.sources.find((source) => source.path === memory).current_project, true);
});

test("uses the Git project root hint when setup runs from a subdirectory or worktree", async (t) => {
  const homeDir = await temporaryHome(t);
  const projectRoot = path.join(homeDir, "Work", "Visual Project");
  const cwd = path.join(homeDir, "worktrees", "visual-project", "packages", "web");
  const generatedLabel = projectRoot.replace(/[^a-zA-Z0-9]/g, "-");
  const memory = path.join(homeDir, ".claude", "projects", generatedLabel, "memory", "MEMORY.md");
  await put(memory, "current\n");

  const result = await discoverMemorySources({ homeDir, env: {}, platform: process.platform, cwd, projectRoot });

  assert.equal(result.sources.find((source) => source.path === memory).current_project, true);
});

test("honors Claude autoMemoryDirectory and reports malformed settings without failing", async (t) => {
  const homeDir = await temporaryHome(t);
  const custom = path.join(homeDir, "claude-memory");
  const settings = path.join(homeDir, ".claude", "settings.json");
  await put(settings, JSON.stringify({ autoMemoryDirectory: custom }));
  await put(path.join(custom, "MEMORY.md"), "custom\n");

  const customResult = await discoverMemorySources({ homeDir, env: {}, platform: process.platform });
  assert.equal(customResult.sources.find((source) => source.provider === "claude").path, path.join(custom, "MEMORY.md"));

  await writeFile(settings, "{not-json", "utf8");
  const malformedResult = await discoverMemorySources({ homeDir, env: {}, platform: process.platform });
  assert.match(malformedResult.diagnostics.join("\n"), /Could not parse Claude settings/);
});

test("expands a home-relative Claude autoMemoryDirectory", async (t) => {
  const homeDir = await temporaryHome(t);
  await put(path.join(homeDir, ".claude", "settings.json"), JSON.stringify({ autoMemoryDirectory: "~/chosen-memory" }));
  const memory = path.join(homeDir, "chosen-memory", "MEMORY.md");
  await put(memory, "chosen\n");

  const result = await discoverMemorySources({ homeDir, env: {}, platform: process.platform });

  assert.equal(result.sources.find((source) => source.provider === "claude").path, memory);
});

test("honors the Claude environment switch that disables auto memory", async (t) => {
  const homeDir = await temporaryHome(t);
  await put(path.join(homeDir, ".claude", "projects", "alpha", "memory", "MEMORY.md"), "alpha\n");

  const result = await discoverMemorySources({
    homeDir,
    env: { CLAUDE_CODE_DISABLE_AUTO_MEMORY: "1" },
    platform: process.platform
  });

  assert.equal(result.sources.some((source) => source.provider === "claude"), false);
  assert.match(result.diagnostics.join("\n"), /disabled by CLAUDE_CODE_DISABLE_AUTO_MEMORY/);
});

test("reads exact source content from a fresh discovery on every call", async (t) => {
  const homeDir = await temporaryHome(t);
  const sourcePath = path.join(homeDir, ".codex", "memories", "MEMORY.md");
  const original = "# Persona\n\nI like café walks.  \nDo not normalize me.\n";
  await put(sourcePath, original);

  const discovered = await discoverMemorySources({ homeDir, env: {}, platform: process.platform });
  const source = discovered.sources.find((candidate) => candidate.path === sourcePath);
  const first = await readMemorySource(source.id, { homeDir, env: {}, platform: process.platform });
  assert.equal(first.content, original);

  const changed = `${original}\nNew preference: quiet mornings.\n`;
  await writeFile(sourcePath, changed, "utf8");
  const second = await readMemorySource(source.id, { homeDir, env: {}, platform: process.platform });
  assert.equal(second.content, changed);
  assert.notEqual(second.source.sha256, first.source.sha256);
});

test("refuses an unknown or no-longer-discoverable source ID", async (t) => {
  const homeDir = await temporaryHome(t);
  await assert.rejects(
    readMemorySource("codex:missing", { homeDir, env: {}, platform: process.platform }),
    /not available in the fresh discovery result/
  );
});

test("rejects a memory entrypoint replaced by a symbolic link", async (t) => {
  const homeDir = await temporaryHome(t);
  const sourcePath = path.join(homeDir, ".codex", "memories", "MEMORY.md");
  const target = path.join(homeDir, "sensitive.md");
  await put(target, "unapproved\n");
  await mkdir(path.dirname(sourcePath), { recursive: true });
  await symlink(target, sourcePath);

  const result = await discoverMemorySources({ homeDir, env: {}, platform: process.platform });

  assert.equal(result.sources.some((source) => source.path === sourcePath), false);
  assert.match(result.diagnostics.join("\n"), /symbolic link/);
});

test("reports an approved source that becomes unreadable instead of returning partial content", async (t) => {
  const homeDir = await temporaryHome(t);
  const sourcePath = path.join(homeDir, ".codex", "memories", "MEMORY.md");
  await put(sourcePath, "private\n");
  const discovered = await discoverMemorySources({ homeDir, env: {}, platform: process.platform });
  const source = discovered.sources.find((candidate) => candidate.path === sourcePath);
  await chmod(sourcePath, 0o000);
  t.after(() => chmod(sourcePath, 0o600).catch(() => {}));

  await assert.rejects(
    readMemorySource(source.id, { homeDir, env: {}, platform: process.platform }),
    /EACCES|permission denied/i
  );
});

test("searches a fresh large source and returns complete matching Markdown sections only", async (t) => {
  const homeDir = await temporaryHome(t);
  const sourcePath = path.join(homeDir, ".codex", "memories", "MEMORY.md");
  await put(sourcePath, `# Visual work\nLikes collaborative canvases.\n\n# Private unrelated detail\n${"Do not include this section. ".repeat(1200)}\n`);
  const discovered = await discoverMemorySources({ homeDir, env: {}, platform: process.platform });
  const source = discovered.sources.find((candidate) => candidate.path === sourcePath);

  await assert.rejects(
    readMemorySource(source.id, { homeDir, env: {}, platform: process.platform }),
    /larger than 25 KB.*search/i
  );
  const result = await searchMemorySource(source.id, "visual collaboration", { homeDir, env: {}, platform: process.platform });

  assert.equal(result.sections.length, 1);
  assert.equal(result.sections[0].content, "# Visual work\nLikes collaborative canvases.\n\n");
  assert.ok(!JSON.stringify(result).includes("Private unrelated detail"));
});

test("discovers and rereads a manually supplied memory export as its own source", async (t) => {
  const homeDir = await temporaryHome(t);
  const imported = path.join(homeDir, "Downloads", "chatgpt-memory.md");
  await put(imported, "exported preference\n");

  const discovered = await discoverMemorySources({ homeDir, env: {}, platform: process.platform, additionalMemoryPaths: [imported] });
  const source = discovered.sources.find((candidate) => candidate.provider === "imported");
  const read = await readMemorySource(source.id, { homeDir, env: {}, platform: process.platform, additionalMemoryPaths: [imported] });

  assert.equal(source.path, imported);
  assert.equal(read.content, "exported preference\n");
});

test("reads or searches a linked Claude topic only inside the approved memory directory", async (t) => {
  const homeDir = await temporaryHome(t);
  const memoryDirectory = path.join(homeDir, ".claude", "projects", "alpha", "memory");
  const entrypoint = path.join(memoryDirectory, "MEMORY.md");
  await put(entrypoint, "# Index\nSee [preferences](preferences.md).\n");
  await put(path.join(memoryDirectory, "preferences.md"), "# Visual\nCollaborative canvas.\n\n# Unrelated\nPrivate detail.\n");
  const discovered = await discoverMemorySources({ homeDir, env: {}, platform: process.platform });
  const source = discovered.sources.find((candidate) => candidate.path === entrypoint);

  const exact = await readMemoryTopic(source.id, "preferences.md", null, { homeDir, env: {}, platform: process.platform });
  const searched = await readMemoryTopic(source.id, "preferences.md", "visual collaboration", { homeDir, env: {}, platform: process.platform });

  assert.match(exact.content, /Private detail/);
  assert.equal(searched.sections.length, 1);
  assert.ok(!JSON.stringify(searched).includes("Private detail"));
});

test("rejects linked Claude topic traversal and symbolic links", async (t) => {
  const homeDir = await temporaryHome(t);
  const memoryDirectory = path.join(homeDir, ".claude", "projects", "alpha", "memory");
  const entrypoint = path.join(memoryDirectory, "MEMORY.md");
  const outside = path.join(homeDir, "outside.md");
  await put(entrypoint, "# Index\n");
  await put(outside, "outside\n");
  await symlink(outside, path.join(memoryDirectory, "linked.md"));
  const discovered = await discoverMemorySources({ homeDir, env: {}, platform: process.platform });
  const source = discovered.sources.find((candidate) => candidate.path === entrypoint);

  await assert.rejects(
    readMemoryTopic(source.id, "../../../../outside.md", null, { homeDir, env: {}, platform: process.platform }),
    /inside the approved memory directory/
  );
  await assert.rejects(
    readMemoryTopic(source.id, "linked.md", null, { homeDir, env: {}, platform: process.platform }),
    /symbolic link/
  );
});

test("refuses to return an entire Claude topic over 25 KB without a query", async (t) => {
  const homeDir = await temporaryHome(t);
  const memoryDirectory = path.join(homeDir, ".claude", "projects", "alpha", "memory");
  const entrypoint = path.join(memoryDirectory, "MEMORY.md");
  await put(entrypoint, "# Index\nSee large.md.\n");
  await put(path.join(memoryDirectory, "large.md"), `# Relevant\nvisual collaboration\n\n# Unrelated\n${"private detail ".repeat(2500)}\n`);
  const discovered = await discoverMemorySources({ homeDir, env: {}, platform: process.platform });
  const source = discovered.sources.find((candidate) => candidate.path === entrypoint);

  await assert.rejects(
    readMemoryTopic(source.id, "large.md", null, { homeDir, env: {}, platform: process.platform }),
    /larger than 25 KB.*--query/i
  );
  const searched = await readMemoryTopic(source.id, "large.md", "visual collaboration", { homeDir, env: {}, platform: process.platform });
  assert.equal(searched.sections.length, 1);
  assert.ok(!JSON.stringify(searched).includes("private detail"));
});
