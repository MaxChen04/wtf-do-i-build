# Aviator Hamster setup

Schema-Version: 2

## Host

- Host: <detected-or-user-confirmed host>
- Model guidance shown: <row and last verified date>

## Capabilities

- Git: <available | unavailable>
- Node: <available | unavailable>
- GitHub CLI: <available | unavailable | not authenticated>
- Skill discovery: <find-skills | npx fallback | unavailable>
- Connectors: <capabilities, not secrets>
- Projects directory: <path | ask during project creation>

## Optional context consent

- GitHub: <accepted | skipped | unavailable>
- Google Calendar: <accepted | skipped | unavailable>
- Résumé: <accepted path | skipped>

## Memory consent

- Record one row per source with accepted, skipped, or unavailable; never collapse mixed choices into one status.
- Codex local memory:
  - <source ID | path | accepted, skipped, or unavailable | last access result>
- Claude local memory sources:
  - <source ID | project label | current-project yes/no | path | accepted, skipped, or unavailable | last access result>
- Imported memory files:
  - <source ID | original path | accepted, skipped, or unavailable | last access result>
- ChatGPT cloud memory: <accepted | skipped | unavailable>
- Claude cloud memory: <accepted | skipped | unavailable>
- Local source metadata: <per-source modification time, size, and SHA-256 after approved read | never>

## Privacy

This file records consent, availability, and source metadata. It contains no credentials, OAuth tokens, copied calendar data, or raw memory content.
