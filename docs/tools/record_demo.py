"""
record_demo.py — Rekam VIDEO DEMO bersuara aplikasi secara otomatis.

Alur:
  1. Kumpulkan semua teks yang bisa dibacakan aplikasi → buat suaranya (Windows TTS, tts_sapi.ps1)
  2. Rekam layar dengan Playwright sambil mencatat kapan aplikasi berbicara & memutar efek suara
  3. Sintesis efek suara (resep sama dengan src/audio/sfx.js), campur dengan suara bicara sesuai waktu
  4. Gabungkan video + audio → docs/video/Demo-Liam-Goes-to-the-Zoo.mp4 (ffmpeg dari paket imageio-ffmpeg)

Pemakaian (dev server berjalan: npx vite --port 5288):
    python docs/tools/record_demo.py http://localhost:5288/
Butuh: pip install playwright numpy imageio-ffmpeg ; Google Chrome ; Windows (suara Microsoft Zira)
"""
import json
import os
import subprocess
import sys
import time
import wave
from pathlib import Path

import numpy as np
import imageio_ffmpeg
from playwright.sync_api import sync_playwright

URL = sys.argv[1] if len(sys.argv) > 1 else 'http://localhost:5288/'
ROOT = Path(__file__).resolve().parents[2]
WORK = Path(os.environ.get('DEMO_WORK', ROOT / 'docs' / 'video' / '_work'))
OUT = ROOT / 'docs' / 'video' / 'Demo-Liam-Goes-to-the-Zoo.mp4'
WORK.mkdir(parents=True, exist_ok=True)
SR = 44100
W, H = 1280, 720
EXTRA_TEXTS = ['What animal is this?']

# ───────────────────────── 1. suara bicara ─────────────────────────
def collect_texts():
    with sync_playwright() as p:
        b = p.chromium.launch(channel='chrome', headless=True)
        pg = b.new_page()
        pg.goto(URL)
        pg.wait_for_timeout(1500)
        texts = pg.evaluate("""async (extra) => {
          const d = await import('/src/data/defaultSlides.js');
          const a = await import('/src/audio/AudioProvider.jsx');
          const proj = d.createDefaultProject();
          const raw = [proj.settings.correctVoice, proj.settings.wrongVoice, ...extra];
          for (const s of proj.slides) { if (s.correctText) raw.push(s.correctText); for (const e of s.elements) raw.push(e.speakText || e.text || ''); }
          return [...new Set(raw.map(t => a.speakableText(t)).filter(Boolean))];
        }""", EXTRA_TEXTS)
        b.close()
    return texts


def synth_speech(texts):
    items = [{'id': f't{i:03d}', 'text': t} for i, t in enumerate(texts)]
    lst = WORK / 'speech.json'
    lst.write_text(json.dumps(items, ensure_ascii=False), encoding='utf-8')
    subprocess.run(['powershell', '-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', str(Path(__file__).with_name('tts_sapi.ps1')),
                    '-List', str(lst), '-OutDir', str(WORK / 'speech')], check=True)
    clips, durs = {}, {}
    for it in items:
        data, sr = read_wav(WORK / 'speech' / f"{it['id']}.wav")
        clips[it['text']] = data
        durs[it['text']] = round(len(data) / SR, 3)
    return clips, durs


def read_wav(path):
    with wave.open(str(path)) as w:
        sr, n, ch, sw = w.getframerate(), w.getnframes(), w.getnchannels(), w.getsampwidth()
        raw = np.frombuffer(w.readframes(n), dtype=np.int16 if sw == 2 else np.uint8).astype(np.float32)
    if sw == 1:
        raw = (raw - 128) * 256
    raw = raw.reshape(-1, ch).mean(1) / 32768
    if sr != SR:
        x = np.linspace(0, len(raw) - 1, int(len(raw) * SR / sr))
        raw = np.interp(x, np.arange(len(raw)), raw)
    return raw.astype(np.float32), SR


# ───────────────────────── 3. efek suara (sama dgn sfx.js) ─────────────────────────
def tone(buf, freq, start=0.0, duration=0.15, kind='sine', gain=0.2, slide_to=None):
    n = int(duration * SR)
    t = np.arange(n) / SR
    f = freq * (slide_to / freq) ** (t / duration) if slide_to else np.full(n, freq)
    phase = 2 * np.pi * np.cumsum(f) / SR
    wave_ = {'sine': np.sin(phase), 'triangle': 2 / np.pi * np.arcsin(np.sin(phase)),
             'square': np.sign(np.sin(phase)), 'sawtooth': 2 * ((phase / (2 * np.pi)) % 1) - 1}[kind]
    env = np.minimum(1, t / 0.012) * np.exp(-5.5 * t / duration)
    s = int(start * SR)
    end = min(len(buf), s + n)
    buf[s:end] += (wave_ * env * gain)[: end - s]


