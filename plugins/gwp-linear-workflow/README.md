# GWP Linear Workflow Plugin

This plugin packages the local Codex workflow for implementing GWP Recovery
Platform Linear issues and opening GitHub pull requests.

The canonical workflow specification lives in the repository at
`docs/gwp_codex_workflow_plugin_spec.md`.

For step-by-step user instructions, see
`docs/gwp_codex_workflow_user_walkthrough.md`.

## One-Time Developer Setup

Run these commands from the repository root after cloning or pulling the setup
PR. Each command is in its own fenced block so Markdown viewers can show a copy
button and copied text can be pasted directly into the terminal.

```bash
codex plugin marketplace add ./
```

```bash
codex plugin add gwp-linear-workflow@gwp-recovery-platform
```

Then complete the personal authentication steps:

1. Authenticate Linear:

```bash
codex mcp login linear
```

2. Authenticate GitHub CLI with upstream push and PR permissions:

```bash
gh auth status
```

3. Trust the GWP Recovery Platform repository in Codex so project-scoped agents
   under `.codex/agents/*.toml` are loaded.
4. Run the workflow doctor from the repository root:

```bash
python3 plugins/gwp-linear-workflow/scripts/gwp_doctor.py
```

The plugin bundles its own GWP-specific Linear operations skill
(`gwp-linear-ops`), so developers do not need to separately install the
standalone Linear skill. Each developer still needs personal Linear OAuth.

## Everyday Use

From the repository root, ask Codex:

```text
gwp-linear-to-pr Work on Linear issue GWP-26
```

The workflow fetches the issue, runs preflight, moves the issue to In Progress,
creates an issue branch, produces a read-only plan, waits for developer
approval, implements with tests, validates the committed diff, opens a GitHub PR,
and moves the issue to In Review.

Linear reads, comments, and status transitions are handled by the plugin-local
`gwp-linear-ops` skill over the bundled Linear MCP server.

## Boundaries

- Do not use Codex cloud agents for this workflow.
- Do not assign Linear issues to `@Codex` as the trigger.
- Do not move Linear issues to Done before the linked PR is merged.
- Do not create a PR unless tests, lint, typecheck, build, and internal
  validation all pass.
