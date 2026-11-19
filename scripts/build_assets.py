"""
build_assets.py — Merangkai aset Canva "ICT ELEMENT" menjadi aset web siap pakai.

Jalankan dari root proyek:
    python scripts/build_assets.py                 # semua slide
    python scripts/build_assets.py "slide 8" --ui  # hanya slide tertentu / skin tombol

Input : ICT ELEMENT/ICT ELEMENT/slide */*.jpg   (layer 1920x1080 hasil ekspor Canva)
Output: public/assets/slides/
          sXX/bg.webp            → background bersih (teks & karakter dihapus agar bisa
                                   ditampilkan ulang sebagai elemen interaktif)
          sXX/<elemen>.webp      → cutout transparan (karakter, hewan, mobil, bubble, …)
          ui/*.webp              → skin tombol (krem, pink)
          library/sXX/*.webp     → SEMUA layer asli dalam bentuk cutout transparan
                                   (dipakai "Pustaka Aset" di Admin Panel)
          reference/sXX.jpg      → gambar "gambaran" (desain jadi) untuk pembanding
        src/data/assetManifest.json → posisi/ukuran semua elemen (dipakai defaultSlides.js)

Butuh: pip install pillow numpy opencv-python
"""
import json
import os
import re
import sys

import cv2
import numpy as np
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'ICT ELEMENT', 'ICT ELEMENT')
OUT = os.path.join(ROOT, 'public', 'assets', 'slides')
MANIFEST = os.path.join(ROOT, 'src', 'data', 'assetManifest.json')
W, H = 1920, 1080


# ───────────────────────────── util dasar ─────────────────────────────
def load(slide, fn):
    return np.array(Image.open(os.path.join(SRC, slide, fn)).convert('RGB'))


def slug(name):
    s = os.path.splitext(name)[0].strip().lower()
    s = re.sub(r'[^a-z0-9]+', '-', s).strip('-')
    return s


def sid(slide):  # 'slide 9-1' -> 's09-1'
    n = slide.split()[1]
    a, *b = n.split('-')
    return f"s{int(a):02d}" + (f"-{b[0]}" if b else '')


def save_webp(arr_rgba, path, quality=86):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    Image.fromarray(arr_rgba).save(path, 'WEBP', quality=quality, method=4)


def save_bg(arr_rgb, path, quality=84):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    Image.fromarray(arr_rgb).save(path, 'WEBP', quality=quality, method=4)


def border_bg(a):
    b = np.concatenate([a[0], a[-1], a[:, 0], a[:, -1]])
    q = (b // 4).astype(np.int32)
    key = q[:, 0] * 65536 + q[:, 1] * 256 + q[:, 2]
    vals, cnt = np.unique(key, return_counts=True)
    return b[key == vals[cnt.argmax()]].mean(0)


def cutout(a, tol=20, bg=None):
    """Hapus latar polos (krem/putih) yang terhubung ke tepi → (rgba, box)."""
    if bg is None:
        bg = border_bg(a)
    d = np.abs(a.astype(np.float32) - bg).max(2)
    cand = (d <= tol).astype(np.uint8)
    _, lab = cv2.connectedComponents(cand, connectivity=4)
    bl = np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))
    bl = bl[bl != 0]
    bgm = np.isin(lab, bl) & (cand > 0)
    fg = (~bgm).astype(np.uint8)
    n, lab2, st, _ = cv2.connectedComponentsWithStats(fg, connectivity=8)
    if n > 1:
        areas = st[1:, cv2.CC_STAT_AREA]
        keep = np.zeros(n, bool)
        keep[1:] = areas >= max(40, areas.max() * 0.004)
        fg = keep[lab2].astype(np.uint8)
    return finish_alpha(a, fg, bg, d, tol)


def finish_alpha(a, fg, bg, d, tol):
    # alpha lembut di tepi + hilangkan "halo" warna latar
    inner = cv2.erode(fg, np.ones((3, 3), np.uint8))
    edge = (fg > 0) & (inner == 0)
    alpha = fg.astype(np.float32)
    soft = np.clip((d - tol * 0.35) / (tol * 2.2), 0.15, 1.0)
    alpha[edge] = soft[edge]
    alpha = cv2.GaussianBlur(alpha, (3, 3), 0.6) * (fg > 0)
    rgb = a.astype(np.float32)
    al = np.maximum(alpha, 1e-3)[..., None]
    un = (rgb - (1 - al) * bg) / al
    rgb = np.where(edge[..., None], np.clip(un, 0, 255), rgb)
    rgba = np.dstack([rgb, alpha * 255]).astype(np.uint8)
    ys, xs = np.where(fg > 0)
    if len(xs) == 0:
        return None, None
    box = (int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1)
    return rgba, box


