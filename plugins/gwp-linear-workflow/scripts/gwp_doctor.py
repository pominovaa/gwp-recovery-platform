#!/usr/bin/env python3
from __future__ import annotations

import json
import os
import shlex
import subprocess
from pathlib import Path

try:
    import tomllib
except ModuleNotFoundError:
    tomllib = None  # type: ignore[assignment]
    TOMLDecodeError = ValueError
else:
    TOMLDecodeError = tomllib.TOMLDecodeError


ROOT = Path.cwd()
EXPECTED_REMOTE = "github.com/olena-ageyeva/gwp-recovery-platform"
REQUIRED_SCRIPTS = ["test", "lint", "typecheck", "build"]
REQUIRED_COMMANDS = [
    ["npm", "test"],
    ["npm", "run", "lint"],
    ["npm", "run", "typecheck"],
    ["npm", "run", "build"],
]
REQUIRED_AGENTS = {
    "gwp-planner.toml": {"name": "gwp_planner", "sandbox_mode": "read-only"},
    "gwp-developer.toml": {"name": "gwp_developer"},
    "gwp-validator.toml": {"name": "gwp_validator", "sandbox_mode": "read-only"},
    "gwp-reviewer.toml": {"name": "gwp_reviewer", "sandbox_mode": "read-only"},
}


def run(command: list[str], timeout: int = 600) -> subprocess.CompletedProcess[str]:
    # Match an interactive shell closely enough that Codex and gh find the same auth/config.
    command_text = (
        'if ! command -v npm >/dev/null 2>&1 && [ -s "$HOME/.nvm/nvm.sh" ]; '
        'then . "$HOME/.nvm/nvm.sh"; fi; '
        + shlex.join(command)
    )
    return subprocess.run(
        ["bash", "-lc", command_text],
        cwd=ROOT,
        text=True,
        capture_output=True,
        check=False,
        timeout=timeout,
    )


def ok(label: str, detail: str = "") -> tuple[bool, str, str]:
    return True, label, detail


def fail(label: str, detail: str = "") -> tuple[bool, str, str]:
    return False, label, detail


def compact_output(result: subprocess.CompletedProcess[str]) -> str:
    output = (result.stdout + result.stderr).strip()
    return output[-1200:] if len(output) > 1200 else output


def check_remote() -> tuple[bool, str, str]:
    result = run(["git", "remote", "get-url", "origin"])
    remote = result.stdout.strip()
    if result.returncode == 0 and EXPECTED_REMOTE in remote:
        return ok("git remote", remote)
    return fail("git remote", remote or compact_output(result))


def check_linear_mcp() -> tuple[bool, str, str]:
    result = run(["codex", "mcp", "list"])
    output = result.stdout + result.stderr
    has_linear = "linear" in output and "enabled" in output
    has_oauth = "OAuth" in output
    if result.returncode == 0 and has_linear and has_oauth:
        return ok("Linear MCP", "linear enabled with OAuth")
    if result.returncode == 0 and has_linear:
        return fail("Linear MCP", "linear is enabled, but OAuth auth was not confirmed")
    return fail("Linear MCP", compact_output(result))


def check_gh_auth() -> tuple[bool, str, str]:
    result = run(["gh", "auth", "status"])
    if result.returncode == 0:
        return ok("GitHub CLI auth", "gh auth status passed")

    output = compact_output(result)
    sandbox_network_disabled = os.environ.get("CODEX_SANDBOX_NETWORK_DISABLED") == "1"
    sandbox_markers = [
        "token in default is invalid",
        "no oauth token found",
        "could not resolve host",
        "network",
        "keyring",
    ]
    if sandbox_network_disabled or any(marker in output.lower() for marker in sandbox_markers):
        return fail(
            "GitHub CLI auth",
            output
            + "\n\n"
            + "This can be a Codex sandbox false negative when gh stores credentials "
            + "in the desktop keyring or when sandbox network is disabled. Before "
            + "re-authenticating, rerun `gh auth status` in a normal terminal or ask "
            + "Codex to retry the GitHub CLI check outside the sandbox. Treat this as "
            + "a real auth blocker only if the outside-sandbox check also fails.",
        )
    return fail("GitHub CLI auth", output)


def check_package_scripts() -> tuple[bool, str, str]:
    package_path = ROOT / "package.json"
    if not package_path.exists():
        return fail("npm scripts", "package.json is missing")

    scripts = json.loads(package_path.read_text()).get("scripts", {})
    missing = [script for script in REQUIRED_SCRIPTS if script not in scripts]
    if missing:
        return fail("npm scripts", "missing: " + ", ".join(missing))
    return ok("npm scripts", ", ".join(REQUIRED_SCRIPTS))


def check_verification_commands() -> tuple[bool, str, str]:
    failures: list[str] = []
    for command in REQUIRED_COMMANDS:
        result = run(command)
        if result.returncode != 0:
            failures.append(f"{shlex.join(command)} failed:\n{compact_output(result)}")

    if failures:
        return fail("verification commands", "\n\n".join(failures))
    return ok("verification commands", "npm test, lint, typecheck, and build passed")


def check_agents() -> tuple[bool, str, str]:
    agent_root = ROOT / ".codex" / "agents"
    failures: list[str] = []

    for filename, expected in REQUIRED_AGENTS.items():
        path = agent_root / filename
        if not path.exists():
            failures.append(f"missing {path}")
            continue

        try:
            if tomllib is None:
                raise RuntimeError(
                    "Python 3.11+ is required to read project agent TOML files. "
                    "Run this doctor with Python 3.11+ or install a TOML parser "
                    "and update the script to use it."
                )
            data = tomllib.loads(path.read_text())
        except RuntimeError as error:
            failures.append(str(error))
            break
        except TOMLDecodeError as error:
            failures.append(f"{path} is invalid TOML: {error}")
            continue

        for key in ["name", "description", "developer_instructions"]:
            if key not in data:
                failures.append(f"{path} missing {key}")

        for key, value in expected.items():
            if data.get(key) != value:
                failures.append(f"{path} expected {key}={value!r}, found {data.get(key)!r}")

    if failures:
        return fail("project agents", "; ".join(failures))

    return ok(
        "project agents",
        "agent files are present and valid TOML; confirm repo trust in Codex UI/IDE",
    )


def main() -> int:
    checks = [
        check_remote(),
        check_linear_mcp(),
        check_gh_auth(),
        check_package_scripts(),
        check_verification_commands(),
        check_agents(),
    ]

    for passed, label, detail in checks:
        marker = "PASS" if passed else "FAIL"
        suffix = f" - {detail}" if detail else ""
        print(f"[{marker}] {label}{suffix}")

    return 0 if all(passed for passed, _, _ in checks) else 1


if __name__ == "__main__":
    raise SystemExit(main())