N = {'C5': 523.25, 'E5': 659.25, 'G5': 783.99, 'C6': 1046.5, 'E6': 1318.5, 'G6': 1568}


def sfx(name):
    buf = np.zeros(int(SR * 2.2), np.float32)
    if name == 'click':
        tone(buf, 620, 0, 0.07, 'triangle', 0.14, 940)
    elif name == 'whoosh':
        tone(buf, 300, 0, 0.18, 'sine', 0.06, 900)
    elif name == 'correct':
        for i, fq in enumerate([N['C5'], N['E5'], N['G5'], N['C6']]):
            tone(buf, fq, i * 0.07, 0.35, 'sine', 0.18)
        tone(buf, N['G6'], 0.28, 0.5, 'triangle', 0.07)
    elif name == 'wrong':
        tone(buf, 220, 0, 0.28, 'sawtooth', 0.1, 120)
        tone(buf, 180, 0.2, 0.38, 'square', 0.07, 85)
    elif name == 'win':
        for fq, st, du in [(N['C5'], 0, .14), (N['E5'], .14, .14), (N['G5'], .28, .14), (N['C6'], .42, .3), (N['G5'], .74, .12), (N['C6'], .88, .7)]:
            tone(buf, fq, st, du, 'triangle', 0.18)
        for fq in (N['C5'], N['E5'], N['G5']):
            tone(buf, fq, 0.88, 0.9, 'sine', 0.08)
    return buf


# ───────────────────────── 2. rekam layar ─────────────────────────
INIT = """
(() => {
  window.__speechLog = []; window.__cancelLog = []; window.__sfxLog = []; window.__timers = [];
  const DUR = %s;
  const synth = window.speechSynthesis;
  if (synth) {
    synth.speak = (u) => {
      const text = (u.text || '').trim();
      if (!text) { setTimeout(() => u.onend && u.onend(), 10); return; }
      window.__speechLog.push({ text, t: Date.now() });
      const ms = ((DUR[text] || Math.max(0.6, text.length * 0.07)) + 0.15) * 1000;
      window.__timers.push(setTimeout(() => u.onend && u.onend(), ms));
    };
    synth.cancel = () => { window.__timers.forEach(clearTimeout); window.__timers = []; window.__cancelLog.push(Date.now()); };
    synth.resume = () => {};
  }
  const ready = () => {
    if (document.getElementById('__demo_cursor')) return;
    const c = document.createElement('div');
    c.id = '__demo_cursor';
    c.innerHTML = '<svg width="28" height="28" viewBox="0 0 24 24"><path d="M4 2l16 9-7 2-3 7z" fill="#111" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/></svg>';
    c.style.cssText = 'position:fixed;left:0;top:0;z-index:2147483647;pointer-events:none;transform:translate(-4px,-2px);transition:transform .05s';
    document.body.appendChild(c);
    addEventListener('mousemove', (e) => { c.style.left = e.clientX + 'px'; c.style.top = e.clientY + 'px'; }, true);
    addEventListener('mousedown', (e) => {
      const r = document.createElement('div');
      r.style.cssText = `position:fixed;left:${e.clientX - 22}px;top:${e.clientY - 22}px;width:44px;height:44px;border-radius:50%%;border:4px solid #facc15;z-index:2147483646;pointer-events:none;animation:__rip .5s ease-out forwards`;
      document.body.appendChild(r); setTimeout(() => r.remove(), 520);
    }, true);
    const st = document.createElement('style');
    st.textContent = '@keyframes __rip{from{transform:scale(.3);opacity:1}to{transform:scale(1.4);opacity:0}}' +
      '#__demo_cap{position:fixed;left:50%%;bottom:6px;transform:translateX(-50%%);z-index:2147483645;pointer-events:none;max-width:78%%;background:rgba(15,23,42,.88);color:#fff;font:700 17px Nunito,system-ui,sans-serif;padding:7px 20px;border-radius:999px;box-shadow:0 6px 20px rgba(0,0,0,.35);text-align:center;transition:opacity .3s}';
    document.head.appendChild(st);
  };
  window.__caption = (txt) => {
    ready();
    let el = document.getElementById('__demo_cap');
    if (!el) { el = document.createElement('div'); el.id = '__demo_cap'; document.body.appendChild(el); }
    el.textContent = txt; el.style.opacity = txt ? 1 : 0;
  };
  document.addEventListener('DOMContentLoaded', ready);
})();
"""


