# Host equivalence notes

## Installation evidence — 2026-07-11

The Vercel skills CLI performed clean local-copy installs from this repository:

- Codex: all five skills landed under `.agents/skills/`.
- Claude Code: all five skills landed under `.claude/skills/`.

The install copies include each skill's deterministic helper scripts. From the clean Codex install, the bundled `/create-projects` provisioner created an isolated local repository, copied the project-local execution skill and journal helper, and made the expected first commit.

The local `codex exec` binary could not start because its installed native executable was missing. This is an environment defect, not proof of host invocation. The Claude CLI was available, but no paid model invocation was run as part of package construction.

On 2026-07-12, two bounded Claude Code `/brainstorm` invocations with synthetic, local-only input were attempted. The second disabled optional MCP servers. Neither returned or wrote an artifact; both were stopped. See `evals/evidence/2026-07-12-interim-parity-run.md`; do not treat either attempt as a successful host equivalence run.

## Discovery equivalence evidence — 2026-07-12

Codex and Claude Code each completed the same local-only `/brainstorm` scenario after the distribution and discovery-validation fixes. Both raw artifacts pass the discovery validator and are compared in [the host-equivalence report](evidence/2026-07-12-host-equivalence/report.md).

## Remaining live equivalence run

For one selected fixture, run `/setup`, `/brainstorm`, `/prd`, `/create-projects`, and one `/build-project` step on both hosts. Compare: setup and consent gates, question sequence, source ledger, direction diversity, PRD headings and IDs, validator result, PRD status update, journal event, evidence, and commit boundary. Record differences as host-adapter fixes only; never loosen a product gate for one host.
