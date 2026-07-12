# Lean Public Repository Tree Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Remove internal documentation and evaluation trees from future clones while keeping the remaining package checks coherent.

**Architecture:** Treat `docs/` and `evals/` as local-only paths through root ignore rules and remove their currently tracked contents. Remove the package, CI, and test entrypoints that depend on `evals/`; keep general Node tests, artifact validation, and host-copy distribution checks.

**Tech Stack:** Git ignore rules, npm scripts, GitHub Actions, Node.js test runner.

---

### Task 1: Specify the lean-tree contract

**Files:**
- Create: `test/repository-tree.test.mjs`

**Step 1: Write the failing test**

Assert that `.gitignore` contains anchored `/docs/` and `/evals/` rules, `package.json` has no `evals` script, and the validation workflow has no `npm run evals` step.

**Step 2: Run the test to verify it fails**

Run: `node --test test/repository-tree.test.mjs`

Expected: FAIL because the ignore rules are absent and evaluation entrypoints still exist.

### Task 2: Remove internal trees and dependent entrypoints

**Files:**
- Modify: `.gitignore`
- Modify: `package.json`
- Modify: `.github/workflows/validate.yml`
- Delete: `test/evals.test.mjs`
- Delete: `docs/`
- Delete: `evals/`

**Step 1: Add the ignore rules and remove evaluation commands**

Add `/docs/` and `/evals/` to `.gitignore`. Remove the `evals` npm script and GitHub Actions step.

**Step 2: Remove tracked internal content**

Remove `test/evals.test.mjs`, `docs/`, and `evals/` from the working tree. Their contents remain in Git history.

**Step 3: Run the focused test**

Run: `node --test test/repository-tree.test.mjs`

Expected: PASS.

### Task 3: Verify and commit

**Files:**
- Verify all remaining tracked files.

**Step 1: Check for broken references**

Run: `rg -n --hidden -g '!.git/**' -g '!node_modules/**' 'npm run evals|evals/run-evals|docs/plans' .`

Expected: no required runtime or validation references.

**Step 2: Run the remaining suite**

Run: `npm test && npm run validate && npm run check-distribution && git diff --check`

Expected: all commands pass.

**Step 3: Confirm ignore behavior and tree shape**

Run: `git check-ignore docs/example.md evals/example.json`

Expected: both paths are ignored.

**Step 4: Commit**

```bash
git add -A
git commit -m "chore: simplify public repository tree"
```
