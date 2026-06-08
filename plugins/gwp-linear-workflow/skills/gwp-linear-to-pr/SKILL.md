---
name: gwp-linear-to-pr
description: "Use this skill when the user asks Codex to work on, resume, check PR comments, or review a PR for a GWP Recovery Platform Linear issue, especially prompts like Work on Linear issue GWP-XX, resume workflow for GWP-XX, check PR comments for GWP-XX, review PR comments for GWP-XX, or review PR for GWP-XX. This workflow fetches the Linear issue, plans the change, waits for approval, implements with tests, validates acceptance criteria, creates or updates a GitHub PR, handles PR feedback through manual one-time checks, and can post an outbound Codex PR review comment."
---

# GWP Linear-to-PR Workflow

You are running the local GWP Recovery Platform Linear-to-PR workflow.

The canonical source of truth is `docs/gwp_codex_workflow_plugin_spec.md` in the
repository. Follow that spec when it is more specific than this summary.

## Scope

Use this skill only for `olena-ageyeva/gwp-recovery-platform` and Linear issues
whose IDs match the project issue key pattern, such as `GWP-XX`.

Do not use Codex cloud agents from Linear or GitHub. Do not enable GitHub-side
Codex review.

For explain, review, or plan-only requests, stay read-only: fetch the issue,
inspect the repo, and produce the plan without changing Linear status, creating
a branch, editing files, committing, pushing, or creating a PR.

## Mode Selection

Default to read-only explain or plan mode unless the request contains all of:

1. Explicit invocation of this workflow or an unmistakable request to use it.
2. An implementation/resume/comment-check/review verb such as `work on`, `implement`, `build`, `resume`, `check PR comments`, `review PR comments`, `review PR`, or `review pull request`.
3. A valid Linear issue ID matching the project issue key pattern.

If the request is ambiguous, fetch/read only what is needed to explain the issue
and ask the developer to confirm before entering work mode.

Recognize these work-mode prompts:

- `work on Linear issue GWP-XX`
- `resume workflow for GWP-XX`
- `resume GWP-XX`
- `check PR comments for GWP-XX`
- `review PR comments for GWP-XX`
- `review PR for GWP-XX`
- `review pull request for GWP-XX`

## Resume Mode

Before creating a branch or PR for an issue, detect existing work for that issue:

1. Check local branches for the issue ID case-insensitively.
2. Check remote branches for the issue ID case-insensitively.
3. Check open GitHub PRs for the issue ID.
4. Read Linear comments for workflow checkpoints:
   - approved plan and acceptance criteria
   - PR-created summary
   - PR-comment checkpoint with handled GitHub comment/thread IDs
   - follow-up implementation checkpoints

If multiple local branches, remote branches, or PRs could apply, ask the
developer which one to continue. If an approved-plan comment exists, use it as
the source of truth instead of re-planning. If no approved-plan comment exists,
run the planning phase again.

Infer the resume stage from Linear, Git, and GitHub state:

1. No branch exists: start the normal workflow.
2. Branch exists and no approved-plan checkpoint exists: re-plan and wait for approval.
3. Approved plan exists and no PR exists: continue implementation or rerun verification as needed.
4. PR exists and is open: run one manual PR comment check.
5. PR is merged or closed: report final PR state and do not move Linear to `Done`.

Outbound PR review mode is separate from resume mode. If the developer asks
`review PR for GWP-XX` or `review pull request for GWP-XX`, run the outbound PR
review workflow below instead of the manual PR comment check.

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

### GitHub CLI sandbox handling

Codex sessions may run shell commands in a restricted sandbox that cannot access
the desktop keyring or network. In that state, `gh auth status` can incorrectly
report that the active account token is invalid even when the same command works
in a normal terminal.

When any GitHub CLI command fails with symptoms such as `token is invalid`,
`no oauth token found`, `Could not resolve host`, network disabled output, or
keyring access failure:

1. Do not immediately tell the developer to re-authenticate.
2. Retry the same GitHub CLI check outside the sandbox / with command escalation.
3. Treat GitHub authentication as valid only if the escalated check passes.
4. Treat GitHub authentication as blocked only if the escalated check also fails.

Use this retry rule for preflight, push/PR readiness checks, `gh pr create`,
`gh pr comment`, and any GitHub API calls made through the CLI. Git operations
and `gh` may use different credential stores, so a successful `git push` does
not prove `gh` can open a PR or reply to PR comments.

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
26. Use `gwp-linear-ops` to post a PR-created checkpoint comment to Linear.
27. Stop cleanly and tell the developer to use `gwp-linear-to-pr check PR comments for GWP-XX` or `gwp-linear-to-pr resume workflow for GWP-XX` when they want Codex to inspect PR feedback.

