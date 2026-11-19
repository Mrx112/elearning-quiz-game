"""Bangun ulang semua dokumen PDF di docs/pdf/ (Markdown -> HTML -> PDF via Chrome headless).

Pemakaian (dari folder proyek):  python docs/tools/build_pdfs.py [all|report|docs]
Butuh: Python 3 + paket `markdown` (pip install markdown) dan Google Chrome terpasang.
Laporan (01) memakai gambar dari docs/screenshots/; dokumen 02–05 dibuat dari file .md.
"""
import re
import subprocess
import sys
import tempfile
from pathlib import Path

import markdown

PROJECT = Path(__file__).resolve().parents[2]
DOCS = PROJECT / "docs"
SHOTS = DOCS / "screenshots"
OUT = DOCS / "pdf"
BUILD = Path(tempfile.gettempdir()) / "kuis-pdfbuild"
CHROME = r"C:\Program Files\Google\Chrome\Application\chrome.exe"

OUT.mkdir(parents=True, exist_ok=True)
BUILD.mkdir(parents=True, exist_ok=True)

PROJECT_CODE = "T1126-046 (REQ-9724)"
DATE = "18 November 2026"

BASE_CSS = """
@import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&family=Nunito:wght@400;600;700;800&display=swap');
@page {
  size: A4;
  margin: 18mm 17mm 20mm 17mm;
  @bottom-left { content: "Petualangan Kuis · %(code)s"; font: 8pt 'Nunito', 'Segoe UI', sans-serif; color: #8b8aa3; }
  @bottom-right { content: "Halaman " counter(page) " / " counter(pages); font: 8pt 'Nunito', 'Segoe UI', sans-serif; color: #8b8aa3; }
}
@page cover { margin: 0; @bottom-left { content: none; } @bottom-right { content: none; } }
* { box-sizing: border-box; }
html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
body { font-family: 'Nunito', 'Segoe UI', system-ui, sans-serif; font-size: 10.2pt; line-height: 1.55; color: #1e1b3a; margin: 0; }
h1, h2, h3, h4 { font-family: 'Fredoka', 'Nunito', 'Segoe UI', sans-serif; color: #3b1f8f; line-height: 1.25; break-after: avoid; }
h1 { font-size: 21pt; margin: 0 0 4mm; padding-bottom: 3mm; border-bottom: 3px solid #7c3aed; }
h2 { font-size: 14.5pt; margin: 7mm 0 2.5mm; padding-left: 3mm; border-left: 4px solid #f59e0b; }
h3 { font-size: 11.5pt; margin: 5mm 0 2mm; color: #5b21b6; }
h4 { font-size: 10.5pt; margin: 4mm 0 1.5mm; }
p { margin: 0 0 2.5mm; }
a { color: #6d28d9; text-decoration: none; }
ul, ol { margin: 0 0 3mm; padding-left: 6mm; }
li { margin: 0.6mm 0; }
blockquote { margin: 3mm 0; padding: 2.5mm 4mm; background: #f5f3ff; border-left: 4px solid #8b5cf6; border-radius: 0 6px 6px 0; color: #3f3a5c; }
blockquote p { margin: 0; }
code { font-family: Consolas, 'Cascadia Mono', monospace; font-size: 8.8pt; background: #f1effa; padding: 0.3mm 1.2mm; border-radius: 3px; color: #4c1d95; }
pre { background: #1e1b2e; color: #ece9ff; padding: 3.5mm 4mm; border-radius: 8px; font-size: 8pt; line-height: 1.45; white-space: pre; overflow: hidden; break-inside: avoid; }
pre code { background: none; color: inherit; padding: 0; font-size: inherit; }
table { width: 100%%; border-collapse: collapse; margin: 2mm 0 4mm; font-size: 9pt; break-inside: auto; }
thead { display: table-header-group; }
tr { break-inside: avoid; }
th { background: #5b21b6; color: #fff; text-align: left; padding: 2mm 2.5mm; font-weight: 800; }
td { padding: 1.8mm 2.5mm; border-bottom: 1px solid #e4e1f2; vertical-align: top; }
tr:nth-child(even) td { background: #faf9ff; }
hr { border: 0; border-top: 1px dashed #d6d1ee; margin: 5mm 0; }
.doc-meta { display: flex; gap: 3mm; flex-wrap: wrap; margin: -1mm 0 5mm; }
.doc-meta span { font-size: 8.5pt; font-weight: 800; color: #5b21b6; background: #ede9fe; padding: 1mm 2.5mm; border-radius: 99px; }
""" % {"code": PROJECT_CODE}


