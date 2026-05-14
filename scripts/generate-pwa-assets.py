#!/usr/bin/env python3
"""Generate PWA icons and the English social card.

Produces:
  - assets/icons/icon-192.png            (any purpose, 192x192)
  - assets/icons/icon-512.png            (any purpose, 512x512)
  - assets/icons/icon-192-maskable.png   (maskable, safe zone)
  - assets/icons/icon-512-maskable.png   (maskable, safe zone)
  - assets/icons/apple-touch-icon.png    (iOS home screen, 180x180)
  - assets/icons/favicon-48.png          (browser tab fallback)
  - og-image-en.png                       (1200x630, English social preview)

Requires Pillow only. Run once after a brand refresh:
    python scripts/generate-pwa-assets.py
"""

from __future__ import annotations

import os
import sys
from pathlib import Path

try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError:
    sys.stderr.write("Pillow is required. Install with: pip install Pillow\n")
    sys.exit(1)

REPO_ROOT = Path(__file__).resolve().parent.parent
ICONS_DIR = REPO_ROOT / "assets" / "icons"
ICONS_DIR.mkdir(parents=True, exist_ok=True)

# Brand palette (matches css/01-base.css and manifest.webmanifest).
DARK = (11, 15, 23)
DARK_2 = (17, 24, 39)
ACCENT = (249, 115, 22)
ACCENT_SOFT = (249, 115, 22, 40)
WHITE = (246, 247, 251)
MUTED = (148, 163, 184)
MVP_GREEN = (52, 211, 153)
RELEASE_BLUE = (96, 165, 250)


def find_font(size: int, *, bold: bool = False) -> ImageFont.FreeTypeFont:
    """Locate a sans-serif TTF; fall back to PIL's default."""
    candidates = [
        ("C:/Windows/Fonts/segoeuib.ttf" if bold else "C:/Windows/Fonts/segoeui.ttf"),
        "C:/Windows/Fonts/arialbd.ttf" if bold else "C:/Windows/Fonts/arial.ttf",
        "/System/Library/Fonts/Helvetica.ttc",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    ]
    for path in candidates:
        if os.path.exists(path):
            try:
                return ImageFont.truetype(path, size)
            except Exception:
                continue
    return ImageFont.load_default()


def draw_checkmark(draw: ImageDraw.ImageDraw, *, size: int, offset_x: int, offset_y: int, color, stroke_ratio: float = 0.10) -> None:
    """Draw a rounded checkmark inside a square of the given size at (offset)."""
    s = size
    w = max(2, int(s * stroke_ratio))
    p1 = (offset_x + int(s * 0.27), offset_y + int(s * 0.52))
    p2 = (offset_x + int(s * 0.45), offset_y + int(s * 0.70))
    p3 = (offset_x + int(s * 0.73), offset_y + int(s * 0.32))
    draw.line([p1, p2], fill=color, width=w)
    draw.line([p2, p3], fill=color, width=w)
    half = w // 2
    for cx, cy in (p1, p2, p3):
        draw.ellipse((cx - half, cy - half, cx + half, cy + half), fill=color)


def make_icon(size: int, out: Path, *, with_corners: bool = True, padding_ratio: float = 0.0) -> None:
    """Plain (any-purpose) icon: rounded square + centered checkmark."""
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    if with_corners:
        radius = int(size * 0.22)
        draw.rounded_rectangle((0, 0, size - 1, size - 1), radius=radius, fill=DARK_2)
    else:
        draw.rectangle((0, 0, size, size), fill=DARK_2)
    inner = int(size * (1 - 2 * padding_ratio))
    offset = (size - inner) // 2
    draw_checkmark(draw, size=inner, offset_x=offset, offset_y=offset, color=ACCENT)
    img.save(out)


def make_maskable(size: int, out: Path) -> None:
    """Maskable icon: full-bleed background, checkmark inside the 80% safe zone."""
    img = Image.new("RGBA", (size, size), DARK_2)
    draw = ImageDraw.Draw(img)
    inner = int(size * 0.78)
    offset = (size - inner) // 2
    draw_checkmark(draw, size=inner, offset_x=offset, offset_y=offset, color=ACCENT)
    img.save(out)


