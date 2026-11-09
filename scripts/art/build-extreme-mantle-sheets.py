"""Rebuild compact all-class and one-row-per-trial mantle contact sheets."""

from pathlib import Path
from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[2]
ASSETS = ROOT / "dist/assets/extreme/mantles-v2"
OUTPUT = ROOT / "docs/assets"
JOBS = (
    "knight", "crusader", "assassin", "rogue", "hunter", "performer",
    "wizard", "sage", "priest", "monk", "pactWarrior", "spiritCommander",
)
KINDS = (
    ("atk", "ATK / BREAKER", (180, 96, 62)),
    ("matk", "MATK / ARCANE", (141, 116, 224)),
    ("hp", "HP / ABYSS", (225, 89, 119)),
    ("clear", "CLEAR / LEGION", (76, 208, 171)),
)
FONT_PATH = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
SMALL = ImageFont.truetype(FONT_PATH, 15)
HEADING = ImageFont.truetype(FONT_PATH, 22)


def cell_art(kind, job, size):
    path = ASSETS / f"{kind}-{job}.webp"
    with Image.open(path) as src:
        assert src.size == (1024, 1536), (path, src.size)
        art = src.convert("RGBA")
    art.thumbnail(size, Image.Resampling.LANCZOS)
    return art


def draw_row(canvas, kind, label, color, top, cell_width, art_height, left):
    draw = ImageDraw.Draw(canvas)
    draw.rounded_rectangle(
        (left - 10, top - 7, canvas.width - left + 10, top + art_height + 48),
        radius=9,
        fill=(30, 43, 56),
    )
    draw.rectangle((left - 10, top - 7, left - 4, top + art_height + 48), fill=color)
    draw.text((left, top), label, font=SMALL, fill=color)
    for index, job in enumerate(JOBS):
        x = left + index * cell_width
        art = cell_art(kind, job, (cell_width - 14, art_height - 26))
        image_x = x + (cell_width - art.width) // 2
        image_y = top + 22 + (art_height - 26 - art.height) // 2
        canvas.paste(art, (image_x, image_y), art)
        draw.text((x + 5, top + art_height + 12), job, font=SMALL, fill=(221, 230, 232))


def main():
    OUTPUT.mkdir(parents=True, exist_ok=True)
    for kind, label, color in KINDS:
        sheet = Image.new("RGB", (2180, 370), (19, 29, 40))
        draw_row(sheet, kind, label, color, top=18, cell_width=178, art_height=300, left=21)
        sheet.save(OUTPUT / f"extreme-mantles-v2-{kind}-12.jpg", quality=91, subsampling=0)

    # Lightweight overview: 4 rows x 12 classes, capped to 1600 px width.
    full = Image.new("RGB", (1600, 1100), (19, 29, 40))
    draw = ImageDraw.Draw(full)
    draw.text((23, 14), "EXTREME MANTLES V2 / 48 ARTWORKS / 2026-11-09", font=HEADING, fill=(241, 241, 229))
    for row, (kind, label, color) in enumerate(KINDS):
        draw_row(full, kind, label, color, top=52 + 260 * row, cell_width=129, art_height=198, left=20)
    # Keep the 48-tile preview compact so browsers and GitHub can render it reliably.
    full.save(OUTPUT / "extreme-mantles-v2-contact-sheet.jpg", quality=81, subsampling=2, optimize=True)
    print("Generated 4 series sheets (12 each) and 1 compact overview (48).")


if __name__ == "__main__":
    main()