---
name: gwp-linear-to-pr
description: "Use this skill when the user asks Codex to work on a GWP Recovery Platform Linear issue, especially prompts like Work on Linear issue GWP-26. This workflow fetches the Linear issue, moves it to In Progress, plans the change, waits for approval, implements with tests, validates acceptance criteria, creates a GitHub PR, and moves the Linear issue to In Review."
---

# GWP Linear-to-PR Workflow

You are running the local GWP Recovery Platform Linear-to-PR workflow.

The canonical source of truth is `docs/gwp_codex_workflow_plugin_spec.md` in the
repository. Follow that spec when it is more specific than this summary.

## Scope

Use this skill only for `olena-ageyeva/gwp-recovery-platform` and Linear issues
with IDs like `GWP-26`.

Do not use Codex cloud agents from Linear or GitHub. Do not enable GitHub-side
Codex review.

For explain, review, or plan-only requests, stay read-only: fetch the issue,
inspect the repo, and produce the plan without changing Linear status, creating
a branch, editing files, committing, pushing, or creating a PR.

## Mode Selection

Default to read-only explain or plan mode unless the request contains all of:

1. Explicit invocation of this workflow or an unmistakable request to use it.
2. An implementation verb such as `work on`, `implement`, or `build`.
3. A valid Linear issue ID like `GWP-26`.

If the request is ambiguous, fetch/read only what is needed to explain the issue
and ask the developer to confirm before entering work mode.

## Resume Mode

Before creating a branch or PR for an issue, detect existing work for that issue:

1. Check local branches for the issue ID case-insensitively.
2. Check remote branches for the issue ID case-insensitively.
3. Check open GitHub PRs for the issue ID.
4. Read Linear comments for a previously posted approved plan and acceptance criteria.

If multiple local branches, remote branches, or PRs could apply, ask the
developer which one to continue. If an approved-plan comment exists, use it as
the source of truth instead of re-planning. If no approved-plan comment exists,
run the planning phase again.

## Required Preflight

Before changing Linear status, creating a branch, editing files, committing,
pushing, or creating a PR, verify:

1. `origin` points to `olena-ageyeva/gwp-recovery-platform`.
2. The workflow targets the upstream repository, not an unrelated fork.
3. The worktree is clean, or the developer explicitly approves continuing with existing changes.
4. The current branch is not `main` before implementation commits are made.
5. Local `main` is fresh enough to branch from, or `git pull` on `main` succeeds.
6. The Linear issue exists and belongs to the expected GWP team/project scope.
7. Linear MCP is configured and authenticated.
8. GitHub authentication is available for PR creation.
9. The developer can push a branch to the upstream repository.
10. The native Linear GitHub integration is installed for the upstream repository, when observable.
11. `npm test`, `npm run lint`, `npm run typecheck`, and `npm run build` are defined and runnable.

If upstream push access fails, stop and report the failure. Continue with a
fork-based PR only after the developer explicitly approves that fallback.

## Required Workflow

1. Parse the Linear issue ID from the user request.
2. Confirm the current Git repository is `olena-ageyeva/gwp-recovery-platform`.
3. Use the `gwp-linear-ops` skill with Linear MCP to fetch the Linear issue.
4. Read title, description, comments, labels, priority, status, and acceptance criteria.
5. If issue status is not `Todo`, warn the developer and ask whether to continue.
6. If the issue is `Backlog`, `Canceled`, or `Duplicate`, stop unless the developer explicitly overrides.
7. Run the required preflight checklist above.
8. Use `gwp-linear-ops` to resolve the issue team's workflow state IDs before changing Linear status. Never hardcode Linear state IDs.
9. Use `gwp-linear-ops` to move the Linear issue to `In Progress` only after issue, repository, and preflight are confirmed.
10. Create a branch from fresh `main` with the issue ID in the name.
11. Spawn the `gwp_planner` agent in read-only mode.
12. Present the implementation plan and acceptance criteria to the developer.
13. Wait for explicit developer approval before editing code.
14. After approval, use `gwp-linear-ops` to post the approved plan and acceptance criteria as a Linear comment.
15. Spawn the `gwp_developer` agent to implement the approved plan.
16. Require tests to be added or updated for behavior changes.
17. Run `npm test`, `npm run lint`, `npm run typecheck`, and `npm run build`.
18. If verification fails, repair up to 3 cycles, then stop with a summary.
19. Commit changes on the issue branch with the Linear issue ID in the commit message.
20. Spawn the `gwp_validator` agent in read-only mode to review `git diff main...HEAD`.
21. If validation fails, return findings to development, repair, recommit, rerun verification, and validate again, up to 3 cycles.
22. Do not push or create a PR unless validation returns PASS.
23. Push the issue branch to the upstream repository.
24. Create a GitHub PR with the Linear issue ID in the title and the required PR body sections.
25. Use `gwp-linear-ops` to move the Linear issue to `In Review`.
26. Post a final summary including branch, PR URL, verification commands, validation result, and Linear status.

## Hard Rules

- Never commit directly to `main`.
- Never create a PR if any required verification command fails.
- Never create a PR if internal validation fails.
- Never move an issue to `Done`; `Done` means PR merged.
- Never commit secrets or `.env.local`.
- Never broaden scope without developer approval.
- Ask questions when requirements are unclear.