def crop(rgba, box):
    x0, y0, x1, y1 = box
    return rgba[y0:y1, x0:x1]


def scale_rgba(rgba, s):
    if abs(s - 1) < 1e-3:
        return rgba
    h, w = rgba.shape[:2]
    return cv2.resize(rgba, (max(1, round(w * s)), max(1, round(h * s))), interpolation=cv2.INTER_AREA if s < 1 else cv2.INTER_CUBIC)


def place_mask(rgba_c, x, y, dil=6):
    """Mask (1920x1080) dari cutout ter-crop yang ditempatkan di (x, y)."""
    m = np.zeros((H, W), np.uint8)
    h, w = rgba_c.shape[:2]
    x, y = int(round(x)), int(round(y))
    x0, y0, x1, y1 = max(0, x), max(0, y), min(W, x + w), min(H, y + h)
    if x1 <= x0 or y1 <= y0:
        return m
    m[y0:y1, x0:x1] = (rgba_c[y0 - y:y1 - y, x0 - x:x1 - x, 3] > 10).astype(np.uint8)
    if dil:
        m = cv2.dilate(m, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (dil * 2 + 1, dil * 2 + 1)))
    return m


def color_mask(G, box, color, tol, pad=10):
    x0, y0, x1, y1 = box
    x0, y0, x1, y1 = max(0, x0 - pad), max(0, y0 - pad), min(W, x1 + pad), min(H, y1 + pad)
    m = np.zeros((H, W), np.uint8)
    sub = G[y0:y1, x0:x1].astype(np.float32)
    d = np.sqrt(((sub - np.array(color, np.float32)) ** 2).sum(2))
    m[y0:y1, x0:x1] = (d < tol).astype(np.uint8)
    return m


def snap_rect(G, approx, color, tol=26, margin=(230, 70)):
    """Cari kotak tombol berwarna `color` di sekitar `approx` → (x0,y0,x1,y1)."""
    x0, y0, x1, y1 = approx
    mx, my = margin
    wx0, wy0 = max(0, x0 - mx), max(0, y0 - my)
    wx1, wy1 = min(W, x1 + mx), min(H, y1 + my)
    sub = G[wy0:wy1, wx0:wx1].astype(np.float32)
    d = np.sqrt(((sub - np.array(color, np.float32)) ** 2).sum(2))
    m = (d < tol).astype(np.uint8)
    m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, np.ones((25, 25), np.uint8))
    n, lab, st, _ = cv2.connectedComponentsWithStats(m, connectivity=8)
    if n <= 1:
        return list(approx)
    # komponen terbesar yang beririsan dengan pusat approx
    cx, cy = (x0 + x1) // 2 - wx0, (y0 + y1) // 2 - wy0
    best, barea = None, 0
    for i in range(1, n):
        bx, by, bw, bh, area = st[i]
        if bx <= cx <= bx + bw and by <= cy <= by + bh and area > barea:
            best, barea = i, area
    if best is None:
        best = 1 + int(st[1:, cv2.CC_STAT_AREA].argmax())
    bx, by, bw, bh, _ = st[best]
    return [int(wx0 + bx), int(wy0 + by), int(wx0 + bx + bw), int(wy0 + by + bh)]


