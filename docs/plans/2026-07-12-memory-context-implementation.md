# Memory Context Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add consented, fresh, cross-platform local memory retrieval and capability-aware cloud recall to `/setup` and `/brainstorm`.

**Architecture:** A dependency-free Node CLI deterministically discovers and reads local Codex and Claude memory sources without caching their contents. Skill instructions and policy references own consent, cloud capability checks, evidence precedence, prompt-injection defense, and provenance reporting.

**Tech Stack:** Node.js 20 ESM, `node:test`, Markdown Agent Skills.

---

### Task 1: Memory discovery contract

**Files:**
- Create: `test/memory-sources.test.mjs`
- Create: `scripts/memory-sources.mjs`

1. Write tests for default and overridden Codex locations, Claude config overrides, multiple Claude projects, excluded automation memory, stable source IDs, exact reads, changed-file rereads, and missing-source errors.
2. Run `node --test test/memory-sources.test.mjs` and confirm failure because the module does not exist.
3. Implement discovery, exact small-file reads, and relevant-section search plus `discover`, `read`, and `search` CLI commands.
4. Rerun the focused test and confirm it passes.

### Task 2: Skill distribution

**Files:**
- Modify: `scripts/sync-skill-scripts.mjs`
- Create: `skills/setup/scripts/memory-sources.mjs`
- Create: `skills/brainstorm/scripts/memory-sources.mjs`
- Modify: `test/brainstorm-distribution.test.mjs`

1. Add failing distribution assertions for both packaged script copies.
2. Add the root script to the distribution map and sync it.
3. Run the focused distribution tests and `npm run check-distribution`.

### Task 3: Consent and evidence policy

**Files:**
- Modify: `skills/setup/SKILL.md`
- Modify: `skills/brainstorm/SKILL.md`
- Modify: `skills/setup/assets/setup-profile-template.md`
- Modify: `skills/setup/references/connector-policy.md`
- Modify: `skills/setup/references/private-context-policy.md`
- Modify: `skills/setup/references/host-capabilities.md`
- Create: `skills/setup/references/memory-policy.md`
- Create: `skills/brainstorm/references/memory-policy.md`
- Create: `test/memory-skill-contract.test.mjs`

1. Write failing contract tests for per-source consent, fresh reads, relevant-section search, imported exports, current-user precedence, untrusted-memory handling, cloud capability checks, no scraping, and provenance summaries.
2. Update the setup flow and profile schema to remember permissions and metadata only.
3. Update brainstorm to discover sources fresh, read only approved relevant sources, follow linked topic files when relevant, and report provenance.
4. Run the focused contract tests.

### Task 4: Behavior fixtures and user documentation

**Files:**
- Create: `evals/fixtures/memory-context.json`
- Modify: `evals/expected-behaviors.md`
- Modify: `README.md`

1. Add a fixture covering consent, conflicts, prompt injection, unavailable cloud recall, and a recurring-friction inference.
2. Document the local-first memory behavior and manual cloud fallback.
3. Run `npm run evals` and the full automated suite.

### Task 5: Cross-host verification

**Files:**
- Create or update: `evals/evidence/2026-07-12-memory-context/report.md`

1. Run the same setup/brainstorm pressure scenario through Codex CLI and Claude Code CLI using the local skill files.
2. Confirm both hosts request or honor per-source consent, read approved sources, refuse memory-embedded instructions, prioritize current user intent, and state cloud limitations honestly.
3. Run `npm test`, `npm run validate`, `npm run check-distribution`, `npm run evals`, and `git diff --check`.
4. Review the final diff against the approved design and commit only after fresh verification.
