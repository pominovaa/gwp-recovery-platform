#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import re
import subprocess
import sys
from pathlib import Path
from typing import Any

from gwp_pr_utils import issue_key_matches


ROOT = Path.cwd()
EXPECTED_REPO = "olena-ageyeva/gwp-recovery-platform"

QUERY = """\
query(
  $owner: String!,
  $repo: String!,
  $number: Int!,
  $commentsCursor: String,
  $reviewsCursor: String,
  $threadsCursor: String
) {
  repository(owner: $owner, name: $repo) {
    pullRequest(number: $number) {
      number
      url
      title
      state
      isDraft
      baseRefName
      headRefName
      updatedAt
      mergedAt

      comments(first: 100, after: $commentsCursor) {
        pageInfo { hasNextPage endCursor }
        nodes {
          id
          body
          createdAt
          updatedAt
          author { login }
        }
      }

      reviews(first: 100, after: $reviewsCursor) {
        pageInfo { hasNextPage endCursor }
        nodes {
          id
          state
          body
          submittedAt
          author { login }
        }
      }

      reviewThreads(first: 100, after: $threadsCursor) {
        pageInfo { hasNextPage endCursor }
        nodes {
          id
          isResolved
          isOutdated
          path
          line
          diffSide
          startLine
          startDiffSide
          originalLine
          originalStartLine
          resolvedBy { login }
          comments(first: 100) {
            nodes {
              id
              body
              createdAt
              updatedAt
              author { login }
            }
          }
        }
      }
    }
  }
}
"""


def run(command: list[str], stdin: str | None = None) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        command,
        cwd=ROOT,
        input=stdin,
        capture_output=True,
        text=True,
        check=False,
    )


def run_json(command: list[str], stdin: str | None = None) -> Any:
    result = run(command, stdin=stdin)
    if result.returncode != 0:
        raise RuntimeError(
            f"Command failed: {' '.join(command)}\n{result.stdout}{result.stderr}".strip()
        )
    try:
        return json.loads(result.stdout)
    except json.JSONDecodeError as error:
        raise RuntimeError(f"Could not parse JSON from {' '.join(command)}: {error}") from error


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
    matches = [
        pr
        for pr in payload
        if issue_key_matches(issue_id, pr.get("title") or "")
        or issue_key_matches(issue_id, pr.get("headRefName") or "")
    ]
    open_matches = [pr for pr in matches if pr.get("state") == "OPEN"]
    candidates = open_matches or matches

    if not candidates:
        raise RuntimeError(f"No PR found for {issue_id} in {repo}")
    if len(candidates) > 1:
        summary = ", ".join(f"#{pr['number']} {pr['headRefName']}" for pr in candidates)
        raise RuntimeError(f"Multiple PRs found for {issue_id}: {summary}")
    return int(candidates[0]["number"])


def fetch_page(
    owner: str,
    repo: str,
    number: int,
    comments_cursor: str | None,
    reviews_cursor: str | None,
    threads_cursor: str | None,
) -> dict[str, Any]:
    command = [
        "gh",
        "api",
        "graphql",
        "-F",
        "query=@-",
        "-F",
        f"owner={owner}",
        "-F",
        f"repo={repo}",
        "-F",
        f"number={number}",
    ]
    if comments_cursor:
        command += ["-F", f"commentsCursor={comments_cursor}"]
    if reviews_cursor:
        command += ["-F", f"reviewsCursor={reviews_cursor}"]
    if threads_cursor:
        command += ["-F", f"threadsCursor={threads_cursor}"]

    return run_json(command, stdin=QUERY)


