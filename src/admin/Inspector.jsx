/**
 * Inspector — Panel properti di kanan editor.
 *   Tanpa elemen terpilih → pengaturan SLIDE (nama, jenis, background, umpan balik).
 *   Dengan elemen terpilih → pengaturan ELEMEN (teks, gaya, gambar, suara, kunci jawaban, animasi, posisi).
 */
import { ArrowDownToLine, ArrowUpToLine, ChevronDown, ChevronUp, Copy, Image as ImageIcon, Move, Sparkles, Trash2, Type, Volume2, CheckCircle2, Layers, Scaling } from 'lucide-react';
import { AudioField, Btn, Check, Field, ImageField, imageSize, imageSizeFromUrl, NumberInput, Section, Select, TextInput, inputCls } from './fields';
import { SKINS, TEXT_PRESETS } from '../data/defaultSlides';
import { useAudio } from '../audio/AudioProvider';
import { resolveMediaUrl } from '../lib/mediaStore';

const FONT_OPTIONS = [
  ['story', 'Lora Italic (cerita)'],
  ['spartan', 'League Spartan (judul kuis)'],
  ['sans', 'Open Sans (tombol)'],
  ['fun', 'Luckiest Guy (judul seru)'],
  ['rounded', 'Fredoka (bulat)'],
  ['nunito', 'Nunito (bersih)'],
];
const ANIM_OPTIONS = [
  ['none', 'Tanpa animasi'],
  ['pop', 'Muncul membesar (pop)'],
  ['fade', 'Memudar masuk'],
  ['slide-left', 'Masuk dari kiri'],
  ['slide-right', 'Masuk dari kanan'],
  ['drop', 'Jatuh dari atas'],
  ['rise', 'Naik dari bawah'],
];
const LOOP_OPTIONS = [
  ['none', 'Diam'],
  ['float', 'Melayang'],
  ['bounce', 'Melompat kecil'],
  ['sway', 'Bergoyang'],
  ['pulse', 'Berdenyut'],
  ['flutter', 'Mengepak (kupu-kupu)'],
  ['rumble', 'Bergetar (mobil)'],
];
const LANG_OPTIONS = [
  ['auto', 'Otomatis (deteksi EN/ID)'],
  ['en-US', 'Inggris (en-US)'],
  ['id-ID', 'Indonesia (id-ID)'],
];
const KIND_TITLE = { image: 'Gambar', text: 'Teks', option: 'Pilihan Jawaban', hotspot: 'Area Sentuh' };

function skinValue(skin) {
  if (!skin) return 'none';
  if (skin === SKINS.cream) return 'cream';
  if (skin === SKINS.pink) return 'pink';
  return 'custom';
}

function TestSpeak({ el }) {
  const { speak, speakingId } = useAudio();
  const text = el.speakText || el.text || '';
  return (
    <Btn onClick={() => speak({ id: `test-${el.id}`, text, lang: el.lang, audio: el.audio })} disabled={!text && !el.audio}>
      <Volume2 className="h-4 w-4" /> {speakingId === `test-${el.id}` ? 'Berhenti' : 'Dengarkan'}
    </Btn>
  );
}

