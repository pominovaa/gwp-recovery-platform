# GWP Codex Workflow: How It Looks From a Developer's Seat

This is a narrative companion to
[`gwp_codex_workflow_plugin_spec.md`](./gwp_codex_workflow_plugin_spec.md). The
spec is the canonical source of truth; this document describes the same workflow
from the developer's point of view. For copy-ready setup commands, use
[`gwp_codex_workflow_user_walkthrough.md`](./gwp_codex_workflow_user_walkthrough.md).

## One-time setup

Before the first run, each developer installs the local repository marketplace,
installs the `gwp-linear-workflow` plugin, authenticates Linear, confirms GitHub
CLI access to `olena-ageyeva/gwp-recovery-platform`, trusts the repository in
Codex, and runs the workflow doctor:

```bash
python3 plugins/gwp-linear-workflow/scripts/gwp_doctor.py
```

The custom planning, development, validation, and reviewer agents are committed
to the repository under `.codex/agents/*.toml`. Developers do not create those
agents locally; trusting the project lets Codex load them.

## Starting an issue

The developer opens the repo in Codex and enters:

```text
gwp-linear-to-pr Work on Linear issue GWP-26
```

From there:

1. **Claim.** Codex confirms the repo remote, fetches the Linear issue, checks
   Linear and GitHub auth, resolves Linear workflow states, moves the issue to
   `In Progress`, and creates a branch containing the issue ID.
2. **Plan.** The read-only Planning Agent produces an implementation plan,
   acceptance criteria, test plan, risks, and open questions. The root Codex
   session shows that plan to the developer.
3. **Approve.** The developer replies with `Approved` only after the plan is
   correct. Codex then posts the approved plan and criteria as a Linear
   checkpoint comment.
4. **Build.** The Development Agent implements only the approved plan, updates
   tests for behavior changes, and runs:

   ```bash
   npm test
   npm run lint
   npm run typecheck
   npm run build
   ```

5. **Validate.** Codex commits the verified work with the Linear issue ID, then
   the read-only Validation Agent reviews the committed diff against acceptance
   criteria, test quality, security-sensitive areas, and required command
   results.
6. **Open PR.** Only after validation passes, Codex pushes the branch, opens a
   GitHub PR, moves the Linear issue to `In Review`, and posts a PR-created
   checkpoint to Linear.

## After the PR

After PR creation, Codex stops cleanly. When the developer wants Codex to inspect
PR feedback, they ask for a one-time PR comment check.

Codex reads:

1. Top-level PR comments.
2. Review submissions.
3. Inline review threads and review-thread comments.

All new comments are triaged, including bot or agent comments. Informational
comments that need no code change get a direct GitHub reply explaining why no
change is needed, then Codex records the handled ID in a Linear PR-comment
checkpoint. Comments that may require changes produce a follow-up plan. Codex
must wait for developer approval before editing files, committing, pushing, or
resolving threads.

Approved PR-feedback changes go through the same guarded loop as the original
implementation: Development Agent, required npm commands, commit with the Linear
issue ID, Validation Agent, push after `PASS`, and Linear follow-up checkpoint.

When the developer wants Codex to review the current PR itself and publish
feedback, they ask:

```text
gwp-linear-to-pr review PR for GWP-26
```

This outbound review path is separate from `review PR comments`. Codex resolves
the PR from the Linear issue, fetches PR metadata and diff context, runs the
read-only Reviewer Agent, then posts one structured top-level PR comment. It does
not edit files, change Linear status, post inline comments, approve the PR, or
submit an official GitHub review event.

## Resuming work

The developer can resume from any point with:

```text
gwp-linear-to-pr resume workflow for GWP-26
```

or check an existing PR with:

```text
gwp-linear-to-pr check PR comments for GWP-26
```

or:

```text
gwp-linear-to-pr review PR comments for GWP-26
```

To publish a Codex-authored review comment on the PR, ask:

```text
gwp-linear-to-pr review PR for GWP-26
```

On resume, Codex inspects Linear comments, local branches, remote branches,
commits, and GitHub PRs. It infers the current stage:

1. No branch exists: start normal workflow.
2. Branch exists but no approved-plan checkpoint exists: re-plan and wait for approval.
3. Approved plan exists but no PR exists: continue implementation or verification.
4. Open PR exists: run one manual PR comment check.
5. PR is merged or closed: report final state and do not move Linear to `Done`.

Linear comments are the durable checkpoint store. They capture the approved plan,
PR-created state, handled GitHub feedback IDs, and follow-up implementation
results so a later Codex session can resume without relying on local untracked
files.

## Current smoke test

For the current GWP-36 smoke-test PR, after reinstalling the updated plugin and
starting a new Codex thread, the developer runs:

```text
gwp-linear-to-pr resume workflow for GWP-36
```

Codex should detect PR #7, find the unresolved Copilot review thread, present a
follow-up plan to reword the Find Help support-scope note, wait for approval,
update the PR branch, rerun verification and validation, push the update, and
stop cleanly.

## Failure behavior

The workflow fails safe:

- **Auth/preflight fails:** Codex stops before Linear status changes or branch
  work. If `gh` fails only inside the Codex sandbox, Codex retries outside the
  sandbox before treating it as a real auth failure.
- **Verification fails:** Codex repairs up to 3 cycles, then stops without PR
  creation or PR update.
- **Validation fails:** Codex repairs up to 3 cycles, then stops without push or
  PR update.
- **PR creation or update fails:** Codex reports branch, commit, verification,
  validation, and the exact GitHub error.

## Boundaries

- Codex never commits directly to `main`.
- Codex never creates or updates a PR while required checks or validation fail.
- Codex never applies PR-review feedback without developer approval of a
  follow-up plan.
- Codex never moves a Linear issue to `Done`; merge completion remains handled
  by Linear-GitHub integration or humans.
- Codex never broadens scope into auth, billing, Stripe, Supabase, privacy, or
  user-data behavior unless explicitly approved.
