"""Create pixel-accurate CSS-size wardrobe/entry image proofs without changing assets.

These are raster approximations of <img object-fit: contain>, not browser screenshots.
They deliberately show each source against dark AND light game-like backgrounds.
"""

from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[2]
ASSETS = ROOT / "dist/assets/extreme/mantles-v2"
OUTPUT = ROOT / "docs/assets"
JOBS = ("knight", "crusader", "assassin", "rogue", "hunter", "performer",
        "wizard", "sage", "priest", "monk", "pactWarrior", "spiritCommander")
KINDS = ("atk", "matk", "hp", "clear")
FONT = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 14)


def css_contain(source, bounds, bg):
    """Center full transparent source, like CSS object-fit:contain (no alpha crop)."""
    w, h = bounds
    tile = Image.new("RGBA", bounds, (*bg, 255))
    ratio = min(w / source.width, h / source.height)
    art = source.resize((round(source.width * ratio), round(source.height * ratio)), Image.Resampling.LANCZOS)
    tile.alpha_composite(art, ((w - art.width) // 2, (h - art.height) // 2))
    return tile.convert("RGB")


def main():
    OUTPUT.mkdir(parents=True, exist_ok=True)
    # Two real UI image box sizes: wardrobe 108x114; desktop entry 200x240.
    for kind in KINDS:
        sheet = Image.new("RGB", (1370, 1110), (17, 25, 37))
        wardrobe = Image.new("RGB", (1590, 325), (17, 25, 37))
        draw = ImageDraw.Draw(sheet)
        wardrobe_draw = ImageDraw.Draw(wardrobe)
        draw.text((20, 10), f"{kind.upper()} / 12 JOBS / CSS IMAGE BOX PROOF / NOT BROWSER CAPTURE", font=FONT, fill="white")
        for index, job in enumerate(JOBS):
            x = 20 + (index % 6) * 225
            y = 45 + (index // 6) * 530
            with Image.open(ASSETS / f"{kind}-{job}.webp") as image:
                source = image.convert("RGBA")
            draw.text((x, y), job, font=FONT, fill=(232, 238, 238))
            wx = 15 + index * 131
            wardrobe_draw.text((wx, 8), job[:12], font=FONT, fill="white")
            for i, bg in enumerate(((23, 35, 51), (229, 228, 211))):
                # Entry at its rendered 200x240 desktop size.
                preview = css_contain(source, (200, 240), bg)
                sheet.paste(preview, (x, y + 22 + i * 246))
                draw.rectangle((x, y + 22 + i * 246, x + 199, y + 261 + i * 246), outline=(112, 131, 144))
                small = css_contain(source, (108, 114), bg)
                wardrobe.paste(small, (wx, 35 + i * 135))
                wardrobe_draw.rectangle((wx, 35 + i * 135, wx + 107, 148 + i * 135), outline=(112, 131, 144))
        name = OUTPUT / f"extreme-mantles-ui-proof-{kind}.jpg"
        sheet.save(name, quality=88, subsampling=2, optimize=True)
        wardrobe.save(OUTPUT / f"extreme-mantles-wardrobe-proof-{kind}.jpg", quality=88, subsampling=2, optimize=True)
        print(name.relative_to(ROOT))


if __name__ == "__main__":
    main()