class Demo:
    def __init__(self, pg):
        self.pg = pg
        self.clicks = []
        self.x, self.y = W / 2, H / 2

    def cap(self, txt):
        self.pg.evaluate('(t) => window.__caption(t)', txt)

    def wait(self, s):
        self.pg.wait_for_timeout(int(s * 1000))

    def move(self, x, y, steps=18):
        self.pg.mouse.move(x, y, steps=steps)
        self.x, self.y = x, y

    def click(self, locator, pause=0.5, sound=True):
        loc = locator.first if hasattr(locator, 'first') else locator
        bb = loc.bounding_box()
        self.move(bb['x'] + bb['width'] / 2, bb['y'] + bb['height'] / 2)
        self.wait(0.25)
        if sound:
            self.clicks.append(int(time.time() * 1000))
        self.pg.mouse.click(self.x, self.y)
        self.wait(pause)

    def sel(self, css):
        return self.pg.locator(css)

    def role(self, name, **kw):
        return self.pg.get_by_role('button', name=name, **kw)


def scenario(d: Demo):
    pg = d.pg
    pg.goto(URL)
    pg.evaluate('localStorage.clear()')
    pg.reload()
    d.wait(1.2)
    d.cap('Liam Goes to the Zoo — Game E-Learning Interaktif (React + Vite + Tailwind)')
    d.move(W * 0.62, H * 0.45)
    d.wait(3)
    d.cap('Halaman pembuka — klik "Mulai Bermain"')
    d.wait(1.2)
    d.click(d.role('Mulai Bermain'), 0.3)

    d.cap('Slide 1 — kalimat cerita dibacakan otomatis')
    d.wait(7.5)
    d.cap('Sentuh karakter atau teks untuk mendengar suaranya')
    d.click(d.sel('[aria-label="Liam"]'), 1.4)
    d.click(d.sel('[aria-label="Mother"]'), 1.6)
    d.click(d.role('Lanjut').last, 0.3)

    d.cap('Slide 2 — kosakata Father & Mother')
    d.wait(4.5)
    d.click(d.sel('[aria-label="Father"]').last, 1.8)
    d.click(d.role('Lanjut').last, 0.3)
    d.cap('Slide 3 — Let’s go!')
    d.wait(3.5)
    d.click(d.role('Lanjut').last, 0.3)

    d.cap('Kuis lampu lalu lintas — coba jawaban SALAH dulu')
    d.wait(6.5)
    d.click(d.sel('button[aria-label="Jawaban: Yellow"]'), 2.6)
    d.cap('Jawaban BENAR → suara "benar", skor bertambah, lanjut otomatis')
    d.click(d.sel('button[aria-label="Jawaban: Red"]'), 3.6)
    d.cap('Lampu kuning')
    d.wait(5.8)
    d.click(d.sel('button[aria-label="Jawaban: Yellow"]'), 3.6)
    d.cap('Lampu hijau — mobil berjalan')
    d.wait(5.8)
    d.click(d.sel('button[aria-label="Jawaban: Green"]'), 3.6)

    d.cap('Sampai di kebun binatang! (area gambar juga bisa disentuh)')
    d.wait(4.2)
    d.click(d.sel('[aria-label="Giraffe"]'), 1.6)
    d.click(d.sel('[aria-label="Zoo"]'), 1.4)
    d.click(d.role('Lanjut').last, 0.3)

    d.cap('Peta — sentuh tujuan yang berkedip untuk melanjutkan')
    d.wait(2.2)
    d.click(d.sel('[aria-label="air paradise"]'), 2.2)
    for cap, ans, extra in (('Kuis: What is this animal? — swan', 'swan', None),
                            ('Kuis: butterfly', 'butterfly', None)):
        d.cap(cap)
        d.wait(3.4)
        d.click(d.sel(f'button[aria-label="Jawaban: {ans}"]'), 3.7)
    d.cap('Peta — Wild Safari')
    d.wait(2.2)
    d.click(d.sel('[aria-label="wild safari"]'), 2.2)
    d.cap('Kuis: Is the elephant big or small?')
    d.wait(4.2)
    d.click(d.sel('button[aria-label="Jawaban: small"]'), 2.4)
    d.click(d.sel('button[aria-label="Jawaban: Big"]'), 3.7)
    d.cap('Kuis: What does the animal beside it eat?')
    d.wait(4.4)
    d.click(d.sel('[aria-label="Leopard"]'), 1.5)
    d.click(d.sel('button[aria-label="Jawaban: meat"]'), 3.7)
    d.cap('Kuis: Is the giraffe tall?')
    d.wait(3.6)
    d.click(d.sel('button[aria-label="Jawaban: Yes"]'), 3.7)
    d.cap('Peta — Sea World')
    d.wait(2.2)
    d.click(d.sel('[aria-label="sea world"]'), 2.2)
    d.cap('Kosakata: monkey')
    d.wait(2.6)
    d.click(d.sel('[aria-label="Monkey"]'), 1.4)
    d.click(d.role('Lanjut').last, 0.3)
    d.cap('Sea World — sentuh label hewan')
    d.wait(1.6)
    for t in ('turtle', 'dolphin', 'whale'):
        d.click(d.sel(f'[aria-label="{t}"]'), 1.4)
    d.click(d.role('Lanjut').last, 0.3)
    d.cap('Skor akhir + bintang + tombol "Main Lagi"')
    d.wait(6)
    d.move(*_center(d.role('Main Lagi')))
    d.wait(1.5)

    # ── Admin ──
    d.cap('Mode Pengelola / Admin Panel — PIN default 1234')
    d.click(d.role('Admin / Kelola Konten'), 0.8)
    for k in '1234':
        d.click(pg.locator('[role=dialog] button', has_text=k).first, 0.25)
    d.wait(1.5)
    d.cap('Editor visual: daftar slide, kanvas, dan panel properti')
    d.wait(2.5)
    d.click(pg.get_by_text('Kuis — Swan').first, 1.2)
    d.cap('Klik teks soal → ubah kalimatnya (otomatis bisa dibacakan)')
    d.click(d.sel('[aria-label^="Teks: What is this animal"]'), 0.8)
    ta = pg.locator('aside textarea').first
    d.click(ta, 0.3)
    pg.keyboard.press('Control+A')
    pg.keyboard.type('What animal is this?', delay=70)
    d.wait(0.8)
    d.click(d.role('Dengarkan'), 2.4)
    d.cap('Pilih tombol jawaban → atur kunci jawaban, suara, animasi')
    d.click(d.sel('[aria-label^="Pilihan: rabbit"]'), 1.0)
    d.click(pg.get_by_text('Ini jawaban BENAR'), 1.0)
    d.click(pg.get_by_text('Ini jawaban BENAR'), 1.0)
    d.cap('Seret elemen untuk memindahkan, tarik sudut untuk mengubah ukuran')
    bb = d.sel('[aria-label^="Pilihan: rabbit"]').first.bounding_box()
    d.move(bb['x'] + bb['width'] / 2, bb['y'] + bb['height'] / 2)
    pg.mouse.down()
    d.move(bb['x'] + bb['width'] / 2 + 60, bb['y'] + bb['height'] / 2 + 70, steps=25)
    pg.mouse.up()
    d.wait(1.2)
    d.cap('Overlay "Desain Canva" untuk mencocokkan posisi dengan desain asli')
    d.click(pg.locator('text=Desain Canva'), 2.2)
    d.click(pg.locator('text=Desain Canva'), 0.6)
    d.cap('Pustaka aset ICT ELEMENT + unggah gambar Canva sendiri (.png/.jpg/.webp)')
    d.click(d.role('Gambar', exact=True).first, 1.6)
    d.click(pg.locator('[role=dialog] nav button', has_text='Slide 15'), 2.0)
    d.click(pg.locator('[aria-label="Tutup"]'), 0.6)
    d.cap('Tambah slide baru: cerita atau kuis 2/3/4 pilihan')
    d.click(d.role('Slide baru'), 1.6)
    d.click(pg.get_by_text('Kuis 3 pilihan'), 2.2)
    d.cap('Pengaturan: PIN, bahasa suara EN/ID, kecepatan, poin, suara benar/salah')
    d.click(d.role('Pengaturan', exact=True), 3.2)
    d.cap('Backup & Reset: Export / Import .json dan Reset ke aset ICT ELEMENT')
    d.click(d.role('Backup & Reset', exact=True), 3.2)
    d.cap('Panduan singkat di dalam aplikasi')
    d.click(d.role('Panduan', exact=True), 2.8)
    d.cap('Semua perubahan tersimpan otomatis — klik "Main / Pratinjau" untuk mencoba')
    d.click(d.role('Main / Pratinjau'), 6.5)
    d.cap('Terima kasih!')
    d.wait(2.5)