def fetch_all(repo: str, number: int) -> dict[str, Any]:
    owner, repo_name = repo.split("/", 1)
    conversation_comments: list[dict[str, Any]] = []
    reviews: list[dict[str, Any]] = []
    review_threads: list[dict[str, Any]] = []
    pr_meta: dict[str, Any] | None = None

    comments_cursor: str | None = None
    reviews_cursor: str | None = None
    threads_cursor: str | None = None

    while True:
        payload = fetch_page(
            owner,
            repo_name,
            number,
            comments_cursor,
            reviews_cursor,
            threads_cursor,
        )
        if payload.get("errors"):
            raise RuntimeError(json.dumps(payload["errors"], indent=2))

        pr = payload["data"]["repository"]["pullRequest"]
        if pr_meta is None:
            pr_meta = {
                "number": pr["number"],
                "url": pr["url"],
                "title": pr["title"],
                "state": pr["state"],
                "isDraft": pr["isDraft"],
                "baseRefName": pr["baseRefName"],
                "headRefName": pr["headRefName"],
                "updatedAt": pr["updatedAt"],
                "mergedAt": pr["mergedAt"],
                "repository": f"{owner}/{repo_name}",
            }

        comment_page = pr["comments"]
        review_page = pr["reviews"]
        thread_page = pr["reviewThreads"]
        conversation_comments.extend(comment_page.get("nodes") or [])
        reviews.extend(review_page.get("nodes") or [])
        review_threads.extend(thread_page.get("nodes") or [])

        comments_cursor = (
            comment_page["pageInfo"]["endCursor"] if comment_page["pageInfo"]["hasNextPage"] else None
        )
        reviews_cursor = (
            review_page["pageInfo"]["endCursor"] if review_page["pageInfo"]["hasNextPage"] else None
        )
        threads_cursor = (
            thread_page["pageInfo"]["endCursor"] if thread_page["pageInfo"]["hasNextPage"] else None
        )
        if not (comments_cursor or reviews_cursor or threads_cursor):
            break

    assert pr_meta is not None
    return {
        "pull_request": pr_meta,
        "conversation_comments": conversation_comments,
        "reviews": reviews,
        "review_threads": review_threads,
    }


def annotate_handled(payload: dict[str, Any], handled_ids: set[str]) -> dict[str, Any]:
    unhandled: list[dict[str, Any]] = []

    for comment in payload["conversation_comments"]:
        comment["handled"] = comment["id"] in handled_ids
        if not comment["handled"]:
            unhandled.append({"kind": "conversation_comment", "id": comment["id"]})

    for review in payload["reviews"]:
        review["handled"] = review["id"] in handled_ids
        if not review["handled"]:
            unhandled.append({"kind": "review", "id": review["id"], "state": review["state"]})

    for thread in payload["review_threads"]:
        thread["handled"] = thread["id"] in handled_ids
        thread_comments = thread.get("comments", {}).get("nodes") or []
        thread_has_unhandled_comment = False
        for comment in thread_comments:
            comment["handled"] = comment["id"] in handled_ids
            if not comment["handled"]:
                thread_has_unhandled_comment = True
                unhandled.append(
                    {
                        "kind": "review_thread_comment",
                        "id": comment["id"],
                        "threadId": thread["id"],
                        "path": thread.get("path"),
                        "line": thread.get("line"),
                        "isResolved": thread.get("isResolved"),
                        "isOutdated": thread.get("isOutdated"),
                    }
                )
        thread["hasUnhandledComments"] = thread_has_unhandled_comment

    payload["unhandled"] = unhandled
    return payload


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Fetch GWP PR comments and review threads.")
    parser.add_argument("--repo", help=f"GitHub repo, defaults to origin ({EXPECTED_REPO}).")
    parser.add_argument("--pr", type=int, help="Pull request number.")
    parser.add_argument("--issue-id", help="Linear issue ID, for example GWP-XX.")
    parser.add_argument(
        "--handled-id",
        action="append",
        default=[],
        help="GitHub comment, review, or thread ID already handled by the workflow.",
    )
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

        payload = fetch_all(repo, pr_number)
        payload = annotate_handled(payload, set(args.handled_id))
        print(json.dumps(payload, indent=2))
        return 0
    except Exception as error:
        print(str(error), file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
