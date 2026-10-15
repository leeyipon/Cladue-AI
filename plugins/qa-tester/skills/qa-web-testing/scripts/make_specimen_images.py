"""Generate clearly-fake test images for identity-verification QA.

Every image is labelled SPECIMEN / QA TEST DATA. Never use real passports, ID cards or
real people's faces for testing.

Usage: python make_specimen_images.py <out_dir>     (needs Pillow)
"""
import os
import sys

from PIL import Image, ImageDraw, ImageFont


def font(size):
    for p in ["/System/Library/Fonts/Supplemental/Arial Bold.ttf", "/System/Library/Fonts/Supplemental/Arial.ttf",
              "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"]:
        try:
            return ImageFont.truetype(p, size)
        except Exception:
            pass
    return ImageFont.load_default()


def mono(size):
    for p in ["/System/Library/Fonts/Supplemental/Courier New.ttf", "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf"]:
        try:
            return ImageFont.truetype(p, size)
        except Exception:
            pass
    return font(size)


def passport(path):
    im = Image.new("RGB", (1250, 880), "#e8eef5")
    d = ImageDraw.Draw(im)
    d.rectangle([0, 0, 1250, 90], fill="#1d3557")
    d.text((40, 22), "PASSPORT — SPECIMEN (QA TEST DATA)", fill="white", font=font(40))
    d.rectangle([60, 140, 390, 560], fill="#a8b3c4")
    fields = [("Surname", "TESTER"), ("Given names", "QATEST"), ("Nationality", "CAMBODIAN"), ("Date of birth", "20 MAY 1995"),
              ("Sex", "M"), ("Passport No.", "N00000000"), ("Date of expiry", "20 MAY 2032")]
    for k, (label, value) in enumerate(fields):
        d.text((440, 150 + k * 58), label, fill="#667", font=font(22))
        d.text((440, 174 + k * 58), value, fill="#111", font=font(28))
    d.text((40, 735), "P<KHMTESTER<<QATEST<<<<<<<<<<<<<<<<<<<<<<<<<", fill="#111", font=mono(30))
    d.text((40, 785), "N000000000KHM9505200M3205200<<<<<<<<<<<<<<00", fill="#111", font=mono(30))
    im.save(path, quality=92)


def id_card(path, side):
    im = Image.new("RGB", (1012, 638), "#eef3e8")
    d = ImageDraw.Draw(im)
    d.rectangle([0, 0, 1012, 80], fill="#2d6a4f")
    d.text((30, 20), f"NATIONAL ID — {side} — SPECIMEN", fill="white", font=font(34))
    if side == "FRONT":
        d.rectangle([40, 120, 280, 420], fill="#b7c4b0")
        for k, t in enumerate(["Name: QAREJECT SPECIMEN", "DOB: 12.03.1990", "Sex: F", "ID No.: 000000000"]):
            d.text((320, 150 + k * 60), t, fill="#111", font=font(28))
    else:
        d.text((40, 180), "Address: 45 QA AVENUE, SIEM REAP", fill="#111", font=mono(30))
        d.text((40, 500), "IDKHM000000000<<<<<<<<<<<<<<<", fill="#111", font=mono(30))
    im.save(path, quality=92)


def drawn_selfie(path):
    """A cartoon face: any eKYC that accepts this has no real liveness / face match."""
    im = Image.new("RGB", (900, 1100), "#dfe7ef")
    d = ImageDraw.Draw(im)
    d.ellipse([220, 200, 680, 800], fill="#e0b48f")
    d.ellipse([345, 432, 395, 468], fill="#333")
    d.ellipse([505, 432, 555, 468], fill="#333")
    d.arc([370, 520, 530, 680], 20, 160, fill="#733", width=8)
    d.text((150, 1010), "SYNTHETIC SELFIE — QA TEST DATA", fill="#2c2c2c", font=font(34))
    im.save(path, quality=92)


if __name__ == "__main__":
    out = sys.argv[1] if len(sys.argv) > 1 else "test-data"
    os.makedirs(out, exist_ok=True)
    passport(os.path.join(out, "specimen_passport.jpg"))
    id_card(os.path.join(out, "specimen_id_front.jpg"), "FRONT")
    id_card(os.path.join(out, "specimen_id_back.jpg"), "BACK")
    drawn_selfie(os.path.join(out, "synthetic_selfie_drawn.jpg"))
    with open(os.path.join(out, "notes.txt"), "w") as f:
        f.write("not an image - used for wrong-file-type tests")
    print("specimen images written to", out)
