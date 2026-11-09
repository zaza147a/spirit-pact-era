#!/usr/bin/env python3
"""Normalize V2 mantle sprites to a safe, consistent portrait canvas.

Do not use on wide compositions: those require fresh portrait artwork.
Original artwork remains recoverable from Git history.
"""

from pathlib import Path
import argparse
from PIL import Image

CANVAS = (1024, 1536)
MAX_DRAW = (900, 1370)


def normalize(path: Path, allow_wide: bool = False) -> None:
    with Image.open(path) as opened:
        source = opened.convert("RGBA")
    bbox = source.getchannel("A").getbbox()
    if bbox is None:
        raise ValueError(f"Blank alpha image: {path}")
    source = source.crop(bbox)
    if source.width > source.height and not allow_wide:
        raise ValueError(f"Wide art requires redraw, not shrink-to-fit: {path}")
    scale = min(MAX_DRAW[0] / source.width, MAX_DRAW[1] / source.height)
    size = (round(source.width * scale), round(source.height * scale))
    source = source.resize(size, Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", CANVAS, (0, 0, 0, 0))
    x = (CANVAS[0] - size[0]) // 2
    y = (CANVAS[1] - size[1]) // 2
    canvas.alpha_composite(source, (x, y))
    canvas.save(path, "WEBP", quality=94, method=6)


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--allow-wide", action="store_true", help="Temporary safe-frame fallback for wide art; flag for visual redraw")
    parser.add_argument("files", nargs="+", type=Path)
    args = parser.parse_args()
    for sprite in args.files:
        normalize(sprite, allow_wide=args.allow_wide)
        print(sprite)