def html_page(title, body, extra_css=""):
    return f"""<!doctype html><html lang="id"><head><meta charset="utf-8"><title>{title}</title>
<style>{BASE_CSS}{extra_css}</style></head><body>{body}</body></html>"""


def md_to_html(md_text):
    html = markdown.markdown(md_text, extensions=["tables", "fenced_code", "sane_lists"])
    # Tautan ke file .md lain tidak berlaku di PDF -> jadikan teks biasa
    html = re.sub(r'<a href="[^"]+\.md">(.*?)</a>', r"<strong>\1</strong>", html)
    # Checkbox markdown -> kotak cetak
    html = html.replace("[ ]", "☐").replace("[x]", "☑")
    return html


def print_pdf(html_path, pdf_path):
    cmd = [
        CHROME, "--headless=new", "--disable-gpu", "--no-pdf-header-footer", "--force-device-scale-factor=1",
        "--run-all-compositor-stages-before-draw", "--virtual-time-budget=8000",
        f"--print-to-pdf={pdf_path}", html_path.as_uri(),
    ]
    subprocess.run(cmd, check=True, capture_output=True, timeout=120)
    print("  ✓", pdf_path.name, f"({pdf_path.stat().st_size // 1024} KB)")


# ------------------------------------------------------------------ dokumen markdown
MD_DOCS = [
    (PROJECT / "README.md", "02-Dokumentasi-Teknis-README.pdf", "Dokumentasi Teknis"),
    (DOCS / "PANDUAN-ASET-CANVA.md", "03-Panduan-Aset-Canva.pdf", "Panduan Aset Canva"),
    (DOCS / "PANDUAN-HOSTING.md", "04-Panduan-Menjalankan-dan-Hosting.pdf", "Panduan Hosting"),
    (DOCS / "CHECKLIST-PENGUJIAN.md", "05-Checklist-Pengujian.pdf", "Checklist Pengujian"),
]


def build_markdown_docs():
    for src, out_name, label in MD_DOCS:
        body = md_to_html(src.read_text(encoding="utf-8"))
        meta = f'<div class="doc-meta"><span>{PROJECT_CODE}</span><span>{label}</span><span>{DATE}</span></div>'
        body = body.replace("</h1>", "</h1>" + meta, 1)
        html_path = BUILD / (Path(out_name).stem + ".html")
        html_path.write_text(html_page(label, body), encoding="utf-8")
        print_pdf(html_path, OUT / out_name)


# ------------------------------------------------------------------ laporan + screenshot
def img(name):
    return (SHOTS / name).as_uri()


def figure(name, num, caption, width="100%"):
    return f"""<figure class="shot" style="width:{width}"><img src="{img(name)}" alt="">
<figcaption><b>Gambar {num}.</b> {caption}</figcaption></figure>"""


