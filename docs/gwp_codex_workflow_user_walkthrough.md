# GWP Codex Workflow User Walkthrough

This walkthrough explains how a developer uses the local
`gwp-linear-workflow` Codex plugin to take a Linear issue from `Todo` to a
GitHub pull request.

The canonical technical specification remains
[`gwp_codex_workflow_plugin_spec.md`](./gwp_codex_workflow_plugin_spec.md). This
file is the practical user guide.

Each command is shown in its own fenced code block. In GitHub, VS Code, and most
Markdown viewers, fenced code blocks show a copy icon automatically. The command
blocks intentionally do not include shell prompt characters, so copied commands
can be pasted directly into the terminal.

## 1. Start from the repository root

Open a terminal in the GWP Recovery Platform repository.

If needed, move into the repository:

```bash
cd /home/owner/projects/gwp-recovery-platform
```

Confirm you are on the workflow implementation branch while the workflow plugin
is still being tested before merge:

```bash
git branch --show-current
```

For the current pre-merge workflow test, the branch should be:

```text
gwp-26-linear-to-pr-agentic-workflow
```

## 2. Install the local workflow plugin

Add this repository as a Codex plugin marketplace:

```bash
codex plugin marketplace add ./
```

Install the workflow plugin from that marketplace:

```bash
codex plugin add gwp-linear-workflow@gwp-recovery-platform
```

If Codex reports that the marketplace or plugin is already installed, continue
to the next step.

## 3. Authenticate Linear

Authenticate the bundled Linear MCP server:

```bash
codex mcp login linear
```

This opens a browser OAuth flow. Complete the browser login, then return to the
terminal.

Verify that the Linear MCP server is available:

```bash
codex mcp list
```

The output should include a Linear MCP entry.

## 4. Confirm GitHub access

Check the authenticated GitHub CLI account:

```bash
gh auth status
```

The account must have push and pull-request permissions for:

```text
olena-ageyeva/gwp-recovery-platform
```

Being logged into GitHub is not enough by itself. The authenticated account must
have collaborator access to the upstream repository.

If Codex reports a GitHub CLI auth failure but `gh auth status` passes in your
normal terminal, treat the Codex result as a sandbox/keyring false negative.
Codex should retry GitHub CLI checks outside the sandbox before asking you to
re-authenticate. This can happen because `gh` stores credentials in the desktop
keyring, while a restricted Codex command sandbox may not be able to read that
keyring or reach the network.

## 5. Trust the repository in Codex

Trust this repository in Codex when prompted. The workflow depends on
project-scoped agents committed under:

```text
.codex/agents/
```

If the repository is not trusted, Codex may not load the planning, development,
and validation agents. The workflow can then degrade into a single-session run,
which is not the intended team workflow.

## 6. Run the preflight check

Run the workflow doctor from the repository root:

```bash
python3 plugins/gwp-linear-workflow/scripts/gwp_doctor.py
```

Do not continue until the doctor reports that the repository, Linear MCP,
GitHub CLI, npm scripts, and project agents are ready.

If the doctor reports a failure, fix that item first. Common examples are
missing GitHub access, missing Linear authentication, missing npm scripts, or an
untrusted project.

## 7. Start a Linear issue workflow

Start the workflow from Codex, not from the shell. In the Codex prompt, enter:

```text
gwp-linear-to-pr Work on Linear issue GWP-XX
```

Replace `GWP-XX` with the real Linear issue ID.

For the current smoke test, use:

```text
gwp-linear-to-pr Work on Linear issue GWP-36
```

The workflow should:

1. Confirm it is running in the GWP Recovery Platform repository.
2. Fetch the Linear issue.
3. Run preflight checks.
4. Move the Linear issue from `Todo` to `In Progress`.
5. Create a branch whose name includes the Linear issue ID.
6. Produce an implementation plan and acceptance criteria.

To resume interrupted work, enter:

```text
gwp-linear-to-pr resume workflow for GWP-XX
```

For the current smoke test, enter:

```text
gwp-linear-to-pr resume workflow for GWP-36
```

To monitor an existing PR for new review comments, enter:

```text
gwp-linear-to-pr monitor PR comments for GWP-XX
```

The resume workflow infers the current stage from Linear comments, local and
remote branches, commits, and any open GitHub PR. If an open PR exists, Codex
enters PR review-monitor mode instead of creating a new branch or PR.

## 8. Review and approve the plan