def _center(loc):
    bb = loc.first.bounding_box()
    return bb['x'] + bb['width'] / 2, bb['y'] + bb['height'] / 2


def record(durs):
    vid_dir = WORK / 'raw'
    vid_dir.mkdir(exist_ok=True)
    for f in vid_dir.glob('*.webm'):
        f.unlink()
    with sync_playwright() as p:
        b = p.chromium.launch(channel='chrome', headless=True)
        ctx = b.new_context(viewport={'width': W, 'height': H}, record_video_dir=str(vid_dir), record_video_size={'width': W, 'height': H})
        ctx.add_init_script(INIT % json.dumps(durs))
        t0 = int(time.time() * 1000)
        pg = ctx.new_page()
        d = Demo(pg)
        try:
            scenario(d)
        except Exception:
            pg.screenshot(path=str(WORK / 'gagal.png'))
            raise
        finally:
            logs = pg.evaluate('({ speech: window.__speechLog, cancel: window.__cancelLog, sfx: window.__sfxLog })')
            # log hilang saat reload → ambil juga dari sesi sebelumnya
            t_end = int(time.time() * 1000)
            path = pg.video.path()
            ctx.close()
            b.close()
    return t0, t_end, path, logs, d.clicks


# ───────────────────────── 4. campur & gabung ─────────────────────────
def mix(t0, t_end, logs, clicks, clips):
    total = (t_end - t0) / 1000 + 2
    buf = np.zeros(int(total * SR), np.float32)
    cancels = sorted(logs['cancel'])

    def put(sig, t_ms, gain=1.0, cut_ms=None):
        s = int((t_ms - t0) / 1000 * SR)
        if s < 0:
            return
        if cut_ms:
            sig = sig[: max(0, int((cut_ms - t_ms) / 1000 * SR))]
        e = min(len(buf), s + len(sig))
        buf[s:e] += sig[: e - s] * gain

    for ev in logs['speech']:
        clip = clips.get(ev['text'])
        if clip is None:
            continue
        cut = next((c for c in cancels if c > ev['t'] + 60), None)
        put(clip, ev['t'], 0.95, cut)
    for ev in logs['sfx']:
        put(sfx(ev['name']), ev['t'], 0.9)
    for t in clicks:
        put(sfx('click'), t, 0.5)
    peak = np.abs(buf).max() or 1
    buf = buf / max(1.0, peak / 0.95)
    out = WORK / 'audio.wav'
    with wave.open(str(out), 'wb') as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((buf * 32767).astype(np.int16).tobytes())
    return out


def main():
    print('1/4 kumpulkan teks…')
    texts = collect_texts()
    print('   ', len(texts), 'teks')
    print('2/4 buat suara (Windows TTS)…')
    clips, durs = synth_speech(texts)
    print('3/4 rekam layar…')
    t0, t_end, raw, logs, clicks = record(durs)
    print(f"    {len(logs['speech'])} ucapan, {len(logs['sfx'])} efek suara, {len(clicks)} klik, {(t_end - t0) / 1000:.0f} detik")
    audio = mix(t0, t_end, logs, clicks, clips)
    print('4/4 gabung video + audio…')
    OUT.parent.mkdir(parents=True, exist_ok=True)
    ff = imageio_ffmpeg.get_ffmpeg_exe()
    subprocess.run([ff, '-y', '-loglevel', 'error', '-i', str(raw), '-i', str(audio), '-c:v', 'libx264', '-preset', 'medium', '-crf', '21',
                    '-pix_fmt', 'yuv420p', '-r', '30', '-c:a', 'aac', '-b:a', '160k', '-shortest', '-movflags', '+faststart', str(OUT)], check=True)
    print('SELESAI →', OUT, f'{OUT.stat().st_size / 1e6:.1f} MB')


if __name__ == '__main__':
    main()
