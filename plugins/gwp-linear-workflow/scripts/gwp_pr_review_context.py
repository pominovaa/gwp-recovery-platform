#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import re
import subprocess
import sys
from pathlib import Path
from typing import Any


ROOT = Path.cwd()
EXPECTED_REPO = "olena-ageyeva/gwp-recovery-platform"


def run(command: list[str]) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        command,
        cwd=ROOT,
        capture_output=True,
        text=True,
        check=False,
    )


def run_json(command: list[str]) -> Any:
    result = run(command)
    if result.returncode != 0:
        raise RuntimeError(
            f"Command failed: {' '.join(command)}\n{result.stdout}{result.stderr}".strip()
        )
    try:
        return json.loads(result.stdout)
    except json.JSONDecodeError as error:
        raise RuntimeError(f"Could not parse JSON from {' '.join(command)}: {error}") from error


def run_text(command: list[str]) -> str:
    result = run(command)
    if result.returncode != 0:
        raise RuntimeError(
            f"Command failed: {' '.join(command)}\n{result.stdout}{result.stderr}".strip()
        )
    return result.stdout


def ensure_gh_auth() -> None:
    result = run(["gh", "auth", "status"])
    if result.returncode == 0:
        return

    output = (result.stdout + result.stderr).strip()
    sandbox_hint = (
        "GitHub CLI auth failed. If this command is running inside a Codex "
        "sandbox and the output mentions tokens, keyring, or network, retry the "
        "same command outside the sandbox before asking the developer to run "
        "`gh auth login`."
    )
    raise RuntimeError(f"{output}\n\n{sandbox_hint}")


def parse_repo_from_origin() -> str:
    result = run(["git", "remote", "get-url", "origin"])
    if result.returncode != 0:
        raise RuntimeError((result.stdout + result.stderr).strip())

    remote = result.stdout.strip()
    match = re.search(r"github\.com[:/]([^/]+)/([^/.]+)(?:\.git)?$", remote)
    if not match:
        raise RuntimeError(f"Could not parse GitHub repo from origin: {remote}")

    return f"{match.group(1)}/{match.group(2)}"


def resolve_current_pr_number(repo: str) -> int:
    payload = run_json(["gh", "pr", "view", "--repo", repo, "--json", "number"])
    return int(payload["number"])


def resolve_pr_by_issue(repo: str, issue_id: str) -> int:
    payload = run_json(
        [
            "gh",
            "pr",
            "list",
            "--repo",
            repo,
            "--state",
            "all",
            "--limit",
            "100",
            "--json",
            "number,title,headRefName,state,updatedAt",
        ]
    )
    issue_lower = issue_id.lower()
    matches = [
        pr
        for pr in payload
        if issue_lower in (pr.get("title") or "").lower()
        or issue_lower in (pr.get("headRefName") or "").lower()
    ]
    open_matches = [pr for pr in matches if pr.get("state") == "OPEN"]
    candidates = open_matches or matches

    if not candidates:
        raise RuntimeError(f"No PR found for {issue_id} in {repo}")
    if len(candidates) > 1:
        summary = ", ".join(f"#{pr['number']} {pr['headRefName']}" for pr in candidates)
        raise RuntimeError(f"Multiple PRs found for {issue_id}: {summary}")
    return int(candidates[0]["number"])


def fetch_pr_context(repo: str, pr_number: int) -> dict[str, Any]:
    pr = run_json(
        [
            "gh",
            "pr",
            "view",
            str(pr_number),
            "--repo",
            repo,
            "--json",
            ",".join(
                [
                    "number",
                    "url",
                    "title",
                    "state",
                    "isDraft",
                    "baseRefName",
                    "headRefName",
                    "body",
                    "author",
                    "createdAt",
                    "updatedAt",
                    "mergedAt",
                    "additions",
                    "deletions",
                    "changedFiles",
                    "commits",
                    "labels",
                    "reviewDecision",
                    "mergeable",
                ]
            ),
        ]
    )
    changed_files = run_json(
        [
            "gh",
            "pr",
            "view",
            str(pr_number),
            "--repo",
            repo,
            "--json",
            "files",
        ]
    ).get("files", [])
    diff = run_text(["gh", "pr", "diff", str(pr_number), "--repo", repo])

    return {
        "pull_request": pr,
        "changed_files": changed_files,
        "diff": diff,
    }


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Fetch GWP PR review context.")
    parser.add_argument("--repo", help=f"GitHub repo, defaults to origin ({EXPECTED_REPO}).")
    parser.add_argument("--pr", type=int, help="Pull request number.")
    parser.add_argument("--issue-id", help="Linear issue ID, for example GWP-36.")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    try:
        ensure_gh_auth()
        repo = args.repo or parse_repo_from_origin()
        if repo != EXPECTED_REPO:
            raise RuntimeError(f"Expected {EXPECTED_REPO}, found {repo}")

        if args.pr is not None:
            pr_number = args.pr
        elif args.issue_id:
            pr_number = resolve_pr_by_issue(repo, args.issue_id)
        else:
            pr_number = resolve_current_pr_number(repo)

        payload = fetch_pr_context(repo, pr_number)
        payload["repository"] = repo
        print(json.dumps(payload, indent=2))
        return 0
    except Exception as error:
        print(str(error), file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
