# Model guidance

Last verified: 2026-07-12. Refresh active-host availability before relying on a named model.

| Host | Questioning and discovery | PRD synthesis and review | Why |
| --- | --- | --- | --- |
| Codex | GPT 5.6 at Medium, or Luna at Max | Sol for PRD synthesis | questioning benefits from speed and judgment; synthesis benefits from the strongest reasoning route |
| Claude Code | Claude Opus 4.8 at Low | Fable 5 at High, or Opus 4.8 at High | use lower effort for the interview and higher effort for synthesis and review |
| Cursor | a capable planning model | the strongest available architecture and review model | Cursor model availability changes frequently; let the user choose from current host options |
| Unknown | current model | ask the user to select their strongest available model | do not guess a vendor model name |

Inspect the active host before recommending a switch. Model labels and availability change; if a preferred route is unavailable, recommend the closest available model for the same role and say that it is a fallback. Never invent availability.

Show this as advice, not a requirement. Record a declined PRD checkpoint in the journal. Do not put model names in generated PRDs or project repositories.
