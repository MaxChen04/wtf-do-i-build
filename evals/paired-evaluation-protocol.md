# App-versus-skill paired evaluation

Status: ready to run; do not claim a parity result until both artifact sets exist.

Use the migrated source-app profile fixtures in `evals/fixtures/source-app/` and the behavior fixtures in `evals/fixtures/`. For each case, run the current hosted application and the skill package from a clean session with the same user-provided evidence. Save raw discovery and PRD artifacts under a dated, ignored evaluation-results directory.

Score each output independently for personalization, specificity, candidate diversity, unsupported inference, demand evidence, PRD executability, grounding, and clean-session resumability. Record source availability, host/model tier, question count, time to selected direction, selected recommendation, validation output, and any blocker. Compare guards and artifacts, not word-for-word prose.

The app remains the baseline until a written report links raw artifacts and scores every fixture. This protocol does not authorize app retirement.
