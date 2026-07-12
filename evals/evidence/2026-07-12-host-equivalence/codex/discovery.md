# Discovery brief: Volunteer handoffs

Schema-Version: 1
Status: directions-selected

## Resume here

Next action: invoke `/prd` for D1 — Shift Handoff Builder.

## Stated lead and goal

> "I repeatedly watch small nonprofit volunteer coordinators lose handoff details between shifts. I built internal dashboards before and enjoyed making a repeated workflow obvious and fast. I can talk to two coordinators this week. You decide which direction is strongest, and I explicitly select your recommendation."

The goal of this discovery is to identify a small, build-worthy direction rooted in the observed handoff problem, recommend the strongest direction, and record the user's explicit selection without generating a PRD.

## Source ledger

| Source | Consent | What it established | Provenance |
| --- | --- | --- | --- |
| Conversation | yes | Small-nonprofit volunteer coordinators repeatedly lose details between shifts. | Direct user statement in this session |
| Conversation | yes | The user has built internal dashboards and enjoyed making repeated workflows obvious and fast. | Direct user statement in this session |
| Conversation | yes | The user can speak with two coordinators this week. | Direct user statement in this session |
| Conversation | yes | The user delegated the recommendation and explicitly selected it in advance. | Direct user statement in this session |

No web, connectors, external sources, personal profile, or repository-external journal were used.

## Questions and answers

| ID | Question | Answer | Why it mattered |
| --- | --- | --- | --- |
| Q1 | Have you built anything before, what did you enjoy, and what made you stop or want to improve it? | The user built internal dashboards and enjoyed making a repeated workflow obvious and fast. No stopping condition was provided. | Establishes relevant build experience and a stated preference for workflow clarity, while preserving the unanswered portion as a gap. |
| Q2 | Who experiences the problem, at what moment, and how often? | Small-nonprofit volunteer coordinators repeatedly lose details between shifts. | Identifies a specific user, repeated workflow, and painful moment. |
| Q3 | What near-term access exists for validation? | The user can talk to two coordinators this week. | Makes a small demand and workflow test credible. |
| Q4 | Who should choose among viable directions? | The user said, "You decide," and explicitly selected the recommendation. | Authorizes a recommendation and records selection without another interview round. |

## Prior builds and access

- Prior build: internal dashboards.
- Stated enjoyable aspect: making a repeated workflow obvious and fast.
- Relevant access: two volunteer coordinators available for conversations this week.
- Not established: whether the dashboards shipped, their technical stack, why work stopped, or whether the coordinators belong to the same nonprofit.

## Evidence, inference, conflicts, and gaps

### Direct evidence

- Shift details are repeatedly lost between volunteer shifts at small nonprofits.
- Volunteer coordinators are the people observed dealing with the problem.
- The user has built internal dashboards before.
- The user enjoyed simplifying and speeding up repeated workflows.
- The user can interview two coordinators this week.
- The user explicitly selected the direction recommended in this discovery.

### Bounded inference

- **Medium confidence:** The failure likely occurs because handoff information is captured inconsistently, scattered across channels, or difficult for the incoming shift to scan. The current tools and exact failure mechanism have not been observed.
- **Medium confidence:** A narrow workflow tool is likely a better first project than a broad volunteer-management platform because the evidence concerns one repeated transition moment.
- **Low confidence:** Coordinators may value accountability for unresolved items, but the user did not directly report missed ownership or follow-up.
- **Medium confidence:** The user's dashboard experience may reduce implementation risk for a structured handoff interface. This is capability evidence, not the source of the direction.

### Conflicts

- None identified. The current user statement is the controlling evidence.

### Gaps

- What coordinators use today: paper, chat, spreadsheets, email, or an existing volunteer system.
- Which details are most often lost and what consequences follow.
- Whether the outgoing volunteer, coordinator, or both create the handoff.
- Whether incoming volunteers have reliable device and account access.
- Required privacy, safeguarding, retention, and permission boundaries.
- Whether two coordinators independently confirm the problem and will test a lightweight prototype.

## Readiness verdict

**Ready** — the lead names a specific user and workflow, a repeated painful moment, a reason this user is well placed to explore it now, and near-term access for validation. The evidence supports discovery and a small prototype direction, but not yet a broad product or feature set.

The smallest demand test is to interview both coordinators using recent real handoffs, map where details were lost, and ask each to complete one paper or clickable version of the proposed handoff flow. Continue only if both can identify a consequential recent loss and at least one agrees to test the flow during a real shift change.

## Candidate directions

### D1 — Shift Handoff Builder

