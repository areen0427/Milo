"""Draw the Milo app icon source with a transparent margin, as macOS Dock icons have.

Run from milo-app/:  /path/to/venv/bin/python scripts/build-app-icon.py
Needs Pillow (pip install pillow). Writes src-tauri/icons/source.png (1024x1024).

The rounded body is 860px inside the 1024px canvas. Drawing it edge to edge
made the app look larger than its Dock neighbours; 824px (80%) looked small to the user.
"""

from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "src-tauri" / "icons" / "source.png"

CANVAS = 1024
SCALE = 4  # draw at 4x and downsample for smooth edges
BODY = 860  # body size inside the canvas: other Dock icons fill about 80%, full bleed 100%
MARGIN = (CANVAS - BODY) // 2
CORNER = 200  # about 22% of the body, close to Apple's continuous corner

BG = (12, 15, 18, 255)  # #0c0f12, the app canvas colour
AMBER = (245, 180, 83, 255)  # #f5b453, the app accent

# The ring and dot keep the same proportions they had on the full-bleed version.
RING_OUTER = 330 * BODY / CANVAS
RING_WIDTH = 60 * BODY / CANVAS
DOT_RADIUS = 92 * BODY / CANVAS


def main() -> None:
    size = CANVAS * SCALE
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    s = SCALE

    left = MARGIN * s
    right = (MARGIN + BODY) * s
    draw.rounded_rectangle([left, left, right, right], radius=CORNER * s, fill=BG)

    cx = cy = CANVAS * s / 2
    outer = RING_OUTER * s
    draw.ellipse([cx - outer, cy - outer, cx + outer, cy + outer], fill=AMBER)
    inner = outer - RING_WIDTH * s
    draw.ellipse([cx - inner, cy - inner, cx + inner, cy + inner], fill=BG)

    dot = DOT_RADIUS * s
    draw.ellipse([cx - dot, cy - dot, cx + dot, cy + dot], fill=AMBER)

    img = img.resize((CANVAS, CANVAS), Image.LANCZOS)
    img.save(OUT)
    print(f"wrote {OUT.relative_to(ROOT)} ({CANVAS}px, body {BODY}px, margin {MARGIN}px)")


if __name__ == "__main__":
    main()
