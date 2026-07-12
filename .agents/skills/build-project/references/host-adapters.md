# Host adapters

Map the same semantic actions to the host's visible capabilities. If a capability is missing, use the fallback without weakening the gate.

| Semantic action | Codex | Claude Code | Cursor | Fallback |
| --- | --- | --- | --- | --- |
| inspect and edit | workspace tools | filesystem and shell | editor and terminal | shell and editor |
| task tracking | plan tools | task list if exposed | task tools if exposed | PRD checkbox |
| delegation | collaboration if exposed | subagents if exposed | agents if exposed | single agent |
| real-surface proof | browser/tool capabilities | browser/tool capabilities | browser/tool capabilities | project-native command and manual proof |
| commit | Git tools or shell | Git tools or shell | terminal | Git shell |

All adapters must read `PRD.md`, preserve user gates, update status, retain evidence, and honor the same commit boundary. Unsupported tools are never guessed.
