# GWP Recovery Platform Codex Workflow Plugin Specification

## Purpose

This document defines the local Codex agentic workflow for implementing Linear issues in the GWP Recovery Platform codebase.

The workflow starts when a developer, working locally in Codex CLI/IDE inside the GitHub repository, asks:

```text
Work on Linear issue GWP-26
```

Codex must then fetch the Linear issue, move it through the correct workflow states, plan the implementation, wait for human approval, implement the change with tests, validate the result with an internal validation agent, create a GitHub pull request, and move the Linear issue to review.

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

The Codex workflow remains the primary orchestrator for planning, implementation, testing, validation, and PR creation.

## Workflow modes

Codex must distinguish between read-only planning and active implementation.

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

## Required verification commands

Before validation and PR creation, Codex must run:

```bash
npm test
npm run lint
npm run build
```

The current repository already defines `npm run lint`, so linting is required for
version 0.1. If the lint command is unavailable or broken because of framework
tooling changes, Codex must stop, report the exact failure, and ask whether to
update the lint setup or proceed with documented risk.

If the repository later adds explicit typechecking or end-to-end tests, this workflow should be updated to include them.

Suggested future commands:

```bash
npm run typecheck
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
Spawn Development Agent
  ↓
Development Agent implements approved plan and tests
  ↓
Run npm test, npm run lint, and npm run build
  ↓
Spawn Validation Agent
  ↓
Validation Agent reviews diff against plan and acceptance criteria
  ↓
If validation fails, return to Development Agent
  ↓
If validation passes, create PR
  ↓
Move Linear issue to In Review
  ↓
Post final summary
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

## Agent execution model

Version 0.1 uses project skills and local Codex orchestration as the primary
execution model.

Codex may use separate planning, development, and validation agents when the
local Codex environment supports multi-agent execution. If project-scoped agent
configuration files are used, their format must be verified against the current
Codex agent configuration format before implementation.

If multi-agent execution is unavailable, Codex must still follow the same phase
boundaries in a single local session:

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

1. Implement only the approved plan.
2. Keep changes minimal and focused.
3. Add or update tests for changed behavior.
4. Preserve existing behavior unless the approved plan says otherwise.
5. Run required verification commands.
6. Fix failing tests caused by the implementation.
7. Stop and ask for help if requirements are unclear or failures cannot be resolved safely.

### Required commands

The Development Agent must run:

```bash
npm test
npm run lint
npm run build
```

### Repair loop

If tests, lint, or build fail, the Development Agent may attempt to fix the problem.

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
7. Build results.

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

Recommended structure:

```text
gwp-linear-workflow/
  .codex-plugin/
    plugin.json

  skills/
    gwp-linear-to-pr/
      SKILL.md
      agents/
        openai.yaml

    gwp-pr-validation/
      SKILL.md

    gwp-test-and-build/
      SKILL.md

  hooks/
    hooks.json
    guard_no_main_commit.py
    guard_branch_name.py
    guard_no_secret_commit.py

  README.md
```

## Plugin manifest

Suggested `.codex-plugin/plugin.json`:

```json
{
  "name": "gwp-linear-workflow",
  "version": "0.1.0",
  "description": "Local Codex workflow for implementing GWP Recovery Platform Linear issues with planning, tests, validation, PR creation, and Linear status transitions.",
  "skills": "./skills/"
}
```

If MCP configuration is packaged through the plugin later, add it according to the current Codex plugin configuration format.

For version 0.1, developers may configure Linear MCP directly in their local Codex setup.

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

If `gh` is not installed or authenticated, Codex may use another available
GitHub connector. If no GitHub PR creation mechanism is available, Codex must
stop before implementation and report the missing setup.

## Skill: gwp-linear-to-pr

Create:

```text
skills/gwp-linear-to-pr/SKILL.md
```

Suggested content:

```md
---
name: gwp-linear-to-pr
description: Use this skill when the user asks Codex to work on a GWP Recovery Platform Linear issue, especially prompts like "Work on Linear issue GWP-26". This workflow fetches the Linear issue, moves it to In Progress, plans the change, waits for approval, implements with tests, validates acceptance criteria, creates a GitHub PR, and moves the Linear issue to In Review.
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
3. Fetch the Linear issue using the approved Linear skill/MCP.
4. Read title, description, comments, labels, priority, status, and acceptance criteria.
5. If issue status is not `Todo`, warn the developer and ask whether to continue.
6. If the issue is in `Backlog`, `Canceled`, or `Duplicate`, stop unless the developer explicitly overrides.
7. Run the required preflight checks.
8. Move the Linear issue to `In Progress` only after the issue, repository, and preflight are confirmed.
9. Create a branch from `main` using the issue ID.
10. Spawn the Planning Agent in read-only mode.
11. Present the implementation plan and acceptance criteria to the developer.
12. Wait for explicit developer approval.
13. Spawn the Development Agent to implement the approved plan.
14. Require tests to be added or updated for behavior changes.
15. Run `npm test`.
16. Run `npm run lint`.
17. Run `npm run build`.
18. If verification fails, repair up to 3 cycles.
19. Spawn the Validation Agent in read-only mode.
20. If validation fails, return findings to the Development Agent, repair, rerun tests, rerun lint, rerun build, and validate again.
21. Do not create a PR unless validation returns PASS.
22. Create a GitHub PR with the Linear issue ID in the title.
23. Include acceptance criteria and verification results in the PR body.
24. Move the Linear issue to `In Review`.
25. Post a final summary including branch, PR URL, verification commands, and Linear status.

## Hard rules

- Never commit directly to `main`.
- Never create a PR if `npm test` fails.
- Never create a PR if `npm run lint` fails.
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
npm run build
```

9. Do not create a PR unless tests, lint, and build pass.
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

Project-scoped custom agents are optional for version 0.1. Before adding these
files, verify that `.codex/agents/*.toml` is the current supported Codex
configuration format for project agents.

If this format is not supported, do not add these files. Keep the workflow in
the plugin skill and follow the same planning, development, and validation phase
boundaries in the local Codex session.

Add project-scoped agents under:

```text
.codex/agents/
```

Suggested files:

```text
.codex/agents/gwp-planner.toml
.codex/agents/gwp-developer.toml
.codex/agents/gwp-validator.toml
```

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
5. Build results.
6. Validation result.
7. PR creation error.
8. Manual next steps.

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

### Version 0.1

Implement:

1. Local Linear MCP setup.
2. `gwp-linear-to-pr` skill.
3. Project `AGENTS.md`.
4. Project custom agents:
   - Planning Agent
   - Development Agent
   - Validation Agent
5. PR template.
6. Native Linear GitHub integration for linking and final Done-on-merge behavior.

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
