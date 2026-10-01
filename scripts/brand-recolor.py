#!/usr/bin/env python3
"""Lock imagery to the LUSAKO brand sheet (DESIGN.md › Palette).

The brand sheet's blue strip runs #FFFFFF → #278CF0 → #0055A8 as a straight sRGB blend. Every recoloured pixel
lands on that strip, so imagery can't bring in colours the sheet doesn't have.

  strip   Gradient-map each pixel's brightness onto the strip (#0055A8 shadows, #278CF0 mid-tones, white
          highlights), keeping transparency. For the 3D icons and 3D renders.
  mono    Neutral black & white, for lifestyle photos (the StomDent reference shows photos in greyscale).
  hald    Write a Hald colour table of the strip map, for ffmpeg's `haldclut` filter (the scroll film).

Usage:
  python3 scripts/brand-recolor.py strip <in> <out> [--mid 0.5] [--lo 1] [--hi 99.5]
  python3 scripts/brand-recolor.py mono  <in> <out> [--contrast 1.06]
  python3 scripts/brand-recolor.py hald  <out.png> --lo <luma> --hi <luma> [--mid 0.5]

Output format follows the extension (.webp / .png / .jpg). Needs Pillow and numpy.
"""
import argparse

import numpy as np
from PIL import Image

DEEP = np.array([0x00, 0x55, 0xA8], np.float32)  # dark end of the strip
BRAND = np.array([0x27, 0x8C, 0xF0], np.float32)  # main blue, the strip's middle
WHITE = np.array([0xFF, 0xFF, 0xFF], np.float32)


def luma(rgb: np.ndarray) -> np.ndarray:
    """Gamma-encoded Rec. 709 luma in 0..1."""
    return (rgb[..., 0] * 0.2126 + rgb[..., 1] * 0.7152 + rgb[..., 2] * 0.0722) / 255.0


def strip_map(t: np.ndarray, mid: float) -> np.ndarray:
    """t in 0..1 → RGB on the strip: 0 = #0055A8, `mid` = #278CF0, 1 = #FFFFFF."""
    t = np.clip(t, 0.0, 1.0)[..., None]
    low = DEEP + (BRAND - DEEP) * np.clip(t / mid, 0, 1)
    high = BRAND + (WHITE - BRAND) * np.clip((t - mid) / (1 - mid), 0, 1)
    return np.where(t <= mid, low, high)


def save(img: Image.Image, path: str) -> None:
    ext = path.rsplit(".", 1)[-1].lower()
    if ext == "webp":
        img.save(path, "WEBP", quality=90, method=6)
    elif ext in ("jpg", "jpeg"):
        img.convert("RGB").save(path, "JPEG", quality=86, optimize=True, progressive=True)
    else:
        img.save(path, optimize=True)


def cmd_strip(args) -> None:
    img = Image.open(args.input).convert("RGBA")
    a = np.array(img).astype(np.float32)
    y = luma(a[..., :3])
    visible = a[..., 3] > 24
    if args.range:
        lo, hi = (float(v) for v in args.range.split(","))
    else:
        lo, hi = np.percentile(y[visible], [args.lo, args.hi]) if visible.any() else (0.0, 1.0)
    t = (y - lo) / max(hi - lo, 1e-6)
    rgb = strip_map(t, args.mid)
    out = np.dstack([rgb, a[..., 3]]).round().clip(0, 255).astype(np.uint8)
    save(Image.fromarray(out), args.output)
    print(f"strip {args.input} -> {args.output}  luma lo={lo:.3f} hi={hi:.3f} mid={args.mid}")


def cmd_mono(args) -> None:
    img = Image.open(args.input)
    has_alpha = img.mode in ("RGBA", "LA")
    a = np.array(img.convert("RGBA")).astype(np.float32)
    y = luma(a[..., :3]) * 255.0
    y = (y - 128.0) * args.contrast + 128.0
    y = y.clip(0, 255)
    out = np.dstack([y, y, y, a[..., 3]]).round().astype(np.uint8)
    result = Image.fromarray(out)
    save(result if has_alpha else result.convert("RGB"), args.output)
    print(f"mono  {args.input} -> {args.output}")


def cmd_hald(args) -> None:
    level = 8  # 64³ colours in a 512×512 image
    size = level**2
    n = size**3
    idx = np.arange(n)
    r = (idx % size) * 255.0 / (size - 1)
    g = ((idx // size) % size) * 255.0 / (size - 1)
    b = (idx // (size * size)) * 255.0 / (size - 1)
    rgb = np.stack([r, g, b], axis=-1)
    t = (luma(rgb) - args.lo) / max(args.hi - args.lo, 1e-6)
    mapped = strip_map(t, args.mid).round().clip(0, 255).astype(np.uint8)
    side = level**3
    save(Image.fromarray(mapped.reshape(side, side, 3)), args.output)
    print(f"hald  -> {args.output}  lo={args.lo} hi={args.hi} mid={args.mid}")


def main() -> None:
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = p.add_subparsers(dest="mode", required=True)
    s = sub.add_parser("strip")
    s.add_argument("input")
    s.add_argument("output")
    s.add_argument("--mid", type=float, default=0.5, help="where #278CF0 sits on the 0..1 brightness scale")
    s.add_argument("--lo", type=float, default=1.0, help="percentile mapped to #0055A8")
    s.add_argument("--hi", type=float, default=99.5, help="percentile mapped to white")
    s.add_argument("--range", help="fixed luma range 'lo,hi' (0..1) instead of per-image percentiles, to keep a set consistent")
    m = sub.add_parser("mono")
    m.add_argument("input")
    m.add_argument("output")
    m.add_argument("--contrast", type=float, default=1.06)
    h = sub.add_parser("hald")
    h.add_argument("output")
    h.add_argument("--lo", type=float, required=True)
    h.add_argument("--hi", type=float, required=True)
    h.add_argument("--mid", type=float, default=0.5)
    args = p.parse_args()
    {"strip": cmd_strip, "mono": cmd_mono, "hald": cmd_hald}[args.mode](args)


if __name__ == "__main__":
    main()
