#!/usr/bin/env python3
from __future__ import annotations

import unittest

from gwp_pr_comments import summarize_status_checks
from gwp_pr_review_context import find_review_comment_candidates


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
