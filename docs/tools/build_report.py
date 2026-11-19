"""
build_report.py — Susun LAPORAN + PANDUAN PENGGUNAAN (PDF) dari screenshot di docs/screenshots/.

Pemakaian:
    python docs/tools/capture_screenshots.py http://localhost:5290/   # (sekali, ambil screenshot)
    python docs/tools/build_report.py
Hasil: docs/pdf/Laporan-dan-Panduan-Liam-Goes-to-the-Zoo.pdf
Butuh: pip install playwright ; Google Chrome
"""
import html
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[2]
SHOTS = ROOT / 'docs' / 'screenshots'
REF = ROOT / 'public' / 'assets' / 'slides' / 'reference'
OUT = ROOT / 'docs' / 'pdf' / 'Laporan-dan-Panduan-Liam-Goes-to-the-Zoo.pdf'
FONTS = ROOT / 'node_modules' / '@fontsource'
DATE = '19 November 2026'


JPG = ROOT / 'docs' / 'tools' / '_jpg'


def jpg(name):
    """Versi JPEG terkompresi dari screenshot PNG (agar ukuran PDF kecil)."""
    from PIL import Image
    JPG.mkdir(exist_ok=True)
    out = JPG / f'{name}.jpg'
    if not out.exists():
        im = Image.open(SHOTS / f'{name}.png').convert('RGB')
        if im.width > 1400:
            im = im.resize((1400, round(im.height * 1400 / im.width)), Image.LANCZOS)
        im.save(out, quality=80, optimize=True)
    return out


def img(name, cap=None, cls='shot'):
    p = jpg(name)
    c = f'<figcaption>{cap}</figcaption>' if cap else ''
    return f'<figure class="{cls}"><img src="{p.as_uri()}">{c}</figure>'


def font(fam, folder, file, weight, style='normal'):
    return f"@font-face{{font-family:'{fam}';src:url('{(FONTS / folder / 'files' / file).as_uri()}') format('woff2');font-weight:{weight};font-style:{style}}}"


CSS = (
    font('Nunito', 'nunito', 'nunito-latin-600-normal.woff2', 400)
    + font('Nunito', 'nunito', 'nunito-latin-800-normal.woff2', 700)
    + font('Fredoka', 'fredoka', 'fredoka-latin-600-normal.woff2', 600)
    + font('Fredoka', 'fredoka', 'fredoka-latin-700-normal.woff2', 700)
    + """
@page { size: A4; margin: 16mm 15mm 18mm 15mm; }
* { box-sizing: border-box; }
html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
body { font-family: 'Nunito', 'Segoe UI', sans-serif; font-size: 10.2pt; line-height: 1.55; color: #1f2937; margin: 0; }
h1, h2, h3 { font-family: 'Fredoka', 'Nunito', sans-serif; color: #0c4a6e; line-height: 1.2; break-after: avoid; }
h1 { font-size: 22pt; margin: 0 0 4mm; }
h2 { font-size: 15.5pt; margin: 0 0 3mm; padding-bottom: 1.5mm; border-bottom: 2.5px solid #fbbf24; }
h3 { font-size: 12pt; margin: 5mm 0 2mm; color: #9a3412; }
p { margin: 0 0 2.4mm; }
ul, ol { margin: 0 0 3mm; padding-left: 5.5mm; }
li { margin-bottom: 1mm; }
section { break-before: page; }
.cover { height: 262mm; display: flex; flex-direction: column; justify-content: space-between; padding: 6mm 4mm; background: linear-gradient(160deg,#e0f2fe,#fff7ed 60%,#fef3c7); border-radius: 6mm; }
.cover h1 { font-size: 34pt; color: #ea580c; margin-top: 4mm; }
.cover .tag { font-family: Fredoka; color: #0369a1; letter-spacing: .14em; text-transform: uppercase; font-size: 11pt; }
.cover .hero img { width: 100%; border-radius: 4mm; box-shadow: 0 4mm 10mm rgba(0,0,0,.18); }
.meta { display: grid; grid-template-columns: 34mm 1fr; gap: 1.2mm 4mm; font-size: 10pt; }
.meta b { color: #0c4a6e; }
figure { margin: 0 0 4mm; break-inside: avoid; }
figure img { width: 100%; border-radius: 2.5mm; border: 1px solid #cbd5e1; display: block; }
figcaption { font-size: 8.6pt; color: #64748b; margin-top: 1.2mm; text-align: center; }
.grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 4mm; }
.grid3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 3mm; }
.box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 3mm; padding: 3mm 4mm; margin: 0 0 3.5mm; break-inside: avoid; }
.tip { background: #fffbeb; border-color: #fcd34d; }
.ok { background: #f0fdf4; border-color: #86efac; }
.warn { background: #fef2f2; border-color: #fca5a5; }
table { width: 100%; border-collapse: collapse; font-size: 8.8pt; margin-bottom: 4mm; }
th, td { border: 1px solid #cbd5e1; padding: 1.4mm 2mm; vertical-align: middle; text-align: left; }
th { background: #0c4a6e; color: #fff; font-family: Fredoka; font-weight: 600; }
tr { break-inside: avoid; }
td img { width: 34mm; border-radius: 1.2mm; display: block; }
.num { display: inline-grid; place-items: center; width: 6.5mm; height: 6.5mm; border-radius: 50%; background: #f59e0b; color: #fff; font-family: Fredoka; font-weight: 700; margin-right: 2mm; }
.step { display: grid; grid-template-columns: 1fr 1.25fr; gap: 4mm; align-items: start; margin-bottom: 4mm; break-inside: avoid; }
.step h3 { margin-top: 0; }
.wide { break-inside: avoid; margin-bottom: 3mm; }
.wide figure img { width: 100%; }
code { font-family: Consolas, monospace; font-size: 8.8pt; background: #f1f5f9; padding: .3mm 1.2mm; border-radius: 1mm; }
pre { font-family: Consolas, monospace; font-size: 8.2pt; background: #0f172a; color: #e2e8f0; padding: 3mm; border-radius: 2mm; white-space: pre-wrap; line-height: 1.4; }
.toc li { margin-bottom: 1.6mm; }
.small { font-size: 8.8pt; color: #475569; }
"""
)