export function ElementInspector({ el, slide, onChange, onDelete, onDuplicate, onLayer, onPickLibrary }) {
  const st = el.style || {};
  const setStyle = (patch) => onChange({ style: patch });
  const hasText = el.kind === 'text' || el.kind === 'option';

  const fitRatio = async (src, file) => {
    const size = file ? await imageSize(file) : await imageSizeFromUrl(await resolveMediaUrl(src));
    if (!size) return {};
    const hPct = ((el.w / 100) * 1920 * (size.h / size.w) * 100) / 1080;
    return { h: Math.round(hPct * 100) / 100 };
  };

  return (
    <div>
      <div className="flex items-center gap-2 border-b bg-slate-50 px-4 py-2.5">
        <span className="flex-1 text-sm font-extrabold text-slate-800">{KIND_TITLE[el.kind]}</span>
        <Btn onClick={onDuplicate} aria-label="Duplikat" title="Duplikat">
          <Copy className="h-4 w-4" />
        </Btn>
        <Btn variant="danger" onClick={onDelete} aria-label="Hapus elemen" title="Hapus elemen (Delete)">
          <Trash2 className="h-4 w-4" />
        </Btn>
      </div>

      {hasText && (
        <Section title="Teks" icon={Type}>
          <Field label={el.kind === 'option' ? 'Label jawaban' : 'Isi teks'} hint="Tekan Enter untuk baris baru. Teks otomatis bisa diklik untuk dibacakan.">
            <textarea className={`${inputCls} min-h-[70px]`} value={el.text || ''} onChange={(e) => onChange({ text: e.target.value })} />
          </Field>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Font">
              <Select value={st.font} onChange={(v) => setStyle({ font: v })} options={FONT_OPTIONS} />
            </Field>
            <Field label="Ukuran">
              <NumberInput value={st.size} onChange={(v) => setStyle({ size: v })} min={8} max={300} />
            </Field>
            <Field label="Warna">
              <div className="flex gap-1.5">
                <input type="color" value={st.color || '#000000'} onChange={(e) => setStyle({ color: e.target.value })} className="h-8 w-10 cursor-pointer rounded border border-slate-300" />
                <TextInput value={st.color} onChange={(v) => setStyle({ color: v })} />
              </div>
            </Field>
            <Field label="Rata">
              <Select value={st.align || 'center'} onChange={(v) => setStyle({ align: v })} options={[['left', 'Kiri'], ['center', 'Tengah'], ['right', 'Kanan']]} />
            </Field>
            <Field label="Tebal">
              <Select value={String(st.weight || 700)} onChange={(v) => setStyle({ weight: Number(v) })} options={[['400', 'Normal'], ['600', 'Semi tebal'], ['700', 'Tebal'], ['800', 'Sangat tebal']]} />
            </Field>
            <Field label="Jarak baris">
              <NumberInput value={st.lineHeight} step={0.05} onChange={(v) => setStyle({ lineHeight: v })} min={0.6} max={3} />
            </Field>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            <Check checked={st.italic} onChange={(v) => setStyle({ italic: v })} label="Miring" />
            <Check checked={st.glow} onChange={(v) => setStyle({ glow: v })} label="Cahaya putih di belakang" />
          </div>
          <Field label="Kotak latar (skin tombol)">
            <Select
              value={skinValue(st.skin)}
              onChange={(v) => setStyle({ skin: v === 'none' ? '' : v === 'cream' ? SKINS.cream : v === 'pink' ? SKINS.pink : st.skin || SKINS.cream })}
              options={[
                ['none', 'Tanpa kotak'],
                ['cream', 'Kotak krem (Canva)'],
                ['pink', 'Kotak pink (peta)'],
                ['custom', 'Gambar sendiri…'],
              ]}
            />
          </Field>
          {skinValue(st.skin) === 'custom' && (
            <ImageField label="Gambar kotak / tombol" value={st.skin} onChange={(ref) => setStyle({ skin: ref })} hint="Ekspor tombol dari Canva (.png transparan) — gambar akan diregangkan mengikuti ukuran kotak." />
          )}
          <Field label="Gaya cepat">
            <div className="flex flex-wrap gap-1">
              {Object.entries({ story: 'Cerita', question: 'Pertanyaan', option: 'Tombol', label: 'Label peta', title: 'Judul besar' }).map(([k, l]) => (
                <Btn key={k} className="!px-2 !py-1 text-xs" onClick={() => setStyle({ ...TEXT_PRESETS[k] })}>
                  {l}
                </Btn>
              ))}
            </div>
          </Field>
        </Section>
      )}

      {el.kind === 'option' && (
        <Section title="Kunci Jawaban" icon={CheckCircle2}>
          <Check checked={el.correct} onChange={(v) => onChange({ correct: v })} label="Ini jawaban BENAR" hint="Boleh lebih dari satu jawaban benar." />
          <ImageField label="Gambar pilihan (opsional)" value={el.src} allowClear onChange={(ref) => onChange({ src: ref })} onPickLibrary={() => onPickLibrary((it) => onChange({ src: it.src }))} hint="Untuk soal bergambar: pilihan berupa kartu gambar + label." />
        </Section>
      )}

      {el.kind === 'image' && (
        <Section title="Gambar" icon={ImageIcon}>
          <ImageField
            label="File gambar"
            value={el.src}
            onChange={async (ref, file) => onChange({ src: ref, ...(await fitRatio(ref, file)) })}
            onPickLibrary={() => onPickLibrary(async (it) => onChange({ src: it.src, ...(await fitRatio(it.src)) }))}
            hint="Gunakan PNG transparan dari Canva (Unduh → PNG → Latar transparan)."
          />
          <Check checked={el.sticker} onChange={(v) => onChange({ sticker: v })} label="Bingkai stiker putih" hint="Garis tepi putih seperti stiker (gaya desain slide Sea World)." />
          <Btn onClick={async () => onChange(await fitRatio(el.src))}>
            <Scaling className="h-4 w-4" /> Sesuaikan tinggi dengan rasio gambar
          </Btn>
        </Section>
      )}

      <Section title="Suara (klik untuk mendengar)" icon={Volume2}>
        <Field label={hasText ? 'Teks yang dibacakan (opsional)' : 'Teks yang dibacakan saat disentuh'} hint={hasText ? 'Kosongkan = membaca isi teks di atas.' : 'Kosongkan = gambar tidak bersuara.'}>
          <TextInput value={el.speakText} onChange={(v) => onChange({ speakText: v })} placeholder={hasText ? el.text : 'mis. Elephant'} />
        </Field>
        <Field label="Bahasa suara">
          <Select value={el.lang || 'auto'} onChange={(v) => onChange({ lang: v })} options={LANG_OPTIONS} />
        </Field>
        <AudioField label="Rekaman suara sendiri (.mp3 / .wav)" value={el.audio} onChange={(ref) => onChange({ audio: ref })} hint="Jika diisi, rekaman ini yang diputar. Jika gagal diputar, otomatis kembali ke suara TTS." />
        <div className="flex flex-wrap items-center gap-3">
          <TestSpeak el={el} />
          {el.kind !== 'option' && <Check checked={el.autoRead} onChange={(v) => onChange({ autoRead: v })} label="Bacakan otomatis saat slide dibuka" />}
        </div>
        {el.kind !== 'option' && (
          <>
            <Field label="Saat disentuh">
              <Select value={el.action || 'none'} onChange={(v) => onChange({ action: v })} options={[['none', 'Hanya dibacakan'], ['next', 'Dibacakan lalu lanjut ke slide berikutnya']]} />
            </Field>
            <Check checked={el.highlight} onChange={(v) => onChange({ highlight: v })} label="Beri tanda berkedip + ikon tangan (petunjuk untuk disentuh)" />
          </>
        )}
      </Section>

      <Section title="Animasi" icon={Sparkles}>
        <div className="grid grid-cols-2 gap-2">
          <Field label="Saat muncul">
            <Select value={el.anim || 'none'} onChange={(v) => onChange({ anim: v })} options={ANIM_OPTIONS} />
          </Field>
          <Field label="Berulang">
            <Select value={el.loop || 'none'} onChange={(v) => onChange({ loop: v })} options={LOOP_OPTIONS} />
          </Field>
          <Field label="Jeda muncul (detik)">
            <NumberInput value={el.delay || 0} step={0.1} min={0} max={10} onChange={(v) => onChange({ delay: v })} />
          </Field>
        </div>
      </Section>

      <Section title="Posisi & Ukuran (% panggung)" icon={Move}>
        <div className="grid grid-cols-4 gap-2">
          {['x', 'y', 'w', 'h'].map((k) => (
            <Field key={k} label={{ x: 'X', y: 'Y', w: 'Lebar', h: 'Tinggi' }[k]}>
              <NumberInput value={el[k]} step={0.1} onChange={(v) => onChange({ [k]: v })} />
            </Field>
          ))}
        </div>
        <p className="text-[11px] text-slate-400">Tips: seret langsung di kanvas. Tahan Shift saat menarik sudut untuk menjaga rasio. Panah keyboard = geser halus.</p>
      </Section>

      <Section title="Urutan Lapisan" icon={Layers}>
        <div className="flex flex-wrap gap-1.5">
          <Btn onClick={() => onLayer('front')}>
            <ArrowUpToLine className="h-4 w-4" /> Paling depan
          </Btn>
          <Btn onClick={() => onLayer('up')}>
            <ChevronUp className="h-4 w-4" /> Maju
          </Btn>
          <Btn onClick={() => onLayer('down')}>
            <ChevronDown className="h-4 w-4" /> Mundur
          </Btn>
          <Btn onClick={() => onLayer('back')}>
            <ArrowDownToLine className="h-4 w-4" /> Paling belakang
          </Btn>
        </div>
        <p className="text-[11px] text-slate-400">
          Lapisan {slide.elements.findIndex((e) => e.id === el.id) + 1} dari {slide.elements.length}
        </p>
      </Section>
    </div>
  );
}

