---
name: setup
description: Set up Aviator Hamster's private local context, capability inventory, and project journal. Use when a user wants to start product discovery, connect optional GitHub, calendar, or resume context, ask what is available, or says they are using this package for the first time.
---

# Set up Aviator Hamster

Create or update `~/.aviator-hamster/setup.md` without blocking the user from continuing. This profile is local-only, contains no credentials, and records availability rather than guessed capabilities.

## First minute

Say: “This will take about a minute. You can skip every optional source; the basic workflow works from our conversation.” Explain that stronger host models generally produce stronger PRDs, then show the matching row from [model guidance](references/model-guidance.md).

If the profile is missing, complete the minimal inventory inline even when this skill was invoked indirectly. Do not redirect the user to another command.

## Availability scope

Determine whether this skill was loaded from a repository-local `.agents/skills/setup` or `.claude/skills/setup` copy. Map the active host to the skills CLI agent name: Codex → `codex`; Claude Code → `claude-code`. Check active-host global availability with:

```sh
npx skills@latest list --global --agent <codex|claude-code> --json
```

When the complete Aviator Hamster set is repository-local but not global, ask:

> Aviator Hamster currently works inside this folder. Make it available in all your projects? You can also keep it here only.

Run a global installation only after explicit approval, and install for the active host only:

```sh
npx skills@latest add <repo-root> --global --agent <codex|claude-code> --skill setup brainstorm prd create-projects build-project --yes
```

Never install for another host implicitly. Verify success by rerunning the global list command and confirming all five skill names. Declining global installation does not block setup or brainstorming inside this repository. Record the choice and result in the profile. If Node, network access, or the skills CLI is unavailable, explain the benefit and leave global installation available for later.

## Inventory

Read [host capabilities](references/host-capabilities.md). Detect, but do not print secrets from:

1. active host and skill directories;
2. installed skills and collisions with `setup`, `brainstorm`, or `prd`;
3. Git, Node, GitHub CLI, GitHub authentication state, and an existing projects folder;
4. exposed MCP or connector capabilities; and
5. Vercel `find-skills` or the `npx skills find` fallback.

Record unavailable items as unavailable. For a missing prerequisite, explain its user benefit and offer the host's normal installation path instead of treating it as a failure. Never open personal external content during inventory.

Discover local memory metadata with the first packaged path that exists; discovery inspects paths, size, and modification time but does not read memory content:

```sh
node .agents/skills/setup/scripts/memory-sources.mjs discover --pretty
node .claude/skills/setup/scripts/memory-sources.mjs discover --pretty
node skills/setup/scripts/memory-sources.mjs discover --pretty
```

## Optional context

Read [connector policy](references/connector-policy.md), [memory policy](references/memory-policy.md), and [private context policy](references/private-context-policy.md). Ask separately:

> Relevant context can make the output more personal. Would you like to connect GitHub, connect Google Calendar, or add a recent résumé? Each is optional, and you can review what will be used.

Explain the value of each option before asking. Verify only sources the user authorizes. Copy an approved résumé with its original extension to `~/.aviator-hamster/context/`; do not parse or commit it unless the user asks to use it. Use [the profile template](assets/setup-profile-template.md).

Show every discovered local memory source with its provider, project when present, and path. Ask for consent separately for each discovered source. Also ask separately about ChatGPT cloud memory and Claude cloud memory; mark either unavailable when the current host exposes no supported recall capability. Remember each choice, not a blanket memory choice.

If cloud recall is unavailable and the user provides an exported memory file, rerun discovery with `--include <original-path>`, ask for consent to that imported source, and keep the file in its original location.

After consent, read each accepted local source fresh with the matching packaged script and its discovered ID:

```sh
node <packaged-memory-script> read --source <source-id>
```

Use relevant preferences to shorten setup questions, but do not copy raw memory into the profile. If a previously approved source moved or a new source appears, ask before reading it.

## Complete

Write or update the profile idempotently, migrating older profiles by adding the memory section without changing earlier choices. Initialize the local journal and append exactly one `setup_completed` event:

```sh
node scripts/journal.mjs append --event '{"skill":"setup","event":"setup_completed","session_slug":"<session>","details":{"host":"<host>"}}'
```

Use the packaged script path when installed from this package. Tell the user they can now run `/brainstorm` or describe their lead in plain language.