SLIDES = [
    ('slide 1', 'Cerita', 'Pembuka — "Hello, I’m Liam! Today, I’m going to the zoo with my parents"', 'Kalimat dibacakan otomatis; ayah, Liam, ibu bisa disentuh (Father/Liam/Mother).'),
    ('slide 2', 'Cerita', 'Kenalan — bubble "Father" & "Mother"', 'Bubble teks bisa disentuh; karakter masuk dari kiri/kanan.'),
    ('slide 3', 'Cerita', 'Berangkat — "Let’s go!!!"', 'Mobil masuk dari kiri, thought bubble dibacakan.'),
    ('slide 4', 'Kuis', 'Lampu merah — "What is the color?"', 'Pilihan Red / Yellow / Green (benar: Red).'),
    ('slide 5', 'Kuis', 'Lampu kuning', 'Benar: Yellow.'),
    ('slide 6', 'Kuis', 'Lampu hijau', 'Benar: Green — mobil bergerak ke kanan.'),
    ('slide 8', 'Cerita', 'Sampai di Zoo — "Yeay!!! We are arrive >.<"', 'Area sentuh: Zoo, Giraffe, Monkey.'),
    ('slide 9', 'Cerita (peta)', 'Peta — tujuan Air Paradise', 'Label tujuan berkedip + ikon tangan; sentuh = dibacakan lalu lanjut.'),
    ('slide 9-1', 'Kuis', '"What is this animal?" — swan / rabbit', 'Benar: swan.'),
    ('slide 10', 'Kuis', '"What is this animal?" — butterfly / bird', 'Benar: butterfly.'),
    ('slide 11', 'Cerita (peta)', 'Peta — tujuan Wild Safari', 'Label wild safari berkedip.'),
    ('slide 11-1', 'Kuis', '"Is the elephant big or small?"', 'Benar: Big.'),
    ('slide 12', 'Kuis', '"What does the animal beside it eat?"', 'Benar: meat. Macan tutul bisa disentuh (Leopard).'),
    ('slide 13', 'Kuis', '"Is the giraffe tall?" — Yes / No', 'Benar: Yes.'),
    ('slide 14', 'Cerita (peta)', 'Peta — tujuan Sea World', 'Label sea world berkedip.'),
    ('slide 14-1', 'Kosakata', '"monkey"', 'Label & monyet bisa disentuh.'),
    ('slide 15', 'Kosakata', 'Sea World — turtle, dolphin, whale', 'Hewan & label bisa disentuh; bingkai stiker putih.'),
    ('slide 16', 'Penutup', '"THANK YOU" + skor akhir', 'Bintang, poin, jumlah benar, tombol Main Lagi & Beranda.'),
]
REF_KEYS = ['s01', 's02', 's03', 's04', 's05', 's06', 's08', 's09', 's09-1', 's10', 's11', 's11-1', 's12', 's13', 's14', 's14-1', 's15', 's16']


