# Host capabilities

Detect capabilities by observing the current host, its documented environment markers, and visible tools. Do not invent a connector or command. If host detection fails, ask: “Which AI coding app are you using for this session?”

| Need | Codex | Claude Code | Cursor | Fallback |
| --- | --- | --- | --- | --- |
| Repository-local skills | `.agents/skills` from the repository root | `.claude/skills` from the repository root | host-supported project skills | continue with direct conversation |
| Files and shell | workspace tools | shell tools | terminal | ask the user for the local path |
| Web and GitHub evidence | exposed tools | exposed tools | exposed tools | use conversation and local files |
| Cloud memory recall | capability exposed by the current host | capability exposed by the current host | capability exposed by the current host | mark unavailable; offer an exported file |
| Delegation | collaboration if exposed | subagents if exposed | agents if exposed | one agent |
| Skill location | host-managed | host-managed | host-managed | package directory |

Treat missing capabilities as a narrower evidence base, never as a reason to abandon the universal workflow. For missing Git, explain that it is the project’s save history. For missing Node, explain that it runs the small local journal and validator. For missing GitHub CLI, explain it is needed only to publish later.
