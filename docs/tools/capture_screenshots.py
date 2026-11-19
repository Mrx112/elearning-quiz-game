"""
capture_screenshots.py — Ambil screenshot lengkap aplikasi untuk laporan PDF.

Pemakaian (server harus berjalan, mis. `npm run build && npx vite preview --port 5290`):
    python docs/tools/capture_screenshots.py http://localhost:5290/
Butuh: pip install playwright  (memakai Google Chrome yang terpasang)
Hasil: docs/screenshots/*.png
"""
import sys
from pathlib import Path
from playwright.sync_api import sync_playwright

URL = sys.argv[1] if len(sys.argv) > 1 else 'http://localhost:5290/'
OUT = Path(__file__).resolve().parents[1] / 'screenshots'
OUT.mkdir(parents=True, exist_ok=True)
errors = []


def watch(pg):
    pg.on('pageerror', lambda e: errors.append(f'PAGEERROR {e}'))
    pg.on('console', lambda m: errors.append(f'console.{m.type}: {m.text}') if m.type == 'error' else None)
    pg.on('response', lambda r: errors.append(f'HTTP {r.status} {r.url}') if r.status >= 400 else None)


def fresh(pg):
    pg.goto(URL)
    pg.evaluate('localStorage.clear()')
    pg.reload()
    pg.wait_for_timeout(1500)


def shot(pg, name):
    pg.mouse.move(2, 2)
    pg.screenshot(path=str(OUT / f'{name}.png'))
    print('  ', name)


with sync_playwright() as p:
    b = p.chromium.launch(channel='chrome', headless=True)
    pg = b.new_page(viewport={'width': 1600, 'height': 940})
    watch(pg)
    fresh(pg)
    shot(pg, '01-halaman-pembuka')

    # ── alur main ──
    pg.get_by_role('button', name='Mulai Bermain').click()
    for i in range(18):
        pg.wait_for_timeout(2600)
        num = i + 1
        shot(pg, f'slide-{num:02d}')
        opts = pg.locator('button[aria-label^="Jawaban:"]:not([disabled])')
        if opts.count():
            # cari jawaban benar: coba klik satu per satu (screenshot salah & benar pada slide swan)
            for k in range(opts.count()):
                btn = pg.locator('button[aria-label^="Jawaban:"]:not([disabled])').first
                if num == 9 and k == 0:
                    # sengaja jawab salah dulu → screenshot umpan balik salah
                    pg.locator('button[aria-label="Jawaban: rabbit"]').click()
                    pg.wait_for_timeout(700)
                    shot(pg, 'feedback-salah')
                    pg.wait_for_timeout(1700)
                    pg.locator('button[aria-label="Jawaban: swan"]').click()
                    pg.wait_for_timeout(900)
                    shot(pg, 'feedback-benar')
                    break
                btn.click()
                pg.wait_for_timeout(800)
                txt = pg.locator('[role=status]').inner_text() if pg.locator('[role=status]').count() else ''
                if 'Benar' in txt:
                    if num == 4:
                        shot(pg, 'feedback-benar-lampu')
                    break
                pg.wait_for_timeout(1800)
            pg.locator('[role=status] button', has_text='Lanjut').first.click()
            continue
        if num < 18:
            pg.get_by_role('button', name='Lanjut').last.click()
    pg.wait_for_timeout(2500)
    shot(pg, 'hasil-akhir')

    # hover teks (efek bisa diklik untuk dibacakan)
    fresh(pg)
    pg.get_by_role('button', name='Mulai Bermain').click()
    pg.wait_for_timeout(2500)
    pg.get_by_role('button', name='Lanjut').last.click()
    pg.wait_for_timeout(2500)
    box = pg.locator('[aria-label="Father"]').last.bounding_box()
    pg.mouse.move(box['x'] + box['width'] / 2, box['y'] + box['height'] / 2)
    pg.wait_for_timeout(500)
    pg.screenshot(path=str(OUT / 'fitur-hover-teks.png'))

    # ── admin ──
    fresh(pg)
    pg.get_by_role('button', name='Admin / Kelola Konten').click()
    pg.wait_for_timeout(500)
    shot(pg, 'admin-01-pin')
    pg.keyboard.type('1234')
    pg.wait_for_timeout(1200)
    shot(pg, 'admin-02-editor')
    pg.get_by_text('Kuis — Swan').first.click()
    pg.wait_for_timeout(800)
    shot(pg, 'admin-03-pengaturan-slide-kuis')
    pg.locator('[aria-label^="Pilihan: swan"]').first.click()
    pg.wait_for_timeout(500)
    shot(pg, 'admin-04-edit-pilihan-jawaban')
    pg.locator('aside').last.evaluate('e => e.scrollTo(0, 900)')
    pg.wait_for_timeout(300)
    shot(pg, 'admin-05-kunci-jawaban-suara')
    pg.locator('[aria-label^="Teks: What is this animal"]').first.click()
    pg.wait_for_timeout(400)
    shot(pg, 'admin-06-edit-teks')
    pg.locator('[aria-label^="Gambar"]').first.click()
    pg.wait_for_timeout(400)
    shot(pg, 'admin-07-edit-gambar')
    pg.locator('text=Desain Canva').click()
    pg.wait_for_timeout(600)
    shot(pg, 'admin-08-overlay-desain-canva')
    pg.locator('text=Desain Canva').click()
    pg.get_by_role('button', name='Gambar').first.click()
    pg.wait_for_timeout(1000)
    shot(pg, 'admin-09-pustaka-aset')
    pg.locator('[aria-label="Tutup"]').first.click()
    pg.get_by_role('button', name='Slide baru').click()
    pg.wait_for_timeout(300)
    shot(pg, 'admin-10-tambah-slide')
    pg.get_by_text('Kuis 3 pilihan').click()
    pg.wait_for_timeout(800)
    shot(pg, 'admin-11-slide-kuis-baru')
    for name, f in (('Pengaturan', 'admin-12-pengaturan'), ('Backup & Reset', 'admin-13-backup-reset'), ('Panduan', 'admin-15-panduan')):
        pg.get_by_role('button', name=name, exact=True).click()
        pg.wait_for_timeout(700)
        shot(pg, f)
        if name == 'Backup & Reset':
            pg.get_by_role('button', name='Reset ke default…').click()
            pg.wait_for_timeout(300)
            shot(pg, 'admin-14-konfirmasi-reset')
            pg.get_by_role('button', name='Ya, reset sekarang').click()
            pg.wait_for_timeout(600)
    b.close()

    # ── perangkat lain ──
    for name, vp in (('perangkat-hp-mendatar', (844, 390)), ('perangkat-tablet', (1024, 768)), ('perangkat-hp-tegak', (390, 844))):
        b = p.chromium.launch(channel='chrome', headless=True)
        pg = b.new_page(viewport={'width': vp[0], 'height': vp[1]}, device_scale_factor=2, is_mobile=True, has_touch=True)
        watch(pg)
        fresh(pg)
        pg.get_by_role('button', name='Mulai Bermain').click()
        for _ in range(8):
            pg.wait_for_timeout(700)
            if pg.locator('button[aria-label^="Jawaban:"]:not([disabled])').count():
                break
            pg.get_by_role('button', name='Lanjut').last.click()
        pg.wait_for_timeout(1800)
        shot(pg, name)
        b.close()

print('\n'.join(errors) if errors else 'TANPA ERROR KONSOL / GAMBAR RUSAK')