def slide_table():
    rows = []
    for i, ((folder, kind, title, note), key) in enumerate(zip(SLIDES, REF_KEYS)):
        rows.append(
            f'<tr><td><b>{i + 1}</b></td><td><code>{folder}</code></td><td><img src="{(REF / f"{key}.jpg").as_uri()}"></td>'
            f'<td><img src="{jpg(f"slide-{i + 1:02d}").as_uri()}"></td><td><b>{kind}</b><br>{html.escape(title)}<br><span class="small">{html.escape(note)}</span></td></tr>'
        )
    return (
        '<table><thead><tr><th>#</th><th>Folder ICT ELEMENT</th><th>Desain Canva (gambaran)</th><th>Hasil di aplikasi</th><th>Isi &amp; interaksi</th></tr></thead><tbody>'
        + ''.join(rows)
        + '</tbody></table>'
    )


def step(n, title, body, shot, cap):
    """Langkah Admin: teks di atas, screenshot lebar penuh di bawah (agar detail panel terbaca)."""
    return f'<div class="wide"><h3><span class="num">{n}</span>{title}</h3>{body}{img(shot, cap)}</div>'


def build_html():
    s = []
    s.append(f"""
<div class="cover">
  <div>
    <div class="tag">Laporan Proyek &amp; Panduan Penggunaan</div>
    <h1>Liam Goes to the Zoo</h1>
    <p style="font-size:13pt;max-width:150mm">Game e-learning interaktif bergaya Kahoot / Quizizz — dirangkai dari aset Canva klien
    (<b>ICT ELEMENT</b>), lengkap dengan suara baca otomatis dan <b>Admin Panel tanpa coding</b>.</p>
  </div>
  <div class="hero">{img('slide-01')}</div>
  <div class="meta">
    <b>Teknologi</b><span>React 18 + Vite 6 + Tailwind CSS 4 · Web Speech API · Web Audio API · IndexedDB/localStorage</span>
    <b>Isi</b><span>18 slide (dari 18 folder ICT ELEMENT) · 8 kuis · 4 slide cerita · 3 peta · 2 kosakata · 1 penutup skor</span>
    <b>Status</b><span>Selesai · <code>npm run build</code> sukses · uji otomatis 18 slide tanpa error konsol / gambar rusak</span>
    <b>Lampiran</b><span>Video demo bersuara: <code>docs/video/Demo-Liam-Goes-to-the-Zoo.mp4</code> (3 menit 39 detik)</span>
    <b>Tanggal</b><span>{DATE}</span>
  </div>
</div>""")

    s.append("""<section><h2>Daftar Isi</h2><ol class="toc">
<li>Ringkasan hasil pekerjaan</li><li>Struktur slide yang dirangkai dari folder ICT ELEMENT</li>
<li>Cara menjalankan &amp; memasang aplikasi</li><li>Panduan bermain (untuk siswa)</li>
<li>Fitur suara: sentuh teks → dibacakan</li><li>Panduan Admin Panel (untuk guru / pengelola)</li>
<li>Backup, import &amp; reset</li><li>Tampilan di laptop, tablet &amp; HP</li>
<li>Hasil pengujian</li><li>Catatan teknis &amp; struktur folder</li><li>Catatan isi &amp; saran</li><li>Lampiran: screenshot seluruh slide</li></ol>

<h2 style="margin-top:8mm">1. Ringkasan Hasil Pekerjaan</h2>
<div class="box ok"><ul>
<li><b>Seluruh 18 folder slide ICT ELEMENT</b> (slide 1–16 termasuk 9-1, 11-1, 14-1) dirangkai menjadi alur game berurutan yang setia dengan desain "gambaran" Canva.</li>
<li><b>Aset diproses otomatis</b> (<code>scripts/build_assets.py</code>): latar krem/putih dihapus menjadi PNG/WebP transparan, posisi tiap elemen dicocokkan ke desain jadi, background bersih dibuat dengan menghapus teks & karakter (agar bisa tampil ulang sebagai elemen interaktif beranimasi). Total aset web ±12 MB (asli 109 MB).</li>
<li><b>Kuis interaktif</b>: jawaban benar → animasi hijau, konfeti, bunyi "ding" + ucapan "Correct! Great job!", +10 poin, lanjut otomatis. Jawaban salah → goyang merah, bunyi "buzz" + "Oops! Try again.", boleh mencoba lagi (atau mode "tampilkan jawaban lalu lanjut").</li>
<li><b>Semua teks bisa disentuh untuk dibacakan</b> (Web Speech API, deteksi otomatis Inggris/Indonesia, tombol ganti bahasa), dengan ikon speaker kecil &amp; efek sorot. Bisa diganti rekaman .mp3/.wav sendiri.</li>
<li><b>Halaman skor akhir</b> dengan bintang, poin, jumlah benar, dan tombol <b>Main Lagi</b>.</li>
<li><b>Admin Panel tanpa coding</b> (PIN default 1234): tambah/edit/hapus/urutkan slide, ubah teks soal &amp; jawaban &amp; kunci jawaban, ganti gambar (unggah .png/.jpg/.webp Canva) &amp; audio, editor visual seret-lepas, overlay desain Canva, simpan otomatis, <b>Export / Import Backup (.json)</b> dan <b>Reset ke Default</b>.</li>
<li><b>Responsif</b>: panggung 16:9 menyesuaikan laptop, tablet, dan HP; font disimpan lokal sehingga tetap jalan offline.</li></ul></div>
</section>""")

    s.append(f"""<section><h2>2. Struktur Slide dari Folder ICT ELEMENT</h2>
<p>Setiap folder <code>ICT ELEMENT/ICT ELEMENT/slide …</code> berisi layer Canva 1920×1080 (background, karakter, teks, tombol) serta satu gambar
"gambaran" (desain jadi). Tabel berikut menunjukkan urutan slide di aplikasi, desain aslinya, dan hasil rangkaian di aplikasi.
Folder <code>slide 7</code> memang tidak ada pada aset klien.</p>
{slide_table()}
<div class="box tip"><b>Lokasi aset hasil olahan:</b> <code>public/assets/slides/</code> — <code>sXX/bg.webp</code> (background bersih),
<code>sXX/*.webp</code> (karakter/hewan/objek transparan), <code>ui/</code> (skin tombol krem &amp; pink), <code>library/</code> (SEMUA layer asli
dalam bentuk cutout transparan untuk Pustaka Aset di Admin), <code>reference/</code> (gambar desain jadi untuk overlay). File asli tetap utuh di folder ICT ELEMENT.</div>
</section>""")

    s.append("""<section><h2>3. Cara Menjalankan &amp; Memasang Aplikasi</h2>
<h3>A. Di komputer pengembang</h3>
<pre>npm install          # sekali saja
npm run dev          # mode pengembangan → http://localhost:5173
npm run build        # build produksi → folder dist/
npm run preview      # cek hasil build</pre>
<h3>B. Memasang di perangkat / hosting klien (tanpa coding)</h3>
<ol><li>Jalankan <code>npm run build</code> (atau gunakan folder <code>dist/</code> yang sudah disediakan).</li>
<li>Unggah <b>seluruh isi folder <code>dist/</code></b> ke hosting statis (Netlify drag-and-drop, Vercel, GitHub Pages, cPanel, atau LMS). Path relatif, jadi bisa ditaruh di subfolder.</li>
<li>Untuk dipakai lokal tanpa internet: salin folder <code>dist/</code> lalu jalankan <code>npx vite preview</code> atau server statis apa pun (mis. ekstensi "Live Server").</li>
<li>Buka alamatnya di Chrome / Edge / Safari. Konten yang diubah di Admin Panel tersimpan di browser perangkat tersebut — pindahkan antar-perangkat dengan Export/Import Backup.</li></ol>
<div class="box tip"><b>Catatan suara:</b> kualitas suara baca bergantung pada suara bawaan perangkat. Chrome/Edge di Windows &amp; Android biasanya sudah punya suara Inggris dan Indonesia. Untuk suara yang seragam di semua perangkat, unggah rekaman .mp3 per teks di Admin Panel.</div>
<h3>C. Membangun ulang aset dari ICT ELEMENT (opsional, untuk pengembang)</h3>
<pre>pip install pillow numpy opencv-python
python scripts/build_assets.py              # semua slide (±15 menit)
python scripts/build_assets.py "slide 9-1"  # slide tertentu saja</pre>
</section>""")

    s.append(f"""<section><h2>4. Panduan Bermain (untuk Siswa)</h2>
<div class="step"><div><h3><span class="num">1</span>Mulai</h3><p>Buka aplikasi, lalu tekan tombol oranye <b>Mulai Bermain</b>. Klik pertama ini juga mengaktifkan suara di browser.</p>
<p>Di pojok kanan atas ada tombol <b>Admin / Kelola Konten</b> untuk guru.</p></div>{img('01-halaman-pembuka', 'Halaman pembuka')}</div>
<div class="step"><div><h3><span class="num">2</span>Dengarkan &amp; sentuh</h3><p>Kalimat cerita dibacakan otomatis. Sentuh teks, karakter, atau hewan untuk mendengar suaranya lagi. Tekan <b>Lanjut</b> untuk slide berikutnya, <b>Kembali</b> untuk mengulang.</p>
<p>Bar atas: <b>Beranda</b>, skor ⭐, bahasa suara (Auto/EN/ID), suara baca, efek suara, dan Admin.</p></div>{img('slide-02', 'Slide cerita — bubble Father & Mother bisa disentuh')}</div>
<div class="step"><div><h3><span class="num">3</span>Jawab kuis</h3><p>Pada slide kuis, sentuh salah satu tombol jawaban. Ikon speaker kecil di tombol bisa disentuh untuk mendengar pilihan tanpa menjawab.</p>
<p>Tombol <b>Lanjut</b> baru aktif setelah soal dijawab benar.</p></div>{img('slide-04', 'Kuis lampu lalu lintas')}</div>
<div class="grid2">{img('feedback-salah', 'Jawaban SALAH: tombol bergoyang merah + suara "salah" → coba lagi')}{img('feedback-benar', 'Jawaban BENAR: hijau + konfeti + suara "benar" + poin')}</div>
<div class="step"><div><h3><span class="num">4</span>Peta tujuan</h3><p>Di slide peta, tujuan berikutnya berkedip kuning dengan ikon tangan. Sentuh label itu untuk mendengarnya dan langsung pergi ke area tersebut.</p></div>{img('slide-08', 'Peta: label "air paradise" berkedip')}</div>
<div class="step"><div><h3><span class="num">5</span>Skor akhir</h3><p>Di akhir petualangan muncul <b>THANK YOU</b>, bintang (1–3), total poin, jumlah soal benar, dan tombol <b>Main Lagi</b> untuk mengulang dari awal.</p>
<p class="small">Poin: 10 untuk benar di percobaan pertama, 5 bila benar setelah salah (bisa diubah).</p></div>{img('hasil-akhir', 'Halaman skor akhir')}</div>
</section>""")

    s.append(f"""<section><h2>5. Fitur Suara: Sentuh Teks → Dibacakan</h2>
<div class="step"><div><ul>
<li>Semua teks soal, kalimat cerita, label, dan pilihan jawaban bisa disentuh/diklik untuk dibacakan memakai <b>Web Speech API</b> (<code>window.speechSynthesis</code>).</li>
<li><b>Penanda visual</b>: ikon speaker kuning kecil, efek cahaya kuning saat disorot, dan teks berdenyut saat sedang dibacakan. Sentuh lagi untuk berhenti.</li>
<li><b>Bahasa otomatis</b>: kalimat Inggris dibaca dengan suara Inggris, kalimat Indonesia dengan suara Indonesia. Tombol bahasa di bar atas: Auto → EN → ID.</li>
<li><b>Fallback audio custom</b>: bila Admin mengunggah rekaman .mp3/.wav untuk suatu teks, rekaman itu yang diputar; jika gagal, otomatis kembali ke TTS.</li>
<li>Gambar (karakter/hewan) &amp; area sentuh juga bisa diberi teks suara, mis. gajah → "Elephant".</li>
<li>Teks yang baru ditambahkan/diubah di Admin otomatis langsung bisa dibacakan.</li></ul></div>
{img('fitur-hover-teks', 'Teks "Father" disorot — siap dibacakan')}</div>
<div class="box"><b>Efek suara</b> "benar", "salah", klik, pindah slide, dan fanfare skor dibuat langsung oleh Web Audio API (tanpa file). Admin bisa menggantinya dengan file audio sendiri di tab Pengaturan.</div>
</section>""")

    s.append(f"""<section><h2>6. Panduan Admin Panel (untuk Guru / Pengelola)</h2>
{step(1, 'Masuk Mode Pengelola', '<p>Klik <b>Admin / Kelola Konten</b> (halaman pembuka) atau ikon ⚙ di bar atas game. Masukkan PIN <b>1234</b> (bisa diubah atau dimatikan di tab Pengaturan).</p><p class="small">Alternatif: buka alamat aplikasi dengan akhiran <code>#admin</code>.</p>', 'admin-01-pin', 'Dialog PIN')}
{step(2, 'Kenali tampilan editor', '<ul><li><b>Kiri</b>: daftar slide (thumbnail, jenis, urutan).</li><li><b>Tengah</b>: kanvas visual — klik elemen untuk memilih, seret untuk memindah, tarik titik sudut kuning untuk mengubah ukuran (Shift = rasio tetap).</li><li><b>Kanan</b>: panel properti slide / elemen.</li><li><b>Atas</b>: tab Slide &amp; Soal, Pengaturan, Backup &amp; Reset, Panduan; status "Tersimpan otomatis"; tombol <b>Main / Pratinjau</b>.</li></ul>', 'admin-02-editor', 'Editor Admin Panel')}
{step(3, 'Pengaturan slide', '<p>Klik area kosong kanvas untuk membuka pengaturan slide: nama, jenis (Cerita / Kuis / Penutup), <b>background</b> (unggah atau pilih dari pustaka), gambar acuan Canva, teks umpan balik benar, dan perilaku jika salah.</p><p class="small">Panel ini juga memberi peringatan bila kuis belum punya jawaban benar.</p>', 'admin-03-pengaturan-slide-kuis', 'Pengaturan slide kuis')}
{step(4, 'Ubah kalimat soal &amp; teks', '<p>Klik teks di kanvas → ubah isi di kotak <b>Isi teks</b> (Enter = baris baru). Atur font, ukuran, warna, rata, tebal, miring, cahaya, dan kotak latar (skin krem/pink Canva atau gambar tombol sendiri). Teks baru otomatis bisa dibacakan.</p>', 'admin-06-edit-teks', 'Mengedit teks pertanyaan')}
{step(5, 'Pilihan jawaban &amp; kunci jawaban', '<p>Klik tombol jawaban → ubah <b>Label jawaban</b>, centang <b>Ini jawaban BENAR</b> untuk kunci jawaban (boleh lebih dari satu). Pilihan juga bisa diberi gambar (soal bergambar).</p><p>Tambah pilihan baru lewat toolbar <b>+ Pilihan jawaban</b>.</p>', 'admin-04-edit-pilihan-jawaban', 'Mengedit pilihan jawaban')}
{step(6, 'Suara, animasi, posisi, lapisan', '<p>Bagian <b>Suara</b>: teks yang dibacakan (opsional), bahasa, unggah rekaman .mp3/.wav, tombol <b>Dengarkan</b>, bacakan otomatis, dan aksi "dibacakan lalu lanjut". Bagian <b>Animasi</b>: masuk (pop, fade, dari kiri/kanan…) &amp; berulang (melayang, melompat…). Lalu posisi/ukuran (%) dan urutan lapisan.</p>', 'admin-05-kunci-jawaban-suara', 'Suara, animasi, posisi')}
{step(7, 'Ganti gambar / karakter Canva', '<p>Klik gambar → <b>Unggah</b> file .png/.jpg/.webp dari perangkat, atau <b>Pustaka</b> untuk memilih elemen ICT ELEMENT. Tinggi otomatis menyesuaikan rasio gambar baru. Opsi "Bingkai stiker putih" tersedia.</p>', 'admin-07-edit-gambar', 'Mengganti gambar')}
{step(8, 'Pustaka aset', '<p>Toolbar <b>+ Gambar</b> membuka Pustaka: semua layer dari setiap folder slide ICT ELEMENT (sudah transparan) dan tab <b>Unggahan saya</b> untuk file yang pernah diunggah. Elemen pustaka ditempatkan di posisi aslinya pada desain.</p>', 'admin-09-pustaka-aset', 'Pustaka Aset')}
{step(9, 'Cocokkan dengan desain Canva', '<p>Centang <b>Desain Canva</b> di toolbar: gambar "gambaran" asli tampil transparan di atas kanvas (geser slider untuk transparansi) sehingga posisi elemen bisa dicocokkan dengan presisi.</p>', 'admin-08-overlay-desain-canva', 'Overlay desain Canva')}
{step(10, 'Tambah, duplikat, hapus &amp; urutkan slide', '<p><b>+ Slide baru</b>: slide cerita atau kuis 2/3/4 pilihan (disisipkan setelah slide terpilih). Pada slide terpilih: ▲▼ untuk urutan (atau seret-lepas di daftar), ⧉ duplikat, 🗑 hapus (dengan konfirmasi).</p>', 'admin-10-tambah-slide', 'Menu slide baru')}
<div class="grid2">{img('admin-11-slide-kuis-baru', 'Slide kuis baru (3 pilihan) siap diedit')}{img('admin-12-pengaturan', 'Tab Pengaturan')}</div>
<div class="box"><b>Tab Pengaturan</b>: judul &amp; subjudul game, PIN admin (ubah / matikan), bahasa suara (Otomatis / Inggris / Indonesia), kecepatan bicara + tombol tes, bacakan otomatis, ikon speaker, mode jika salah, poin benar, poin setelah salah, jeda lanjut otomatis, ucapan &amp; file audio untuk BENAR/SALAH.</div>
</section>""")

    s.append(f"""<section><h2>7. Backup, Import &amp; Reset</h2>
<div class="grid2">{img('admin-13-backup-reset', 'Tab Backup & Reset')}{img('admin-14-konfirmasi-reset', 'Konfirmasi sebelum reset')}</div>
<ul><li><b>Export Backup (.json)</b>: mengunduh satu file berisi semua slide, teks, kunci jawaban, pengaturan, <b>dan</b> semua gambar/audio unggahan (base64). Simpan untuk cadangan atau untuk dipindahkan ke perangkat lain.</li>
<li><b>Import Backup (.json)</b>: memulihkan isi game dari file backup (isi saat ini diganti).</li>
<li><b>Reset ke Default</b>: mengembalikan seluruh isi ke versi bawaan aset ICT ELEMENT (perlu konfirmasi; file unggahan dihapus).</li>
<li><b>Penyimpanan otomatis</b>: data slide di <code>localStorage</code>, file unggahan di <code>IndexedDB</code> (localStorage hanya muat ±5 MB, sedangkan satu PNG Canva bisa 1–3 MB). Data tersimpan per browser &amp; perangkat.</li></ul>
<div class="box tip"><b>Alur memindahkan konten ke perangkat sekolah:</b> edit di laptop → Export Backup → kirim file .json → di perangkat sekolah buka aplikasi → Admin → Import Backup.</div>
{img('admin-15-panduan', 'Panduan singkat tersedia juga di dalam aplikasi (tab Panduan)')}
</section>""")

    s.append(f"""<section><h2>8. Tampilan di Laptop, Tablet &amp; HP</h2>
<p>Panggung game berukuran tetap 16:9 (kanvas desain 1920×1080) yang menyesuaikan layar, sehingga tata letak Canva tetap presisi di semua ukuran. Bar atas/bawah otomatis ringkas di layar pendek. Pada HP posisi tegak muncul saran memutar layar.</p>
{img('perangkat-tablet', 'Tablet 1024×768')}
<div class="grid2">{img('perangkat-hp-mendatar', 'HP mendatar 844×390')}{img('perangkat-hp-tegak', 'HP tegak 390×844')}</div>
</section>""")

    s.append("""<section><h2>9. Hasil Pengujian</h2>
<table><thead><tr><th>Pengujian</th><th>Cara</th><th>Hasil</th></tr></thead><tbody>
<tr><td>Build produksi</td><td><code>npm run build</code></td><td>✅ Sukses (Vite 6, 1601 modul, ±3,9 detik)</td></tr>
<tr><td>Alur 18 slide</td><td>Playwright + Chrome: mainkan dari slide 1 sampai skor akhir</td><td>✅ Semua slide tampil, kuis berfungsi, skor &amp; Main Lagi berjalan</td></tr>
<tr><td>Error JavaScript &amp; gambar rusak</td><td>Memantau console error, pageerror, dan respons HTTP ≥ 400 selama pengujian</td><td>✅ 0 error, 0 gambar/aset gagal dimuat</td></tr>
<tr><td>Umpan balik benar / salah</td><td>Klik jawaban salah lalu benar pada tiap kuis</td><td>✅ Animasi, suara, poin (10 / 5), lanjut otomatis</td></tr>
<tr><td>Admin Panel</td><td>PIN, pilih/seret elemen, edit teks, kunci jawaban, pustaka, slide baru, pengaturan, reset</td><td>✅ Berfungsi; reset mengembalikan 18 slide bawaan</td></tr>
<tr><td>Kecocokan desain</td><td>Render tiap slide dibandingkan berdampingan dengan gambar "gambaran" Canva; ukuran font dikalibrasi terhadap lebar teks asli</td><td>✅ Posisi &amp; ukuran sesuai desain</td></tr>
<tr><td>Responsif</td><td>Viewport 1600×940, 1024×768, 844×390, 390×844</td><td>✅ Rapi di laptop, tablet, HP</td></tr>
</tbody></table>
<div class="box"><b>Video demo bersuara</b> — <code>docs/video/Demo-Liam-Goes-to-the-Zoo.mp4</code> (1280×720, 3:39). Berisi alur bermain lengkap (narasi teks, jawaban salah &amp; benar, skor akhir) dan tur Admin Panel. Suara di video: narasi teks aplikasi (suara Windows en-US), efek benar/salah/klik; keterangan berbahasa Indonesia di layar. Dibuat ulang dengan <code>python docs/tools/record_demo.py</code>.</div>
</section>""")

    s.append("""<section><h2>10. Catatan Teknis &amp; Struktur Folder</h2>
<pre>elearning-quiz-game/
├── ICT ELEMENT/ICT ELEMENT/slide …   ← aset asli Canva klien (tidak diubah)
├── scripts/build_assets.py           ← olah aset → public/assets/slides + src/data/assetManifest.json
├── public/assets/slides/             ← aset web (bg, cutout, ui, library, reference)
├── src/
│   ├── App.jsx                       ← alur layar: pembuka → main → admin
│   ├── data/defaultSlides.js         ← isi bawaan 18 slide (teks, kunci jawaban, posisi)
│   ├── data/assetManifest.json       ← posisi/ukuran elemen hasil pencocokan desain
│   ├── lib/projectStore.jsx          ← simpan otomatis, export/import/reset
│   ├── lib/mediaStore.js             ← file unggahan (IndexedDB)
│   ├── audio/                        ← TTS + deteksi bahasa, efek suara Web Audio
│   ├── components/stage/             ← panggung 16:9 & penggambar slide berlapis
│   ├── components/game/              ← popup umpan balik, skor akhir, konfeti
│   ├── screens/                      ← halaman pembuka & permainan
│   └── admin/                        ← Admin Panel (editor, inspector, pustaka, pengaturan, backup)
├── docs/                             ← laporan PDF, screenshot, video, skrip dokumentasi
└── _legacy-v1/                       ← kode versi kuis lama (disimpan, tidak dipakai build)</pre>
<h3>Model data slide (ringkas)</h3>
<pre>slide   = { id, name, type: 'story'|'quiz'|'ending', background, reference, correctText, wrongMode, elements[] }
element = { id, kind: 'image'|'text'|'option'|'hotspot', x, y, w, h (% panggung),
            text, style{font,size,color,skin,…}, src, correct, speakText, audio, lang,
            anim, loop, delay, autoRead, action: 'none'|'next', highlight, sticker }</pre>
<p class="small">Referensi aset: <code>"s01/bg.webp"</code> = file bawaan di public/assets/slides, <code>"media:&lt;id&gt;"</code> = file unggahan di IndexedDB.</p>
</section>""")

    s.append("""<section><h2>11. Catatan Isi &amp; Saran</h2>
<div class="box warn"><ul>
<li><b>Ejaan "collor"</b> pada slide 4–6 diperbaiki menjadi <b>"color"</b> agar dibacakan benar oleh suara otomatis. Bisa dikembalikan di Admin bila diinginkan.</li>
<li><b>Slide 4–6</b> (lampu lalu lintas) pada desain berupa pertanyaan tanpa pilihan jawaban; ditambahkan tombol <b>Red / Yellow / Green</b> agar menjadi kuis interaktif.</li>
<li><b>Slide 8</b> "Yeay!!! We are arrive &gt;.&lt;" ditampilkan sesuai desain; emotikon tidak dibacakan. Saran tata bahasa: "Yeay!!! We have arrived!" — bisa diubah di Admin.</li>
<li><b>Slide peta 9 / 11 / 14</b> tidak menyebutkan tujuan yang harus dipilih; ditetapkan berurutan Air Paradise → Wild Safari → Sea World (label berkedip). Bisa diganti di Admin (aksi "Dibacakan lalu lanjut" &amp; tanda berkedip).</li>
<li><b>Slide 12</b>: di desain, macan tutul tertutup semak di depannya, sehingga dipertahankan menyatu dengan background (lebih setia pada desain) dan diberi area sentuh "Leopard".</li>
<li><b>Folder slide 7</b> tidak ada di aset klien, jadi alur langsung dari slide 6 ke slide 8.</li>
<li>Suara baca mengikuti suara yang terpasang di perangkat; untuk pengucapan seragam, unggah rekaman suara guru (.mp3) per teks.</li></ul></div>
</section>""")

    shots = ''.join(img(f'slide-{i:02d}', f'Slide {i}') for i in range(1, 19))
    s.append(f"""<section><h2>12. Lampiran: Screenshot Seluruh Slide</h2><div class="grid2">{shots}</div></section>""")
    return f'<!doctype html><html lang="id"><head><meta charset="utf-8"><style>{CSS}</style></head><body>{"".join(s)}</body></html>'


def main():
    OUT.parent.mkdir(parents=True, exist_ok=True)
    tmp = ROOT / 'docs' / 'tools' / '_report.html'
    tmp.write_text(build_html(), encoding='utf-8')
    with sync_playwright() as p:
        b = p.chromium.launch(channel='chrome', headless=True)
        pg = b.new_page()
        pg.goto(tmp.as_uri())
        pg.wait_for_timeout(1500)
        pg.pdf(
            path=str(OUT), format='A4', print_background=True, display_header_footer=True,
            header_template='<span></span>',
            footer_template='<div style="width:100%;font:8px Segoe UI,sans-serif;color:#94a3b8;padding:0 15mm;display:flex;justify-content:space-between"><span>Liam Goes to the Zoo — Laporan &amp; Panduan</span><span>Halaman <span class="pageNumber"></span> / <span class="totalPages"></span></span></div>',
            margin={'top': '14mm', 'bottom': '16mm', 'left': '14mm', 'right': '14mm'},
        )
        b.close()
    tmp.unlink()
    import shutil
    shutil.rmtree(JPG, ignore_errors=True)
    print('PDF ->', OUT, f'{OUT.stat().st_size / 1e6:.1f} MB')


if __name__ == '__main__':
    main()
