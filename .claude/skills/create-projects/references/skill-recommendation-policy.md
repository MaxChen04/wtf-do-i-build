# Skill recommendation policy

Derive recommendations from the approved PRD's stack, interfaces, risks, and proof requirements. Search with `find-skills` first, falling back to `npx skills find`. Inspect source, license, maintenance, actual `SKILL.md`, linked files, and permissions before presenting candidates.

Group a small set by value: framework/domain, testing, diagnosis, review, deployment, and workflow. Offer Matt Pocock engineering skills when their discipline matches, Vercel skills only where their stack matches, and original P Stack only for Cursor users who explicitly want it. Record source, version or commit, scope, and rationale in `skills-lock.json` after approval.
