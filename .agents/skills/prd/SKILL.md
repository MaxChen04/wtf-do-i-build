---
name: prd
description: Turn one or more selected Aviator Hamster directions into grounded, executable, educational, and resumable product requirements documents. Use when a user wants to turn an idea into a plan, asks for a PRD, has selected project directions, or wants a build-ready specification.
---

# Create reviewed PRDs

Create one `prd.md` per selected direction. Do not create local folders, repositories, installs, or GitHub remotes; those are `/create-projects` decisions. If setup is missing, perform the short inline setup and continue.

## Gate and prepare

Read the discovery artifact and verify `Status: directions-selected` plus explicit selected IDs. If either is absent, explain what is missing and route to `/brainstorm`; never invent context. State that this takes a focused generation and review pass, narrating `domain scan → drafting → review` as it happens.

Read [output contract](references/output-contract.md), [grounding contract](references/grounding-contract.md), and [resumability](references/resumability.md). Before generation, show the host row from `../setup/references/model-guidance.md`, recommend the strongest available generation/review model, and record the user's choice without leaking model names into the PRD.

## Generate each selected direction

For each direction, perform the [domain extension scan](references/domain-extension.md), including the limitations query. Use only tool-returned sources. Derive the architecture from the dominant constraint with [the framework decision](references/framework-decision.md); do not default to a fashionable stack.

Write from [the PRD template](assets/prd-template.md). Preserve source provenance, include the plain-English digest and Mermaid diagram before technical detail, and make every build step independently verifiable. Keep a narrow first wedge and an adjacent future path.

## Review and approval

Apply [judge rubric](references/judge-rubric.md). Prefer a fresh reviewer when the host supports one; otherwise use a deliberately clean self-review. Allow at most two repair rounds. After that, ship only a passing document or a clearly flagged best score; block a document with a zero rubric dimension.

Run `node scripts/validate-artifacts.mjs <path-to-prd.md>`. Compare completed PRDs, recommend which to build first, and ask which PRDs the user approves for project creation. Append `prd_generated`, `prd_approved`, or `prd_rejected` events using this skill's bundled journal script. On approval, offer `/create-projects` and explain that it will show all folders, skills, and publication choices before changing anything.
