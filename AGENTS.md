# GWP Recovery Platform Codex Guidance

## Project

This repository contains the GWP Recovery Platform web application.

The source of truth for project tasks is Linear.
The source of truth for code is GitHub.

The canonical source for the local Codex workflow is
`docs/gwp_codex_workflow_plugin_spec.md`. This file is a short project reminder,
not a replacement for the workflow spec.

## Required Workflow

When working on a Linear issue:

1. After confirming explicit work mode, the upstream repo, Linear
   authentication, issue scope, and eligible status, immediately assign the
   issue to the current developer and move `Todo` to `In Progress`.
2. Verify every Linear assignment and status write by re-fetching the issue;
   retry once and report partial success if the readback still differs.
3. Claim the issue before the broader preflight and planning; do not roll the
   claim back if a later check fails.
4. Before switching to another issue branch, automatically stash tracked and
   untracked non-ignored work with a message containing the issue ID, exact
   source branch name captured before stashing, and UTC timestamp. Verify the
   stash and clean worktree, leave the stash intact, and report its ref and
   message. Never stash visible secret files or automatically apply the stash to
   the issue branch.
5. In resume mode, do not automatically stash dirty work already on the
   intended issue branch.
6. Prefer Linear `gitBranchName`; otherwise use a branch containing the issue ID.
7. Use the Linear issue ID in commit messages.
8. Use `<ISSUE-ID>: <exact Linear title>` for the PR title.
9. Do not commit directly to `main`.
10. Read related code and tests before editing.
11. Keep changes focused on the active Linear issue.
12. Do not broaden scope without approval.
13. Add or update tests for behavior changes.
14. Run targeted tests before the full verification gate.
15. Before PR creation, run:

```bash
npm test
npm run lint
npm run typecheck
npm run build
```

16. Do not create a PR unless tests, lint, typecheck, and build pass.
17. Do not create a PR unless internal validation passes.
18. For defects, include root cause, prevention notes, and regression coverage.
19. For frontend changes, record bounded visual validation or a skip reason.
20. For any workflow path that changes repository files, commit the changes and
    push the issue branch to GitHub before reporting completion.
21. After PR feedback is either triaged as no-code or approved and implemented,
    automatically resolve only directly addressed inline review threads against
    a validated, pushed, green head. Re-fetch first, block on newer unhandled
    comments, require an evidence reply for human-authored or no-code threads,
    verify every resolution write, and record thread IDs and outcomes in Linear.
    Outdated state alone is insufficient.

## Linear Statuses

The local Codex workflow uses:

```text
Todo
In Progress
In Review
Done
```

Ignore these statuses unless explicitly instructed:

```text
Backlog
Canceled
Duplicate
```

`Done` means the PR was merged. Codex must not move an issue to `Done`; the
native Linear GitHub integration or a human owns that post-merge transition.

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

Be especially careful with authentication, authorization, billing, Stripe
checkout, Stripe webhooks, Supabase queries, user recovery data, and admin
functionality.

## Validation Expectations

Before PR creation, an internal validation agent must review acceptance criteria,
test quality, security risks, auth and authorization risks, billing and Stripe
risks, Supabase/data risks, UI regression risks, unrelated code changes, and
required command results.

Codex must not create a PR until validation passes.

## PR Expectations

Every PR should include:

```md
Linear issue: GWP-XX

## Summary
- ...

## Root Cause / Prevention
- N/A for non-defect work.

## Acceptance Criteria
- [x] ...

## Verification
- [x] Targeted tests: `...`
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
