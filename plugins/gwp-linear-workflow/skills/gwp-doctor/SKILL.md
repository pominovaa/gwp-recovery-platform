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

The helper runs the full required verification gate (`npm test`, `npm run lint`,
`npm run typecheck`, and `npm run build`), so expect it to take about as long as
a normal pre-PR verification run.

Treat failures as blockers for work mode unless the workflow spec explicitly
allows developer-approved risk.
