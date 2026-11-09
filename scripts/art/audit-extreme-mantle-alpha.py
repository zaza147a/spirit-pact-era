#!/usr/bin/env python3
"""Audit V2 mantle RGBA artwork and its visible alpha margins."""

from __future__ import annotations

import argparse
import hashlib
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[2]
ASSET_DIR = ROOT / "dist/assets/extreme/mantles-v2"
WIDTH, HEIGHT = 1024, 1536


def audit(threshold: int, margin: float) -> int:
    paths = sorted(ASSET_DIR.glob("*.webp"))
    problems: list[str] = []
    hashes: dict[str, str] = {}
    if len(paths) != 48:
        problems.append(f"expected 48 artworks, found {len(paths)}")

    print("file,left,top,right,bottom,min_margin_percent,status")
    for path in paths:
        with Image.open(path) as im:
            if im.format != "WEBP" or im.size != (WIDTH, HEIGHT) or im.mode != "RGBA":
                problems.append(f"{path.name}: invalid WEBP/RGBA/1024x1536 format")
                continue
            alpha = im.getchannel("A")
            bbox = alpha.point(lambda v: 255 if v >= threshold else 0).getbbox()
            if bbox is None:
                problems.append(f"{path.name}: no visible pixels")
                continue
            left, top, right, bottom = bbox
            edges = (left, top, WIDTH - right, HEIGHT - bottom)
            minimum = 100 * min(left / WIDTH, top / HEIGHT,
                                (WIDTH - right) / WIDTH,
                                (HEIGHT - bottom) / HEIGHT)
            status = "PASS" if minimum >= margin else "REVIEW"
            print(f"{path.name},{','.join(map(str, edges))},{minimum:.2f},{status}")
            if status == "REVIEW":
                problems.append(f"{path.name}: {minimum:.2f}% minimum margin (goal {margin:.2f}%)")

        digest = hashlib.sha256(path.read_bytes()).hexdigest()
        if digest in hashes:
            problems.append(f"{path.name}: duplicate SHA-256 of {hashes[digest]}")
        hashes[digest] = path.name

    print(f"\n{len(paths)} files; {len(problems)} review item(s)")
    for item in problems:
        print("-", item)
    # A review item is not a broken asset. Fail only when asked for strict margins.
    return int(bool(problems))


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--alpha-threshold", type=int, default=128)
    parser.add_argument("--minimum-margin", type=float, default=6.0)
    parser.add_argument("--strict", action="store_true", help="exit nonzero for review items")
    args = parser.parse_args()
    result = audit(args.alpha_threshold, args.minimum_margin)
    raise SystemExit(result if args.strict else 0)
