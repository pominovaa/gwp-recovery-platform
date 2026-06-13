#!/usr/bin/env python3
from __future__ import annotations

import unittest
from unittest.mock import patch

import gwp_pr_comments
import gwp_pr_review_context
from gwp_pr_comments import annotate_handled, summarize_status_checks
from gwp_pr_review_context import find_review_comment_candidates


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


if __name__ == "__main__":
    unittest.main()
