#!/usr/bin/env python3
from __future__ import annotations

import unittest

from gwp_pr_utils import issue_key_matches


class IssueKeyMatchesTest(unittest.TestCase):
    def test_matches_exact_issue_key_with_common_delimiters(self) -> None:
        self.assertTrue(issue_key_matches("GWP-26", "GWP-26: Add workflow plugin"))
        self.assertTrue(issue_key_matches("GWP-26", "feature/gwp-26-linear-to-pr"))

    def test_rejects_overlapping_issue_keys(self) -> None:
        self.assertFalse(issue_key_matches("GWP-2", "GWP-26: Add workflow plugin"))
        self.assertFalse(issue_key_matches("GWP-2", "feature/gwp-26-linear-to-pr"))
        self.assertFalse(issue_key_matches("GWP-26", "GWP-260 follow-up"))


if __name__ == "__main__":
    unittest.main()
