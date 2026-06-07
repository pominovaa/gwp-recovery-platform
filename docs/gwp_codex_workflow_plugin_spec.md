# GWP Recovery Platform Codex Workflow Plugin Specification

## Purpose

This document defines the local Codex agentic workflow for implementing Linear issues in the GWP Recovery Platform codebase.

The workflow starts when a developer, working locally in Codex CLI/IDE inside the GitHub repository, asks:

```text
Work on Linear issue GWP-26
```

Codex must then fetch the Linear issue, move it through the correct workflow
states, plan the implementation, wait for human approval, implement the change
with tests, validate the result with an internal validation agent, create or
update a GitHub pull request, move the Linear issue to review, and continue
monitoring PR feedback while the Codex session remains active.

This workflow is intended to be packaged as a Codex plugin distributed to all developers on the team.

## Systems involved

### GitHub repository

```text
https://github.com/olena-ageyeva/gwp-recovery-platform.git
```

The GitHub repository is the source of truth for code.

This is the upstream public repository for the project. The workflow must target
this repository, not a developer's personal fork, unless upstream push access is
not available and the developer explicitly approves a fork-based PR fallback.

### Linear

Linear is the source of truth for project work, issue status, issue descriptions, comments, acceptance criteria, and progress tracking.

### Codex local CLI/IDE

Codex local CLI/IDE is the workflow orchestrator.

For now, do not use Codex cloud agents from Linear or GitHub. Do not rely on assigning issues to `@Codex` in Linear. The workflow should run locally from the developer’s machine.

### Native Linear GitHub integration

The native Linear GitHub integration should be enabled as a supporting integration.

Its purpose is to link branches, commits, and PRs to Linear issues and to optionally automate the final move from `In Review` to `Done` when the PR is merged.

The Codex workflow remains the primary orchestrator for planning,
implementation, testing, validation, PR creation, and PR feedback follow-up.

## Known repository prerequisites

These prerequisites must be resolved in the repository before the workflow is
rolled out, because the workflow's hard gates depend on them.

### `npm run lint` is currently broken on Next.js 16

The repository runs `next ^16.2.6` but still defines:

```json
"lint": "next lint"
```

Next.js 16 removed the `next lint` command entirely (it was not merely
deprecated), removed the `eslint` option from the Next config, and stopped
running ESLint automatically during `next build`. As a result, `npm run lint`
will fail on every run, and the lint gate in this workflow can never pass as
written.

Required fix before rollout: migrate to the ESLint CLI using the official
codemod, which rewrites `package.json` scripts and creates an ESLint flat config:

```bash
npx @next/codemod@canary next-lint-to-eslint-cli .
```

After migration, the lint script should call ESLint directly, for example:

```json
"lint": "eslint ."
```

### Add an explicit typecheck script

Because Next.js 16 no longer runs linting during `next build`, and to catch
type regressions introduced by the Development Agent, add a dedicated typecheck
script:

```json
"typecheck": "tsc --noEmit"
```

This workflow treats `npm run typecheck` as a required verification command (see
"Required verification commands"). If the script does not yet exist, adding it is
part of repository prerequisite setup, not a per-issue change.

## Workflow modes

Codex must distinguish between read-only planning and active implementation.

Mode selection must be deterministic, not inferred loosely from natural language.
The preferred trigger for work mode is explicit invocation of the
`gwp-linear-to-pr` skill (for example `/skills` or `$gwp-linear-to-pr` in the
CLI/IDE, or naming the skill in the prompt). When the request is ambiguous,
Codex must default to the safe, read-only explain or plan mode and ask the
developer to confirm before entering work mode. Work mode requires an explicit
implementation/resume verb such as "work on", "implement", "build", "resume",
or "monitor" plus a valid Linear issue ID.

Recognized work-mode prompts include:

```text
work on Linear issue GWP-26
resume workflow for GWP-26
resume GWP-26
monitor PR comments for GWP-26
```

### Explain or plan mode

Use this mode when the developer asks to understand, inspect, review, or plan an
issue.

Codex may:

1. Fetch the Linear issue.
2. Inspect the repository.
3. Produce a plan, review, or recommendation.

Codex must not:

1. Move the Linear issue status.
2. Create a branch.
3. Edit files.
4. Commit or push.
5. Create a PR.

### Work mode

Use this mode when the developer explicitly asks Codex to work on or implement a
Linear issue.

After required preflight checks pass, Codex may move the issue to `In Progress`
and create the issue branch. Codex must not edit files, commit, push, or create
a PR until the developer approves the implementation plan.

### Resume mode

Use this mode when work already exists for the issue.

Codex must detect existing local branches, remote branches, and open PRs for the
issue before creating new branches or PRs. If multiple candidates exist, Codex
must ask the developer which one to continue.

To restore context across sessions, Codex should re-read the approved plan and
acceptance criteria from the Linear comment posted at approval time (see
"Persisting the approved plan to Linear") rather than re-planning from scratch. If
no such comment exists, treat the issue as not yet planned and re-run the planning
phase.

Codex must infer the resume stage from Linear, Git, and GitHub state:

1. If no branch exists, start the normal workflow.
2. If a branch exists and no approved-plan checkpoint exists, re-plan and wait for approval.
3. If an approved plan exists and no PR exists, continue implementation or rerun verification as needed.
4. If an open PR exists, enter post-PR review-monitor mode.
5. If the PR is merged or closed, stop monitoring, report the final PR state, and do not move Linear to `Done`.

## Required preflight

Before changing Linear status, creating a branch, editing files, committing, or
creating a PR, Codex must run a preflight check.

The preflight must verify:

1. The current Git repository remote points to `olena-ageyeva/gwp-recovery-platform`.
2. The workflow is targeting the upstream repository, not an unrelated fork.
3. The current worktree is clean, or the developer explicitly approves working with existing changes.
4. The current branch is not `main` before implementation commits are made.
5. The local `main` branch is up to date enough to branch from, or `git pull` succeeds.
6. The Linear issue exists and belongs to the expected `GWP` team/project scope.
7. Linear MCP authentication is available.
8. GitHub authentication is available for PR creation.
9. The developer can push a branch to the upstream repository.
10. The native Linear GitHub integration is installed for `olena-ageyeva/gwp-recovery-platform`.
11. The repository defines runnable `npm test`, `npm run lint`, `npm run typecheck`, and `npm run build` scripts (see "Known repository prerequisites").

