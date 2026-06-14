#!/usr/bin/env python3
from __future__ import annotations

import re


def issue_key_matches(issue_id: str, value: str) -> bool:
    pattern = re.compile(rf"(?<![A-Za-z0-9]){re.escape(issue_id)}(?![A-Za-z0-9])", re.IGNORECASE)
    return bool(pattern.search(value))
