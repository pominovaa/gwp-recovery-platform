---
name: gwp-linear-ops
description: "Use this plugin-local skill for GWP Recovery Platform Linear operations during the GWP Linear-to-PR workflow. It fetches issues, reads comments, resolves workflow state IDs, updates statuses, and creates comments through the bundled Linear MCP server."
---

# GWP Linear Operations

Use this skill for Linear operations inside the GWP Linear Workflow plugin. This
skill exists so the plugin is self-contained and does not depend on every
developer separately installing the standalone Linear skill.

The bundled Linear MCP server is the transport. Developers still need personal
OAuth with:

```bash
codex mcp login linear
```

## Scope

Use only for GWP Recovery Platform work in the expected Linear workspace and for
issues with IDs like `GWP-26`.

Do not use this skill to create unrelated Linear issues, projects, labels, or
cycles unless the developer explicitly asks for that separate Linear task.

## Required Order

1. Read before writing.
2. Confirm the issue exists and belongs to the expected GWP team/project scope.
3. Read issue title, description, status, team, labels, priority, comments, and existing acceptance criteria.
4. Resolve workflow statuses from the issue's team before any status update.
5. Update issue status only when the parent `gwp-linear-to-pr` workflow says the gate for that transition has passed.
6. Create Linear comments only when the workflow requires a durable artifact, such as the approved plan, PR-created summary, PR-comment checkpoint, follow-up implementation checkpoint, or final PR summary.

## Transition Gates

Move `Todo` to `In Progress` only after the parent workflow confirms:

- The issue was fetched successfully.
- The repository is `olena-ageyeva/gwp-recovery-platform`.
- The issue is in scope for the GWP workflow.
- The developer intentionally asked Codex to work on the issue.
- Required preflight checks passed.

Move `In Progress` to `In Review` only after the parent workflow confirms:

- The implementation plan was approved.
- Development is complete.
- Tests were added or updated where appropriate.
- `npm test`, `npm run lint`, `npm run typecheck`, and `npm run build` passed.
- Internal validation passed.
- A GitHub PR was created successfully.

## Workflow State Resolution

Linear workflow state names are team-scoped labels, not stable global IDs.

Before moving an issue:

1. Resolve the issue's team from the fetched issue.
2. List that team's workflow states through Linear MCP.
3. Match the requested human label case-insensitively.
4. Tolerate minor label differences such as `In Progress` and `In progress`.
5. Stop and report available states if the target state is missing or ambiguous.

Never hardcode a Linear workflow state ID.

## Allowed Statuses

The GWP workflow uses:

```text
Todo
In Progress
In Review
Done
```

Do not automatically move issues into or out of:

```text
Backlog
Canceled
Duplicate
```

Never move an issue to `Done` before the linked PR is merged. Done is preferably
handled by the native Linear GitHub integration after merge.

## Comment Conventions

Post the approved plan only after explicit developer approval. Do not overwrite
the Linear issue description.

Approved-plan comments should include:

- Linear issue ID and title.
- Approved implementation plan.
- Final acceptance criteria.
- Test plan.
- Risk notes.

Final PR comments should include:

- Branch name.
- PR URL.
- Verification command results.
- Validation result.
- Any follow-ups.

PR-created checkpoint comments should include:

- Linear issue ID.
- Branch name.
- PR URL and PR number.
- Base branch.
- Verification command results.
- Validation result.
- Linear status after PR creation.

PR-comment checkpoint comments should include:

- Linear issue ID.
- PR URL and PR number.
- Check timestamp.
- GitHub comment, review, review-thread, and review-thread-comment IDs already handled.
- Summary of comments triaged as informational.
- Summary of comments that produced an approved follow-up plan, if any.

Follow-up implementation checkpoint comments should include:

- Linear issue ID.
- PR URL and PR number.
- GitHub feedback IDs addressed.
- Approved follow-up plan.
- Commit SHA.
- Verification command results.
- Validation result.

## Failure Behavior

If Linear MCP is unavailable or unauthenticated, stop and ask the developer to
run:

```bash
codex mcp login linear
```

If status resolution or issue scope is unclear, stop and report the exact
available data instead of guessing.
