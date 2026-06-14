---
name: gwp-doctor
description: "Use this skill to check whether a developer's local environment is ready to run the GWP Recovery Platform Linear-to-PR workflow. It verifies repository remote, Linear MCP, GitHub CLI auth, required npm scripts, required verification commands, and project-scoped Codex agents."
---

# GWP Doctor

Run this skill from the GWP Recovery Platform repository root before the first
workflow run or when setup seems broken.

Use the helper script:

```bash
python3 plugins/gwp-linear-workflow/scripts/gwp_doctor.py
```

If the plugin is installed outside the repository, resolve the script path from
the installed plugin root.

The doctor is read-only with respect to source files and Linear. It must not
change Linear status, create branches, edit files, commit, push, or create PRs.

The helper verifies that the workflow plugin is installed and enabled, checks
structured Linear MCP authentication state, and performs a read-only fetch of
`GWP-26` through Linear MCP. Pass `--linear-probe-issue GWP-XX` to use another
existing issue for that probe.

Commands run natively on Windows so PowerShell-visible `codex`, `gh`, Git, and
npm executables remain available. On Unix, commands also run natively, with an
nvm login-shell fallback only when npm is not already on `PATH`.

The helper also runs the full required verification gate (`npm test`, `npm run
lint`, `npm run typecheck`, and `npm run build`), so expect it to take about as
long as a normal pre-PR verification run.

Treat failures as blockers for work mode unless the workflow spec explicitly
allows developer-approved risk.

If Linear reports `not_logged_in`, run:

```bash
codex mcp login linear
```

The doctor must report `PASS` for both Linear authentication and the read-only
issue probe before the environment is considered ready.

## GitHub CLI sandbox note

If `gh auth status` fails inside Codex with `token is invalid`, `no oauth token
found`, network, or keyring-related output, do not assume the developer's GitHub
login is broken. Codex sandboxes may not be able to access keyring-backed `gh`
credentials or the network.

Before telling the developer to run `gh auth login`, rerun the GitHub CLI check
outside the sandbox / with command escalation. Treat the failure as real only if
the outside-sandbox check also fails.
