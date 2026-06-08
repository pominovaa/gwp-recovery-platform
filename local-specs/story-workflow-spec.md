# Story Workflow Spec

Use this workflow for every Linear story or defect from intake through PR closure.

## 1. Pull, Assign, And Start The Issue

1. Pull the Linear issue by identifier, for example `GWP-37`.
2. Before reading code, editing files, switching branches, or creating a story branch, assign the issue to the person doing the work.
3. Move the issue to `In Progress`.
4. Confirm the assignment and `In Progress` status update succeeded.
5. Read the full issue title, description, acceptance criteria, comments, labels, priority, assignee, project, and status.
6. If the issue is a defect, capture the reported behavior, expected behavior, reproduction notes, affected route/component, and any existing screenshots.
7. Confirm the exact working issue key and title before naming the branch or PR.

## 2. Start From Latest Main

1. Run `git status -sb`.
2. Confirm the worktree is clean, or explicitly identify unrelated local changes and keep them out of the story.
3. Switch to `main`.
4. Pull the latest changes for `main`.
5. If switching or pulling is blocked by local changes, stop and resolve the branch state before reading, coding, or creating a story branch.

## 3. Prepare The Branch

1. Run `git status -sb`.
2. Confirm the worktree is clean, or explicitly identify unrelated local changes and keep them out of the story.
3. Confirm the current branch is `main` and includes the latest pulled changes.
4. Create a new branch from `main`.
5. Branch format:

```text
<owner-or-initials>/<issue-key>-<short-kebab-case-story-title>
```

Example:

```text
eageeva/gwp-37-defect-heal-page-does-not-load-as-expected
```

## 4. Read Code And Tests Before Coding

1. Find the route, component, service, or module named in the issue.
2. Read existing related code before editing.
3. Read existing tests that cover the behavior.
4. Identify the narrowest implementation path that follows current app patterns.
5. Avoid unrelated redesigns, refactors, dependency changes, or cleanup.

## 5. Implement The Story

1. Preserve current visual styling unless the issue explicitly asks for a style change.
2. Prefer existing shared components, helpers, tokens, and patterns.
3. Centralize reusable logic or styling only when it removes real duplication or matches an established pattern.
4. Do not introduce abstractions that change behavior outside the issue scope.
5. Keep changes limited to files required for the story.

## 6. Defect Requirements

For defects, do all of the following:

1. Identify the root cause before or during the fix.
2. Document the root cause in the PR body.
3. Explain what changed to fix the defect.
4. Add or update focused tests that protect the corrected behavior.
5. Make sure tests cover the regression risk, not only the happy-path text or render output.
6. If the defect is visual, add tests for stable styling hooks, shared component usage, or DOM structure where practical.
7. If a visual test cannot be automated, document the manual visual comparison in the PR body.

## 7. Validation

Run validation appropriate to the change:

1. Run targeted tests for changed behavior.
2. Run the full test suite.
3. Run the production build.
4. For frontend changes, do a local visual check of affected pages and compare against the pre-change behavior.
5. If any required validation cannot be run, document the exact reason and the residual risk in the PR body.

Use bounded commands and avoid leaving persistent local processes running. Do not start dev servers unless visual validation requires it.

## 8. Commit

1. Run `git status -sb`.
2. Confirm only intended files are changed.
3. Stage only the story files.
4. Commit with a concise message.

Example:

```text
Fix heal page styling
```

## 9. Push And Create PR

1. Push the branch.
2. Create a non-draft PR.
3. PR title format:

```text
<ISSUE-KEY>: <exact Linear issue title>
```

Example:

```text
GWP-37: Defect: /heal page does not load as expected
```

4. PR body must include:
   - Summary
   - Root cause, for defects
   - Prevention, for defects
   - Validation
   - Linear issue reference

## 10. Move Linear To Review

Only after an actual PR URL exists:

1. Add the PR link to Linear if useful.
2. Move the Linear issue to `In Review`.
3. Do not claim review status if the Linear update fails.

## 11. Check PR Comments

1. Check GitHub PR review comments, unresolved threads, and CI status.
2. Address actionable comments with focused commits.
3. Rerun relevant validation after changes.
4. Push follow-up commits to the same branch.
5. Keep Linear updated if review comments materially change scope or status.

## 12. Close Or Merge PR

1. Confirm CI is passing or document any approved exceptions.
2. Confirm required reviews are complete.
3. Merge the PR using the project-approved merge strategy, or close it only if the work is intentionally abandoned.
4. After merge, move the Linear issue to `Done`.
5. If the PR is closed without merge, do not move the issue to `Done`; update Linear with the reason and next step.

## 13. Improve This Instruction

At the end of the story workflow, review whether these instructions caused confusion, missed a required team step, or could prevent a repeated mistake.

1. If the workflow should be clearer or more complete, update `local-specs/story-workflow-spec.md`.
2. Keep instruction changes small, actionable, and grounded in what happened during the story.
3. If the instruction update is unrelated to the product change, call it out separately in the final response.
4. If no instruction improvement is needed, say so in the final response.

## 14. Final Response Checklist

Report:

1. PR URL.
2. Branch name.
3. Commit hash or summary.
4. Validation results.
5. Linear status update result.
6. Any skipped validation or blocked follow-up.
7. Whether `local-specs/story-workflow-spec.md` was improved or did not need changes.
