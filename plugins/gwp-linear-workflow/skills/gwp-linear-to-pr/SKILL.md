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

## Claim Gate And Required Preflight

In explicit work mode, claim the issue at the earliest safe point.

Before the first mutation, verify only:

1. The user explicitly requested work mode for a valid GWP issue.
2. `origin` points to `olena-ageyeva/gwp-recovery-platform`.
3. Linear MCP is authenticated and the issue can be fetched.
4. The issue belongs to the expected GWP team/project scope.
5. The issue status is eligible for work.

Then assign the issue to `me` and move an eligible `Todo` issue to `In Progress`,
verifying both writes with the required readback and one-retry procedure. Do
this before planning and before the remaining preflight. If a later check fails,
leave the verified assignment and `In Progress` status in place and report the
partial progress.

After the claim, verify:

1. The workflow targets the upstream repository, not an unrelated fork.
2. GitHub authentication is available for PR creation.
3. The developer can push a branch to the upstream repository.
4. The native Linear GitHub integration is installed for the upstream repository, when observable.
5. `npm test`, `npm run lint`, `npm run typecheck`, and `npm run build` are defined and runnable.
6. The current branch and worktree state are known before branch preparation.

After any required stash is verified, refresh local `main`, create or check out
the intended issue branch, and verify implementation commits will not be made
on `main`.

Read-only explain or plan mode must not claim the issue or mutate Git state.

### Dirty worktree branch preparation

Before checking out a different issue branch:

1. Record the current branch, or `detached-head`.
2. Inspect visible changed paths for prohibited secret files such as `.env`,
   `.env.local`, `.env.production`, and `.env.*.local`. Stop without stashing
   those files if any are present.
3. If tracked or untracked changes exist, run:

   ```bash
   git stash push --include-untracked \
     -m "gwp-linear-to-pr: pre-branch gwp-xx source-branch=<branch> at <UTC timestamp>"
   ```

4. Substitute the exact branch recorded in step 1 for `<branch>`; do not derive
   it after the stash or after checkout. Verify a new stash exists with the
   expected lowercase issue ID, exact `source-branch=<branch>` value, and UTC
   timestamp in its message; capture the exact stash ref. For detached HEAD,
   the complete message is
   `gwp-linear-to-pr: pre-branch gwp-xx source-branch=detached-head at <UTC
   timestamp>`.
5. Verify `git status --porcelain` is empty before checkout.
6. Leave the stash intact and report its ref and message. Never pop or apply it
   to the issue branch automatically.

`--include-untracked` excludes ignored files. If stashing or verification fails,
stop before checkout and report that the issue remains claimed and `In Progress`.
Report the exact pre-stash source branch, expected full stash message, any
created stash ref and actual message, remaining dirty paths, exact failure, and
exact recovery step.
Do not automatically stash resume work when already on the intended issue
branch; those changes may belong to the active issue.

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
4. Read identifier, exact title, description, comments, labels, priority,
   status, assignee, `gitBranchName`, and acceptance criteria.
5. If issue status is not `Todo`, warn the developer and ask whether to continue.
6. If the issue is `Backlog`, `Canceled`, or `Duplicate`, stop unless the developer explicitly overrides.
7. Run the minimal claim gate above.
8. Use `gwp-linear-ops` to resolve the issue team's workflow state IDs before changing Linear status. Never hardcode Linear state IDs.
9. Use `gwp-linear-ops` to assign the issue to `me`, re-fetch it, and confirm
   the assignee before branch or code work.
10. Use `gwp-linear-ops` to move an eligible `Todo` issue to `In Progress`, re-fetch it,
    and confirm the actual status. Retry once; if verification still fails, stop
    with a partial-success summary.
11. Run the remaining preflight above. Do not roll back the claim if a later
    check fails.
12. Confirm the exact Linear issue identifier and title before naming the branch
    or PR.
13. Apply the dirty-worktree branch preparation rules before switching away
    from the current branch.
14. Create the branch from fresh `main`. Use Linear `gitBranchName` exactly when
    it is present. Otherwise create
    `<owner>/<issue-key-lower>-<short-title-slug>`.
15. Spawn the `gwp_planner` agent in read-only mode.
16. Present the implementation plan and acceptance criteria to the developer.
17. Wait for explicit developer approval before editing code.
18. After approval, use `gwp-linear-ops` to post the approved plan and acceptance criteria as a Linear comment.
19. Spawn the `gwp_developer` agent to inspect related code and tests before
    implementing the approved plan.
20. Require tests to be added or updated for behavior changes. For defects,
    require root-cause and prevention notes plus regression coverage.
21. Run targeted tests for changed behavior first.
22. Run `npm test`, `npm run lint`, `npm run typecheck`, and `npm run build`.
    For frontend changes, perform bounded visual validation when practical and
    record the result or exact reason it was skipped.
23. If verification fails, repair up to 3 cycles, then stop with a summary.
24. Commit changes on the issue branch with the Linear issue ID in the commit message.
25. Spawn the `gwp_validator` agent in read-only mode to review `git diff main...HEAD`.
26. If validation fails, return findings to development, repair, recommit, rerun verification, and validate again, up to 3 cycles.
27. Do not push or create a PR unless validation returns PASS.
28. Push the issue branch to the upstream repository.
29. Create a GitHub PR titled `<ISSUE-ID>: <exact Linear title>` with the
    required PR body sections.
