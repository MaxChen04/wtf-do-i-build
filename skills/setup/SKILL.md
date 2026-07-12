---
name: setup
description: Set up Aviator Hamster's private local context, capability inventory, and project journal. Use when a user wants to start product discovery, connect optional GitHub, calendar, or resume context, ask what is available, or says they are using this package for the first time.
---

# Set up Aviator Hamster

Create or update `~/.aviator-hamster/setup.md` without blocking the user from continuing. This profile is local-only, contains no credentials, and records availability rather than guessed capabilities.

## First minute

Say: “This will take about a minute. You can skip every optional source; the basic workflow works from our conversation.” Explain that stronger host models generally produce stronger PRDs, then show the matching row from [model guidance](references/model-guidance.md).

If the profile is missing, complete the minimal inventory inline even when this skill was invoked indirectly. Do not redirect the user to another command.

## Inventory

Read [host capabilities](references/host-capabilities.md). Detect, but do not print secrets from:

1. active host and skill directories;
2. installed skills and collisions with `setup`, `brainstorm`, or `prd`;
3. Git, Node, GitHub CLI, GitHub authentication state, and an existing projects folder;
4. exposed MCP or connector capabilities; and
5. Vercel `find-skills` or the `npx skills find` fallback.

Record unavailable items as unavailable. For a missing prerequisite, explain its user benefit and offer the host's normal installation path instead of treating it as a failure. Never open personal external content during inventory.

## Optional context

Read [connector policy](references/connector-policy.md) and [private context policy](references/private-context-policy.md). Ask separately:

> Relevant context can make the output more personal. Would you like to connect GitHub, connect Google Calendar, or add a recent résumé? Each is optional, and you can review what will be used.

Explain the value of each option before asking. Verify only sources the user authorizes. Copy an approved résumé with its original extension to `~/.aviator-hamster/context/`; do not parse or commit it unless the user asks to use it. Use [the profile template](assets/setup-profile-template.md).

## Complete

Write or update the profile idempotently, initialize the local journal, and append exactly one `setup_completed` event:

```sh
node scripts/journal.mjs append --event '{"skill":"setup","event":"setup_completed","session_slug":"<session>","details":{"host":"<host>"}}'
```

Use the packaged script path when installed from this package. Tell the user they can now run `/brainstorm` or describe their lead in plain language.