Any workflow execution that edits repository files must not stop with local-only
changes or unpushed commits. After verification and validation pass, the final
code-delivery step is to commit the issue-scoped changes and push the issue
branch to the upstream GitHub repository before reporting completion.

## Manual PR Comment Check

Run this mode when the developer asks to check or review PR comments, or when
resume mode finds an open PR for the issue. This is a one-time check; do not keep
running after the check completes.

Use this helper to fetch PR feedback:

```bash
python3 plugins/gwp-linear-workflow/scripts/gwp_pr_comments.py --issue-id GWP-XX
```

Pass `--handled-id <id>` for every GitHub comment, review, review-thread, or
review-thread-comment ID already recorded in the latest Linear PR-comment
checkpoint.

Comment-check behavior:

1. Fetch top-level PR comments, review submissions, and review threads once.
2. If the PR state is merged or closed, report the final PR state and do not make further code changes.
3. Triage all new comments, including bot/agent comments.
4. Treat resolved or outdated threads as context; do not change code from them unless they contain new comments that require action.
5. If any new comment may require a change, produce a follow-up implementation plan and ask for developer approval.
6. If no code update is needed for a new comment, reply to the original GitHub comment explaining why no change is needed, then post a Linear PR-comment checkpoint with the handled ID.
7. Do not edit files, commit, push, reply on GitHub, or resolve GitHub threads before the developer approves a follow-up plan, except for the explicit no-code-change reply described above.

For approved PR-feedback changes:

1. Spawn the `gwp_developer` agent to implement only the approved follow-up plan.
2. Run `npm test`, `npm run lint`, `npm run typecheck`, and `npm run build`.
3. Commit with the Linear issue ID in the commit message.
4. Spawn the `gwp_validator` agent to validate the updated committed diff.
5. Push the updated branch only after validation returns PASS.
6. Use `gwp-linear-ops` to post a follow-up implementation checkpoint and a PR-comment checkpoint with handled GitHub IDs.
7. Stop cleanly and tell the developer to run `gwp-linear-to-pr check PR comments for GWP-XX` again when they want another one-time check.

## Outbound PR Review

Run this mode when the developer asks Codex to review the PR for a Linear issue,
using prompts such as `review PR for GWP-XX` or `review pull request for GWP-XX`.
This mode posts one top-level PR conversation comment. It is not the same as
`review PR comments`, which triages existing reviewer feedback.

Use this helper to fetch PR review context:

```bash
python3 plugins/gwp-linear-workflow/scripts/gwp_pr_review_context.py --issue-id GWP-XX
```

Review behavior:

1. Fetch the Linear issue and relevant workflow checkpoint comments.
2. Fetch PR metadata, changed files, commits, and diff with the helper.
3. If the PR is merged or closed, report the final PR state and do not post a review comment unless the developer explicitly asks for a post-merge/post-close review.
4. Spawn the `gwp_reviewer` agent in read-only mode with the Linear issue, checkpoints, PR metadata, changed files, and diff.
5. Inspect the reviewer output before posting. It must use this exact top-level structure:
   - `## Codex PR Review for GWP-XX`
   - `Review result: No blocking findings` or `Review result: Findings`
   - `## Findings`
   - `## Test and Validation Notes`
   - `## Risk Notes`
   - `## Follow-ups`
6. Post exactly one top-level PR conversation comment with `gh pr comment --body-file`.
7. Stop cleanly after posting and summarize the PR URL and review result.

Outbound PR review hard rules:

- Do not edit files, commit, push, change Linear status, resolve review threads, or approve/merge the PR.
- Do not ask for approval before posting when the developer explicitly invoked this mode.
- Do not post inline comments or submit an official GitHub review event in version 0.1.
- If the reviewer output is malformed or too vague to be useful, fix the review text in the root session before posting; do not ask the reviewer agent to post it.

## Hard Rules

- Never commit directly to `main`.
- Never create or update a PR if any required verification command fails.
- Never create or update a PR if internal validation fails.
- Never move an issue to `Done`; `Done` means PR merged.
- Never commit secrets or `.env.local`.
- Never stop a code-changing workflow with uncommitted changes or unpushed commits after verification and validation pass.
- Never broaden scope without developer approval.
- Ask questions when requirements are unclear.