REPORT_CSS = """
.cover { page: cover; height: 100vh; position: relative; overflow: hidden; color: #fff;
  background: linear-gradient(135deg, #4c1d95 0%, #7c3aed 50%, #d946ef 100%); padding: 24mm 20mm; }
.cover .dots { position: absolute; inset: 0; opacity: .14; background-image: radial-gradient(circle, #fff 1.4px, transparent 1.6px); background-size: 22px 22px; }
.cover .tag { display: inline-block; font: 800 9pt 'Nunito', sans-serif; letter-spacing: .12em; text-transform: uppercase; background: rgba(255,255,255,.18); padding: 1.5mm 4mm; border-radius: 99px; }
.cover h1 { color: #fff; border: 0; font-size: 34pt; margin: 8mm 0 3mm; padding: 0; line-height: 1.1; }
.cover .sub { font-size: 13pt; font-weight: 700; opacity: .92; max-width: 150mm; }
.cover .hero { position: absolute; left: 35mm; right: 35mm; top: 92mm; border-radius: 14px; overflow: hidden; box-shadow: 0 18px 40px rgba(30,10,80,.45); border: 4px solid rgba(255,255,255,.55); }
.cover .hero img { width: 100%; display: block; }
.cover table.meta { position: absolute; left: 20mm; right: 20mm; bottom: 20mm; width: auto; font-size: 9.5pt; margin: 0; }
.cover table.meta td { color: #fff; background: rgba(255,255,255,.12) !important; border-bottom: 1px solid rgba(255,255,255,.18); padding: 2mm 3.5mm; }
.cover table.meta td:first-child { font-weight: 800; width: 42mm; opacity: .85; }
.pb { break-before: page; }
table { break-inside: avoid; }
.feat { break-inside: avoid; margin-bottom: 2mm; }
figure.shot { margin: 3mm auto 5mm; break-inside: avoid; text-align: center; }
figure.shot img { max-width: 100%; max-height: 98mm; border-radius: 8px; border: 1px solid #ddd8f0; box-shadow: 0 4px 14px rgba(60,30,140,.14); }
figure.shot figcaption { font-size: 8.6pt; color: #5d5a78; margin-top: 2mm; text-align: center; }
.row { display: flex; gap: 5mm; align-items: flex-start; }
.row figure.shot { flex: 1; margin-top: 2mm; }
.row figure.shot img { max-height: 92mm; }
.kpi { display: grid; grid-template-columns: repeat(4, 1fr); gap: 3mm; margin: 3mm 0 5mm; }
.kpi div { background: #f5f3ff; border: 1px solid #e2dcfb; border-radius: 10px; padding: 3mm; text-align: center; }
.kpi b { display: block; font: 700 17pt 'Fredoka', sans-serif; color: #5b21b6; }
.kpi span { font-size: 8pt; font-weight: 800; color: #6b6890; text-transform: uppercase; letter-spacing: .04em; }
.ok { color: #047857; font-weight: 800; } .wait { color: #b45309; font-weight: 800; }
.note { background: #fffbeb; border: 1px solid #fde68a; border-left: 4px solid #f59e0b; border-radius: 0 8px 8px 0; padding: 3mm 4mm; margin: 3mm 0; font-size: 9.4pt; }
.flow { font-family: Consolas, monospace; font-size: 8.2pt; background: #1e1b2e; color: #ece9ff; padding: 3.5mm 4mm; border-radius: 8px; white-space: pre; line-height: 1.45; break-inside: avoid; }
"""