GitHub CLI checks must account for Codex sandbox behavior. If `gh auth status`,
`gh auth token`, `gh pr create`, or a GitHub API command fails inside Codex with
`token is invalid`, `no oauth token found`, network-disabled output, keyring
access errors, or host-resolution errors, Codex must retry the same check outside
the sandbox / with command escalation before reporting a developer auth problem.
Only the outside-sandbox failure is treated as a real blocker.

If upstream push access fails, Codex must stop and report the failure. The
developer may then choose either:

1. Ask the upstream repo owner for collaborator/write access.
2. Use a fork-based PR fallback.

When using a fork fallback, Codex must still open the PR against
`olena-ageyeva/gwp-recovery-platform:main`, and the Linear GitHub integration
must still be configured for the upstream repository.

## Linear statuses

The workflow uses only these statuses:

```text
Todo
In Progress
In Review
Done
```

These statuses are out of scope for this workflow:

```text
Backlog
Canceled
Duplicate
```

Codex must not automatically move issues into or out of `Backlog`, `Canceled`, or `Duplicate`.

## Status transition rules

### How status changes are performed via Linear MCP

Linear workflow statuses are not global names; each team defines its own ordered
set of workflow states, and every state has a team-scoped state ID. The status
labels `Todo`, `In Progress`, `In Review`, and `Done` in this document are human
labels, not values that can be passed directly to the Linear API.

Before moving an issue, Codex must:

1. Resolve the issue's team from the fetched Linear issue.
2. List that team's workflow states via the approved Linear MCP.
3. Map the target human label (for example `In Progress`) to the matching
   team state ID, matching case-insensitively and tolerating minor label
   differences (for example `In Progress` vs `In progress`).
4. Update the issue to that resolved state ID.

If the target state cannot be resolved unambiguously for the issue's team, Codex
must stop and report the available states instead of guessing. Codex must never
hardcode a state ID or assume a label string is identical across teams.

### Todo → In Progress

Codex may move the Linear issue from `Todo` to `In Progress` only after:

1. The Linear issue has been successfully fetched.
2. The current Git repository has been confirmed as `olena-ageyeva/gwp-recovery-platform`.
3. The issue is confirmed to be in scope for this workflow.
4. The developer has intentionally asked Codex to work on the issue.
5. Required preflight checks have passed.

If the issue is not in `Todo`, Codex should warn the developer and ask for confirmation before proceeding.

Codex must not move an issue to `In Progress` for read-only explanation, review,
or planning requests.

### In Progress → In Review

Codex may move the issue from `In Progress` to `In Review` only after:

1. The implementation plan was approved by the developer.
2. The development agent completed the implementation.
3. Tests were added or updated where appropriate.
4. Required verification commands passed.
5. The validation agent passed the change.
6. A GitHub PR was successfully created.

### In Review → Done

`Done` means the PR was merged.

This transition should preferably be handled by the native Linear GitHub integration after PR merge.

Codex must not move an issue to `Done` before the PR is merged.

## Recommended Linear GitHub integration configuration

Enable the native Linear GitHub integration for:

```text
olena-ageyeva/gwp-recovery-platform
```

Recommended behavior:

1. Link PRs to Linear issues when the issue ID appears in the branch name or PR title.
2. Link commits or PRs when the PR description or commit message uses Linear magic words.
3. Show linked GitHub PRs in Linear.
4. Optionally move issues to `Done` when linked PRs are merged.

Avoid relying on Linear GitHub automation for `Todo → In Progress` because the local Codex workflow should own that transition.

Avoid relying on Linear GitHub automation for `In Progress → In Review` unless the team wants PR creation alone to trigger review. In this workflow, Codex moves the issue to `In Review` after validation passes and the PR is created.

During the first GWP-26 test PR, Codex must verify and document the observed
GitHub integration behavior for branch names, PR titles, PR body references, and
merge behavior. Do not assume a closing or non-closing keyword works until it has
been observed for the upstream repository configuration.

## Branch naming convention

Every Codex-created branch must include the Linear issue ID.

Preferred format is the branch name copied from Linear when available.

Accepted formats include:

```text
gwp-26-short-description
bostonvip/gwp-26-short-description
GWP-26-short-description
```

Examples:

```text
gwp-26-add-account-recovery-flow
bostonvip/gwp-42-fix-stripe-checkout-error
GWP-51-improve-mobile-dashboard-layout
```

Codex must never commit directly to `main`.

Before creating a branch, Codex should run:

```bash
git checkout main
git pull
git checkout -b gwp-26-short-description
```

If `git pull` fails or `main` has diverged locally, Codex must stop and report the
failure rather than branching from a stale or conflicted `main`. Codex must not
attempt to force-resolve `main` automatically.

Replace `GWP-26` and `short-description` with the actual issue ID and issue slug.

Branch matching must be case-insensitive for the issue ID. The important rule is
that the branch contains the Linear issue ID and targets the upstream repository.

## Commit convention

Every commit created by Codex should include the Linear issue ID.

Preferred format:

```text
GWP-26: implement account recovery flow
```

If multiple commits are necessary, all should include the issue ID.

Avoid vague commits such as:

```text
fix stuff
updates
final changes
```

## PR title convention

Every PR created by Codex must include the Linear issue ID.

Preferred format:

```text
GWP-26: Add account recovery flow
```

## PR body convention

Every PR body must include:

```md
Linear issue: GWP-26

## Summary
- ...

## Acceptance Criteria
- [x] ...

## Verification
- [x] npm test
- [x] npm run lint
- [x] npm run typecheck
- [x] npm run build

## Validation
- [x] Internal validation agent passed

## Screenshots / Preview
- Include screenshots or preview notes for UI changes.
- Use "N/A" when not applicable.

## Risk Notes
- Mention auth, billing, Supabase, Stripe, privacy, migration, or deployment risks.
- Use "None identified" only when the validation agent agrees.

## Follow-ups
- Mention known deferred work.
- Use "None" if no follow-ups are known.
```

The PR should use non-closing Linear language unless the team specifically wants merge automation to close the issue.

Recommended PR body wording:

```text
Part of GWP-26
```

If the Linear GitHub integration is configured to move issues to `Done` on PR merge, then closing words may be used deliberately:

```text
Fixes GWP-26
```

Use closing words only when the team wants PR merge to mean the Linear issue is done.

## Commit, push, and PR creation sequence

The workflow overview and skill steps must commit, push, and open the PR in this
explicit order. These steps are easy to leave implicit, but without them no PR can
be created.

