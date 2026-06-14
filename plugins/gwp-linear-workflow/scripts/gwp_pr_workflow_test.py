#!/usr/bin/env python3
from __future__ import annotations

import unittest
from unittest.mock import patch

import gwp_pr_comments
import gwp_pr_review_context
import gwp_resolve_threads
from gwp_pr_comments import annotate_handled, summarize_status_checks
from gwp_pr_review_context import find_review_comment_candidates
from gwp_resolve_threads import (
    assess_thread_resolution,
    collect_global_blockers,
    resolve_and_verify_threads,
)


class SubprocessEncodingTests(unittest.TestCase):
    @patch("gwp_pr_comments.subprocess.run")
    def test_comment_helper_forces_utf8_with_replacement(self, run) -> None:
        gwp_pr_comments.run(["gh", "pr", "view"])

        self.assertEqual(run.call_args.kwargs["encoding"], "utf-8")
        self.assertEqual(run.call_args.kwargs["errors"], "replace")

    @patch("gwp_pr_review_context.subprocess.run")
    def test_review_helper_forces_utf8_with_replacement(self, run) -> None:
        gwp_pr_review_context.run(["gh", "pr", "view"])

        self.assertEqual(run.call_args.kwargs["encoding"], "utf-8")
        self.assertEqual(run.call_args.kwargs["errors"], "replace")

    @patch("gwp_pr_comments.subprocess.run")
    def test_resolution_helper_uses_utf8_comment_subprocess(self, run) -> None:
        run.return_value.returncode = 0
        run.return_value.stdout = "{}"
        run.return_value.stderr = ""

        gwp_resolve_threads.run_json(["gh", "pr", "view"])

        self.assertEqual(run.call_args.kwargs["encoding"], "utf-8")
        self.assertEqual(run.call_args.kwargs["errors"], "replace")


class StatusCheckSummaryTests(unittest.TestCase):
    def test_reports_failing_checks_before_pending_checks(self) -> None:
        summary = summarize_status_checks(
            [
                {
                    "__typename": "CheckRun",
                    "name": "unit tests",
                    "status": "COMPLETED",
                    "conclusion": "FAILURE",
                },
                {
                    "__typename": "CheckRun",
                    "name": "deploy",
                    "status": "IN_PROGRESS",
                    "conclusion": None,
                },
                {
                    "__typename": "StatusContext",
                    "context": "lint",
                    "state": "SUCCESS",
                },
            ]
        )

        self.assertEqual(summary["state"], "failing")
        self.assertEqual(summary["failing"], ["unit tests"])
        self.assertEqual(summary["pending"], ["deploy"])
        self.assertEqual(summary["passed"], ["lint"])

    def test_reports_no_checks_without_claiming_success(self) -> None:
        summary = summarize_status_checks([])

        self.assertEqual(summary["state"], "none")
        self.assertEqual(summary["total"], 0)


class HandledCommentTests(unittest.TestCase):
    def test_resolved_and_outdated_threads_are_context_only(self) -> None:
        payload = {
            "conversation_comments": [],
            "reviews": [],
            "review_threads": [
                {
                    "id": "resolved-thread",
                    "isResolved": True,
                    "isOutdated": False,
                    "comments": {"nodes": [{"id": "resolved-comment"}]},
                },
                {
                    "id": "outdated-thread",
                    "isResolved": False,
                    "isOutdated": True,
                    "comments": {"nodes": [{"id": "outdated-comment"}]},
                },
                {
                    "id": "active-thread",
                    "isResolved": False,
                    "isOutdated": False,
                    "path": "example.py",
                    "line": 10,
                    "comments": {"nodes": [{"id": "active-comment"}]},
                },
            ],
        }

        result = annotate_handled(payload, set())

        self.assertFalse(result["review_threads"][0]["hasUnhandledComments"])
        self.assertFalse(result["review_threads"][1]["hasUnhandledComments"])
        self.assertTrue(result["review_threads"][2]["hasUnhandledComments"])
        self.assertEqual(
            result["unhandled"],
            [
                {
                    "kind": "review_thread_comment",
                    "id": "active-comment",
                    "threadId": "active-thread",
                    "path": "example.py",
                    "line": 10,
                    "isResolved": False,
                    "isOutdated": False,
                }
            ],
        )


class ReviewCommentCandidateTests(unittest.TestCase):
    def test_matches_only_current_users_canonical_review_comment(self) -> None:
        comments = [
            {
                "id": "mine",
                "author": {"login": "bostonvip"},
                "body": "AI-generated review note\n\n## Codex PR Review for GWP-26",
            },
            {
                "id": "other",
                "author": {"login": "reviewer"},
                "body": "## Codex PR Review for GWP-26",
            },
            {
                "id": "different",
                "author": {"login": "bostonvip"},
                "body": "## Codex PR Review for GWP-43",
            },
        ]

        matches = find_review_comment_candidates(comments, "bostonvip", "GWP-26")

        self.assertEqual([comment["id"] for comment in matches], ["mine"])


