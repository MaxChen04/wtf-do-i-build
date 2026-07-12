# Discovery brief: Volunteer Handoffs

Schema-Version: 1
Status: directions-selected

## Resume here

Next action: invoke `/prd`

## Stated lead and goal

"I repeatedly watch small nonprofit volunteer coordinators lose handoff details between shifts. I built internal dashboards before and enjoyed making a repeated workflow obvious and fast. I can talk to two coordinators this week. You decide which direction is strongest, and I explicitly select your recommendation."

## Source ledger

| Source | Consent | What it established | Provenance |
| --- | --- | --- | --- |
| Conversation | yes | Repeated observed friction: coordinators lose handoff details between shifts; prior internal dashboard build; enjoyment of making repeated workflows obvious and fast; access to two coordinators this week; explicit delegation of direction recommendation to Claude; explicit selection of recommended direction | direct statement |

## Questions and answers

| ID | Question | Answer | Why it mattered |
| --- | --- | --- | --- |
| — | Interview skipped | User provided sufficient evidence to reach readiness and explicitly delegated direction choice | User stated "you decide" and "I explicitly select your recommendation" — interview policy honors this |

## Prior builds and access

Built internal dashboards (context unspecified beyond "internal"). Enjoyed making repeated workflows obvious and fast. Has not described what caused prior builds to stop or what was unsatisfying. Has direct access to two volunteer coordinators available for conversation this week.

## Evidence, inference, conflicts, and gaps

### Direct evidence

- User has personally observed the friction multiple times ("repeatedly watch") — this is first-hand observation, not hearsay.
- The specific failure mode is loss of handoff details between shifts, not general coordination chaos.
- User has prior dashboard build experience and positive affect toward making repeated workflows fast and legible.
- User has imminent access to two coordinators (this week) — domain access is concrete and time-bounded.
- User explicitly delegated the direction recommendation and recorded an explicit selection.

### Bounded inference

- Confidence ~70%: Coordinators likely use informal channels (group chat, paper, verbal) for handoffs today — inferred from "lose details," which implies no durable structured capture exists. Could be a broken tool rather than no tool.
- Confidence ~60%: Nonprofit context implies low or zero IT budget and no dedicated operations tooling — consistent with coordinators losing details, but not confirmed.
- Confidence ~55%: Prior dashboard work was probably internal to an organization the user was part of (work or school) rather than a product shipped to external users — basis: "internal dashboards" phrasing, but not confirmed.

### Conflicts

None identified.

### Gaps

- What information specifically gets lost (open tasks, volunteer assignments, incidents, contact notes)?
- Whether handoffs are synchronous (overlap period) or async (coordinator leaves before next arrives).
- What coordinators currently use: paper log, group chat, shared doc, verbal only?
- Size of volunteer roster per shift (2 volunteers vs. 30 changes the UI shape significantly).
- Whether the two accessible coordinators are at the same org or different orgs.

## Readiness verdict

Ready — observed pain is specific and repeated, user has direct domain access this week, and prior build experience maps directly to the solution space.

## Candidate directions

### D1 — End-of-shift handoff form and briefing card

- Grounding: "lose handoff details between shifts" is a capture and retrieval problem. User's dashboard experience maps directly to structured data entry + clear display. Coordinators have a natural trigger (shift end) to fill a form.
- Direction: A lightweight web app where the outgoing coordinator fills a structured end-of-shift form (open tasks, volunteer roster state, incidents, notes), and the incoming coordinator sees a clean briefing card when they arrive. Opinionated field set for volunteer coordination contexts; no freeform blank-page problem.
- First wedge: One coordinator fills out the form at the end of three consecutive shifts. Incoming coordinator reads the card instead of asking. Measure whether anything was missed.
- Main risk: Coordinators skip the form when rushed at shift end. Mitigation: form must be completable in under two minutes; mobile-friendly.
- Status: build-worthy

### D2 — Per-volunteer continuity board

- Grounding: Loss of details may be per-person (what is volunteer X working on, where did they leave off) rather than per-shift. Coordinator changes but volunteers persist across shifts.
- Direction: A board with one card per active volunteer, showing current assignment, pending items, and coordinator notes. Any coordinator can update it; the board is the persistent record across shifts.
- First wedge: One coordinator creates cards for their five most active volunteers and updates them for one week. Second coordinator reads the board at shift start.
- Main risk: Two coordinators editing the same card creates conflicts or stale data. Also, this solves volunteer-level continuity, not shift-level handoff — may miss time-sensitive shift events.
- Status: build-worthy

### D3 — Guided shift-overlap handoff checklist

- Grounding: Some nonprofit shifts have a brief overlap window where outgoing and incoming coordinators are both present. A guided, co-signed checklist structures that conversation and creates a record.
- Direction: A shared mobile checklist both coordinators open simultaneously during overlap. Outgoing ticks items off verbally; incoming acknowledges each. Both names and timestamp are recorded. Produces a signed artifact.
- First wedge: Two coordinators run the checklist for one shift overlap. Evaluate whether the record prevented a dropped item.
- Main risk: Requires synchronous overlap — if coordinators never overlap, this direction collapses entirely. This is a gap in the current evidence.
- Status: build-worthy

### D4 — Async shift briefing with acknowledgment

- Grounding: When coordinators do not overlap, the outgoing one needs to leave a legible briefing the incoming one will actually read before starting. Acknowledgment creates accountability.
- Direction: Outgoing coordinator writes a short text briefing (templated prompts for structure) and submits it. Incoming coordinator sees it as a required read-before-start screen and taps "ready." Both timestamps are recorded.
- First wedge: One coordinator sends a briefing for one shift. Incoming coordinator acknowledges before opening any other tool.
- Main risk: Briefings become long freeform paragraphs; the critical detail is buried. Mitigation: templated prompts force structure — but this is harder to enforce than a form with discrete fields.
- Status: build-worthy

## Recommendation

D1 — End-of-shift handoff form and briefing card.

D1 has the tightest match between the stated pain (losing handoff details), the user's prior build pattern (dashboards, structured display), and the smallest credible demand test (three shifts, one coordinator, observable outcome). The structured form solves the capture problem that free-text and verbal handoffs cannot; the briefing card solves the retrieval problem. D2 solves a real but adjacent problem (volunteer-level continuity) that may or may not be what is actually lost. D3 requires synchronous overlap — an unconfirmed precondition — making it the riskiest bet. D4 is the closest alternative to D1 but relies on unstructured text, which reintroduces the "detail buried in prose" failure mode that the user observed. D1's discrete form fields are faster to fill, easier to scan, and directly match dashboard-building experience.

## Selected directions

- D1 — End-of-shift handoff form and briefing card. Explicitly selected by user per their stated delegation: "I explicitly select your recommendation."

Next action: invoke `/prd`.
