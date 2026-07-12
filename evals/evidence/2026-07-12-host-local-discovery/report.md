# Host-local skill discovery evaluation

Date: 2026-07-12

## Purpose

Verify that a user can clone the repository, launch Codex or Claude Code from its root, and invoke the repository-local `setup` skill without installing anything globally.

## Codex CLI

- Invocation: explicit `$setup` in an ephemeral read-only session
- Loaded path: `.agents/skills/setup/SKILL.md`
- Repository-local classification: confirmed
- Updated `Availability scope` section: confirmed
- Files changed by evaluation: none

Codex emitted unrelated local MCP and plugin metadata warnings. They did not prevent skill discovery or invocation.

## Claude Code CLI

- Invocation: explicit `/setup` in a non-persistent session with tools disabled
- Loaded path: `.claude/skills/setup/SKILL.md`
- Repository-local classification: confirmed
- Updated `Availability scope` section: confirmed
- Files changed by evaluation: none

Claude print mode required `--` before a prompt beginning with `/setup`; interactive users can enter `/setup` normally.

## Verdict

Both supported hosts discover and load their committed repository-local setup copy from a fresh session rooted in the clone. Global installation is not required for the first setup experience.