export function SlideInspector({ slide, onChange, onPickLibrary }) {
  const optionCount = slide.elements.filter((e) => e.kind === 'option').length;
  const correctCount = slide.elements.filter((e) => e.kind === 'option' && e.correct).length;
  return (
    <div>
      <div className="border-b bg-slate-50 px-4 py-2.5 text-sm font-extrabold text-slate-800">Pengaturan Slide</div>
      <Section title="Umum">
        <Field label="Nama slide (hanya terlihat di admin)">
          <TextInput value={slide.name} onChange={(v) => onChange({ name: v })} />
        </Field>
        <Field label="Jenis slide">
          <Select
            value={slide.type}
            onChange={(v) => onChange({ type: v })}
            options={[
              ['story', 'Cerita / materi (tombol Lanjut)'],
              ['quiz', 'Kuis (harus menjawab)'],
              ['ending', 'Penutup (tampilkan skor & Main Lagi)'],
            ]}
          />
        </Field>
      </Section>
      <Section title="Background">
        <ImageField label="Gambar background (1920 × 1080)" value={slide.background} onChange={(ref) => onChange({ background: ref })} onPickLibrary={() => onPickLibrary((it) => onChange({ background: it.src }))} hint="Ekspor halaman Canva ukuran 1920×1080 (.jpg/.png)." />
      </Section>
      <Section title="Desain acuan (gambaran Canva)">
        <ImageField label="Gambar acuan" value={slide.reference} allowClear onChange={(ref) => onChange({ reference: ref })} onPickLibrary={() => onPickLibrary((it) => onChange({ reference: it.src }))} hint="Hanya untuk admin: aktifkan 'Tampilkan desain Canva' di atas kanvas untuk mencocokkan posisi elemen." />
      </Section>
      {slide.type === 'quiz' && (
        <Section title="Kuis">
          <p className={`rounded-lg px-2.5 py-2 text-xs font-semibold ${correctCount ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
            {optionCount} pilihan jawaban · {correctCount} ditandai benar
            {!correctCount && ' — pilih salah satu pilihan lalu centang "Ini jawaban BENAR".'}
          </p>
          <Field label="Teks setelah menjawab benar" hint="Ditampilkan di popup umpan balik.">
            <TextInput value={slide.correctText} onChange={(v) => onChange({ correctText: v })} placeholder="Jawaban benar: …" />
          </Field>
          <Field label="Jika jawaban salah">
            <Select
              value={slide.wrongMode || 'default'}
              onChange={(v) => onChange({ wrongMode: v })}
              options={[
                ['default', 'Ikuti pengaturan umum'],
                ['retry', 'Boleh mencoba lagi'],
                ['next', 'Tampilkan jawaban benar lalu lanjut'],
              ]}
            />
          </Field>
        </Section>
      )}
      {slide.type === 'ending' && (
        <Section title="Panel skor akhir (% panggung)">
          <div className="grid grid-cols-4 gap-2">
            {['x', 'y', 'w', 'h'].map((k) => (
              <Field key={k} label={k.toUpperCase()}>
                <NumberInput value={slide.resultBox?.[k]} step={0.5} onChange={(v) => onChange({ resultBox: { ...(slide.resultBox || { x: 22, y: 33, w: 56, h: 40 }), [k]: v } })} />
              </Field>
            ))}
          </div>
        </Section>
      )}
      <p className="px-4 py-3 text-xs text-slate-400">Klik elemen di kanvas untuk mengedit teks, gambar, suara, dan kunci jawabannya.</p>
    </div>
  );
}
