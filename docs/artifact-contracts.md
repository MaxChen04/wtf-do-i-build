# Artifact contracts

`discovery.md` is the cross-session discovery source of truth. It stores schema version, status, source ledger, questions, direct evidence, bounded inference, conflicts, readiness, candidate IDs, selections, and next action.

Each selected direction has a `prd.md` with the portable review layer, PRD structure, stable build IDs, status markers, references, and a resume header. A project copy is named `PRD.md`.

`~/.aviator-hamster/journal.jsonl` is append-only. Each event has `schema_version`, timestamp, skill, event, session slug, optional project slug, and a small details object. `scripts/journal.mjs rollup` deterministically rebuilds `projects.md`. The journal indexes progress; the Markdown artifacts remain the source of truth.