1. After the Development Agent's changes pass all required verification commands,
   stage and commit on the issue branch using the commit convention:

   ```bash
   git add -A
   git commit -m "GWP-26: implement account recovery flow"
   ```

   The Validation Agent reviews this committed diff (`git diff main...HEAD`), not
   uncommitted working-tree state.

2. Only after the Validation Agent returns `PASS`, push the issue branch to the
   upstream repository:

   ```bash
   git push -u origin gwp-26-short-description
   ```

3. Create the PR against upstream `main` using the GitHub CLI (or an equivalent
   connector) with the issue ID in the title and the PR body convention:

   ```bash
   gh pr create --base main --head gwp-26-short-description \
     --title "GWP-26: Add account recovery flow" \
     --body-file <generated PR body>
   ```

4. Capture the returned PR URL for the final summary and the Linear update.

If commits already exist on the branch (resume mode), Codex must not duplicate
them; it commits only new changes and pushes the updated branch.

## Post-PR review monitoring

After PR creation, and whenever resume mode finds an open PR for the issue,
Codex enters post-PR review-monitor mode. This monitor is session-bound: it runs
only while the current Codex session remains active, and it is not a background
daemon.

The default polling interval is 10 minutes.

Each poll must fetch all new GitHub PR feedback since the latest Linear
review-monitor checkpoint:

1. Top-level PR conversation comments.
2. Review submissions.
3. Inline review threads and thread comments.

Codex must triage all new comments, including bot/agent comments. Resolved or
outdated threads are context, but they do not trigger code changes unless they
contain new comments that require action.

If a poll finds that the PR is merged or closed, Codex must stop monitoring
immediately, report the final PR state, skip further code changes, and avoid
moving Linear to `Done`.

If new comments are informational only, Codex posts a review-monitor checkpoint
with the handled GitHub IDs and continues monitoring.

If any new comment may require a change, Codex must:

1. Summarize the feedback.
2. Produce a follow-up implementation plan.
3. Ask the developer for approval.
4. Avoid editing files, committing, pushing, replying on GitHub, or resolving GitHub threads until approval is received.

For approved PR-feedback changes, Codex runs the same guarded update cycle as
the original implementation:

1. Development Agent implements only the approved follow-up plan.
2. `npm test`, `npm run lint`, `npm run typecheck`, and `npm run build` pass.
3. Codex commits with the Linear issue ID in the message.
4. Validation Agent reviews the committed diff.
5. Codex pushes the updated branch only after validation returns PASS.
6. Codex posts follow-up implementation and review-monitor checkpoints to Linear.
7. Codex continues the 10-minute review-monitor loop while the session remains active, or explicitly stops monitoring and provides the resume command.

### Active monitor contract

The phrase "session-bound monitor" means an active Codex turn/session is still
running. It does not mean a background timer continues after Codex sends a final
response.

When Codex enters post-PR review-monitor mode, it must:

1. Poll GitHub immediately.
2. Keep the turn/session active if it is claiming the 10-minute timer is active.
3. Poll every 10 minutes while monitoring remains active.
4. Stop immediately if the PR is merged or closed.
5. Report a brief status update after each poll.
6. Avoid sending a final response while implying monitoring is still active.

If Codex ends the turn, is asked to stop, or cannot keep the polling loop active,
it must post any appropriate review-monitor checkpoint, state that monitoring is
stopped, and provide:

```text
gwp-linear-to-pr resume workflow for GWP-26
```

GitHub review comments are read with the plugin-local helper:

```bash
python3 plugins/gwp-linear-workflow/scripts/gwp_pr_comments.py --issue-id GWP-26
```

Codex must pass one `--handled-id <id>` argument for each GitHub comment,
review, review-thread, and review-thread-comment ID already recorded in the
latest Linear review-monitor checkpoint.

## Required verification commands

Before validation and PR creation, Codex must run:

```bash
npm test
npm run lint
npm run typecheck
npm run build
```

`npm run lint` and `npm run typecheck` depend on the repository prerequisites
described in "Known repository prerequisites". On Next.js 16, `next lint` no
longer exists, so the lint script must already be migrated to the ESLint CLI, and
`npm run typecheck` (`tsc --noEmit`) must already be defined. If either command is
missing or broken because of framework tooling changes, Codex must stop, report
the exact failure, and ask whether to fix the repository setup or proceed with
documented risk. Codex must not silently skip a missing gate.

If the repository later adds end-to-end tests, this workflow should be updated to
include them.

Suggested future command:

```bash
npm run test:e2e
```

Codex must not create a PR if required verification commands fail.

## Workflow overview

The work mode workflow is:

```text
Developer prompt
  ↓
Determine workflow mode
  ↓
Fetch Linear issue
  ↓
Run required preflight
  ↓
Move Linear issue to In Progress
  ↓
Create issue branch
  ↓
Spawn Planning Agent
  ↓
Planning Agent produces implementation plan and acceptance criteria
  ↓
Developer approves plan
  ↓
Post the approved plan and acceptance criteria as a Linear comment
  ↓
Spawn Development Agent
  ↓
Development Agent implements approved plan and tests
  ↓
Run npm test, npm run lint, npm run typecheck, and npm run build
  ↓
Commit changes to the issue branch with the Linear issue ID
  ↓
Spawn Validation Agent
  ↓
Validation Agent reviews committed diff against plan and acceptance criteria
  ↓
If validation fails, return to Development Agent
  ↓
If validation passes, push the issue branch to the upstream repository
  ↓
Create PR with gh
  ↓
Move Linear issue to In Review
  ↓
Post PR-created checkpoint to Linear
  ↓
Enter session-bound PR review monitor
  ↓
Poll GitHub PR comments every 10 minutes while session is active
  ↓
If new comments require changes, produce follow-up plan and wait for approval
  ↓
After approval, Development Agent updates branch, verification passes, Validation Agent passes, and Codex pushes PR update
  ↓
Post review-monitor/follow-up checkpoints to Linear
```

For read-only explain or plan mode, Codex fetches the issue, inspects the repo,
and stops after the Planning Agent output. It must not run the work-mode status,
branch, implementation, validation, or PR steps.

## Human approval gate

Codex must not modify code until the developer approves the implementation plan.

The planning phase may inspect files, read the issue, search the codebase, and propose a plan.

The planning phase must not edit files.

In work mode, Codex may claim the issue and create the issue branch before plan
approval only after preflight passes. It must not edit files, commit, push, or
create a PR before approval.

The developer must approve with an explicit response such as:

```text
Approved
Proceed
Implement this
Looks good
```

If the developer changes the plan, Codex must update the plan before implementation.

### Persisting workflow checkpoints to Linear

Linear issues have no structured acceptance-criteria field; acceptance criteria
live in free-text in the issue description. The Planning Agent extracts and
refines them into concrete, testable criteria, but that refined output must be
captured somewhere the team can see.

After the developer approves the plan, and only after approval, Codex must post
the approved implementation plan and final acceptance criteria as a comment on
the Linear issue. This gives reviewers, the eventual PR, and the validation step
a single shared source of truth. The same acceptance criteria must then appear
verbatim in the PR body.

Codex must not post the plan to Linear before approval, and must not overwrite
the issue description.

Codex must also use Linear comments as durable workflow checkpoints so the
workflow can resume from another session without relying on local untracked
state. Required checkpoint types are:

1. Approved-plan checkpoint with the approved plan, acceptance criteria, test plan, and risk notes.
2. PR-created checkpoint with branch, PR URL, PR number, base branch, verification results, validation result, and Linear status.
3. Review-monitor checkpoint with poll timestamp, triage summary, and handled GitHub comment/review/thread IDs.
4. Follow-up implementation checkpoint with approved follow-up plan, GitHub feedback IDs addressed, commit SHA, verification results, and validation result.

Resume mode must read these checkpoint comments before deciding whether to
re-plan, continue implementation, update an open PR, or only monitor comments.

## Agent execution model

Version 0.1 uses Codex project-scoped custom agents plus local orchestration as
the primary execution model.

The three phases are implemented as real Codex custom agents defined under
`.codex/agents/*.toml` (see "Project-scoped custom agents"). These are required,
not optional, for version 0.1, because the `sandbox_mode` field in those files is
what actually enforces the read-only planning and read-only validation
boundaries. Phase boundaries expressed only in prose can be ignored by the model;
phase boundaries expressed as `sandbox_mode = "read-only"` cannot.

Do not confuse these custom agents with a skill's optional `agents/openai.yaml`
file. `agents/openai.yaml` only configures a skill's UI metadata and invocation
policy; it does not define the planning, development, or validation agents. Those
agents must be true custom agents under `.codex/agents/*.toml`.

### Orchestration model

The `gwp-linear-to-pr` skill runs in the root Codex session, and the root session
is the sole orchestrator. The root session spawns the planning, development, and
validation agents directly, in sequence, gated by the human approval and
validation steps.

Constraints to respect, based on current Codex subagent behavior:

1. Codex spawns subagents only when explicitly instructed to. The skill must
   explicitly request each agent.
2. The default maximum subagent nesting depth is 1 (the root session is depth 0).
   A spawned agent cannot reliably spawn its own subagent, so the Development
   Agent must not be expected to spawn the Validation Agent. All three agents are
   spawned by the root orchestrator.
3. Each subagent runs its own model and tool work, so this multi-agent flow
   consumes meaningfully more tokens than a single-agent run. This matters because
   the workflow is distributed across the whole team.
4. Spawned subagents are non-interactive: they do not have the developer in the
   loop and return their results to the root session. Only the root orchestrator
   interacts with the developer. Therefore the human approval gate, all clarifying
   questions, and all confirmations happen in the root session. When the Planning
   Agent has open questions, it returns them to the root session, which relays them
   to the developer and feeds the answers back into a revised plan before the
   Development Agent is spawned.

If multi-agent execution is unavailable in a given environment, Codex must still
follow the same phase boundaries in a single local session:

1. Planning phase is read-only.
2. Development phase is workspace-write and limited to the approved plan.
3. Validation phase is read-only and reviews the final diff before PR creation.

Handoff artifacts between phases must include:

1. Linear issue ID, title, description, comments, status, and acceptance criteria.
2. Approved implementation plan.
3. Final acceptance criteria.
4. Branch name.
5. Relevant files.
6. Git diff against `main`.
7. Verification command results.
8. Validation result.

## Planning Agent

### Purpose

The Planning Agent converts a Linear issue into a concrete implementation plan.

### Mode

Read-only.

The Planning Agent must not edit files, commit, create branches, or create PRs.

### Inputs

The Planning Agent receives:

1. Linear issue ID.
2. Linear issue title.
3. Linear issue description.
4. Existing Linear acceptance criteria, if any.
5. Relevant Linear comments.
6. Current repository structure.
7. Relevant files discovered during codebase inspection.

### Output

The Planning Agent must produce:

```md
# Implementation Plan for GWP-26

## Issue Summary
Brief explanation of what the issue asks for.

## Current Understanding
What the codebase currently appears to do.

## Relevant Files
- `path/to/file.tsx` — why it matters
- `path/to/test.test.ts` — why it matters

## Proposed Changes
1. ...
2. ...
3. ...

## Acceptance Criteria
- [ ] Specific, testable criterion
- [ ] Specific, testable criterion
- [ ] Specific, testable criterion

## Test Plan
- Unit tests:
- Integration tests:
- Manual checks:
- Commands to run:

## Risks
- Auth risk:
- Billing risk:
- Supabase/data risk:
- Stripe/payment risk:
- UI/regression risk:
- Deployment risk:

## Open Questions
- List any blockers or missing requirements.
- If none, write "None."
```

### Planning rules

The Planning Agent must turn vague requirements into concrete, testable acceptance criteria.

If the Linear issue lacks enough detail, the Planning Agent should ask clarifying questions instead of guessing.

The plan should prefer small, focused changes.

The plan should not propose unrelated refactors unless required for the issue.

## Development Agent

### Purpose

The Development Agent implements the approved plan.

### Mode

Workspace-write.

### Inputs

The Development Agent receives:

1. Approved implementation plan.
2. Final acceptance criteria.
3. Linear issue ID.
4. Branch name.
5. Relevant files identified by the Planning Agent.

### Responsibilities

The Development Agent must:

1. Ensure dependencies are installed (run `npm install` if `node_modules` is
   missing) before running verification.
2. Implement only the approved plan.
3. Keep changes minimal and focused.
4. Add or update tests for changed behavior, following the repository's testing
   conventions (Vitest with React Testing Library; co-located `*.test.ts(x)`
   files).
5. Preserve existing behavior unless the approved plan says otherwise.
6. Run required verification commands.
7. Fix failing tests caused by the implementation.
8. After verification passes, commit the changes to the issue branch using the
   commit convention (Linear issue ID in the message).
9. Stop and ask for help if requirements are unclear or failures cannot be resolved safely.

