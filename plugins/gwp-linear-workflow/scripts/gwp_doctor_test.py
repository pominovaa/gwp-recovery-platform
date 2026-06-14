#!/usr/bin/env python3
from __future__ import annotations

import json
import subprocess
import unittest
from unittest.mock import patch

import gwp_doctor


def completed(
    args: list[str],
    returncode: int = 0,
    stdout: str = "",
    stderr: str = "",
) -> subprocess.CompletedProcess[str]:
    return subprocess.CompletedProcess(args, returncode, stdout, stderr)


class CommandResolutionTests(unittest.TestCase):
    @patch("gwp_doctor.shutil.which")
    def test_resolves_windows_command_without_bash(self, which) -> None:
        which.return_value = r"C:\Program Files\nodejs\npm.CMD"

        command = gwp_doctor.resolved_command(["npm", "test"])

        self.assertEqual(command, [r"C:\Program Files\nodejs\npm.CMD", "test"])

    @patch("gwp_doctor.subprocess.run")
    @patch("gwp_doctor.resolved_command")
    def test_missing_command_returns_actionable_failure(self, resolve, subprocess_run) -> None:
        resolve.side_effect = FileNotFoundError("codex was not found on PATH")

        result = gwp_doctor.run(["codex", "mcp", "list"])

        self.assertEqual(result.returncode, 127)
        self.assertIn("codex was not found", result.stderr)
        subprocess_run.assert_not_called()


class ReadinessTests(unittest.TestCase):
    @patch("gwp_doctor.run")
    def test_rejects_unauthenticated_linear(self, run) -> None:
        run.return_value = completed(
            ["codex", "mcp", "list", "--json"],
            stdout=json.dumps(
                [
                    {
                        "name": "linear",
                        "enabled": True,
                        "auth_status": "not_logged_in",
                    }
                ]
            ),
        )

        passed, label, detail = gwp_doctor.check_linear_mcp("GWP-26")

        self.assertFalse(passed)
        self.assertEqual(label, "Linear MCP")
        self.assertIn("codex mcp login linear", detail)
        run.assert_called_once()

    @patch("gwp_doctor.run")
    def test_requires_successful_linear_tool_probe(self, run) -> None:
        run.side_effect = [
            completed(
                ["codex", "mcp", "list", "--json"],
                stdout=json.dumps(
                    [
                        {
                            "name": "linear",
                            "enabled": True,
                            "auth_status": "oauth",
                        }
                    ]
                ),
            ),
            completed(
                ["codex", "exec"],
                stdout="\n".join(
                    [
                        json.dumps(
                            {
                                "type": "item.completed",
                                "item": {
                                    "type": "mcp_tool_call",
                                    "server": "linear",
                                    "status": "completed",
                                },
                            }
                        ),
                        json.dumps(
                            {
                                "type": "item.completed",
                                "item": {
                                    "type": "agent_message",
                                    "text": "GWP_LINEAR_PROBE_OK:GWP-26",
                                },
                            }
                        ),
                    ]
                ),
            ),
        ]

        passed, label, detail = gwp_doctor.check_linear_mcp("GWP-26")

        self.assertTrue(passed)
        self.assertEqual(label, "Linear MCP")
        self.assertIn("read-only fetch for GWP-26 passed", detail)
        self.assertEqual(run.call_count, 2)

    @patch("gwp_doctor.run")
    def test_accepts_windows_o_auth_status(self, run) -> None:
        run.side_effect = [
            completed(
                ["codex", "mcp", "list", "--json"],
                stdout=json.dumps(
                    [
                        {
                            "name": "linear",
                            "enabled": True,
                            "auth_status": "o_auth",
                        }
                    ]
                ),
            ),
            completed(
                ["codex", "exec"],
                stdout="\n".join(
                    [
                        json.dumps(
                            {
                                "type": "item.completed",
                                "item": {
                                    "type": "mcp_tool_call",
                                    "server": "linear",
                                },
                            }
                        ),
                        json.dumps(
                            {
                                "type": "item.completed",
                                "item": {
                                    "type": "agent_message",
                                    "text": "GWP_LINEAR_PROBE_OK:GWP-26",
                                },
                            }
                        ),
                    ]
                ),
            ),
        ]

        passed, label, detail = gwp_doctor.check_linear_mcp("GWP-26")

        self.assertTrue(passed)
        self.assertEqual(label, "Linear MCP")
        self.assertIn("read-only fetch for GWP-26 passed", detail)
        self.assertEqual(run.call_count, 2)

    @patch("gwp_doctor.run")
    def test_detects_installed_enabled_plugin(self, run) -> None:
        run.return_value = completed(
            ["codex", "plugin", "list", "--json"],
            stdout=json.dumps(
                {
                    "installed": [
                        {
                            "name": "gwp-linear-workflow",
                            "enabled": True,
                        }
                    ]
                }
            ),
        )

        passed, label, detail = gwp_doctor.check_plugin()

        self.assertTrue(passed)
        self.assertEqual(label, "workflow plugin")
        self.assertIn("installed and enabled", detail)


if __name__ == "__main__":
    unittest.main()
