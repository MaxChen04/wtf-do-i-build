# Host-Specific Skill Copies Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make every clone immediately expose all Aviator Hamster skills to Codex and Claude Code while keeping `skills/` canonical.

**Architecture:** A dependency-free Node synchronizer mirrors the complete canonical skill tree into `.agents/skills` and `.claude/skills`. Tests compare directory manifests and bytes, while setup and README explain clone-local availability and offer an explicitly approved active-host global installation.

**Tech Stack:** Node.js 20 ESM, `node:test`, Markdown Agent Skills, GitHub Actions.

---

### Task 1: Host-tree synchronization contract

**Files:**
- Create: `test/host-skill-copies.test.mjs`
- Create: `scripts/sync-host-skills.mjs`
- Modify: `package.json`

1. Write failing tests that create a temporary canonical tree and assert missing, changed, and extra host files are reported for both `.agents/skills` and `.claude/skills`.
2. Run `node --test test/host-skill-copies.test.mjs`; expect module-not-found failure.
3. Implement exported sync and check functions that compare relative file manifests and file bytes, delete stale host trees, and copy canonical files.
4. Add `sync-host-skills` and extend `check-distribution` to verify packaged scripts and both host trees.
5. Run the focused tests; expect all pass.

### Task 2: Committed host copies

**Files:**
- Create: `.agents/skills/{setup,brainstorm,prd,create-projects,build-project}/**`
- Create: `.claude/skills/{setup,brainstorm,prd,create-projects,build-project}/**`
- Modify: `test/host-skill-copies.test.mjs`

1. Add a failing repository-level assertion that all canonical skills exist and match in both host directories.
2. Run the focused test; expect missing-directory failure.
3. Run `npm run sync-host-skills` to generate real copies.
4. Run the focused test and `npm run check-distribution`; expect pass.

### Task 3: Clone-local onboarding contract

**Files:**
- Modify: `skills/setup/SKILL.md`
- Modify: `skills/setup/assets/setup-profile-template.md`
- Modify: `skills/setup/references/host-capabilities.md`
- Create: `test/host-onboarding-contract.test.mjs`

1. Write failing contract tests for repository-local detection, the plain-language global availability prompt, active-host-only installation, explicit approval, declined-install continuation, and post-install verification.
2. Run the focused test; expect assertion failures.
3. Add the minimal setup instructions and profile fields needed to satisfy the contract.
4. Sync packaged scripts if necessary, then regenerate both host trees.
5. Run the contract and distribution tests; expect pass.

### Task 4: User-facing clone and invocation guidance

**Files:**
- Modify: `README.md`
- Modify: `test/host-onboarding-contract.test.mjs`

1. Add failing assertions that README distinguishes shell commands from in-agent `$setup` and `/setup`, documents clone-local use first, and documents optional global installation.
2. Run the focused test; expect assertion failures.
3. Rewrite Start Here around clone, `cd`, launch host, invoke setup, and optionally install globally.
4. Run the focused test; expect pass.

### Task 5: End-to-end verification

**Files:**
- Modify: `evals/evidence/2026-07-12-host-equivalence/report.md` if host evidence changes.

1. Run `npm test`, `npm run validate`, `npm run check-distribution`, `npm run evals`, and `git diff --check`.
2. Confirm `npx skills@latest add . --list` finds all five skills.
3. Confirm `claude plugin validate .` passes.
4. Launch read-only Codex and Claude CLI checks from the repository and verify each can discover its host-local setup copy.
5. Review the final diff and commit the implementation to local `main`.
