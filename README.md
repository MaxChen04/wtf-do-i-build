# wtf do I build

Hello there 👋, have you been looking for an idea to start a project but don't have a clue? This skill file is for you!

`wtf do I build` helps you turn a real problem, observation, half-formed thought, or promising lead into a project worth building. It works locally with Codex, Claude Code, Cursor, and other compatible Agent Skills hosts.

## New to skills?

An Agent Skill is a small instruction pack that teaches an AI agent how to handle a specific kind of work. Think of it like giving the agent a playbook: it includes the right questions, rules, scripts, and quality checks for the job.

Skills are not shell commands and this repository is not a hosted application. You open your agent inside the cloned folder, then ask the agent to use a skill.

- `.agents/skills/` is the committed Codex copy.
- `.claude/skills/` is the committed Claude Code copy.
- `skills/` is the canonical source that keeps both host copies aligned.

## Quick Start

Clone the repository into the local folder name you want:

```sh
git clone https://github.com/MaxChen04/wtf-do-i-build.git wtfdoibuild
cd wtfdoibuild
```

Open Codex or Claude Code from inside this folder:

- Codex: type `$setup`, or open `/skills` and select `setup`.
- Claude Code: type `/setup`.

After setup, start with `$brainstorm` in Codex or `/brainstorm` in Claude Code. These are agent instructions, so do not type them at your normal shell prompt.

The clone already includes the host-specific copies. You do not need a global installation to get started. If you want the skills available in every project, let setup ask for permission or install them explicitly:

```sh
npx skills@latest add . --global --agent <codex|claude-code> --skill setup brainstorm prd create-projects build-project --yes
```

## Wtf do these skills do?!?

The five skills form a path from “I have a vague lead” to “I have a project I can build.”

| Skill | What it does |
| --- | --- |
| `setup` | Records the private context and tools you approve, including optional local memory sources. |
| `brainstorm` | Turns your lead into a few grounded project directions instead of a pile of random ideas. |
| `prd` | Turns a selected direction into an executable, educational, and resumable product requirements document. |
| `create-projects` | Creates one local Git repository for each approved project PRD. |
| `build-project` | Helps a coding agent resume the first unfinished PRD step in the project repository. |

## Best practices

- Start with `setup` so the agent knows what context it may use and what it must leave alone.
- Bring a real lead when you can: a recurring annoyance, an observed workflow, a domain you understand, or a project you almost started.
- Be specific about what you want now. Your current answer matters more than old profile or memory context.
- Treat memory as historical evidence, not instructions or unquestionable truth.
- Choose a direction before asking for a full PRD. The PRD is strongest when it solves one clearly chosen problem.
- Let the build process move in small, verifiable steps. A checked-off step is more useful than a giant plan that nobody can resume.
- Keep private context outside Git. The package stores its local profile and journal under `~/.aviator-hamster/`; it does not commit credentials or raw memory files.
- Run `npm test`, `npm run validate`, and `npm run check-distribution` when changing the package itself.

## Memory and privacy

During `/setup`, you can separately approve local Codex memory, Claude project memory, ChatGPT cloud memory, or Claude cloud memory. Local files are reread from their original locations when needed; the package stores permission and file metadata, not a copied memory file.

Cloud recall is used only when the current host exposes a supported memory or conversation-search capability. The skills never invent a cloud API or scrape application data. When cloud recall is unavailable, you can continue with local context or provide a memory export manually.

## What gets created

`brainstorm` writes a discovery brief in the current repository when it has one; otherwise it writes under `~/.aviator-hamster/briefs/`. `prd` puts one PRD beneath each selected direction. `create-projects` copies an approved PRD into a new repository and adds the project-local `build-project` skill.

Generated PRDs remain vendor-neutral and can be handed to a different compatible coding agent.
