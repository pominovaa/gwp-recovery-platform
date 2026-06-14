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

Windows note: In PowerShell, use the Windows Python launcher if `python3` is not
available:

```powershell
py -3 .\plugins\gwp-linear-workflow\scripts\gwp_doctor.py
```

Windows note: GitHub CLI credentials may be stored in Windows Credential
Manager. If `gh auth status` passes in PowerShell or Git Bash but fails inside a
restricted Codex command sandbox, treat that as the same sandbox/keyring false
negative described in the workflow spec.

The doctor runs commands natively on Windows, verifies that the plugin is
installed and enabled, confirms structured Linear OAuth state, and performs a
read-only Linear issue fetch before reporting ready.

The custom planning, development, validation, and reviewer agents are committed
to the repository under `.codex/agents/*.toml`. In Windows PowerShell, the same
path is `.\.codex\agents\*.toml`. Developers do not create those agents locally;
trusting the project lets Codex load them.

## Starting an issue

The developer opens the repo in Codex and enters:

```text
gwp-linear-to-pr Work on Linear issue GWP-XX
```

From there:

1. **Claim.** Codex confirms the upstream repo, fetches the Linear issue, checks
   Linear auth and issue scope, immediately assigns the issue to the current
   developer, resolves Linear workflow states, and verifies the `In Progress`
   write by re-fetching the issue. It then checks GitHub and remaining preflight
   requirements. Before switching branches, it stores dirty tracked and
   untracked non-ignored work in a verified, retained stash whose message
   identifies the issue, original branch, and UTC timestamp, then creates the
   branch from Linear `gitBranchName` when available.
2. **Plan.** The read-only Planning Agent produces an implementation plan,
   acceptance criteria, test plan, risks, and open questions. The root Codex
   session shows that plan to the developer.
3. **Approve.** The developer replies with `Approved` only after the plan is
   correct. Codex then posts the approved plan and criteria as a Linear
   checkpoint comment.
4. **Build.** The Development Agent reads related code and tests, implements
   only the approved plan, updates tests for behavior changes, runs targeted
   tests first, and then runs:

   ```bash
   npm test
   npm run lint
   npm run typecheck
   npm run build
   ```

   Windows PowerShell:

   ```powershell
   npm.cmd test
   npm.cmd run lint
   npm.cmd run typecheck
   npm.cmd run build
   ```

5. **Validate.** Codex commits the verified work with the Linear issue ID, then
   the read-only Validation Agent reviews the committed diff against acceptance
   criteria, test quality, security-sensitive areas, and required command
   results.
6. **Open PR.** Only after validation passes, Codex pushes the branch, opens a
   GitHub PR titled from the exact Linear identifier and title, moves the issue
   to `In Review`, verifies the status by re-fetching it, and posts a PR-created
   checkpoint containing the confirmed status. Any workflow path that changes
   code commits the changes and pushes the issue branch to GitHub before it
   reports completion.

## After the PR

After PR creation, Codex stops cleanly. When the developer wants Codex to inspect
PR feedback, they ask for a one-time PR comment check.

Codex reads:

1. Top-level PR comments.
2. Review submissions.
3. Inline review threads and review-thread comments.
4. Review decision, mergeability, and CI/check status.

All new comments are triaged, including bot or agent comments. Informational
comments that need no code change get a direct GitHub reply explaining why no
change is needed, then Codex records the handled ID in a Linear PR-comment
checkpoint. An inline no-code thread can then be resolved automatically against
the current validated, green head without a synthetic follow-up approval plan.
Comments that may require changes produce a follow-up plan. Codex must wait for
developer approval before editing files, committing, pushing, or resolving those
threads.

Approved PR-feedback changes go through the same guarded loop as the original
implementation: Development Agent, required npm commands, commit with the Linear
issue ID, Validation Agent, and push after `PASS`. Once the exact pushed head's
GitHub checks pass, Codex automatically resolves directly addressed inline
threads. It first re-fetches the thread, blocks on newer unhandled comments,
requires a newer evidence reply for human-authored or no-code threads, and
verifies the resolution write. Outdated state alone is insufficient. The Linear
follow-up checkpoint records handled comment IDs, resolved thread IDs, and any
blocked or failed outcome.

When the developer wants Codex to review the current PR itself and publish
feedback, they ask:

```text
gwp-linear-to-pr review PR for GWP-XX
```

This outbound review path is separate from `review PR comments`. Codex resolves
the PR from the Linear issue, fetches PR metadata, CI state, existing comments,
and diff context, reads changed files and surrounding tests, then runs the
read-only Reviewer Agent. It creates one canonical `AI-generated review note`
comment or updates the authenticated user's existing canonical comment. It does
not edit files, change Linear status, post inline comments, approve the PR, or
submit an official GitHub review event.

## Resuming work

The developer can resume from any point with:

```text
gwp-linear-to-pr resume workflow for GWP-XX
```

or check an existing PR with:

```text
gwp-linear-to-pr check PR comments for GWP-XX
```

or:

```text
gwp-linear-to-pr review PR comments for GWP-XX
```

To publish a Codex-authored review comment on the PR, ask:

```text
gwp-linear-to-pr review PR for GWP-XX
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

## Failure behavior

The workflow fails safe:

- **Claim-gate failure:** Codex stops before Linear or Git mutation.
- **Later auth/preflight failure:** Codex stops before branch or code work but
  leaves the verified assignment and `In Progress` status intact. If `gh` fails
  only inside the Codex sandbox, Codex retries outside the sandbox before
  treating it as a real auth failure.
- **Dirty-worktree stash failure:** Codex stops before checkout, reports the
  original branch, any created stash ref, remaining dirty paths, and the exact
  recovery step. It never stashes visible secret files or automatically applies
  the stash to the issue branch.
- **Verification fails:** Codex repairs up to 3 cycles, then stops without PR
  creation or PR update.
- **Validation fails:** Codex repairs up to 3 cycles, then stops without push or
  PR update.
- **PR creation or update fails:** Codex reports branch, commit, verification,
  validation, and the exact GitHub error.
- **Linear write verification fails:** Codex retries once, then reports partial
  success with the intended and actual assignee/status instead of claiming the
  workflow completed.

## Boundaries

- Codex never commits directly to `main`.
- Codex never creates or updates a PR while required checks or validation fail.
- Codex never applies PR-review feedback without developer approval of a
  follow-up plan.
- Codex never moves a Linear issue to `Done`; merge completion remains handled
  by Linear-GitHub integration or humans.
- Codex never broadens scope into auth, billing, Stripe, Supabase, privacy, or
  user-data behavior unless explicitly approved.
