# Lean public repository tree

## Decision

Keep the cloned repository focused on the files required to discover, maintain, test, and distribute Aviator Hamster skills. Remove the tracked `docs/` and `evals/` trees and ignore both paths so local planning notes and evaluation artifacts do not reappear in commits.

## Public tree

- `.agents/skills/` — committed Codex copies
- `.claude/skills/` — committed Claude Code copies
- `skills/` — canonical skill sources
- `scripts/` — shared synchronization, validation, memory, journal, and provisioning tools
- `test/` — automated package and behavior-contract tests
- `.github/` — cross-platform validation workflow
- `.claude-plugin/` — Claude plugin metadata
- `agents/` — package-level agent metadata
- root package and legal files — `README.md`, `package.json`, `LICENSE`, and `NOTICE.md`

## Cleanup behavior

Adding `docs/` and `evals/` to `.gitignore` is not enough because Git already tracks their contents. The cleanup removes both tracked trees from the current commit. Their prior contents remain recoverable from repository history.

The `evals` package script, CI step, and evaluation-specific test are removed with the evaluation tree. General tests remain and continue validating the skill contract, host copies, scripts, memory behavior, and project provisioning.

## Verification

- A fresh tree listing contains neither `docs/` nor `evals/`.
- Git ignores newly created files under both paths.
- No tracked package, workflow, test, or README reference requires either path.
- The remaining test, artifact validation, and distribution checks pass on the cleaned tree.
