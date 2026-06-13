---
name: gwp-test-and-build
description: "Use this skill to run the required GWP Recovery Platform verification gate before validation or PR creation: npm test, npm run lint, npm run typecheck, and npm run build."
---

# GWP Test and Build Gate

Run focused tests for the changed behavior first. Record the exact command and
result, then run the required commands from the repository root:

```bash
npm test
npm run lint
npm run typecheck
npm run build
```

All four commands must pass after the final code changes and before validation.
For frontend changes, perform a bounded visual check when practical and record
the result; otherwise record the exact reason and residual risk. Do not skip
missing or failing gates. If a command fails, fix the implementation or stop
with the exact failed command and relevant output.
