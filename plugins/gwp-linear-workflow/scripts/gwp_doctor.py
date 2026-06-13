#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import os
import shlex
import shutil
import subprocess
from pathlib import Path
from typing import Any

try:
    import tomllib
except ModuleNotFoundError:
    tomllib = None  # type: ignore[assignment]
    TOMLDecodeError = ValueError
else:
    TOMLDecodeError = tomllib.TOMLDecodeError


ROOT = Path.cwd()
EXPECTED_REMOTE = "github.com/olena-ageyeva/gwp-recovery-platform"
PLUGIN_NAME = "gwp-linear-workflow"
DEFAULT_LINEAR_PROBE_ISSUE = "GWP-26"
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


def resolved_command(command: list[str]) -> list[str]:
    executable = shutil.which(command[0])
    if executable:
        return [executable, *command[1:]]

    if os.name != "nt" and command[0] == "npm":
        nvm_script = Path.home() / ".nvm" / "nvm.sh"
        if nvm_script.is_file():
            command_text = f'. "{nvm_script}"; {shlex.join(command)}'
            return ["bash", "-lc", command_text]

    raise FileNotFoundError(f"{command[0]} was not found on PATH")


def run(command: list[str], timeout: int = 600) -> subprocess.CompletedProcess[str]:
    try:
        return subprocess.run(
            resolved_command(command),
            cwd=ROOT,
            text=True,
            capture_output=True,
            check=False,
            timeout=timeout,
        )
    except (FileNotFoundError, subprocess.TimeoutExpired) as error:
        return subprocess.CompletedProcess(command, 127, "", str(error))


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


def parse_json_output(result: subprocess.CompletedProcess[str], label: str) -> Any:
    if result.returncode != 0:
        raise RuntimeError(compact_output(result))
    try:
        return json.loads(result.stdout)
    except json.JSONDecodeError as error:
        raise RuntimeError(f"{label} returned invalid JSON: {error}") from error


def check_plugin() -> tuple[bool, str, str]:
    result = run(["codex", "plugin", "list", "--json"])
    try:
        payload = parse_json_output(result, "codex plugin list")
    except RuntimeError as error:
        return fail("workflow plugin", str(error))

    installed = payload.get("installed", []) if isinstance(payload, dict) else []
    for plugin in installed:
        if isinstance(plugin, str):
            name = plugin
            enabled = True
        elif isinstance(plugin, dict):
            name = plugin.get("name") or plugin.get("id") or plugin.get("plugin")
            enabled = plugin.get("enabled", True)
        else:
            continue
        if name == PLUGIN_NAME:
            if enabled:
                return ok("workflow plugin", f"{PLUGIN_NAME} installed and enabled")
            return fail(
                "workflow plugin",
                f"{PLUGIN_NAME} is installed but disabled; enable or reinstall the plugin",
            )

    return fail(
        "workflow plugin",
        f"{PLUGIN_NAME} is not installed; run "
        "`codex plugin add gwp-linear-workflow@gwp-recovery-platform`",
    )


def linear_probe_succeeded(output: str, issue_id: str) -> bool:
    marker = f"GWP_LINEAR_PROBE_OK:{issue_id}"
    saw_linear_tool_call = False
    saw_marker = False

    for line in output.splitlines():
        try:
            event = json.loads(line)
        except json.JSONDecodeError:
            continue
        item = event.get("item", {}) if isinstance(event, dict) else {}
        if (
            isinstance(item, dict)
            and item.get("type") == "mcp_tool_call"
            and "linear" in json.dumps(item).lower()
            and item.get("status") in {None, "completed"}
        ):
            saw_linear_tool_call = True
        if (
            isinstance(item, dict)
            and item.get("type") == "agent_message"
            and str(item.get("text", "")).strip() == marker
        ):
            saw_marker = True

    return saw_linear_tool_call and saw_marker


def check_linear_mcp(issue_id: str) -> tuple[bool, str, str]:
    result = run(["codex", "mcp", "list", "--json"])
    try:
        servers = parse_json_output(result, "codex mcp list")
    except RuntimeError as error:
        return fail("Linear MCP", str(error))

    linear = next(
        (
            server
            for server in servers
            if isinstance(server, dict) and server.get("name", "").lower() == "linear"
        ),
        None,
    )
    if linear is None:
        return fail(
            "Linear MCP",
            "linear is not configured; reinstall the workflow plugin and restart Codex",
        )
    if not linear.get("enabled", False):
        return fail("Linear MCP", "linear is configured but disabled")

    auth_status = str(linear.get("auth_status", "")).lower()
    if auth_status == "not_logged_in":
        return fail("Linear MCP", "linear is not authenticated; run `codex mcp login linear`")
    if auth_status not in {"oauth", "bearer_token"}:
        return fail(
            "Linear MCP",
            f"linear authentication is {auth_status or 'unknown'}; "
            "run `codex mcp login linear` and retry",
        )

    marker = f"GWP_LINEAR_PROBE_OK:{issue_id}"
    prompt = (
        f"Use only the configured Linear MCP server to fetch issue {issue_id}. "
        "Do not use shell commands, web search, or edit files. "
        f"If the read succeeds and the returned identifier is exactly {issue_id}, "
        f"reply with exactly {marker}. Otherwise explain the Linear read failure."
    )
    probe = run(
        [
            "codex",
            "exec",
            "--ephemeral",
            "--sandbox",
            "read-only",
            "--json",
            prompt,
        ],
        timeout=180,
    )
    if probe.returncode != 0:
        return fail(
            "Linear MCP",
            "authenticated configuration was found, but the read-only issue probe failed:\n"
            + compact_output(probe),
        )
    if not linear_probe_succeeded(probe.stdout, issue_id):
        return fail(
            "Linear MCP",
            f"the read-only fetch for {issue_id} did not complete through Linear MCP",
        )

    return ok("Linear MCP", f"OAuth authenticated; read-only fetch for {issue_id} passed")


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


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Check GWP workflow readiness.")
    parser.add_argument(
        "--linear-probe-issue",
        default=DEFAULT_LINEAR_PROBE_ISSUE,
        help="Existing Linear issue ID used for the read-only MCP readiness probe.",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    checks = [
        check_remote(),
        check_plugin(),
        check_linear_mcp(args.linear_probe_issue),
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
