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

`Done` means the PR was merged. Codex must not move an issue to `Done` before
merge.

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
