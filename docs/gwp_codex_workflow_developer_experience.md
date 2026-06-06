# GWP Codex Workflow: How It Looks From a Developer's Seat

This is a narrative companion to
[`gwp_codex_workflow_plugin_spec.md`](./gwp_codex_workflow_plugin_spec.md). The
spec is the canonical source of truth; this document describes the same workflow
from the developer's point of view so the intended experience is easy to picture.
If the two ever disagree, the spec wins.

## One-time setup (per developer)

Before the first run, each developer completes a short setup, once:

1. Install the `gwp-linear-workflow` plugin and enable it from the repository
   marketplace:

   ```bash
   codex plugin marketplace add ./
   codex plugin add gwp-linear-workflow@gwp-recovery-platform
   ```

2. Authenticate the bundled Linear MCP server: `codex mcp login linear` (OAuth in
   the browser).
3. Confirm GitHub push/PR access to `olena-ageyeva/gwp-recovery-platform`
   (`gh auth status`).
4. **Trust the repo** in Codex. The shared planning, development, and validation
   agents live in the repository under `.codex/agents/*.toml`, and Codex only
   loads a project's `.codex/` layers for trusted projects. Without trust, the
   multi-agent flow silently degrades to a single session.
5. Run `gwp-doctor`. It prints a pass/fail checklist — remote is correct, Linear
   is authenticated, `gh` is ready, the `lint`/`typecheck`/`build` scripts run,
   and the custom agents are present and loadable in a trusted project. Green
   means you're ready.

The custom agents themselves are created and committed to the repository **once**,
as a setup task (see the spec's "Repository setup: create the shared custom
agents"). After that, every developer inherits them automatically on `git clone`
— there is no per-developer agent creation.

## The everyday run

The developer opens the repo in Codex and types:

```text
Work on Linear issue GWP-26
```

(or invokes the skill explicitly, e.g. `$gwp-linear-to-pr GWP-26`). From there:

1. **Claim.** Codex confirms it is in `olena-ageyeva/gwp-recovery-platform`,
   fetches GWP-26, runs preflight, resolves the team's "In Progress" workflow
   state ID, moves the issue, and creates a `gwp-26-…` branch off a fresh `main`.
   The developer sees the issue flip to **In Progress** in Linear.
2. **Plan.** The read-only Planning Agent returns an implementation plan plus
   concrete, testable acceptance criteria into the root session. If it has open
   questions, those surface to the developer through the root session — the
   subagent itself never talks to the human directly. The developer reviews the
   plan in the terminal and types `Approved`.
3. **Record.** Codex posts the approved plan and acceptance criteria as a comment
   on the Linear issue, so the team, the eventual PR, and the validation step all
   share one source of truth.
4. **Build.** The workspace-write Development Agent implements only the approved
   plan, adds or updates tests (Vitest + React Testing Library, co-located
   `*.test.ts(x)`), installs dependencies if needed, and runs the full gate:

   ```bash
   npm test
   npm run lint
   npm run typecheck
   npm run build
   ```

   It self-repairs up to 3 cycles on failure, then commits to the issue branch
   with the Linear issue ID in the message
   (e.g. `GWP-26: implement account recovery flow`).
5. **Validate.** The read-only Validation Agent reviews the committed diff
   (`git diff main...HEAD`) against the acceptance criteria and the security
   checklist (auth, billing, Stripe, Supabase, privacy, secrets) and returns
   `PASS` or `FAIL`. A `FAIL` loops back to the Development Agent, up to 3 cycles.
6. **Ship.** Only after `PASS`, Codex pushes the branch to the upstream
   repository, opens the PR with `gh` (acceptance criteria and verification
   results in the body), moves the Linear issue to **In Review**, and prints a
   summary including the branch, the PR URL, and the verification results. The
   developer clicks through to a PR that is ready for human review.

Throughout, the developer's only required interactions are the initial prompt and
the single approval step. Everything else is reported back for visibility.

## Resuming work later

Re-invoking the workflow on an issue that already has work detects the existing
local branch, remote branch, and any open PR before creating anything new, and
asks the developer which to continue if there are multiple candidates. To restore
context across sessions, Codex re-reads the approved plan and acceptance criteria
from the Linear comment posted at approval time rather than re-planning from
scratch. If no such comment exists, the issue is treated as not yet planned and
the planning phase runs again.

## When something goes wrong

The workflow fails safe and tells the developer exactly what happened and what to
do next:

- **Auth / preflight fails** (wrong repo, Linear or GitHub auth missing, no push
  access): Codex stops before changing Linear status or touching the branch.
- **Verification fails** after 3 repair cycles: Codex stops, leaves the issue in
  In Progress, and summarizes what was implemented, which command failed, and the
  error output. No PR is created.
- **Validation fails** after 3 cycles: same fail-safe behavior — no push, no PR,
  issue stays In Progress.
- **PR creation fails**: the branch remains pushed; Codex reports the branch,
  commit, verification results, validation result, the PR error, and the manual
  next steps.

## Boundaries to keep in mind

- The issue moving to **In Progress** means only that it has been claimed; the
  abandon case (plan rejected, work dropped) is handled manually, case by case.
- Codex never commits directly to `main`, never creates a PR while any gate is
  failing, and never moves an issue to **Done** — `Done` means the PR was merged,
  and that transition is left to the native Linear–GitHub integration.

## Prerequisite reminder

The very first run depends on the repository's **Version 0.0 prerequisites** being
in place: `npm run lint` migrated from the removed `next lint` to the ESLint CLI,
and an `npm run typecheck` (`tsc --noEmit`) script added. Until those land, the
lint/typecheck gates cannot pass. See the spec's "Known repository prerequisites".
