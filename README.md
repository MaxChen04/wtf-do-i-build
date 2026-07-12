# Aviator Hamster

Turn a real lead into a project worth building before spending time coding the wrong thing.

This is a local-first Agent Skills package, not a hosted application. It works with Codex, Claude Code, Cursor, and other compatible hosts. Its five skills take you from a lead to an approved project:

1. `/setup` records private local preferences and available tools.
2. `/brainstorm` turns evidence into a few grounded directions.
3. `/prd` turns selected directions into reviewed, resumable PRDs.
4. `/create-projects` makes one local repository per approved PRD.
5. `/build-project` is copied into each created project and resumes the first unfinished PRD step.

## Start here

Install with the open skills CLI:

```sh
npx skills@latest add <owner>/aviator-hamster-skills
```

Then run `/setup`, or simply say what you want to build. Every skill can perform a short inline setup if this is your first command.

The package stores its private local memory under `~/.aviator-hamster/`. It never stores credentials, commits that directory, or sends its journal anywhere. GitHub publication is always a separate, explicit decision after local repositories have been created and committed.

## What gets created

`/brainstorm` writes a `discovery.md` in the current repository when it has one; otherwise it writes under `~/.aviator-hamster/briefs/`. `/prd` puts one `prd.md` beneath each selected direction. `/create-projects` copies an approved PRD to `PRD.md` in a new repository and adds the project-local `/build-project` skill.

## Quality and compatibility

The skills use a shared artifact contract rather than a shared model. Output quality depends on the host model, so `/setup` records the host and `/prd` offers an up-to-date model checkpoint. Generated PRDs remain vendor-neutral.

Run the package checks with:

```sh
npm test
npm run validate
```

## Sources and attribution

The package is informed by [Vercel Skills](https://github.com/vercel-labs/skills), [Matt Pocock's skills](https://github.com/mattpocock/skills), [GStack](https://github.com/garrytan/gstack), and the MIT-licensed [Cursor P Stack](https://github.com/cursor/plugins/tree/main/pstack). It adapts portable execution principles only; it does not copy Cursor modes, model configuration, or hosted telemetry.