class ThreadResolutionSafeguardTests(unittest.TestCase):
    def setUp(self) -> None:
        self.thread = {
            "id": "thread-1",
            "isResolved": False,
            "isOutdated": False,
            "path": "example.py",
            "line": 10,
            "comments": {
                "nodes": [
                    {
                        "id": "review-comment-1",
                        "createdAt": "2026-06-14T01:00:00Z",
                        "author": {"login": "reviewer"},
                    }
                ]
            },
        }

    def assess(
        self,
        *,
        handled: set[str] | None = None,
        addressed: set[str] | None = None,
        reply_required: bool = False,
    ) -> dict[str, object]:
        return assess_thread_resolution(
            self.thread,
            handled or set(),
            addressed or set(),
            "developer",
            reply_required,
        )

    def test_allows_confirmed_addressed_thread_with_handled_comments(self) -> None:
        result = self.assess(
            handled={"review-comment-1"},
            addressed={"thread-1"},
        )

        self.assertTrue(result["eligible"])
        self.assertEqual(result["outcome"], "eligible")

    def test_outdated_state_alone_does_not_allow_resolution(self) -> None:
        self.thread["isOutdated"] = True

        result = self.assess(addressed={"thread-1"})

        self.assertFalse(result["eligible"])
        self.assertEqual(result["reason"], "unhandled_external_comments")

    def test_new_unhandled_external_comment_blocks_resolution(self) -> None:
        self.thread["comments"]["nodes"].append(
            {
                "id": "review-comment-2",
                "createdAt": "2026-06-14T02:00:00Z",
                "author": {"login": "reviewer"},
            }
        )

        result = self.assess(
            handled={"review-comment-1"},
            addressed={"thread-1"},
        )

        self.assertEqual(result["missingHandledCommentIds"], ["review-comment-2"])

    def test_truncated_thread_comments_block_resolution(self) -> None:
        self.thread["comments"]["pageInfo"] = {"hasNextPage": True}

        result = self.assess(
            handled={"review-comment-1"},
            addressed={"thread-1"},
        )

        self.assertEqual(result["reason"], "review_thread_comments_truncated")

    def test_required_reply_must_be_newer_than_external_feedback(self) -> None:
        result = self.assess(
            handled={"review-comment-1"},
            addressed={"thread-1"},
            reply_required=True,
        )

        self.assertEqual(result["reason"], "required_evidence_reply_missing")

        self.thread["comments"]["nodes"].append(
            {
                "id": "developer-reply",
                "createdAt": "2026-06-14T01:05:00Z",
                "author": {"login": "developer"},
            }
        )
        result = self.assess(
            handled={"review-comment-1"},
            addressed={"thread-1"},
            reply_required=True,
        )

        self.assertTrue(result["eligible"])

    def test_already_resolved_thread_is_idempotent(self) -> None:
        self.thread["isResolved"] = True

        result = self.assess()

        self.assertEqual(result["outcome"], "already_resolved")

    def test_stale_head_pending_checks_and_missing_validation_block_writes(self) -> None:
        blockers = collect_global_blockers(
            {
                "state": "OPEN",
                "headRefOid": "new-head",
                "statusCheckSummary": {"state": "pending"},
            },
            "validated-head",
            True,
            False,
        )

        self.assertEqual(
            blockers,
            [
                "pr_head_does_not_match_expected_head",
                "status_checks_pending",
                "internal_validation_not_confirmed",
            ],
        )

    @patch("gwp_resolve_threads.fetch_all")
    @patch("gwp_resolve_threads.resolve_thread")
    def test_failed_readback_stops_before_next_thread(self, resolve_thread, fetch_all) -> None:
        resolve_thread.return_value = {
            "id": "thread-1",
            "isResolved": True,
            "resolvedBy": {"login": "developer"},
        }
        fetch_all.return_value = {
            "review_threads": [
                {
                    "id": "thread-1",
                    "isResolved": False,
                }
            ]
        }

        result = resolve_and_verify_threads(
            "olena-ageyeva/gwp-recovery-platform",
            11,
            ["thread-1", "thread-2"],
        )

        resolve_thread.assert_called_once_with("thread-1")
        fetch_all.assert_called_once()
        self.assertEqual(result["verificationFailures"], ["thread-1"])
        self.assertEqual(result["notAttemptedThreadIds"], ["thread-2"])


if __name__ == "__main__":
    unittest.main()
