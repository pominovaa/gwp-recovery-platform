#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import sys
from typing import Any

from gwp_pr_comments import (
    EXPECTED_REPO,
    ensure_gh_auth,
    fetch_all,
    parse_repo_from_origin,
    resolve_current_pr_number,
    resolve_pr_by_issue,
    run_json,
)


RESOLVE_MUTATION = """\
mutation($threadId: ID!) {
  resolveReviewThread(input: {threadId: $threadId}) {
    thread {
      id
      isResolved
      resolvedBy { login }
    }
  }
}
"""


def author_login(comment: dict[str, Any]) -> str:
    return str((comment.get("author") or {}).get("login") or "")


def assess_thread_resolution(
    thread: dict[str, Any],
    handled_comment_ids: set[str],
    addressed_thread_ids: set[str],
    viewer_login: str,
    reply_required: bool,
) -> dict[str, Any]:
    thread_id = str(thread.get("id") or "")
    result: dict[str, Any] = {
        "threadId": thread_id,
        "path": thread.get("path"),
        "line": thread.get("line"),
        "isOutdated": bool(thread.get("isOutdated")),
        "eligible": False,
    }

    if thread.get("isResolved"):
        result["outcome"] = "already_resolved"
        return result

    if thread_id not in addressed_thread_ids:
        result["outcome"] = "blocked"
        result["reason"] = "thread_not_confirmed_addressed"
        return result

    comment_connection = thread.get("comments") or {}
    if (comment_connection.get("pageInfo") or {}).get("hasNextPage"):
        result["outcome"] = "blocked"
        result["reason"] = "review_thread_comments_truncated"
        return result

    comments = comment_connection.get("nodes") or []
    external_comments = [
        comment for comment in comments if author_login(comment).casefold() != viewer_login.casefold()
    ]
    if not external_comments:
        result["outcome"] = "blocked"
        result["reason"] = "no_external_review_comment"
        return result

    missing_comment_ids = [
        str(comment.get("id") or "")
        for comment in external_comments
        if str(comment.get("id") or "") not in handled_comment_ids
    ]
    if missing_comment_ids:
        result["outcome"] = "blocked"
        result["reason"] = "unhandled_external_comments"
        result["missingHandledCommentIds"] = missing_comment_ids
        return result

    if reply_required:
        latest_external_time = max(
            str(comment.get("createdAt") or "") for comment in external_comments
        )
        has_fresh_reply = any(
            author_login(comment).casefold() == viewer_login.casefold()
            and str(comment.get("createdAt") or "") > latest_external_time
            for comment in comments
        )
        if not has_fresh_reply:
            result["outcome"] = "blocked"
            result["reason"] = "required_evidence_reply_missing"
            return result

    result["eligible"] = True
    result["outcome"] = "eligible"
    return result


def collect_global_blockers(
    pr: dict[str, Any],
    expected_head: str,
    resolving: bool,
    validation_passed: bool,
) -> list[str]:
    blockers: list[str] = []
    if pr["state"] != "OPEN":
        blockers.append(f"pr_state_{str(pr['state']).lower()}")
    if pr.get("headRefOid") != expected_head:
        blockers.append("pr_head_does_not_match_expected_head")
    checks_state = pr["statusCheckSummary"]["state"]
    if checks_state != "passing":
        blockers.append(f"status_checks_{checks_state}")
    if resolving and not validation_passed:
        blockers.append("internal_validation_not_confirmed")
    return blockers


def resolve_thread(thread_id: str) -> dict[str, Any]:
    payload = run_json(
        [
            "gh",
            "api",
            "graphql",
            "-F",
            "query=@-",
            "-F",
            f"threadId={thread_id}",
        ],
        stdin=RESOLVE_MUTATION,
    )
    if payload.get("errors"):
        raise RuntimeError(json.dumps(payload["errors"], indent=2))
    return payload["data"]["resolveReviewThread"]["thread"]


