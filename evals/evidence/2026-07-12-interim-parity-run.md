# Interim parity evidence — 2026-07-12

Status: incomplete. This report does not establish parity or authorize app retirement.

## App baseline: deterministic context preparation

Command run from the frozen source repository:

```sh
pnpm eval:prd -- --mode smoke
```

The command completed without writing product files. It evaluated the existing app's deterministic context-preparation stage—not live idea or PRD generation—on three fixtures.

| Fixture | Confidence | Earned | Specific | Why now | Adjacent | V1 | Demand | Total | Latency |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `beginner-student.json` | 82 | 2 | 2 | 1 | 1 | 1 | 0 | 7 | 8 ms |
| `career-switcher.json` | 82 | 2 | 2 | 1 | 1 | 1 | 0 | 7 | 0 ms |
| `designer-no-github.json` | 82 | 2 | 2 | 1 | 1 | 1 | 0 | 7 | 1 ms |

The aggregate demand-pull score was 0. This score is an implementation-defined smoke heuristic, not an observed judgment of app quality. It cannot be compared to generated PRD quality without a live paired run.

## Skill package: Claude Code live-run attempt

The package installed cleanly into a temporary repository with Claude Code's normal project layout. A bounded `/brainstorm` invocation used only a synthetic nonprofit volunteer-handoff lead, required no external sources, and instructed the host to write `docs/project-briefs/live-evaluation/discovery.md`.

The Claude CLI remained running for more than 100 seconds, wrote no discovery artifact, and emitted an empty result file. The process was stopped to avoid an unbounded model session.

This is an inconclusive host-runner result. It neither passes nor fails the skill's product gates. The clean install and bundled project-provisioner evidence remains valid; the live host invocation must be retried with a minimal host configuration or interactive session.

### Minimal-host retry

A second invocation disabled optional MCP servers with Claude Code's strict MCP configuration and ran under an explicit 75-second alarm. It likewise wrote no artifact or result payload and remained running until manually stopped. The repeated behavior makes this an environment-level runner blocker rather than a one-off integration delay.

## Next evidence needed

1. Run the same synthetic lead through a live app generation and a minimal Claude Code invocation that returns a `discovery.md`.
2. Validate each output against the behavior rubric and preserve raw artifacts.
3. Repeat on Codex once its local CLI binary is repaired or through a supported interactive host flow.
4. Conduct the user workflow study before changing ADR 0001 from pending.