def inpaint(G, mask):
    """Isi area mask. Area besar di-inpaint di resolusi 1/2 lalu diperhalus."""
    if mask.sum() == 0:
        return G
    small = cv2.resize(G, (W // 2, H // 2), interpolation=cv2.INTER_AREA)
    ms = cv2.resize(mask, (W // 2, H // 2), interpolation=cv2.INTER_NEAREST)
    ms = cv2.dilate(ms, np.ones((3, 3), np.uint8))
    bgr = cv2.cvtColor(small, cv2.COLOR_RGB2BGR)
    filled = cv2.inpaint(bgr, ms * 255, 9, cv2.INPAINT_TELEA)
    filled = cv2.cvtColor(filled, cv2.COLOR_BGR2RGB)
    up = cv2.resize(filled, (W, H), interpolation=cv2.INTER_CUBIC)
    # sedikit tekstur agar tidak terlalu "licin"
    noise = np.random.default_rng(7).normal(0, 2.2, up.shape)
    up = np.clip(up.astype(np.float32) + noise, 0, 255)
    soft = cv2.GaussianBlur(mask.astype(np.float32), (9, 9), 3)[..., None]
    soft = np.clip(soft * 1.6, 0, 1)
    out = G.astype(np.float32) * (1 - soft) + up * soft
    return out.astype(np.uint8)


def remove_glyphs(rgba_c, dark_luma=120):
    """Hapus teks (komponen gelap kecil) di dalam bubble → bubble kosong."""
    rgb = rgba_c[..., :3].astype(np.float32)
    luma = rgb @ np.array([0.299, 0.587, 0.114])
    sat = rgb.max(2) - rgb.min(2)
    alpha = rgba_c[..., 3]
    dark = ((luma < dark_luma) | ((sat > 90) & (rgb[..., 0] > rgb[..., 1] + 60))) & (alpha > 200)
    dark = dark.astype(np.uint8)
    n, lab, st, _ = cv2.connectedComponentsWithStats(dark, connectivity=8)
    h, w = dark.shape
    # badan bubble = komponen alpha terbesar (lingkaran kecil "thought bubble" terpisah → tidak disentuh)
    na, la, sa, _ = cv2.connectedComponentsWithStats((alpha > 128).astype(np.uint8), connectivity=8)
    big = 1 + int(sa[1:, cv2.CC_STAT_AREA].argmax())
    X0, Y0, BW, BH = sa[big, :4]
    kill = np.zeros_like(dark)
    for i in range(1, n):
        bx, by, bw, bh, area = st[i]
        inside = bx >= X0 + BW * 0.06 and by >= Y0 + BH * 0.06 and bx + bw <= X0 + BW * 0.94 and by + bh <= Y0 + BH * 0.94
        if bw * bh < 0.25 * w * h and inside:
            kill[lab == i] = 1
    if kill.sum() == 0:
        return rgba_c
    kill = cv2.dilate(kill, np.ones((5, 5), np.uint8))
    bgr = cv2.cvtColor(rgba_c[..., :3], cv2.COLOR_RGB2BGR)
    filled = cv2.cvtColor(cv2.inpaint(bgr, kill * 255, 5, cv2.INPAINT_TELEA), cv2.COLOR_BGR2RGB)
    out = rgba_c.copy()
    out[..., :3] = np.where(kill[..., None] > 0, filled, rgba_c[..., :3])
    return out


def match(G, rgba_c, guess=None, scales=None):
    """Template match cutout ke G → (x, y, scale)."""
    T = rgba_c[..., :3].astype(np.float32)
    M = (rgba_c[..., 3] > 128).astype(np.float32)
    f = 0.25
    Gs = cv2.resize(G, None, fx=f, fy=f, interpolation=cv2.INTER_AREA).astype(np.float32)
    best = None
    for s in (scales if scales is not None else np.geomspace(0.7, 1.4, 25)):
        w, h = int(round(T.shape[1] * s * f)), int(round(T.shape[0] * s * f))
        if w < 6 or h < 6 or w > Gs.shape[1] or h > Gs.shape[0]:
            continue
        Ts = cv2.resize(T, (w, h), interpolation=cv2.INTER_AREA)
        Ms = (cv2.resize(M, (w, h), interpolation=cv2.INTER_AREA) > 0.5).astype(np.float32)
        r = cv2.matchTemplate(Gs, Ts, cv2.TM_SQDIFF, mask=cv2.merge([Ms] * 3)) / (Ms.sum() * 3)
        mn, _, loc, _ = cv2.minMaxLoc(r)
        if best is None or mn < best[0]:
            best = (mn, s, loc[0] / f, loc[1] / f)
    return best[2], best[3], best[1]


# ───────────────────────────── spesifikasi slide ─────────────────────────────
CREAM = (253, 234, 208)
PINK = (232, 176, 176)
RED_TXT = (168, 35, 31)

# fg     : layer yang dijadikan elemen terpisah (dan dihapus dari background)
#          (file, id, opsi) ; opsi: place=(x,y,scale) | strip_text=True
# texts  : teks yang dihapus dari background (dirender ulang sebagai HTML)
#          (id, box, warna, toleransi)
# rects  : kotak tombol/teks → (id, box perkiraan, warna) → di-snap ke posisi persis
# bg     : 'gen' (dari gambaran) atau nama file background bersih milik klien
SPEC = {
    'slide 1': dict(bg='gen', fg=[('ayah.jpg', 'ayah', {}), ('anak .jpg', 'liam', {}), ('ibu .JPG', 'ibu', {})],
                    texts=[('kalimat', (1160, 105, 1756, 305), RED_TXT, 95)]),
    'slide 2': dict(bg='gen', fg=[('ayah .jpg', 'ayah', {'place': 'match'}), ('ibu .JPG', 'ibu', {'place': 'match'}),
                                  ('bubble percakapan ayah.jpg', 'bubble-ayah', {'strip_text': True}),
                                  ('bubble percakapan ibu.jpg', 'bubble-ibu', {'strip_text': True})]),
    'slide 3': dict(bg='gen', fg=[('mobil .jpg', 'mobil', {}), ('bubble percakapan .jpg', 'bubble', {'strip_text': True})]),
    'slide 4': dict(bg='background.jpg', fg=[('lampu lalu lintas merah .jpg', 'lampu', {}), ('panah .jpg', 'panah', {}), ('mobil .jpg', 'mobil', {})],
                    textboxes=[('kalimat .jpg', 'kalimat')]),
    'slide 5': dict(bg='background .jpeg', fg=[('lampu lalu lintas kuning .jpg', 'lampu', {}), ('panah .jpg', 'panah', {}), ('mobil .jpg', 'mobil', {})],
                    textboxes=[('kalimat .jpg', 'kalimat')]),
    'slide 6': dict(bg='background .jpeg', fg=[('lampu lalu lintas hijau .jpg', 'lampu', {}), ('tanda panah.jpg', 'panah', {}), ('mobil .jpg', 'mobil', {})],
                    textboxes=[('kalimat .jpg', 'kalimat')]),
    'slide 8': dict(bg='background .jpeg', special='s8'),
    'slide 9': dict(bg='background .jpg', rects=[('air-paradise', (421, 514, 810, 582), PINK), ('wild-safari', (892, 695, 1229, 749), PINK), ('sea-world', (1499, 541, 1814, 594), PINK)]),
    'slide 11': dict(bg='background .jpg', rects=[('air-paradise', (421, 514, 810, 582), PINK), ('wild-safari', (892, 695, 1229, 749), PINK), ('sea-world', (1499, 541, 1814, 594), PINK)]),
    'slide 14': dict(bg='background .jpg', rects=[('air-paradise', (421, 514, 810, 582), PINK), ('wild-safari', (892, 695, 1229, 749), PINK), ('sea-world', (1499, 541, 1814, 594), PINK)]),
    'slide 9-1': dict(bg='gen', fg=[('angsa .jpg', 'angsa', {})],
                      rects=[('question', (556, 62, 1389, 133), CREAM), ('opt-swan', (411, 274, 653, 323), CREAM), ('opt-rabbit', (1191, 245, 1471, 323), CREAM)]),
    'slide 10': dict(bg='gen', fg=[('kupu kupu .jpg', 'kupu', {})],
                     rects=[('question', (560, 40, 1390, 190), CREAM), ('opt-butterfly', (372, 244, 768, 344), CREAM), ('opt-bird', (1233, 245, 1413, 323), CREAM)]),
    'slide 11-1': dict(bg='gen', fg=[('gajah hewan.jpg', 'gajah', {})],
                       texts=[('question', (715, 34, 1879, 125), (0, 0, 0), 150)],
                       rects=[('opt-big', (1091, 209, 1207, 290), CREAM), ('opt-small', (1561, 214, 1768, 276), CREAM)]),
    'slide 12': dict(bg='gen',  # macan tutul tetap menyatu dgn background (di desain ia tertutup semak)
                     texts=[('question', (603, 26, 1864, 288), (0, 0, 0), 150)],
                     rects=[('opt-meat', (700, 385, 1000, 495), CREAM), ('opt-grass', (1410, 380, 1712, 500), CREAM)]),
    'slide 13': dict(bg='gen', fg=[('gerapah .jpg', 'jerapah', {})],
                     texts=[('question', (847, 48, 1847, 168), (0, 0, 0), 150)],
                     rects=[('opt-yes', (1161, 212, 1310, 278), CREAM), ('opt-no', (1600, 210, 1720, 280), CREAM)]),
    'slide 14-1': dict(bg='gen', rects=[('label-monkey', (827, 234, 1290, 354), CREAM)]),
    'slide 15': dict(bg='background .jpeg', fg=[('kura kura .jpg', 'kura', {}), ('lumba lumba .jpg', 'lumba', {}), ('paus .jpg', 'paus', {})],
                     rects=[('label-turtle', (49, 218, 340, 300), CREAM), ('label-dolphin', (1481, 209, 1871, 314), CREAM), ('label-whale', (1456, 803, 1803, 898), CREAM)]),
    'slide 16': dict(bg='ending .jpeg'),
}


def ref_name(slide, files):
    for f in files:
        if f.lower().startswith('gambaran'):
            return f
    return {'slide 10': 'what is this animal.jpeg', 'slide 16': 'whale.jpeg'}.get(slide)


def special_s8(slide, G, out_dir, entry):
    """Slide 8: layer mobil & bubble punya latar langit (bukan polos) → pisahkan dengan selisih."""
    car = load(slide, 'mobil .jpeg').astype(np.int16)
    bub = load(slide, 'bubble percakapan .jpeg').astype(np.int16)
    diff = np.abs(car - bub).max(2)
    m = (diff > 28).astype(np.uint8)
    m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, np.ones((5, 5), np.uint8))
    n, lab, st, _ = cv2.connectedComponentsWithStats(m, connectivity=8)
    for src, key, pick in ((car, 'mobil', 'low'), (bub, 'bubble', 'high')):
        comps = [i for i in range(1, n) if st[i, cv2.CC_STAT_AREA] > 300]
        cy = lambda i: st[i, cv2.CC_STAT_TOP] + st[i, cv2.CC_STAT_HEIGHT] / 2
        mid = H * 0.58
        sel = [i for i in comps if (cy(i) > mid) == (pick == 'low')]
        fg = np.isin(lab, sel).astype(np.uint8)
        # isi lubang (kaca mobil, isi bubble)
        cnts, _ = cv2.findContours(fg, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
        fill = np.zeros_like(fg)
        cv2.drawContours(fill, cnts, -1, 1, -1)
        a = src.astype(np.uint8)
        d = np.full((H, W), 255.0, np.float32)
        rgba, box = finish_alpha(a, fill, border_bg(a), d, 20)
        c = crop(rgba, box)
        if key == 'bubble':
            c = remove_glyphs(c)
        # target posisi di desain jadi (diukur dari gambaran slide 8): (x0, y0, x1)
        tx0, ty0, tx1 = {'mobil': (770, 705, 1532), 'bubble': (856, 456, 1202)}[key]
        s = (tx1 - tx0) / c.shape[1]
        x, y = tx0, ty0
        c = scale_rgba(c, s)
        save_webp(c, os.path.join(out_dir, f'{key}.webp'))
        entry['elements'][key] = dict(src=f'{sid(slide)}/{key}.webp', box=[round(x), round(y), round(x + c.shape[1]), round(y + c.shape[0])])
        print(f'   s8 {key}: x={x:.0f} y={y:.0f} s={s:.3f}')
    entry['bg'] = f'{sid(slide)}/bg.webp'


def main():
    os.makedirs(OUT, exist_ok=True)
    args = sys.argv[1:]
    only = [a for a in args if not a.startswith('--')]
    do_ui = '--ui' in args or not only
    manifest = {}
    if only and os.path.exists(MANIFEST):
        with open(MANIFEST, encoding='utf-8') as fh:
            manifest = json.load(fh)
    slides = sorted(os.listdir(SRC), key=lambda s: float(s.split()[1].replace('-', '.')))
    if only:
        slides = [s for s in slides if s in only]
    for slide in slides:
        files = sorted(os.listdir(os.path.join(SRC, slide)))
        rname = ref_name(slide, files)
        G = load(slide, rname)
        key = sid(slide)
        out_dir = os.path.join(OUT, key)
        os.makedirs(out_dir, exist_ok=True)
        spec = SPEC.get(slide, {})
        entry = dict(folder=slide, reference=f'reference/{key}.jpg', elements={}, rects={}, texts={}, library=[])
        print(f'== {slide} ({key})')

        # 1) referensi desain jadi
        os.makedirs(os.path.join(OUT, 'reference'), exist_ok=True)
        ref_path = os.path.join(OUT, 'reference', f'{key}.jpg')
        if not os.path.exists(ref_path):
            Image.fromarray(G).resize((1280, 720), Image.LANCZOS).save(ref_path, quality=78)

        # 2) pustaka: semua layer → cutout transparan
        cut_cache = {}
        for fn in files:
            if fn == rname:
                continue
            a = load(slide, fn)
            name = slug(fn)
            full_frame = fn.lower().startswith(('background', 'ending'))
            lib_path = os.path.join(OUT, 'library', key, f'{name}.webp')
            if full_frame:
                if not os.path.exists(lib_path):
                    save_bg(a, lib_path)
                entry['library'].append(dict(name=name, file=fn, src=f'library/{key}/{name}.webp', box=[0, 0, W, H], full=True))
                continue
            rgba, box = cutout(a)
            if rgba is None:
                continue
            cut_cache[fn] = (rgba, box)
            if not os.path.exists(lib_path):
                save_webp(crop(rgba, box), lib_path)
            entry['library'].append(dict(name=name, file=fn, src=f'library/{key}/{name}.webp', box=list(box)))

        mask = np.zeros((H, W), np.uint8)

        # 3) elemen foreground
        for fn, eid, opt in spec.get('fg', []):
            rgba, box = cut_cache[fn]
            c = crop(rgba, box)
            x, y = box[0], box[1]
            if opt.get('place') == 'match':
                lo, hi = opt.get('scales', (1.2, 1.8))
                x, y, s = match(G, c, scales=np.geomspace(lo, hi, 31))
                c = scale_rgba(c, s)
                print(f'   {eid}: match x={x:.0f} y={y:.0f} s={s:.3f}')
            mask |= place_mask(c, x, y, dil=7)
            if opt.get('strip_text'):
                c = remove_glyphs(c)
            save_webp(c, os.path.join(out_dir, f'{eid}.webp'))
            entry['elements'][eid] = dict(src=f'{key}/{eid}.webp', box=[round(x), round(y), round(x + c.shape[1]), round(y + c.shape[0])])

        if spec.get('special') == 's8':
            special_s8(slide, G, out_dir, entry)

        # 4) teks yang dirender ulang
        for tid, box, color, tol in spec.get('texts', []):
            mask |= cv2.dilate(color_mask(G, box, color, tol), np.ones((7, 7), np.uint8))
            entry['texts'][tid] = list(box)
        for fn, tid in spec.get('textboxes', []):
            entry['texts'][tid] = list(cut_cache[fn][1])

        # 5) kotak tombol
        for rid, approx, color in spec.get('rects', []):
            r = snap_rect(G, approx, color)
            entry['rects'][rid] = r
            m = np.zeros((H, W), np.uint8)
            m[max(0, r[1] - 12):r[3] + 12, max(0, r[0] - 12):r[2] + 12] = 1
            # sudut membulat / bayangan kotak: hapus juga piksel sewarna di sekitarnya
            near = color_mask(G, r, color, 52, pad=16)
            mask |= m | cv2.dilate(near, np.ones((11, 11), np.uint8))
            print(f'   rect {rid}: {r}')

        # 6) background
        bgspec = spec.get('bg', 'gen')
        if bgspec == 'gen':
            bg = inpaint(G, mask)
            save_bg(bg, os.path.join(out_dir, 'bg.webp'))
        else:
            bgsrc = load(slide, bgspec)
            save_bg(bgsrc, os.path.join(out_dir, 'bg.webp'))
        entry['bg'] = f'{key}/bg.webp'
        manifest[key] = entry

    # 7) skin tombol
    if do_ui:
        ui = os.path.join(OUT, 'ui')
        for slide, fn, name in (('slide 9-1', 'button .jpg', 'button-cream'), ('slide 9', 'button.jpg', 'button-pink')):
            rgba, box = cutout(load(slide, fn))
            save_webp(crop(rgba, box), os.path.join(ui, f'{name}.webp'))
        manifest['_ui'] = {'buttonCream': 'ui/button-cream.webp', 'buttonPink': 'ui/button-pink.webp'}

    with open(MANIFEST, 'w', encoding='utf-8') as fh:
        json.dump(manifest, fh, indent=1)
    print('manifest ->', MANIFEST)


if __name__ == '__main__':
    main()
