# Host-Specific Skill Copies Design

## Outcome

A fresh clone exposes all five Aviator Hamster skills to Codex and Claude Code without an installation step, provided the user launches the host from inside the cloned repository.

## Repository layout

`skills/` remains the only authoring source. Every canonical skill is copied in full to both host discovery locations:

```text
skills/<skill>/
.agents/skills/<skill>/
.claude/skills/<skill>/
```

The host directories contain real committed files rather than symbolic links. This avoids Windows symlink configuration, checkout, and permission differences.

## First-run experience

1. The user clones the repository and changes into it.
2. The user launches Codex or Claude Code from that directory.
3. Codex discovers `.agents/skills` and exposes `setup` through `$setup` or `/skills`.
4. Claude Code discovers `.claude/skills` and exposes `/setup`.
5. Setup explains that Aviator Hamster currently works only from this clone and asks whether to make it available in every project.
6. Global installation runs only after explicit approval. Declining does not block setup or brainstorming inside the clone.

Git clone never executes repository code. The immediate experience comes from committed host-discovery files, not an automatic post-clone installer.

## Synchronization contract

Maintainers edit only `skills/`. A deterministic command replaces both host trees from the canonical source:

```sh
npm run sync-host-skills
```

`npm run check-distribution` compares every file, relative path, and skill directory across all three trees. It fails for missing, extra, or changed files. The existing packaged-script checks remain part of the same command.

CI runs the distribution check on every change. A contributor who edits a host copy directly receives a failure that says to edit `skills/` and run the sync command.

## Setup behavior

Setup detects whether the current skill was loaded from a repository-local host directory and whether the complete Aviator Hamster set is already globally available for the active host. When only the clone-local copy exists, it asks:

> Aviator Hamster currently works inside this folder. Make it available in all your projects? You can also keep it here only.

If approved, setup uses the supported skills installer for the active host and verifies that the five global skills appear. It never installs for another host implicitly and never treats a declined global install as an error.

## Documentation and verification

The README leads with clone, enter the directory, launch the agent, and invoke the host-appropriate setup command. It then documents optional global installation and direct installation without cloning.

Automated tests prove:

- all five canonical skills exist in both host trees;
- every host copy is byte-for-byte identical to its canonical directory;
- extra or missing host files fail validation;
- synchronization is idempotent; and
- setup explains repository-local versus global availability and requires consent before global installation.
