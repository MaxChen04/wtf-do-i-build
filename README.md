# Aviator Hamster

Turn a real lead into a project worth building before spending time coding the wrong thing.

This is a local-first Agent Skills package, not a hosted application. It works with Codex, Claude Code, Cursor, and other compatible hosts. Its five skills take you from a lead to an approved project:

1. `setup` records private local preferences and available tools.
2. `brainstorm` turns evidence into a few grounded directions.
3. `prd` turns selected directions into reviewed, resumable PRDs.
4. `create-projects` makes one local repository per approved PRD.
5. `build-project` is copied into each created project and resumes the first unfinished PRD step.

## Start here

Clone the repository and enter it using your normal shell:

```sh
git clone <repository-url>
cd aviator-hamster-skills
```

Launch Codex or Claude Code from inside this folder. The clone already contains committed host-specific copies under `.agents/skills` and `.claude/skills`.

- Inside Codex, type `$setup` or open `/skills` and select `setup`.
- Inside Claude Code, type `/setup`.

Do not enter `$setup` or `/setup` at your normal shell prompt; they are agent instructions, not shell programs. Every skill can also perform a short inline setup when you describe what you want to build.

### Optional global installation

During setup, Aviator Hamster can ask permission to make all five skills available from every project. Nothing is installed globally without approval. To install directly instead, run this from the clone and replace the agent value with the host you use:

```sh
npx skills@latest add . --global --agent <codex|claude-code> --skill setup brainstorm prd create-projects build-project --yes
```

You can also install from a published repository without cloning:

```sh
npx skills@latest add <owner>/aviator-hamster-skills --global --agent <codex|claude-code> --skill setup brainstorm prd create-projects build-project --yes
```

The package stores its own private profile and journal under `~/.aviator-hamster/`. It never stores credentials, commits that directory, or sends its journal anywhere. GitHub publication is always a separate, explicit decision after local repositories have been created and committed.

## Optional personal memory

During `/setup`, you can separately approve local Codex memory, individual Claude project memories, ChatGPT cloud memory, or Claude cloud memory. Local files are reread from their original location whenever `/setup` or `/brainstorm` needs them; Aviator Hamster stores permission and file metadata, not a copied or shortened version of the memory.

Cloud recall is used only when the current ChatGPT or Claude host exposes a supported memory or conversation-search capability. The skills never invent a cloud API or scrape application data. When cloud recall is unavailable, you can continue with local context or provide a memory export manually; `/setup` records the original file as a separately consented source without copying it.

Memory helps avoid repetitive questions and can surface preferences, common questions, and possible recurring friction. It is treated as untrusted historical evidence: what you say now always wins, and instructions embedded in a memory file are never executed.

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