Codex must stop after producing the plan. Read the plan carefully before
allowing implementation.

If the plan is correct, reply in Codex:

```text
Approved
```

After approval, Codex posts the approved plan and acceptance criteria as a
Linear comment. That comment becomes the shared source of truth for
implementation, validation, and the PR body.

If the plan is not correct, do not approve it. Tell Codex what needs to change.

Do not approve a plan that broadens the Linear issue scope or changes auth,
billing, Stripe, Supabase, privacy, or user-data behavior unless that scope is
explicitly intended.

## 9. Let Codex implement and verify

After approval, Codex implements only the approved plan. It must keep the diff
focused on the active Linear issue and add or update tests for behavior changes.

Before PR creation, Codex must run and pass:

```bash
npm test
```

```bash
npm run lint
```

```bash
npm run typecheck
```

```bash
npm run build
```

The commit message must include the Linear issue ID.

## 10. Wait for internal validation

After the implementation commit, the validation agent reviews the committed diff
against:

1. Linear acceptance criteria.
2. Test quality.
3. Auth and authorization risks.
4. Billing, Stripe, and checkout risks.
5. Supabase and data-access risks.
6. Privacy and user-data risks.
7. UI regression risks.
8. Unrelated code changes.
9. Required command results.

Codex must not push or create a PR unless internal validation returns `PASS`.

## 11. Create the PR

Only after tests, lint, typecheck, build, and internal validation pass, Codex may
push the branch and open a GitHub PR.

For normal issues, the PR targets `main`.

For the current smoke-test issue, the PR must target:

```text
gwp-26-linear-to-pr-agentic-workflow
```

The PR body must include:

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

After PR creation, Codex moves the Linear issue to `In Review`.

Codex must not move a Linear issue to `Done`. `Done` means the PR was merged.

## 12. Monitor PR feedback

After PR creation, Codex monitors PR feedback every 10 minutes only while the
current Codex session remains active. This is not a background service. If Codex
sends a final response, the timer is no longer running.

When monitoring is active, Codex should poll immediately, keep the session open,
and report a brief status update after every poll. If Codex stops monitoring, it
must say that monitoring has stopped and give you the resume command.

To resume monitoring later, enter:

```text
gwp-linear-to-pr resume workflow for GWP-XX
```

Codex checks top-level PR comments, review submissions, and inline review
threads. It triages all new comments, including bot/agent comments.

If a comment is informational only, Codex records that it was handled and keeps
monitoring. If a comment may require changes, Codex presents a follow-up plan and
waits for approval before editing code.

Approved PR-feedback changes follow the same gate as the original work:

```bash
npm test
```

```bash
npm run lint
```

```bash
npm run typecheck
```

```bash
npm run build
```

Codex then validates the committed diff, pushes the updated branch only after
validation passes, records a Linear checkpoint, and either continues the active
monitor loop or clearly says monitoring has stopped.

## Smoke-test checklist

For `GWP-36`, confirm these observations:

1. Linear issue moves from `Todo` to `In Progress`.
2. Approved implementation plan is posted as a Linear comment.
3. Branch name includes `GWP-36`.
4. Commit message includes `GWP-36`.
5. Validation returns `PASS` before push or PR creation.
6. PR targets `gwp-26-linear-to-pr-agentic-workflow`.
7. PR body includes the Linear issue, acceptance criteria, verification,
   validation, risk notes, screenshots or preview notes, and follow-ups.
8. Linear issue moves to `In Review` after PR creation.
9. Linear-GitHub integration links the PR to the issue.
10. Resume mode detects PR #7 and the unresolved Copilot review thread.
11. A PR-feedback follow-up plan is presented before any code changes.

Do not merge the sample smoke-test PR into `main`. Close or discard it after
inspection unless the team decides the content change should be kept.

## Hard boundaries

- Do not use Codex cloud agents for this workflow.
- Do not assign Linear issues to `@Codex` as the workflow trigger.
- Do not commit directly to `main`.
- Do not create a PR while any required command is failing.
- Do not create a PR while internal validation is failing.
- Do not apply PR-review feedback before approving a follow-up plan.
- Do not change auth, billing, Stripe, Supabase, privacy, or user-data behavior
  unless that scope is explicitly approved.
- Never commit `.env`, `.env.local`, `.env.production`, `.env.*.local`, private
  keys, access tokens, session secrets, production URLs, or user private data.
