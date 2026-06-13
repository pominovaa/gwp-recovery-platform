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

1. Assign the issue to the current developer and verify the assignment.
2. Verify every Linear status write by re-fetching the issue; retry once and
   report partial success if the readback still differs.
3. Prefer Linear `gitBranchName`; otherwise use a branch containing the issue ID.
4. Use the Linear issue ID in commit messages.
5. Use `<ISSUE-ID>: <exact Linear title>` for the PR title.
6. Do not commit directly to `main`.
7. Read related code and tests before editing.
8. Keep changes focused on the active Linear issue.
9. Do not broaden scope without approval.
10. Add or update tests for behavior changes.
11. Run targeted tests before the full verification gate.
12. Before PR creation, run:

```bash
npm test
npm run lint
npm run typecheck
npm run build
```

13. Do not create a PR unless tests, lint, typecheck, and build pass.
14. Do not create a PR unless internal validation passes.
15. For defects, include root cause, prevention notes, and regression coverage.
16. For frontend changes, record bounded visual validation or a skip reason.
11. For any workflow path that changes repository files, commit the changes and
    push the issue branch to GitHub before reporting completion.

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