def draw_pill(draw: ImageDraw.ImageDraw, *, x: int, y: int, text: str, font, fill_text, border, padding_x: int = 18, height: int = 50) -> int:
    """Outlined pill. Returns the x offset where the next pill starts."""
    bbox = draw.textbbox((0, 0), text, font=font)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    w = tw + padding_x * 2
    draw.rounded_rectangle((x, y, x + w, y + height), radius=height // 2, outline=border, width=2)
    draw.text((x + padding_x, y + (height - th) // 2 - 4), text, font=font, fill=fill_text)
    return x + w + 14


def vertical_gradient(width: int, height: int, top, bottom) -> Image.Image:
    """Two-stop vertical gradient with row-by-row line draws (no NumPy needed)."""
    img = Image.new("RGB", (width, height), top)
    draw = ImageDraw.Draw(img)
    for y in range(height):
        t = y / max(height - 1, 1)
        r = int(top[0] * (1 - t) + bottom[0] * t)
        g = int(top[1] * (1 - t) + bottom[1] * t)
        b = int(top[2] * (1 - t) + bottom[2] * t)
        draw.line([(0, y), (width, y)], fill=(r, g, b))
    return img


def draw_radial_glow(img: Image.Image, cx: int, cy: int, radius: int, color) -> None:
    """Soft radial glow painted as concentric ellipses with decreasing alpha."""
    overlay = Image.new("RGBA", img.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    steps = 18
    for i in range(steps, 0, -1):
        t = i / steps
        r = int(radius * t)
        alpha = int(80 * (1 - t) ** 1.4)
        if alpha <= 0:
            continue
        rgba = (color[0], color[1], color[2], alpha)
        draw.ellipse((cx - r, cy - r, cx + r, cy + r), fill=rgba)
    img.alpha_composite(overlay)


def make_og_card(out: Path, *, eyebrow: str, title_lines, stats_lines, tagline: str, pills, author: str) -> None:
    """1200x630 social preview card, English-localized."""
    W, H = 1200, 630
    base = vertical_gradient(W, H, DARK, (16, 22, 35)).convert("RGBA")
    # Right-side glow nod to the live app's gradient backdrop.
    draw_radial_glow(base, cx=int(W * 0.84), cy=int(H * 0.08), radius=520, color=ACCENT)
    draw = ImageDraw.Draw(base)

    eyebrow_font = find_font(28, bold=True)
    title_font = find_font(70, bold=True)
    stats_font = find_font(30)
    tagline_font = find_font(26)
    pill_font = find_font(22, bold=True)
    author_font = find_font(20)

    # Eyebrow (orange uppercase pre-title).
    draw.text((80, 88), eyebrow, font=eyebrow_font, fill=ACCENT)

    # Title (up to two lines, the second is the bolder anchor).
    y = 150
    for line, weight_font in zip(title_lines, [find_font(70), find_font(72, bold=True)]):
        draw.text((80, y), line, font=weight_font, fill=WHITE)
        y += 84

    # Stats block.
    y += 16
    for line in stats_lines:
        draw.text((80, y), line, font=stats_font, fill=MUTED)
        y += 42

    # Tagline (italic-style mute).
    y += 12
    draw.text((80, y), tagline, font=tagline_font, fill=MUTED)

    # Pills row at the bottom.
    px = 80
    py = H - 130
    px = draw_pill(draw, x=px, y=py, text=pills[0], font=pill_font, fill_text=MVP_GREEN, border=MVP_GREEN)
    px = draw_pill(draw, x=px, y=py, text=pills[1], font=pill_font, fill_text=RELEASE_BLUE, border=RELEASE_BLUE)
    px = draw_pill(draw, x=px, y=py, text=pills[2], font=pill_font, fill_text=WHITE, border=WHITE)

    # Author line at the bottom-left.
    draw.text((80, H - 50), author, font=author_font, fill=MUTED)

    # Big right-side icon.
    icon_size = 280
    icon_x = W - icon_size - 100
    icon_y = (H - icon_size) // 2 - 20
    radius = int(icon_size * 0.22)
    draw.rounded_rectangle(
        (icon_x, icon_y, icon_x + icon_size, icon_y + icon_size),
        radius=radius,
        fill=DARK_2,
        outline=(255, 255, 255, 32),
        width=1,
    )
    draw_checkmark(draw, size=icon_size, offset_x=icon_x, offset_y=icon_y, color=ACCENT, stroke_ratio=0.11)

    base.convert("RGB").save(out, "PNG", optimize=True)


def main() -> None:
    # PWA icons.
    make_icon(192, ICONS_DIR / "icon-192.png")
    make_icon(512, ICONS_DIR / "icon-512.png")
    make_icon(180, ICONS_DIR / "apple-touch-icon.png")
    make_icon(48, ICONS_DIR / "favicon-48.png")
    make_maskable(192, ICONS_DIR / "icon-192-maskable.png")
    make_maskable(512, ICONS_DIR / "icon-512-maskable.png")

    # English social card.
    make_og_card(
        REPO_ROOT / "og-image-en.png",
        eyebrow="MVP · RELEASE · QUALITY CHECK",
        title_lines=("Mobile App", "Quality Checklist"),
        stats_lines=("14 categories · 55 items", "6 frameworks · 9 backends"),
        tagline="Make sure nothing is left undone before you ship",
        pills=("MVP", "Release", "PWA · Offline"),
        author="Built by Özcan Orhan Demirci",
    )

    print("Done. Outputs:")
    for p in sorted(ICONS_DIR.glob("*.png")):
        size = p.stat().st_size
        print(f"  {p.relative_to(REPO_ROOT)}  ({size:,} bytes)")
    og = REPO_ROOT / "og-image-en.png"
    if og.exists():
        print(f"  {og.relative_to(REPO_ROOT)}  ({og.stat().st_size:,} bytes)")


if __name__ == "__main__":
    main()
