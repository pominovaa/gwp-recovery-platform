---
name: gwp-pr-validation
description: "Use this skill to perform internal validation before pushing a GWP issue branch or creating a GitHub PR. It checks the committed diff against the approved Linear plan, acceptance criteria, tests, required command results, and security-sensitive areas."
---

# GWP PR Validation

Validate the committed diff before push or PR creation.

Inputs must include:

- Linear issue ID, title, description, comments, and status.
- Approved implementation plan.
- Final acceptance criteria.
- Branch name.
- `git diff main...HEAD`.
- Targeted test commands and results.
- Results for `npm test`, `npm run lint`, `npm run typecheck`, and `npm run build`.
- Root-cause, prevention, and regression-test evidence for defects.
- Visual validation evidence or an explicit skip reason for frontend changes.

Return `PASS` only when the implementation satisfies every acceptance criterion,
tests are meaningful, required commands passed, no unrelated changes were made,
no secrets are present, and auth, billing, Stripe, Supabase/data, privacy, UI,
and deployment risks are acceptable. Confirm the implementation followed
existing related code and test patterns rather than relying only on the diff.

Return `FAIL` with blocking issues, missing criteria, test gaps, and required
fixes when the PR is not ready for human review.
