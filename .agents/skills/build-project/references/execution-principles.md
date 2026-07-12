# Portable execution principles

Adapted principles are informed by Cursor P Stack's MIT-licensed execution materials; this profile keeps only host-neutral behavior.

1. Name the domain and data shape before changing code.
2. Choose the smallest scope that proves a user outcome.
3. Respect boundaries: a change owns its inputs, outputs, errors, and persistence effects.
4. Make repeatable actions idempotent where retries are possible.
5. Diagnose root cause before fixing symptoms.
6. Work in small units with a direct proof surface.
7. Protect context by keeping PRD, decision, and evidence artifacts current.
8. Turn repeated lessons into explicit project structure only after evidence shows the need.

Each principle changes a concrete decision. Do not retain Cursor modes, named subagents, model slugs, or no-op slogans.
