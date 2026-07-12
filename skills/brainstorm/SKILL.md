---
name: brainstorm
description: Turn a real problem, observation, domain access, prior build, or partial product lead into a few grounded project directions. Use when a user says “I want to build something but don't know what,” needs help choosing a project, or wants to turn an observed workflow into a build-worthy direction.
---

# Brainstorm a grounded project

Create a durable `discovery.md`; do not create a PRD or repository in this skill. If `~/.aviator-hamster/setup.md` is missing, perform the short inline inventory from `/setup` and continue.

## Open and resume

Read the setup profile, `journal.jsonl`, and `projects.md`. If there is a recent project, offer its exact next step or a new session. Treat the journal as evidence, not truth: the user’s current statement wins.

State expectations: five to seven questions, normally around fifteen minutes, one question at a time, never more than ten; the user may say “you decide” at any point. Write in the discovery location rules from [source policy](references/source-policy.md).

## Interview

Follow [interview policy](references/interview-policy.md), reading [signal rules](references/signal-rules.md) when weighing evidence. Ask only a question whose answer could change the recommendation. Start with the user’s lead and this question unless the journal already answers it:

> Have you built anything before, including something unfinished? What was it, what did you enjoy, and what made you stop or want to improve it?

Use authorized sources only after consent; do not repeat facts they establish. Preserve direct evidence, bounded inference, conflicts, and unresolved gaps separately. Intent outranks capability.

## Readiness and directions

Read [readiness gate](references/readiness-gate.md). If the premise is not ready, write the missing evidence and one concrete observation or research assignment; do not manufacture directions.

Otherwise generate four directions. Add up to two only when the evidence supports genuinely distinct directions. Apply [idea quality](references/idea-quality.md). Present only directions that pass, recommend one explicitly, and ask the user to select one or several or reject them with a reason.

## Complete

Fill [the discovery template](assets/discovery-template.md), set its status to `directions-selected` only after an explicit user selection, append lifecycle events with `scripts/journal.mjs`, and offer `/prd`. Never use capability evidence to originate a direction and never claim all options are equally good to avoid a recommendation.