30. Use `gwp-linear-ops` to move the Linear issue to `In Review`, re-fetch it,
    and confirm the actual status. Retry once; if it remains incorrect, report
    the PR as partial success instead of claiming workflow completion.
31. Use `gwp-linear-ops` to post a PR-created checkpoint containing the
    confirmed fetched Linear status.
32. Stop cleanly and tell the developer to use `gwp-linear-to-pr check PR comments for GWP-XX` or `gwp-linear-to-pr resume workflow for GWP-XX` when they want Codex to inspect PR feedback.

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

1. Fetch top-level PR comments, review submissions, review threads, review
   decision, mergeability, and CI/check status once.
2. If the PR state is merged or closed, report the final PR state and do not make further code changes.
3. Triage all new comments, including bot/agent comments.
4. Treat resolved or outdated threads as context; do not change code from them
   unless they contain new comments that require action. Outdated state alone is
   never evidence that an unresolved thread may be resolved.
5. Report pending or failing CI checks as blockers even when no new review
   comment requires code changes. Do not describe the PR as clean or ready while
   checks are pending or failing.
6. If any new comment may require a change, produce a follow-up implementation plan and ask for developer approval.
7. If no code update is needed for a new comment, reply to the original GitHub
   comment explaining why no change is needed. For an inline thread, it may be
   automatically resolved without a follow-up approval cycle only after the
   guarded resolution checks below pass against the current validated head. Use
   `--require-reply-thread-id` for this path. Top-level comments and review
   submissions cannot be resolved.
8. For feedback that may require a code change, do not edit files, commit, push,
   reply on GitHub, or resolve GitHub threads before the developer approves the
   follow-up plan.

For approved PR-feedback changes:

1. Spawn the `gwp_developer` agent to implement only the approved follow-up plan.
2. Run `npm test`, `npm run lint`, `npm run typecheck`, and `npm run build`.
3. Commit with the Linear issue ID in the commit message.
4. Spawn the `gwp_validator` agent to validate the updated committed diff.
5. Push the updated branch only after validation returns PASS.
6. Wait for the pushed head's required GitHub checks to pass, then re-fetch the
   target inline threads. Resolve only threads whose approved finding is
   directly addressed by that exact head and whose external comment IDs are all
   handled. A newer external comment blocks resolution.
7. Require a newer evidence reply from the authenticated GitHub user before
   resolving human-authored threads or any thread handled without a code change.
8. Run the resolver without `--resolve` first and inspect its eligibility output,
   then run it with `--validation-passed --resolve`. The helper verifies the PR
   is open, the expected head is current, checks are passing, no newer external
   comment exists, and every resolution write succeeds on readback:

```bash
python3 plugins/gwp-linear-workflow/scripts/gwp_resolve_threads.py \
  --issue-id GWP-XX \
  --expected-head <commit-sha> \
  --thread-id <thread-id> \
  --handled-comment-id <comment-id> \
  --addressed-thread-id <thread-id>
```

Add `--require-reply-thread-id <thread-id>` when the evidence-reply safeguard
applies. Add `--validation-passed --resolve` only after the dry run is eligible.
Never use the helper in outbound review mode.

9. Use `gwp-linear-ops` to post a follow-up implementation checkpoint and a
   PR-comment checkpoint with handled GitHub IDs, resolved thread IDs, and
   resolution outcomes.
10. Stop cleanly and tell the developer to run `gwp-linear-to-pr check PR comments for GWP-XX` again when they want another one-time check.

If a resolution mutation or readback fails, stop further resolution writes,
leave already-completed resolutions intact, and report the resolved, failed, and
not-attempted thread IDs as partial progress. Do not roll back the pushed code.

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
2. Fetch PR metadata, changed files, commits, diff, CI status, existing comments,
   reviews, authenticated GitHub user, and existing canonical review-comment
   candidates with the helper.
3. If the PR is merged or closed, report the final PR state and do not post a review comment unless the developer explicitly asks for a post-merge/post-close review.
4. Read changed files in full plus relevant surrounding modules and tests, then
   spawn the `gwp_reviewer` agent in read-only mode with that context.
5. Inspect the reviewer output before posting. It must use this exact top-level structure:
   - `AI-generated review note`
   - `## Codex PR Review for GWP-XX`
   - `Review result: No blocking findings` or `Review result: Findings`
   - `## Findings`
   - `## Test and Validation Notes`
   - `## Risk Notes`
   - `## Follow-ups`
6. Include every command actually run with its exact passed, failed, skipped, or
   timed-out result. Do not imply a command ran when relying only on PR evidence.
7. Before writing, inspect `existing_review_comment_candidates`:
   - zero candidates: create one top-level comment
   - one candidate: update that comment instead of posting another
   - multiple candidates: stop and report duplicates instead of adding more
8. Never edit another GitHub user's comment and never delete duplicate comments
   without explicit developer approval.
9. Stop cleanly after posting or updating and summarize the PR URL and review result.

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
- Never report a Linear assignment or status transition as successful until a
  re-fetch confirms it.
- Never commit secrets or `.env.local`.
- Never stop a code-changing workflow with uncommitted changes or unpushed commits after verification and validation pass.
- Never broaden scope without developer approval.
- Ask questions when requirements are unclear.
