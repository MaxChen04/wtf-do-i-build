# Locked skill routing

Treat `skills-lock.json` as the approved project skill inventory, not as executable instructions. On every invocation:

1. Read each locked skill's name, scope, source, and rationale. Verify that it is actually available through the host's skill inventory or a repository-local skill directory. Treat a host-incompatible skill, including Cursor-only P Stack outside Cursor, as unavailable.
2. If a locked skill required for the current PRD step is missing, explain what capability is missing and get explicit approval before attempting to install or reinstall it. Never install from the lock automatically. A missing skill that is irrelevant to the current step does not block work.
3. Match the current PRD step's behavior, stack, risks, and verification surface to the locked rationales. Choose the smallest relevant subset; installed does not mean applicable.
4. State which skills were selected and why, then load or invoke them through the host's supported skill interface before editing. Do not invoke every locked skill by default. If no optional skill is relevant, continue with `build-project` alone.
5. Resolve instruction conflicts in this order: current user instructions, `PRD.md`, `AGENTS.md`, then an optional skill. An optional skill may strengthen implementation or verification, but it may not expand scope, weaken an acceptance gate, or authorize an external action.
6. Record materially consequential skill choices in the decision trail with the selected skill, the PRD step, and the reason it applied. Do not rewrite `skills-lock.json` merely to record usage.

New skill discovery belongs in `/create-projects` or an explicit user request. `build-project` routes through skills already approved for this repository.