### Required commands

The Development Agent must run:

```bash
npm test
npm run lint
npm run typecheck
npm run build
```

### Repair loop

If tests, lint, typecheck, or build fail, the Development Agent may attempt to fix the problem.

Maximum repair attempts:

```text
3
```

After 3 failed repair cycles, Codex must stop and summarize:

1. What was implemented.
2. What failed.
3. Which command failed.
4. Relevant error output.
5. Suggested next steps.

Codex must not create a PR after failed verification.

## Validation Agent

### Purpose

The Validation Agent performs internal code review before PR creation.

This replaces GitHub-side Codex review for now.

### Mode

Read-only.

The Validation Agent must not edit files.

### Inputs

The Validation Agent receives:

1. Linear issue.
2. Approved implementation plan.
3. Acceptance criteria.
4. Git diff against `main`.
5. Test results.
6. Lint results.
7. Typecheck results.
8. Build results.

### Responsibilities

The Validation Agent must check:

1. Does the implementation satisfy every acceptance criterion?
2. Are the tests meaningful?
3. Did the implementation follow the approved plan?
4. Did it avoid unrelated changes?
5. Did it avoid committing secrets?
6. Did it preserve auth safety?
7. Did it preserve billing and Stripe safety?
8. Did it preserve Supabase/data safety?
9. Did it avoid exposing private or sensitive data?
10. Did UI behavior remain reasonable, including mobile behavior when relevant?
11. Did required commands pass?
12. Is the PR ready for human review?

### Validation output

The Validation Agent must return either:

```text
PASS
```

or:

```text
FAIL
```

For `PASS`, include:

```md
## Validation Result: PASS

## Acceptance Criteria Review
- [x] Criterion 1 — satisfied by ...
- [x] Criterion 2 — satisfied by ...

## Test Review
- Tests added/updated:
- Commands passed:

## Risk Review
- Auth:
- Billing:
- Supabase/data:
- Stripe:
- Privacy:
- UI:
- Deployment:

## Notes
...
```

For `FAIL`, include:

```md
## Validation Result: FAIL

## Blocking Issues
1. ...

## Acceptance Criteria Not Met
- [ ] ...

## Test Gaps
- ...

## Required Fixes
1. ...
2. ...
```

Codex must not create a PR unless the Validation Agent returns `PASS`.

## Validation repair loop

If validation fails:

1. Codex sends the validation findings to the Development Agent.
2. The Development Agent fixes the issues.
3. Required verification commands are rerun.
4. The Validation Agent reviews again.

Maximum validation repair cycles:

```text
3
```

After 3 failed validation cycles, Codex must stop and summarize the unresolved issues.

## Security rules

Codex must never commit:

```text
.env
.env.local
.env.production
.env.*.local
```

Codex must never expose or commit:

```text
Supabase service role keys
Stripe secret keys
Stripe webhook secrets
Production database URLs
Private API keys
Access tokens
Session secrets
User private data
```

Codex must be especially careful around:

```text
Authentication
Authorization
Billing
Stripe checkout
Stripe webhooks
Supabase queries
User recovery data
Admin functionality
```

If a change affects auth, billing, Stripe, Supabase permissions, or sensitive user data, the plan and validation output must explicitly call that out.

## Plugin structure

This specification is the canonical source of truth for the workflow. Plugin
skills, `AGENTS.md`, PR templates, hooks, and agent configuration files must
summarize or reference this specification instead of redefining conflicting
rules.

Recommended plugin name:

```text
gwp-linear-workflow
```

Recommended structure, following the standard Codex plugin layout (only
`plugin.json` lives inside `.codex-plugin/`; everything else lives at the plugin
root):

```text
gwp-linear-workflow/
  .codex-plugin/
    plugin.json            # required manifest, the only file in this directory

  skills/
    gwp-linear-ops/
      SKILL.md             # plugin-local Linear issue/comment/status operations

    gwp-linear-to-pr/
      SKILL.md
      agents/
        openai.yaml        # OPTIONAL: skill UI metadata + invocation policy only.
                           # This does NOT define the planning/dev/validation
                           # agents. Those are .codex/agents/*.toml in the repo.

    gwp-pr-validation/
      SKILL.md

    gwp-test-and-build/
      SKILL.md

    gwp-doctor/
      SKILL.md             # preflight/onboarding checker (see Team onboarding)

  .mcp.json                # OPTIONAL: bundles the Linear MCP server config so
                           # developers only need to run `codex mcp login linear`

  scripts/
    gwp_doctor.py          # local preflight/check helper
    gwp_pr_comments.py     # GitHub PR comment/review-thread state helper

  assets/                  # OPTIONAL: icon/screenshots for the plugin
  README.md
```

The repository also carries `.agents/plugins/marketplace.json`, whose source path
points to `./plugins/gwp-linear-workflow` from the repository root, so developers
can install the team plugin with
`codex plugin marketplace add ./` followed by
`codex plugin add gwp-linear-workflow@gwp-recovery-platform`.

