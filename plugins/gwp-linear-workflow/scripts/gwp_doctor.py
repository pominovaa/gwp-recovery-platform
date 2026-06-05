#!/usr/bin/env python3
from __future__ import annotations

import json
import subprocess
from pathlib import Path


ROOT = Path.cwd()
EXPECTED_REMOTE = "github.com/olena-ageyeva/gwp-recovery-platform"
REQUIRED_SCRIPTS = ["test", "lint", "typecheck", "build"]
REQUIRED_AGENTS = [
    ROOT / ".codex" / "agents" / "gwp-planner.toml",
    ROOT / ".codex" / "agents" / "gwp-developer.toml",
    ROOT / ".codex" / "agents" / "gwp-validator.toml",
]


def run(command: list[str]) -> subprocess.CompletedProcess[str]:
    return subprocess.run(command, cwd=ROOT, text=True, capture_output=True, check=False)


def ok(label: str, detail: str = "") -> tuple[bool, str, str]:
    return True, label, detail


def fail(label: str, detail: str = "") -> tuple[bool, str, str]:
    return False, label, detail


def check_remote() -> tuple[bool, str, str]:
    result = run(["git", "remote", "get-url", "origin"])
    remote = result.stdout.strip()
    if result.returncode == 0 and EXPECTED_REMOTE in remote:
        return ok("git remote", remote)
    return fail("git remote", remote or result.stderr.strip())


def check_linear_mcp() -> tuple[bool, str, str]:
    result = run(["codex", "mcp", "list"])
    output = result.stdout + result.stderr
    if result.returncode == 0 and "linear" in output and "enabled" in output:
        auth = "OAuth" if "OAuth" in output else "auth status not confirmed by subprocess"
        return ok("Linear MCP", f"linear enabled; {auth}")
    return fail("Linear MCP", output.strip())


def check_gh_auth() -> tuple[bool, str, str]:
    result = run(["gh", "auth", "status"])
    output = result.stdout + result.stderr
    if result.returncode == 0:
        return ok("GitHub CLI auth", "gh auth status passed")
    return fail("GitHub CLI auth", output.strip())


def check_package_scripts() -> tuple[bool, str, str]:
    package_path = ROOT / "package.json"
    if not package_path.exists():
        return fail("npm scripts", "package.json is missing")

    scripts = json.loads(package_path.read_text()).get("scripts", {})
    missing = [script for script in REQUIRED_SCRIPTS if script not in scripts]
    if missing:
        return fail("npm scripts", "missing: " + ", ".join(missing))
    return ok("npm scripts", ", ".join(REQUIRED_SCRIPTS))


def check_agents() -> tuple[bool, str, str]:
    missing = [str(path) for path in REQUIRED_AGENTS if not path.exists()]
    if missing:
        return fail("project agents", "missing: " + ", ".join(missing))
    return ok("project agents", ".codex/agents files found")


def main() -> int:
    checks = [
        check_remote(),
        check_linear_mcp(),
        check_gh_auth(),
        check_package_scripts(),
        check_agents(),
    ]

    for passed, label, detail in checks:
        marker = "PASS" if passed else "FAIL"
        suffix = f" - {detail}" if detail else ""
        print(f"[{marker}] {label}{suffix}")

    return 0 if all(passed for passed, _, _ in checks) else 1


if __name__ == "__main__":
    raise SystemExit(main())
