---
name: build-project
description: Resume an approved project PRD in small, verifiable units. Use inside a created project repository when a user asks to build, implement, continue, resume, fix, investigate, prototype, or refactor an approved PRD step.
---

# Build an approved project

This is a project-local skill. It is installed by `/create-projects`; do not install it globally.

## Guard and orient

Verify the working directory is a Git repository containing `PRD.md`. If it is not, read `~/.aviator-hamster/projects.md`, list known projects, and print the exact `cd` command for the relevant one. Do not build outside a matching project.

Read the entire PRD, `AGENTS.md`, and relevant local instructions before editing. Resume at the first non-`[x]` build step. Read `skills-lock.json` when present and follow [locked skill routing](references/locked-skill-routing.md) before editing so the current step uses the approved relevant skills. Use [host adapters](references/host-adapters.md) only to map actions to tools; they never change product or verification gates.

## Execute one verifiable unit

For the next unit, state its data shape, user-visible behavior, and real verification surface. Inspect the implementation and establish a reproducible baseline. Select a path from [playbooks](references/playbooks.md), then apply [execution principles](references/execution-principles.md).

Keep later work hidden when it would encourage premature completion. Use delegation only if the host exposes it and the work separates independently; otherwise do the same work in one agent. Stop for user decisions and irreversible external actions.

## Prove and record

Read [verification policy](references/verification-policy.md). Completion requires direct evidence from the actual artifact—not a plausible diff—plus an updated PRD checkbox and resume header. Append `build_step_completed` using `.agents/skills/build-project/scripts/journal.mjs`, write a decision trail for long or consequential work using [the TSV template](assets/decision-log-template.tsv), and commit the completed unit when repository policy allows it.

End with the next resumable PRD step and evidence, not a vague status claim.