The planning, development, and validation custom agents are not part of the
plugin bundle. They are project-scoped repository files committed under
`.codex/agents/` in `olena-ageyeva/gwp-recovery-platform` (see "Project-scoped
custom agents"). The plugin distributes the skills and MCP configuration; the
repository carries the custom agents and `AGENTS.md`.

## Plugin manifest

The Codex plugin manifest is a JSON file at `.codex-plugin/plugin.json`. The
`name` must be stable kebab-case (Codex uses it as the plugin identifier), and
all component paths must be relative to the plugin root and start with `./`.

Minimal `.codex-plugin/plugin.json` for version 0.1:

```json
{
  "name": "gwp-linear-workflow",
  "version": "0.1.0",
  "description": "Local Codex workflow for implementing GWP Recovery Platform Linear issues with planning, tests, validation, PR creation, and Linear status transitions.",
  "skills": "./skills/",
  "mcpServers": "./.mcp.json"
}
```

Additional manifest fields supported by Codex that may be added for distribution
polish: `author`, `license`, `keywords`, and an `interface` object containing
presentation metadata such as `displayName`, `shortDescription`, `category`,
`capabilities`, `brandColor`, and `composerIcon`. Confirm the exact accepted keys
against the current Codex plugin build docs before publishing, since the manifest
schema is still evolving.

### Bundling the Linear MCP server

Rather than asking every developer to hand-add the Linear MCP server, the plugin
can bundle it via a root-level `.mcp.json` referenced by `mcpServers` above. The
server is a hosted streamable HTTP endpoint:

```json
{
  "mcpServers": {
    "linear": {
      "url": "https://mcp.linear.app/mcp"
    }
  }
}
```

With this bundled, each developer only needs to authenticate once via
`codex mcp login linear`. Do not bundle any Linear token or secret in the plugin;
authentication is per-developer OAuth.

Installed plugins are tracked per developer in `~/.codex/config.toml` under the
`[plugins]` table, which controls enable/disable state. The `plugin.json` manifest
is the source of truth for plugin identity and bundled components.

## Required local integration setup

Developers must have Linear MCP configured locally.

Recommended setup:

```bash
codex mcp add linear --url https://mcp.linear.app/mcp
```

Then authenticate with Linear when prompted.

If configuring manually, add to Codex config:

```toml
[mcp_servers.linear]
url = "https://mcp.linear.app/mcp"
```

Then run:

```bash
codex mcp login linear
```

Developers must also have GitHub authentication available for the upstream
repository. Acceptable version 0.1 options are:

1. GitHub CLI authenticated with permission to push branches and create PRs.
2. A connected GitHub app/tool in Codex that can create PRs in the upstream repo.

Before work mode begins, Codex must verify:

```bash
git remote -v
gh auth status
```

In Codex, `gh` may be unable to access keyring-backed credentials or network from
the restricted command sandbox. If the first `gh` check fails with token,
keyring, network, or host-resolution symptoms, Codex must retry the same check
outside the sandbox / with command escalation. Do not ask the developer to
re-authenticate unless the outside-sandbox check also fails.

If `gh` is not installed or authenticated, Codex may use another available
GitHub connector. If no GitHub PR creation mechanism is available, Codex must
stop before implementation and report the missing setup.

## Team onboarding

Because this plugin is distributed to every developer, some setup is inherently
per-developer and cannot be carried inside the plugin (it depends on personal
OAuth and credentials). Each developer must complete, once:

1. Install the `gwp-linear-workflow` plugin and enable it from the repository
   marketplace:

   ```bash
   codex plugin marketplace add ./
   codex plugin add gwp-linear-workflow@gwp-recovery-platform
   ```

2. Authenticate the bundled Linear MCP server:

   ```bash
   codex mcp login linear
   ```

3. Ensure GitHub push and PR access to `olena-ageyeva/gwp-recovery-platform`,
   for example via authenticated GitHub CLI:

   ```bash
   gh auth status
   ```

4. Trust the project when first opening it in Codex. Codex loads the repository's
   `.codex/` layers (including `.codex/agents/*.toml` and any `.codex/config.toml`)
   only for trusted projects. Without trust, the planning, development, and
   validation custom agents will not load and the workflow falls back to a single
   session.

A short `README.md` in the plugin should document these steps so onboarding does
not depend on tribal knowledge.

### gwp-doctor preflight skill

To reduce support load, ship a lightweight `gwp-doctor` skill that checks the
developer's environment and prints a clear pass/fail report. It should verify:

1. The current repository remote is `olena-ageyeva/gwp-recovery-platform`.
2. Linear MCP is configured and authenticated.
3. GitHub PR creation is available (`gh auth status` or an equivalent connector).
4. `npm run lint`, `npm run typecheck`, and `npm run build` scripts exist and run
   (catching the Next.js 16 lint-migration prerequisite early).
5. The `.codex/agents/*.toml` custom agents are present and loadable, and the
   project is trusted so those agents actually load.

`gwp-doctor` is read-only and must never change Linear status, create branches,
or edit files.

### Note on profiles

Codex profiles are experimental and are not supported in the IDE extension, and
project-local `.codex/config.toml` ignores certain keys (for example
`model_provider`, `profiles`, `notify`). Do not rely on profiles or project-local
provider/model overrides to enforce this workflow. The enforceable, portable
mechanisms are `AGENTS.md`, the skills, and the `.codex/agents/*.toml` custom
agents with their `sandbox_mode` settings.

## Skill: gwp-linear-to-pr

Create:

```text
skills/gwp-linear-to-pr/SKILL.md
```

Suggested content:

```md
---
name: gwp-linear-to-pr
description: Use this skill when the user asks Codex to work on, resume, or monitor a GWP Recovery Platform Linear issue, especially prompts like "Work on Linear issue GWP-26", "resume workflow for GWP-26", or "monitor PR comments for GWP-26". This workflow fetches the Linear issue, moves it through planning, implementation, validation, PR creation, In Review status, and session-bound PR feedback monitoring.
---

# GWP Linear-to-PR Workflow

You are running the local GWP Recovery Platform Linear-to-PR workflow.

## Scope

Use this skill only for the repository:

`olena-ageyeva/gwp-recovery-platform`

Use this skill only for Linear issues with IDs like:

`GWP-26`

Do not use Codex cloud agents from Linear or GitHub.

Do not enable GitHub-side Codex review.

For explain, review, or plan-only requests, stay read-only: fetch the issue,
inspect the repo, and produce the plan without changing Linear status, creating
a branch, editing files, committing, pushing, or creating a PR.

## Required workflow

1. Parse the Linear issue ID from the user request.
2. Confirm the current Git repository is `olena-ageyeva/gwp-recovery-platform`.
3. Fetch the Linear issue using the plugin-local `gwp-linear-ops` skill over Linear MCP.
4. Read title, description, comments, labels, priority, status, and acceptance criteria.
5. If issue status is not `Todo`, warn the developer and ask whether to continue.
6. If the issue is in `Backlog`, `Canceled`, or `Duplicate`, stop unless the developer explicitly overrides.
7. Run the required preflight checks.
8. Move the Linear issue to `In Progress` only after the issue, repository, and preflight are confirmed.
9. Create a branch from `main` using the issue ID.
10. Spawn the Planning Agent in read-only mode.
11. Present the implementation plan and acceptance criteria to the developer.
12. Wait for explicit developer approval. The Planning Agent cannot ask the
    developer directly; relay its open questions and answers in the root session.
13. After approval, post the approved plan and acceptance criteria as a Linear comment.
14. Spawn the Development Agent to implement the approved plan.
15. Require tests to be added or updated for behavior changes.
16. Run `npm test`.
17. Run `npm run lint`.
18. Run `npm run typecheck`.
19. Run `npm run build`.
20. If verification fails, repair up to 3 cycles.
21. Commit the changes to the issue branch with the Linear issue ID in the message.
22. Spawn the Validation Agent in read-only mode to review the committed diff.
23. If validation fails, return findings to the Development Agent, repair, recommit, rerun verification, and validate again.
24. Do not push or create a PR unless validation returns PASS.
25. Push the issue branch to the upstream repository.
26. Create a GitHub PR with `gh`, using the Linear issue ID in the title.
27. Include acceptance criteria and verification results in the PR body.
28. Move the Linear issue to `In Review`.
29. Post a PR-created checkpoint to Linear.
30. Enter session-bound PR review-monitor mode.
31. Poll GitHub PR comments every 10 minutes while the session remains active.
32. If comments require changes, produce a follow-up plan, wait for approval, update the branch, rerun verification and validation, push, and checkpoint the follow-up.
33. Do not send a final response while claiming monitoring is active.
34. When monitoring stops, say it stopped and provide the resume command.

## Hard rules

- Never commit directly to `main`.
- Never create a PR if `npm test` fails.
- Never create a PR if `npm run lint` fails.
- Never create a PR if `npm run typecheck` fails.
- Never create a PR if `npm run build` fails.
- Never create a PR if the Validation Agent fails.
- Never move an issue to `Done`; `Done` means PR merged.
- Never commit secrets or `.env.local`.
- Never broaden scope without developer approval.
- Ask questions when requirements are unclear.
```

## Project-level AGENTS.md

Add this file to the root of the repository:

```text
AGENTS.md
```

Suggested content:

```md
# GWP Recovery Platform Codex Guidance

## Project

This repository contains the GWP Recovery Platform web application.

The source of truth for project tasks is Linear.

The source of truth for code is GitHub.

The full source of truth for the local Codex workflow is
`docs/gwp_codex_workflow_plugin_spec.md`. This file is a short project reminder,
not a replacement for the workflow spec.

## Required workflow

When working on a Linear issue:

1. Use the Linear issue ID in the branch name.
2. Use the Linear issue ID in commit messages.
3. Use the Linear issue ID in the PR title.
4. Do not commit directly to `main`.
5. Keep changes focused on the active Linear issue.
6. Do not broaden scope without approval.
7. Add or update tests for behavior changes.
8. Before PR creation, run:

```bash
npm test
npm run lint
npm run typecheck
npm run build
```

9. Do not create a PR unless tests, lint, typecheck, and build pass.
10. Do not create a PR unless internal validation passes.

## Linear statuses

The local Codex workflow uses:

```text
Todo
In Progress
In Review
Done
```

Codex should ignore these statuses unless explicitly instructed:

```text
Backlog
Canceled
Duplicate
```

`Done` means the PR was merged.

Codex must not move an issue to `Done` before merge.

## Security

Never commit:

```text
.env
.env.local
.env.production
.env.*.local
```

Never expose:

```text
Supabase service role keys
Stripe secret keys
Stripe webhook secrets
Production database URLs
Private API keys
Access tokens
Session secrets
User private data
```

Be especially careful with:

```text
Authentication
Authorization
Billing
Stripe checkout
Stripe webhooks
Supabase queries
User recovery data
Admin functionality
```

## Validation expectations

Before PR creation, an internal validation agent must review:

1. Acceptance criteria satisfaction.
2. Test quality.
3. Security risks.
4. Auth and authorization risks.
5. Billing and Stripe risks.
6. Supabase/data risks.
7. UI regression risks.
8. Unrelated code changes.
9. Required command results.

Codex must not create a PR until validation passes.

## PR expectations

Every PR should include:

```md
Linear issue: GWP-XX

## Summary
- ...

## Acceptance Criteria
- [x] ...

## Verification
- [x] npm test
- [x] npm run lint
- [x] npm run typecheck
- [x] npm run build

## Validation
- [x] Internal validation agent passed

## Screenshots / Preview
- ...

## Risk Notes
- ...

## Follow-ups
- ...
```
```

## Project-scoped custom agents

Project-scoped custom agents are required for version 0.1. Codex supports custom
agents as standalone TOML files under `.codex/agents/` (project scope) or
`~/.codex/agents/` (personal scope). Each file defines exactly one agent and must
include `name`, `description`, and `developer_instructions`. It may also set other
config keys such as `model`, `model_reasoning_effort`, `sandbox_mode`,
`mcp_servers`, and `skills.config`. Codex loads these as configuration layers for
spawned agent sessions.

These agents are the mechanism that enforces the workflow's phase boundaries:
`sandbox_mode = "read-only"` on the planner and validator is what actually
prevents file edits, rather than relying on prose instructions alone.

These are distinct from a skill's optional `agents/openai.yaml`, which only
configures a skill's UI metadata and invocation policy and must not be used to
define these agents.

### Repository setup: create the shared custom agents

Creating these agents is a one-time repository setup task, not a per-issue step.
The implementer (or Codex itself, running this workflow against the build-out
issue) must:

1. Create the three files below with the contents defined in this section, at
   these exact paths in `olena-ageyeva/gwp-recovery-platform`:

   ```text
   .codex/agents/gwp-planner.toml
   .codex/agents/gwp-developer.toml
   .codex/agents/gwp-validator.toml
   ```

2. Commit them to the repository on a branch and merge them via PR, the same way
   any other change lands. Because they live in the repo (not in the plugin
   bundle), every developer who clones the repository receives the same agents
   automatically — there is no per-developer agent creation.

3. Note that committed agent files only take effect once a developer **trusts the
   project** in Codex (see "Team onboarding"). `gwp-doctor` verifies both that the
   files are present and that the project is trusted.

After this setup lands on `main`, the `gwp-linear-to-pr` skill can reference these
agents by name for every subsequent issue.

### gwp-planner.toml

```toml
name = "gwp_planner"
description = "Read-only planner for converting a GWP Linear issue into an implementation plan and acceptance criteria."

sandbox_mode = "read-only"

developer_instructions = """
You are the Planning Agent for the GWP Recovery Platform.

Your job is to convert a Linear issue into a precise implementation plan.

You may:
- Read the Linear issue.
- Read comments and acceptance criteria.
- Inspect the repository.
- Identify relevant files.
- Propose a plan.
- Define testable acceptance criteria.
- Identify risks and open questions.

You must not:
- Edit files.
- Commit changes.
- Create branches.
- Create pull requests.
- Change Linear status.

Output:
- Issue summary.
- Current understanding.
- Relevant files.
- Proposed changes.
- Acceptance criteria.
- Test plan.
- Risks.
- Open questions.

If the issue is unclear, ask questions instead of guessing.
"""
```

### gwp-developer.toml

```toml
name = "gwp_developer"
description = "Implementation agent for approved GWP Linear issue plans."

developer_instructions = """
You are the Development Agent for the GWP Recovery Platform.

Your job is to implement the approved plan.

You must:
- Implement only the approved plan.
- Keep changes minimal and focused.
- Add or update tests for changed behavior.
- Avoid unrelated refactors.
- Avoid committing secrets.
- Run npm test.
- Run npm run lint.
- Run npm run typecheck.
- Run npm run build.
- Fix failures caused by your implementation.
- Stop after 3 failed repair attempts and summarize the issue.

You must not:
- Commit directly to main.
- Create a PR before validation.
- Broaden scope without approval.
- Invent missing business requirements.
"""
```

### gwp-validator.toml

```toml
name = "gwp_validator"
description = "Read-only validation and code review agent for GWP issue work before PR creation."

sandbox_mode = "read-only"

developer_instructions = """
You are the Validation Agent for the GWP Recovery Platform.

Your job is to perform internal code review before PR creation.

Review:
- The Linear issue.
- The approved implementation plan.
- The acceptance criteria.
- The git diff against main.
- Test results.
- Lint results.
- Typecheck results.
- Build results.

Check:
- Every acceptance criterion is satisfied.
- Tests are meaningful.
- Required commands passed.
- No unrelated changes were made.
- No secrets were committed.
- Auth and authorization remain safe.
- Billing and Stripe behavior remain safe.
- Supabase/data access remains safe.
- Sensitive user data is protected.
- UI changes are reasonable and do not introduce obvious regressions.
- The PR is ready for human review.

Return PASS only if the change is ready for PR creation.

If not ready, return FAIL with blocking issues, missing criteria, test gaps, and required fixes.

Do not edit files.
Do not change Linear status.
Do not create a PR.
"""
```

## Optional hooks for later

Hooks are not required for version 0.1 but are recommended for version 0.2.

Suggested hooks:

```text
guard_no_main_commit.py
guard_branch_name.py
guard_no_secret_commit.py
guard_required_checks.py
```

### guard_no_main_commit.py

Purpose:

Prevent Codex from committing directly to `main`.

### guard_branch_name.py

Purpose:

Warn or block if the current branch does not contain a Linear issue ID like:

```text
GWP-26
```

### guard_no_secret_commit.py

Purpose:

Warn or block if staged files include `.env.local` or likely secrets.

### guard_required_checks.py

Purpose:

Before PR creation, verify that these commands were run after the final code changes:

```bash
npm test
npm run lint
npm run typecheck
npm run build
```

## Failure behavior

### Issue cannot be fetched

Stop and report the problem.

Do not change Linear status.

### Wrong repository

Stop and report the current repository.

Do not change Linear status.

### GitHub authentication or upstream push access fails

Stop and report which check failed.

If the failure came from a GitHub CLI command inside the Codex sandbox, first
retry the same command outside the sandbox / with command escalation when the
output mentions invalid token, missing OAuth token, keyring access, disabled
network, or host-resolution errors. A sandbox-only failure is not enough to tell
the developer to re-authenticate.

Do not change Linear status, create a branch, edit files, commit, push, or create
a PR.

If the developer approves a fork fallback, Codex may continue with a fork-based
branch and PR targeting `olena-ageyeva/gwp-recovery-platform:main`.

### Issue is Backlog, Canceled, or Duplicate

Stop unless the developer explicitly overrides.

### Issue is already In Progress or In Review

Warn the developer and ask whether to continue.

### Planning reveals missing requirements

Stop and ask questions.

Optionally comment on the Linear issue with the questions if the developer approves.

### Verification fails

Repair up to 3 cycles.

If still failing, stop and summarize.

Do not create PR.

Do not move issue to In Review.

### Validation fails

Repair up to 3 cycles.

If still failing, stop and summarize.

Do not create PR.

Do not move issue to In Review.

### PR creation fails

Leave the issue in `In Progress`.

Summarize:

1. Branch name.
2. Commit hash.
3. Test results.
4. Lint results.
5. Typecheck results.
6. Build results.
7. Validation result.
8. PR creation error.
9. Manual next steps.

## Final response format after successful workflow

When the workflow completes successfully, Codex should respond with:

```md
## Completed GWP-26

Status:
- Linear: In Review
- GitHub PR: <PR URL>
- Branch: GWP-26-short-description

Verification:
- npm test: passed
- npm run lint: passed
- npm run typecheck: passed
- npm run build: passed
- Internal validation: passed

Summary:
- ...

Acceptance Criteria:
- [x] ...
- [x] ...

Notes:
- ...
```

## Initial rollout plan

### Version 0.0 (repository prerequisites)

Complete before any plugin rollout (see "Known repository prerequisites"):

1. Migrate `npm run lint` from `next lint` to the ESLint CLI.
2. Add an `npm run typecheck` script (`tsc --noEmit`).
3. Confirm `npm test`, `npm run lint`, `npm run typecheck`, and `npm run build`
   all run cleanly on `main`.

### Version 0.1

Implement:

1. Linear MCP bundled in the plugin via `.mcp.json` (plus per-developer
   `codex mcp login linear`).
2. `gwp-linear-to-pr` skill.
3. `gwp-linear-ops` plugin-local Linear operations skill.
4. `gwp-doctor` preflight/onboarding skill.
5. Project `AGENTS.md`.
6. Project custom agents under `.codex/agents/*.toml` (required, not optional):
   - Planning Agent (`sandbox_mode = "read-only"`)
   - Development Agent (workspace-write)
   - Validation Agent (`sandbox_mode = "read-only"`)
7. PR template.
8. Native Linear GitHub integration for linking and final Done-on-merge behavior.
9. Plugin `README.md` documenting per-developer onboarding.
10. Repository marketplace entry for local team installation.

Do not implement yet:

1. GitHub-side Codex review.
2. Codex cloud agents from Linear.
3. Codex cloud agents from GitHub.
4. Automatic work triggered by assigning issues to Codex in Linear.

### Version 0.2

Consider adding:

1. Branch-name guard hook.
2. No-main-commit guard hook.
3. No-secrets guard hook.
4. Required-checks guard hook.
5. Stronger PR template enforcement.

### Version 0.3

Consider adding:

1. Netlify deploy preview validation.
2. Browser/UI validation.
3. Specialized auth/security validation agent.
4. Specialized billing/Stripe validation agent.
5. Optional GitHub-side Codex review.
