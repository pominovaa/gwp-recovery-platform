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

Windows note: These examples use POSIX-style paths and command syntax. On
Windows, use Git Bash as the closest match, or use PowerShell with Windows paths
such as `C:\Users\<you>\projects\gwp-recovery-platform`.

## 1. Start from the repository root

Open a terminal in the GWP Recovery Platform repository.

If needed, move into the repository:

```bash
cd /your/path/to/projects/gwp-recovery-platform
```

Windows PowerShell alternative:

```powershell
Set-Location C:\Users\<you>\projects\gwp-recovery-platform
```

Confirm the current branch when needed:

```bash
git branch --show-current
```

The workflow creates or resumes issue branches later. Do not run implementation
commits directly on `main`.

## 2. Install the local workflow plugin

Add this repository as a Codex plugin marketplace:

```bash
codex plugin marketplace add ./
```

Windows PowerShell alternative:

```powershell
codex plugin marketplace add .
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

Windows note: GitHub CLI credentials may be stored in Windows Credential Manager.
If Codex cannot read those credentials but `gh auth status` passes in PowerShell
or Git Bash, treat it as the same sandbox/keyring false negative.

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

Windows note: Use `py -3` or `python` instead of `python3` if that is the Python
3 command available in your terminal.

```bash
python3 plugins/gwp-linear-workflow/scripts/gwp_doctor.py
```

Windows PowerShell alternative:

```powershell
py -3 .\plugins\gwp-linear-workflow\scripts\gwp_doctor.py
```

The doctor runs commands natively on Windows, so it uses the same PowerShell
`PATH` entries for `codex`, `gh`, Git, and npm. It verifies that the workflow
plugin is installed and enabled, confirms structured Linear OAuth state, and
performs a read-only fetch of `GWP-26`. To use another existing issue:

```powershell
py -3 .\plugins\gwp-linear-workflow\scripts\gwp_doctor.py --linear-probe-issue GWP-XX
```

Do not continue until the doctor reports that the plugin, repository, Linear
MCP authentication and issue probe, GitHub CLI, npm scripts, verification
commands, and project agents are ready.

If the doctor reports a failure, fix that item first. Common examples are
missing GitHub access, missing Linear authentication, missing npm scripts, or an
untrusted project. If it reports `linear is not authenticated`, run:

```bash
codex mcp login linear
```

## 7. Start a Linear issue workflow

Start the workflow from Codex, not from the shell. In the Codex prompt, enter:

```text
gwp-linear-to-pr Work on Linear issue GWP-XX
```

Replace `GWP-XX` with the real Linear issue ID.

The workflow should:

1. Confirm it is running in the GWP Recovery Platform repository.
2. Fetch the Linear issue.
3. Run preflight checks.
4. Assign the issue to the current developer and verify the assignment by
   re-fetching the issue.
5. Move the Linear issue from `Todo` to `In Progress` and verify the returned
   status by re-fetching it.
6. Confirm the exact issue identifier and title.
7. Create the branch from Linear `gitBranchName` when present; otherwise use the
   documented owner/issue/title fallback.
8. Produce an implementation plan and acceptance criteria after reading related
   code and tests.

To resume interrupted work, enter:

```text
gwp-linear-to-pr resume workflow for GWP-XX
```

To check an existing PR once for new review comments, enter:

```text
gwp-linear-to-pr check PR comments for GWP-XX
```

To have Codex review the PR itself and post one top-level PR comment, enter:

```text
gwp-linear-to-pr review PR for GWP-XX
```

The resume workflow infers the current stage from Linear comments, local and
remote branches, commits, and any open GitHub PR. If an open PR exists, Codex
runs the same one-time PR comment check instead of creating a new branch or PR.

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

Codex first runs targeted tests for the changed behavior. Before PR creation, it
must then run and pass:

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

For defects, the PR must include root-cause and prevention notes plus focused
regression coverage. For frontend changes, Codex performs a bounded visual check
when practical and records either the result or the exact reason it was skipped.

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
push the branch and open a GitHub PR. Any workflow path that changes code must
commit the changes and push the issue branch to GitHub before it reports
completion.

For normal issues, the PR targets `main`.

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

After PR creation, Codex moves the Linear issue to `In Review`, immediately
re-fetches it, and retries the write once if the returned status does not match.
If the second readback still differs, Codex reports the PR as partial success
with the intended and actual statuses instead of claiming completion.

Codex must not move a Linear issue to `Done`. `Done` means the PR was merged.

## 12. Check PR feedback

After PR creation, Codex stops cleanly. When you want Codex to inspect PR
feedback, run a manual one-time check:

```text
gwp-linear-to-pr check PR comments for GWP-XX
```

You can also resume the workflow, which performs the same one-time PR comment
check if an open PR exists:

```text
gwp-linear-to-pr resume workflow for GWP-XX
```

Codex checks top-level PR comments, review submissions, inline review threads,
review decision, mergeability, and CI/check status. It triages all new comments,
including bot/agent comments, and does not describe a PR as ready while checks
are pending or failing.

If no code update is needed for a comment, Codex replies to the original GitHub
comment explaining why no change is needed and records the handled ID in Linear.
If a comment may require changes, Codex presents a follow-up plan and waits for
approval before editing code.

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
validation passes, records a Linear checkpoint, and stops cleanly. Run another
manual PR comment check later if more feedback arrives.

If the PR is merged or closed, Codex reports the final PR state and does not make
more code changes. Codex still does not move Linear to `Done`; merge completion
remains handled by Linear-GitHub integration or humans.

## 13. Ask Codex to review the PR

To publish a Codex-authored review after the PR exists, run:

```text
gwp-linear-to-pr review PR for GWP-XX
```

Codex resolves the PR from the Linear issue, fetches PR metadata, changed files,
commits, diff and CI context, existing comments/reviews, and prior canonical
review candidates. It reads changed files in full with relevant surrounding
modules and tests, then runs the read-only Reviewer Agent.

The comment begins with `AI-generated review note` followed by
`## Codex PR Review for GWP-XX`. The first run creates one top-level comment; a
later run by the same GitHub user updates that canonical comment. If multiple
canonical candidates exist, Codex stops and reports the duplicates instead of
posting another. It never edits another user's comment or deletes comments
without explicit approval.

This is not the same as `review PR comments`. It does not triage existing
reviewer feedback, edit files, change Linear status, post inline comments,
approve the PR, or submit an official GitHub review event.

## Workflow checklist

For any issue, confirm these observations:

1. Linear issue moves from `Todo` to `In Progress`.
2. Approved implementation plan is posted as a Linear comment.
3. Branch name includes `GWP-XX`.
4. Commit message includes `GWP-XX`.
5. Validation returns `PASS` before push or PR creation.
6. PR targets the intended upstream base branch.
7. PR body includes the Linear issue, acceptance criteria, verification,
   validation, risk notes, screenshots or preview notes, and follow-ups.
8. Linear issue moves to `In Review` after PR creation.
9. Linear-GitHub integration links the PR to the issue.
10. Resume mode detects the linked PR and any unhandled review feedback.
11. A PR-feedback follow-up plan is presented before any code changes.

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
