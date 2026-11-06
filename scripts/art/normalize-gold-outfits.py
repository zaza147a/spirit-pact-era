"""Normalize gold outfit portrait framing to the SSS portrait aspect ratio.

Run against checked-in source images before committing updated WebP assets.
The transparent artwork is never upscaled: it is cropped to its alpha bounds,
then centered on a 1024 x 1504 canvas (2x the common 512 x 752 SSS frame).
"""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
ASSETS = ROOT / 'dist/assets/cosmetics'
CANVAS = (1024, 1504)
MARGIN = 28


def normalize(path):
    with Image.open(path) as original:
        art = original.convert('RGBA')
    bounds = art.getchannel('A').getbbox()
    if not bounds:
        raise ValueError(f'Empty portrait: {path}')
    art = art.crop(bounds)
    scale = min((CANVAS[0] - 2 * MARGIN) / art.width,
                (CANVAS[1] - 2 * MARGIN) / art.height, 1)
    if scale < 1:
        art = art.resize((round(art.width * scale), round(art.height * scale)), Image.Resampling.LANCZOS)
    canvas = Image.new('RGBA', CANVAS)
    canvas.alpha_composite(art, ((CANVAS[0] - art.width) // 2, (CANVAS[1] - art.height) // 2))
    canvas.save(path, 'WEBP', quality=94, method=6)


if __name__ == '__main__':
    portraits = sorted(ASSETS.glob('fixed-*.webp'))
    if len(portraits) != 36:
        raise RuntimeError(f'Expected 36 gold outfits; got {len(portraits)}')
    for portrait in portraits:
        normalize(portrait)
    print(f'Normalized {len(portraits)} outfits to {CANVAS[0]}x{CANVAS[1]}')