- **Grounding:** Details are repeatedly lost specifically between shifts, and the user enjoys making repeated workflows obvious and fast.
- **Direction:** A guided end-of-shift flow that turns essential updates, unresolved tasks, incidents, and the next shift's priorities into one scannable handoff record.
- **First wedge:** One configurable handoff template for one volunteer program, completed by the outgoing shift and opened by the incoming coordinator or lead.
- **First success moment:** The incoming person can understand what changed, what remains open, and what needs attention in under two minutes without contacting the prior shift.
- **Smallest demand test:** Reconstruct two recent handoffs with each coordinator, then have them use a paper or clickable template for one live shift transition.
- **Main risk:** A form can create extra work without preventing loss if it asks the wrong questions or sits outside the tools volunteers already use.
- **Why this user can explore it:** Direct coordinator access enables fast workflow validation; prior dashboard experience lowers the risk of building a clear structured interface.
- **Credible adjacent path:** Add program-specific templates, acknowledgements, searchable history, and integrations only after the core handoff proves useful.
- **Status:** build-worthy

### D2 — Incoming Shift Briefing

- **Grounding:** The observed pain appears at shift transition, when the next person needs the missing context.
- **Direction:** A read-first briefing that compiles the few changes, alerts, schedule notes, and open items relevant to the incoming shift.
- **First wedge:** A coordinator manually assembles a mobile-friendly briefing from existing notes before one shift begins.
- **First success moment:** An incoming volunteer correctly names the day's priorities and exceptions before starting work.
- **Smallest demand test:** Give coordinators a manually prepared briefing based on a recent shift and compare it with what the incoming volunteer normally receives.
- **Main risk:** It may improve presentation while leaving the upstream capture problem untouched; important details can still be absent.
- **Why this user can explore it:** The user's stated interest in fast, obvious workflows fits a scan-friendly briefing, and coordinator interviews can test comprehension.
- **Credible adjacent path:** Personalize briefings by role, add read confirmation, and pull from trusted source systems after proving comprehension improves.
- **Status:** build-worthy

### D3 — Open-Loop Ownership Board

- **Grounding:** Lost handoff details may include unresolved work that needs to survive across shifts.
- **Direction:** A lightweight board where coordinators assign an owner and due point to anything that cannot be finished during the current shift.
- **First wedge:** Track only cross-shift exceptions with three states: needs owner, owned, and resolved.
- **First success moment:** Every unfinished item has a visible next owner before the outgoing shift ends.
- **Smallest demand test:** Ask the two coordinators to log cross-shift exceptions for one week and see whether ownership, rather than context, is the dominant failure.
- **Main risk:** Ownership failure is only a low-confidence inference; the core problem may be missing context rather than unassigned work.
- **Why this user can explore it:** The repeated-workflow experience is relevant to a compact operational board, while coordinator access can quickly confirm or reject the ownership hypothesis.
- **Credible adjacent path:** Add escalation rules, reminders, and outcome reporting if unresolved ownership proves consequential.
- **Status:** build-worthy

### D4 — Handoff Quality Review

- **Grounding:** The user has observed repeated loss, suggesting coordinators may benefit from seeing where their handoff process breaks over time.
- **Direction:** A retrospective tool that logs handoff misses, groups them by cause, and helps a coordinator improve the team's handoff checklist.
- **First wedge:** A weekly five-minute review of missed details and the handoff fields that failed to capture them.
- **First success moment:** A coordinator changes one handoff practice based on a visible recurring failure pattern.
- **Smallest demand test:** Have both coordinators record missed details for one week and review whether patterns are frequent and actionable enough to justify a tool.
- **Main risk:** It asks users to document failures after the fact and may produce insight too slowly to earn repeated use.
- **Why this user can explore it:** Dashboard experience supports pattern visibility, and direct coordinator access enables a short logging test.
- **Credible adjacent path:** Recommend checklist changes, compare programs, and measure whether repeat misses decline after enough data exists.
- **Status:** build-worthy

## Recommendation

**Recommend D1 — Shift Handoff Builder.** It attacks the exact painful moment described rather than an inferred downstream symptom. It has the strongest combination of direct evidence, a narrow first use, a success moment that coordinators can observe immediately, and a credible live test with the two available coordinators. D2 starts too late if information was never captured, D3 depends on an unconfirmed ownership problem, and D4 delays value until enough failures have accumulated.

## Selected directions

- **D1 — Shift Handoff Builder** — explicitly selected by the user through the instruction, "You decide which direction is strongest, and I explicitly select your recommendation." The selection applies to the recommendation made above.

Next action: invoke `/prd` in a future step. PRD generation is intentionally out of scope for this discovery artifact.
