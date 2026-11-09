"""Reject replacement art that repaints an approved mantle instead of editing alpha.

Usage: python scripts/art/check-extreme-mantle-mask-only.py ORIGINAL.webp CANDIDATE.png
This is a non-mutating acceptance gate: it never writes an image.
"""

import argparse
from pathlib import Path
from PIL import Image, ImageChops


def inspect(original_path: Path, candidate_path: Path):
    with Image.open(original_path) as source, Image.open(candidate_path) as edited:
        original = source.convert("RGBA")
        candidate = edited.convert("RGBA")
    if original.size != (1024, 1536) or candidate.size != original.size:
        raise ValueError(f"Expected identical 1024x1536 canvases: {original.size}, {candidate.size}")

    # Every approved opaque source pixel must retain its exact RGB values.
    # Alpha-only correction may change A but must not redraw skin, gear or weapons.
    before_rgb = original.convert("RGB")
    after_rgb = candidate.convert("RGB")
    difference = ImageChops.difference(before_rgb, after_rgb).convert("L")
    opaque = original.getchannel("A").point(lambda alpha: 255 if alpha >= 240 else 0)
    changed = ImageChops.multiply(difference.point(lambda v: 255 if v else 0), opaque)
    changed_pixels = changed.histogram()[255]
    opaque_pixels = opaque.histogram()[255]
    changed_pct = 100 * changed_pixels / max(1, opaque_pixels)

    # A genuinely transparent cutout cannot keep the full original background
    # as an almost-opaque replacement glow. This detects that common failure.
    alpha = candidate.getchannel("A")
    edge = Image.new("L", alpha.size, 255)
    from PIL import ImageDraw
    drawer = ImageDraw.Draw(edge)
    drawer.rectangle((128, 128, 895, 1407), fill=0)
    edge_alpha = ImageChops.multiply(alpha, edge)
    edge_opaque = edge_alpha.point(lambda v: 255 if v >= 32 else 0).histogram()[255]
    print(f"opaque_source_pixels={opaque_pixels} changed_rgb_pixels={changed_pixels} "
          f"changed_rgb_pct={changed_pct:.4f}% edge_alpha_ge32_pixels={edge_opaque}")
    if changed_pixels:
        raise ValueError("REJECT: candidate repaints original opaque RGB pixels; alpha-only correction required")
    print("PASS: original opaque RGB content preserved exactly (transparency aesthetics still require review)")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("original", type=Path)
    parser.add_argument("candidate", type=Path)
    options = parser.parse_args()
    inspect(options.original, options.candidate)