def resolve_and_verify_threads(
    repo: str,
    pr_number: int,
    eligible_ids: list[str],
) -> dict[str, Any]:
    mutation_results: list[dict[str, Any]] = []
    mutation_failures: list[dict[str, str]] = []
    verification_failures: list[str] = []
    verified_ids: list[str] = []
    attempted_ids: list[str] = []

    for thread_id in eligible_ids:
        attempted_ids.append(thread_id)
        try:
            mutation_results.append(resolve_thread(thread_id))
        except Exception as error:
            mutation_failures.append({"threadId": thread_id, "error": str(error)})
            break

        refreshed = fetch_all(repo, pr_number)
        refreshed_threads = {
            str(thread.get("id") or ""): thread for thread in refreshed["review_threads"]
        }
        if not refreshed_threads.get(thread_id, {}).get("isResolved"):
            verification_failures.append(thread_id)
            break
        verified_ids.append(thread_id)

    return {
        "mutationResults": mutation_results,
        "mutationFailures": mutation_failures,
        "verifiedResolvedThreadIds": verified_ids,
        "notAttemptedThreadIds": [
            thread_id for thread_id in eligible_ids if thread_id not in attempted_ids
        ],
        "verificationFailures": verification_failures,
    }


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Safely resolve addressed GWP GitHub PR review threads."
    )
    parser.add_argument("--repo", help=f"GitHub repo, defaults to origin ({EXPECTED_REPO}).")
    parser.add_argument("--pr", type=int, help="Pull request number.")
    parser.add_argument("--issue-id", help="Linear issue ID, for example GWP-XX.")
    parser.add_argument(
        "--expected-head",
        required=True,
        help="Exact pushed PR head SHA that passed verification and validation.",
    )
    parser.add_argument(
        "--thread-id",
        action="append",
        required=True,
        help="Inline GitHub review-thread node ID to evaluate.",
    )
    parser.add_argument(
        "--handled-comment-id",
        action="append",
        default=[],
        help="External review-thread comment ID already addressed by the workflow.",
    )
    parser.add_argument(
        "--addressed-thread-id",
        action="append",
        default=[],
        help="Thread ID whose finding was directly addressed by the current code or response.",
    )
    parser.add_argument(
        "--require-reply-thread-id",
        action="append",
        default=[],
        help="Thread ID that requires a newer reply from the authenticated GitHub user.",
    )
    parser.add_argument(
        "--validation-passed",
        action="store_true",
        help="Confirm the current expected head passed internal GWP validation.",
    )
    parser.add_argument(
        "--resolve",
        action="store_true",
        help="Perform verified resolution writes. Without this flag the helper is read-only.",
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

        viewer = run_json(["gh", "api", "user"])
        viewer_login = str(viewer.get("login") or "")
        if not viewer_login:
            raise RuntimeError("Could not resolve the authenticated GitHub user.")

        payload = fetch_all(repo, pr_number)
        pr = payload["pull_request"]
        global_blockers = collect_global_blockers(
            pr,
            args.expected_head,
            args.resolve,
            args.validation_passed,
        )

        threads_by_id = {
            str(thread.get("id") or ""): thread for thread in payload["review_threads"]
        }
        handled_comment_ids = set(args.handled_comment_id)
        addressed_thread_ids = set(args.addressed_thread_id)
        reply_required_ids = set(args.require_reply_thread_id)
        thread_results: list[dict[str, Any]] = []

        for thread_id in args.thread_id:
            thread = threads_by_id.get(thread_id)
            if thread is None:
                thread_results.append(
                    {
                        "threadId": thread_id,
                        "eligible": False,
                        "outcome": "blocked",
                        "reason": "review_thread_not_found",
                    }
                )
                continue
            thread_results.append(
                assess_thread_resolution(
                    thread,
                    handled_comment_ids,
                    addressed_thread_ids,
                    viewer_login,
                    thread_id in reply_required_ids,
                )
            )

        blocked_threads = [
            result for result in thread_results if result["outcome"] == "blocked"
        ]
        result_payload: dict[str, Any] = {
            "mode": "resolve" if args.resolve else "dry_run",
            "repository": repo,
            "pullRequest": pr_number,
            "pullRequestUrl": pr["url"],
            "expectedHead": args.expected_head,
            "actualHead": pr.get("headRefOid"),
            "statusCheckSummary": pr["statusCheckSummary"],
            "viewerLogin": viewer_login,
            "globalBlockers": global_blockers,
            "threads": thread_results,
            "resolutionAttempted": False,
        }

        if global_blockers or blocked_threads:
            print(json.dumps(result_payload, indent=2))
            return 1

        eligible_ids = [
            result["threadId"] for result in thread_results if result["outcome"] == "eligible"
        ]
        if not args.resolve:
            print(json.dumps(result_payload, indent=2))
            return 0

        result_payload["resolutionAttempted"] = bool(eligible_ids)
        resolution_results = resolve_and_verify_threads(repo, pr_number, eligible_ids)
        result_payload.update(resolution_results)
        print(json.dumps(result_payload, indent=2))
        return (
            1
            if resolution_results["mutationFailures"]
            or resolution_results["verificationFailures"]
            else 0
        )
    except Exception as error:
        print(str(error), file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
