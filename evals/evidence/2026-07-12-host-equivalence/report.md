# Codex and Claude Code discovery equivalence — 2026-07-12

## Scenario

Both hosts received the same synthetic lead: a builder who repeatedly observes small-nonprofit volunteer coordinators lose handoff details between shifts, has dashboard experience, enjoys simplifying repeated workflows, can interview two coordinators, and explicitly selects the assistant's recommendation.

Both runs used a clean temporary Git repository, a fresh local installation of this package, and no web, connector, résumé, personal-profile, or other external source. Both were told to stop before PRD generation.

## Evidence

| Gate | Codex | Claude Code |
| --- | --- | --- |
| Installed package path | `.agents/skills/` | `.claude/skills/` |
| Discovery artifact | [raw artifact](codex/discovery.md) | [raw artifact](claude/discovery.md) |
| Structural validator | pass | pass |
| Status | `directions-selected` | `directions-selected` |
| Candidate count | 4 | 4 |
| Evidence split | direct evidence and bounded inference headings | direct evidence and bounded inference headings |
| Recommendation | D1: Shift Handoff Builder | D1: End-of-shift handoff form and briefing card |
| Explicit selection | recorded | recorded |
| PRD generated | no | no |

The hosts use different wording and distinct candidate names, as expected. Both preserve the product gates: intent does not originate from capability, inferences remain separate and confidence-bounded, directions are materially different, one direction is recommended, and the artifact is resumable.

## Runner notes

The existing global Codex CLI was incomplete: its native executable was absent. Reinstalling `@openai/codex@latest` repaired it to `0.144.1`, after which the run succeeded. Claude Code completed the final validated run in about 130 seconds. Earlier Claude attempts exposed the discovery-template drift fixed in this commit.

## Scope remaining

This proves the `/brainstorm` host-equivalence slice only. It does not yet prove the full five-skill sequence, live PRD quality against the hosted app, or the user workflow study required before a retirement decision.
