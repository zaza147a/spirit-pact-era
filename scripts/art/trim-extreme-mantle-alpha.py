#!/usr/bin/env python3
"""Remove extremely faint alpha haze without repainting mantle pixels.

Only suitable for individually approved files: threshold must be reviewed against
dark and light composites before replacing the source. High-opacity RGB must
remain byte-identical after decoding the lossless WebP output.
"""

import argparse
from pathlib import Path

import numpy as np
from PIL import Image


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("source", type=Path)
    parser.add_argument("destination", type=Path)
    parser.add_argument("--threshold", type=int, required=True)
    args = parser.parse_args()
    if not 0 <= args.threshold <= 25:
        parser.error("threshold must be 0..25 (faint alpha only)")

    original = np.array(Image.open(args.source).convert("RGBA"))
    changed = original.copy()
    trim = (changed[:, :, 3] > 0) & (changed[:, :, 3] <= args.threshold)
    changed[:, :, 3][trim] = 0
    args.destination.parent.mkdir(parents=True, exist_ok=True)
    Image.fromarray(changed, "RGBA").save(
        args.destination, format="WEBP", lossless=True, method=6
    )

    decoded = np.array(Image.open(args.destination).convert("RGBA"))
    protected = original[:, :, 3] > args.threshold
    if not np.array_equal(original[:, :, :3][protected], decoded[:, :, :3][protected]):
        raise RuntimeError("Protected original RGB changed")
    if not np.array_equal(original[:, :, 3][protected], decoded[:, :, 3][protected]):
        raise RuntimeError("Protected original alpha changed")
    if np.any(decoded[:, :, 3][~protected]):
        raise RuntimeError("Background alpha was not cleared")
    print(f"PASS: cleared {np.count_nonzero(trim)} faint-alpha pixels; protected RGB/alpha unchanged")


if __name__ == "__main__":
    main()