def build_report():
    body = f"""
<section class="cover"><div class="dots"></div>
  <span class="tag">Laporan Pengembangan Aplikasi</span>
  <h1>Petualangan Kuis</h1>
  <p class="sub">Website Game E-Learning Interaktif (referensi Kahoot / Quizizz) dengan audio sentuh-untuk-mendengar dan slot aset Canva</p>
  <div class="hero"><img src="{img('04-feedback-benar.png')}" alt=""></div>
  <table class="meta">
    <tr><td>Kode Proyek</td><td>{PROJECT_CODE}</td></tr>
    <tr><td>Tanggal Laporan</td><td>{DATE}</td></tr>
    <tr><td>Deadline</td><td>19 November 2026</td></tr>
    <tr><td>Status</td><td>Aplikasi selesai &amp; teruji · menunggu aset Canva, audio, dan soal dari klien</td></tr>
  </table>
</section>

<h1>1. Ringkasan</h1>
<p>Aplikasi <b>Petualangan Kuis</b> telah selesai dibangun sesuai Scope of Work: start screen, kuis pilihan ganda,
pengecekan jawaban otomatis dengan umpan balik visual &amp; audio, perhitungan skor, halaman hasil, review jawaban,
serta fitur <b>sentuh teks untuk mendengarkan</b> (Click-to-Speak). Seluruh elemen visual disiapkan sebagai
<b>slot aset Canva</b>: tampilan sudah rapi dengan gaya bawaan dan akan otomatis berganti begitu file desain klien dimasukkan.</p>
<div class="kpi">
  <div><b>4</b><span>Layar utama</span></div>
  <div><b>22</b><span>Slot aset Canva</span></div>
  <div><b>5</b><span>Contoh soal (ID &amp; EN)</span></div>
  <div><b>2–4</b><span>Opsi per soal</span></div>
</div>
<div class="note"><b>Catatan:</b> seluruh screenshot pada laporan ini memakai <b>tampilan bawaan</b>, karena aset Canva,
file audio, dan soal final dari klien belum diterima. Contoh soal bersifat demo untuk memperlihatkan fitur.</div>

<h2>Kesesuaian dengan Scope of Work</h2>
<table>
<thead><tr><th style="width:34%">Poin SOW</th><th>Implementasi</th><th style="width:16%">Status</th></tr></thead>
<tr><td>Integrasi aset Canva, responsif</td><td>22 slot aset (background, logo, frame soal, tombol, maskot, badge, bintang, ilustrasi soal) dengan fallback otomatis; diuji di layar laptop dan HP 375&nbsp;px.</td><td class="ok">Selesai</td></tr>
<tr><td>Start Screen</td><td>Logo, nama pemain, toggle efek suara &amp; suara pembaca, pilihan bahasa suara, tombol mulai.</td><td class="ok">Selesai</td></tr>
<tr><td>Soal pilihan ganda interaktif</td><td>2–4 opsi berwarna dengan ikon bentuk; mode "pilih lalu kunci" atau "langsung jawab".</td><td class="ok">Selesai</td></tr>
<tr><td>Cek jawaban + feedback visual &amp; audio</td><td>Benar: panel hijau, konfeti, bunyi <i>ding</i>. Salah: panel merah bergetar, bunyi <i>buzz</i>, jawaban benar ditunjukkan. Pilihan terkunci setelah menjawab.</td><td class="ok">Selesai</td></tr>
<tr><td>Skor otomatis &amp; halaman hasil</td><td>Skor ala Kahoot (bonus kecepatan &amp; beruntun), akurasi, bintang, badge, papan peringkat, review jawaban.</td><td class="ok">Selesai</td></tr>
<tr><td>Click-to-Speak / Audio Trigger</td><td>Soal, pilihan, jawaban benar, dan penjelasan bisa disentuh untuk dibacakan. File audio klien diputar bila ada; jika tidak, memakai Text-to-Speech.</td><td class="ok">Selesai</td></tr>
<tr><td>Bank soal terstruktur</td><td>Satu file konfigurasi JavaScript (<code>questionsData.js</code>).</td><td class="ok">Selesai</td></tr>
<tr><td>Testing &amp; panduan hosting</td><td>Checklist pengujian; panduan Netlify, Vercel, GitHub Pages, cPanel; deploy otomatis GitHub Pages.</td><td class="ok">Selesai</td></tr>
<tr><td>Integrasi aset &amp; audio klien</td><td>Tinggal memasukkan file sesuai Panduan Aset Canva.</td><td class="wait">Menunggu klien</td></tr>
</table>


<h1 class="pb">2. Tampilan &amp; Fitur Aplikasi</h1>
<div class="feat"><h2>2.1 Halaman Awal (Start Screen)</h2>
<p>Pemain dapat mengisi nama (opsional), menyalakan/mematikan efek suara dan suara pembaca, serta memilih bahasa suara:
<b>Otomatis</b> (mengikuti bahasa tiap teks), <b>Indonesia</b>, atau <b>English</b>. Tombol "Tes suara" memutar contoh suara.
Logo dan maskot adalah slot aset Canva.</p>
{figure('01-start-screen.png', 1, 'Start Screen dengan input nama, pengaturan suara, dan tombol Mulai Belajar.', '82%')}

</div><div class="feat"><h2>2.2 Soal &amp; Fitur Sentuh-untuk-Mendengar</h2>
<p>Setiap soal menampilkan progress bar per soal, skor real-time, timer, slot ilustrasi, dan teks soal.
Soal dibacakan otomatis saat muncul; teks yang sedang dibacakan <b>menyala kuning</b> dengan ikon gelombang suara,
dan <b>timer berhenti</b> selama suara diputar agar siswa yang mendengarkan tidak dirugikan.</p>
{figure('02-soal-dibacakan.png', 2, 'Teks soal sedang dibacakan (highlight kuning); timer dijeda selama suara diputar.', '82%')}

</div><div class="feat"><h2>2.3 Memilih Jawaban</h2>
<p>Menyentuh sebuah pilihan akan <b>membacakan</b> pilihan tersebut sekaligus <b>memilihnya</b> (bingkai putih).
Jawaban baru diproses setelah tombol <b>Kunci Jawaban</b> ditekan. Mode ini membantu anak mendengarkan dulu sebelum menjawab.
Mode "langsung jawab" seperti Kahoot dapat diaktifkan lewat satu baris konfigurasi.</p>
{figure('03-pilih-jawaban.png', 3, 'Pilihan "Mars" dipilih dan sedang dibacakan; tombol Kunci Jawaban aktif.', '82%')}

</div><div class="feat"><h2>2.4 Umpan Balik Jawaban Benar</h2>
<p>Jawaban benar menampilkan panel hijau, hujan konfeti, maskot senang, bunyi <i>ding</i>, dan perolehan poin
(lebih cepat menjawab = poin lebih besar). Penjelasan singkat dapat disentuh untuk dibacakan. Pilihan lain otomatis terkunci.</p>
{figure('04-feedback-benar.png', 4, 'Feedback "Benar!" dengan konfeti, poin, dan penjelasan.', '82%')}

</div><div class="feat"><h2>2.5 Umpan Balik Jawaban Salah</h2>
<p>Jawaban salah menampilkan panel merah yang bergetar, bunyi <i>buzz</i>, maskot yang menyemangati, serta
<b>jawaban yang benar</b> (ditandai centang hijau pada kartu pilihan). Bila waktu habis, muncul "Waktu Habis!".</p>
{figure('05-feedback-salah.png', 5, 'Feedback "Kurang Tepat!"; penjelasan sedang dibacakan dengan suara bahasa Inggris.', '82%')}

</div><div class="feat"><h2>2.6 Variasi Soal: 2–4 Pilihan &amp; Campuran Bahasa</h2>
<p>Layout pilihan menyesuaikan jumlah opsi. Bahasa suara dapat diatur per teks: pada soal 5, pertanyaan dibacakan dengan
suara Indonesia sedangkan pilihan "Dog / Cat / Bird" dibacakan dengan suara Inggris. Badge "2× beruntun!" muncul saat
pemain menjawab benar berturut-turut.</p>
<div class="row">
{figure('06-soal-benar-salah.png', 6, 'Soal Benar/Salah dengan 2 pilihan.')}
{figure('07-soal-campuran-bahasa.png', 7, 'Soal 3 pilihan, campuran bahasa Indonesia–Inggris, bonus beruntun.')}
</div>

</div><div class="feat"><h2>2.7 Halaman Hasil &amp; Papan Peringkat</h2>
<p>Menampilkan total skor (animasi hitung naik), jumlah benar/salah, akurasi, 1–3 bintang, badge emas/perak/perunggu
(slot aset Canva), serta tombol <b>Main Lagi</b> dan <b>Review Jawaban</b>. Papan peringkat menyimpan 5 skor teratas di perangkat.</p>
<div class="row">
{figure('08-halaman-hasil.png', 8, 'Halaman hasil: skor, bintang, badge, statistik.')}
{figure('09-papan-peringkat.png', 9, 'Papan peringkat; skor pemain saat ini ditandai "Kamu".')}
</div>

</div><div class="feat"><h2>2.8 Review Jawaban</h2>
<p>Siswa dapat meninjau setiap soal: jawaban yang dipilih, jawaban yang benar, poin yang didapat, dan penjelasan
(semua teks tetap bisa disentuh untuk dibacakan).</p>
{figure('10-review-jawaban.png', 10, 'Review Jawaban: hijau = jawaban benar, merah = jawaban pemain yang salah.', '72%')}

</div><div class="feat"><h2>2.9 Tampilan di HP (Responsif)</h2>
<p>Diuji pada lebar layar 375–390&nbsp;px (ukuran iPhone/Android umum) tanpa scroll horizontal.
Pilihan jawaban tersusun vertikal dan panel feedback muncul dari bawah layar.</p>
{figure('11-tampilan-hp.png', 11, 'Tampilan HP: Start Screen, soal dengan pilihan terpilih, dan feedback "Benar!".', '100%')}

</div>
<h1 class="pb">3. Cara Kerja Sistem</h1>
<h2>3.1 Teknologi</h2>
<table>
<thead><tr><th style="width:30%">Komponen</th><th>Teknologi</th></tr></thead>
<tr><td>Framework</td><td>React 18 + Vite 6 (build statis, bisa di-hosting gratis)</td></tr>
<tr><td>Tampilan</td><td>Tailwind CSS v4, ikon Lucide, font Fredoka &amp; Nunito</td></tr>
<tr><td>Suara pembaca</td><td>Web Speech API (Text-to-Speech) + dukungan file .mp3/.wav</td></tr>
<tr><td>Efek suara</td><td>Web Audio API (synthesizer, tanpa file) + dukungan file custom</td></tr>
<tr><td>Ukuran aplikasi</td><td>± 74 KB (gzip) di luar aset gambar</td></tr>
</table>

<h2>3.2 Alur Permainan</h2>
<div class="flow">Start Screen ──Mulai──► Soal (menjawab) ──Kunci / waktu habis──► Feedback ──► Soal berikutnya …
                                                                        └──(soal terakhir)──► Hasil ──► Review</div>
<p>Jawaban hanya diproses satu kali per soal: setelah terjawab, seluruh pilihan dikunci sehingga tidak terjadi klik ganda.</p>

<h2>3.3 Sistem Audio</h2>
<div class="flow">Teks disentuh ──► ada file audio klien (.mp3/.wav)? ── ya ──► putar file
                                         │                   └─ gagal / tidak ada ─┐
                                         └── tidak ────────────────────────────────┴─► Text-to-Speech
                                                                                       (suara terbaik untuk bahasa teks)</div>
<ul>
<li>Teks yang sedang dibacakan diberi highlight; menyentuhnya lagi menghentikan suara.</li>
<li>Efek suara (klik, benar, salah, detak 5 detik terakhir, fanfare) dibuat langsung oleh browser, tanpa file.</li>
<li>Kualitas suara Text-to-Speech bergantung perangkat; untuk pelafalan yang harus tepat, gunakan rekaman .mp3 dari klien.</li>
</ul>

<h2>3.4 Penggantian Aset Canva</h2>
<p>Setiap slot memeriksa apakah file gambar tersedia. Jika ada, desain Canva dipakai; jika belum, tampilan bawaan yang tampil.
Klien cukup menaruh file dengan nama yang ditentukan di folder <code>public/assets/canva/</code>, tanpa mengubah kode.</p>
<table>
<thead><tr><th>Aset utama</th><th>Ukuran ekspor</th><th>Format</th></tr></thead>
<tr><td>Background (laptop / HP)</td><td>1920 × 1080 / 1080 × 1920 px</td><td>PNG / JPG</td></tr>
<tr><td>Logo</td><td>1200 × 400 px</td><td>PNG transparan</td></tr>
<tr><td>Frame kartu soal</td><td>1600 × 900 px</td><td>PNG transparan</td></tr>
<tr><td>Tombol pilihan A–D (4 file)</td><td>800 × 200 px</td><td>PNG transparan</td></tr>
<tr><td>Tombol utama</td><td>600 × 160 px</td><td>PNG transparan</td></tr>
<tr><td>Maskot (3 ekspresi), badge (3)</td><td>512 × 512 px</td><td>PNG transparan</td></tr>
<tr><td>Bintang (menyala / redup)</td><td>256 × 256 px</td><td>PNG transparan</td></tr>
<tr><td>Ilustrasi soal</td><td>1200 × 675 px</td><td>PNG / JPG</td></tr>
</table>
<p>Daftar lengkap, cara ekspor dari Canva, dan batas ukuran file ada di dokumen <b>Panduan Aset Canva</b>.</p>

<h1 style="margin-top:8mm">4. Hasil Pengujian</h1>
<table>
<thead><tr><th style="width:38%">Area</th><th>Hasil</th><th style="width:18%">Status</th></tr></thead>
<tr><td>Alur permainan lengkap (5 soal → hasil → review)</td><td>Berjalan tanpa error di Chrome desktop.</td><td class="ok">Lulus</td></tr>
<tr><td>Jawaban benar, salah, dan waktu habis</td><td>Feedback, skor, dan penguncian pilihan sesuai.</td><td class="ok">Lulus</td></tr>
<tr><td>Sentuh-untuk-mendengar &amp; jeda timer</td><td>Highlight dan jeda timer bekerja pada soal, pilihan, dan penjelasan.</td><td class="ok">Lulus</td></tr>
<tr><td>Responsif HP 375 px</td><td>Tidak ada scroll horizontal; panel feedback disesuaikan.</td><td class="ok">Lulus</td></tr>
<tr><td>Build produksi</td><td><code>npm run build</code> berhasil (± 74 KB gzip).</td><td class="ok">Lulus</td></tr>
<tr><td>Uji di HP Android/iPhone asli &amp; tablet</td><td>Dijadwalkan sebelum demo.</td><td class="wait">Belum</td></tr>
<tr><td>Aset Canva &amp; audio klien</td><td>Menunggu materi klien.</td><td class="wait">Menunggu</td></tr>
</table>
<h3>Perbaikan selama pengujian</h3>
<ul>
<li><b>Tombol Enter</b>: menekan Enter untuk mengunci jawaban ikut melewati panel feedback. Diperbaiki dan diuji ulang.</li>
<li><b>Tampilan HP</b>: maskot dan judul panel feedback diperkecil agar judul muat dalam satu baris.</li>
</ul>

<h2>Langkah Berikutnya</h2>
<table>
<thead><tr><th style="width:8%">No</th><th>Kegiatan</th><th style="width:22%">Pihak</th></tr></thead>
<tr><td>1</td><td>Mengirim aset Canva sesuai Panduan Aset Canva (22 file), file audio (opsional), dan soal final.</td><td>Klien</td></tr>
<tr><td>2</td><td>Memasukkan aset &amp; soal, memeriksa keterbacaan teks di atas desain klien.</td><td>Tim pengembang</td></tr>
<tr><td>3</td><td>Uji di HP Android, iPhone, dan tablet; uji pelafalan suara.</td><td>Tim pengembang</td></tr>
<tr><td>4</td><td>Deploy ke hosting gratis (Netlify / Vercel / GitHub Pages) dan demo pertama.</td><td>Tim pengembang</td></tr>
<tr><td>5</td><td>Revisi minor (maksimal 2 kali sesuai SOW) dan serah terima source code.</td><td>Bersama</td></tr>
</table>

<h2>Dokumen Pendukung</h2>
<table>
<thead><tr><th>Dokumen</th><th>Isi</th></tr></thead>
<tr><td>02 · Dokumentasi Teknis</td><td>Struktur folder, alur kode, panduan kustomisasi soal, aset, dan audio.</td></tr>
<tr><td>03 · Panduan Aset Canva</td><td>Daftar file, ukuran ekspor, cara ekspor dari Canva, checklist pengiriman aset.</td></tr>
<tr><td>04 · Panduan Menjalankan &amp; Hosting</td><td>Menjalankan di komputer dan online gratis (Netlify, Vercel, GitHub Pages, cPanel).</td></tr>
<tr><td>05 · Checklist Pengujian</td><td>Daftar skenario uji beserta statusnya.</td></tr>
</table>
"""
    html_path = BUILD / "01-Laporan-Aplikasi.html"
    html_path.write_text(html_page("Laporan Aplikasi Petualangan Kuis", body, REPORT_CSS), encoding="utf-8")
    print_pdf(html_path, OUT / "01-Laporan-Aplikasi-Petualangan-Kuis.pdf")


if __name__ == "__main__":
    which = sys.argv[1] if len(sys.argv) > 1 else "all"
    if which in ("all", "report"):
        build_report()
    if which in ("all", "docs"):
        build_markdown_docs()
