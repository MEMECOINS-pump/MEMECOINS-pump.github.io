#!/usr/bin/env python3
"""Snapshot pump.fun livestream metadata for GitHub Pages."""
from __future__ import annotations

import json
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DESK = ROOT / "data" / "desk.json"
OUT = ROOT / "data" / "live.json"
UA = {"User-Agent": "MEMECOINS-desk/1.0", "Accept": "application/json"}


def mints_from_desk() -> list[str]:
    desk = json.loads(DESK.read_text(encoding="utf-8"))
    found: list[str] = []
    mint = (desk.get("essentials") or {}).get("mint")
    if mint:
        found.append(mint)
    for day in desk.get("days") or []:
        if day.get("mint"):
            found.append(day["mint"])
    return found


def fetch_live(mint: str) -> dict:
    url = f"https://livestream-api.pump.fun/livestream?mintId={mint}"
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=20) as res:
        data = json.loads(res.read().decode())
    return {
        "id": data.get("id"),
        "isLive": bool(data.get("isLive")),
        "viewers": int(data.get("numParticipants") or 0),
        "title": data.get("title") or "",
        "thumbnail": data.get("thumbnail") or "",
        "mode": data.get("mode") or "",
    }


def main() -> None:
    prev = {}
    if OUT.exists():
        try:
            prev = json.loads(OUT.read_text(encoding="utf-8")).get("streams") or {}
        except json.JSONDecodeError:
            prev = {}

    streams = {}
    for mint in mints_from_desk():
        try:
            streams[mint] = fetch_live(mint)
            print(mint, streams[mint]["isLive"], streams[mint]["viewers"])
        except Exception as err:
            print("fail", mint, err)
            if mint in prev:
                streams[mint] = prev[mint]

    payload = {
        "updated": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "streams": streams,
    }
    OUT.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")
    print("wrote", OUT)


if __name__ == "__main__":
    main()
