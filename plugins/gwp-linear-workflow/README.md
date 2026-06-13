# GWP Linear Workflow Plugin

This plugin packages the local Codex workflow for implementing GWP Recovery
Platform Linear issues, opening GitHub pull requests, resuming interrupted
workflows, checking PR feedback on request, and posting Codex-authored PR review
comments.

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

The doctor checks that the plugin is installed and enabled, verifies structured
Linear OAuth state, performs a read-only fetch of `GWP-26`, checks GitHub CLI
authentication, validates project agents, and runs the required npm commands.
Use `--linear-probe-issue GWP-XX` when a different existing issue should be used
for the Linear probe.

The plugin bundles its own GWP-specific Linear operations skill
(`gwp-linear-ops`), so developers do not need to separately install the
standalone Linear skill. Each developer still needs personal Linear OAuth.

## Everyday Use

From the repository root, ask Codex:

```text
gwp-linear-to-pr Work on Linear issue GWP-XX
```

The workflow fetches the issue, runs preflight, moves the issue to In Progress,
creates an issue branch, produces a read-only plan, waits for developer
approval, implements with tests, validates the committed diff, opens a GitHub PR,
moves the issue to In Review, and stops cleanly. Any workflow path that changes
code commits the changes and pushes the issue branch to GitHub before it reports
completion.

After PR creation, run a manual PR comment check when you want Codex to inspect
new feedback.

To resume interrupted work or continue from an open PR, ask Codex:

```text
gwp-linear-to-pr resume workflow for GWP-XX
```

To check an existing PR once for new feedback without starting a new issue branch,
ask Codex:

```text
gwp-linear-to-pr check PR comments for GWP-XX
```

or:

```text
gwp-linear-to-pr review PR comments for GWP-XX
```

When new PR feedback may require code changes, Codex produces a follow-up plan
and waits for approval before editing, committing, pushing, or updating the PR.
When no code update is needed, Codex replies to the original GitHub comment with
the reason and records the handled feedback in Linear.

To have Codex review the PR itself and post one structured top-level PR comment,
ask:

```text
gwp-linear-to-pr review PR for GWP-XX
```

This is separate from `review PR comments`: it does not triage incoming feedback
or edit code, and it does not submit an official GitHub review event.

Linear reads, comments, and status transitions are handled by the plugin-local
`gwp-linear-ops` skill over the bundled Linear MCP server.

## Boundaries

- Do not use Codex cloud agents for this workflow.
- Do not assign Linear issues to `@Codex` as the trigger.
- Do not move Linear issues to Done before the linked PR is merged.
- Do not create a PR unless tests, lint, typecheck, build, and internal
  validation all pass.
- Do not apply PR-review feedback without developer approval of a follow-up plan.
- Do not use outbound PR review mode to approve, merge, or inline-comment on a PR.
