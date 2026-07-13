---
name: create-projects
description: Create one isolated local git repository for each approved WTF Do I Build PRD, add the approved handoff and project-local execution profile, and optionally publish after explicit approval. Use when a user asks to set up a project, create a repository from a PRD, or turn approved plans into local projects.
---

# Create approved projects

Create local repositories first. Never create a folder, commit, install a skill, or create a GitHub remote until the user has approved the proposed changes. If setup is missing, perform the short inline setup and continue.

## Prepare the proposal

Read the approved PRDs and [repository policy](references/repository-policy.md). Determine or ask for the parent projects directory. For each PRD, propose the folder name, repository name, visibility if later published, and a minimal skill set derived from the PRD. Resolve collisions before changing disk state.

Show all proposed local actions and ask for one explicit local-creation approval. Explain that a repository is simply a project folder with a reliable change history; GitHub is optional and comes later.

## Create local repositories

After approval, use `scripts/provision-project.mjs` or equivalent idempotent operations to create one folder per approved PRD, initialize Git, copy `PRD.md`, write the README and AGENTS routing file from assets, add `CONTEXT.md` when shared domain vocabulary is needed, copy this package's `build-project` skill into a project-local skill directory, verify the handoff, and make one clean first commit.

Append `repository_created` and `skills_installed` journal events. If one project fails, report its recovery path and continue safely with the others.

## Recommend optional skills

Read [skill recommendation policy](references/skill-recommendation-policy.md) and [execution profiles](references/execution-profiles.md). Search with Vercel `find-skills` or `npx skills find` using the actual stack and risks. Inspect candidate instructions and permissions. Explain each recommendation and its scope, then ask for approval before installation. Do not install a universal bundle.

## Publish only if requested

Read [GitHub policy](references/github-policy.md). Check `gh` and authentication only after the user explicitly asks to publish and approves owner, name, visibility, and push. A remote failure leaves the local repository valid and gets recorded as `github_publication_result`.

## Finish

Report exactly what happened. Print the literal `cd <path>` command and the host’s project-opening command for every successful project. Explain that `/build-project` is local to that project and resumes from the first unfinished step in `PRD.md`.
