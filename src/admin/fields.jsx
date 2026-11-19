/**
 * fields.jsx — Komponen form kecil untuk Admin Panel.
 */
import { useRef, useState } from 'react';
import { Image as ImageIcon, Library, Music, Play, Trash2, Upload } from 'lucide-react';
import { putMedia } from '../lib/mediaStore';
import { useMediaUrl } from '../hooks/useMediaUrl';

export const inputCls =
  'w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-sm text-slate-800 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-200';

export function Field({ label, hint, children, className = '' }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[11px] leading-snug text-slate-400">{hint}</span>}
    </label>
  );
}

export function Section({ title, children, icon: Icon }) {
  return (
    <section className="border-b border-slate-200 px-4 py-3 last:border-0">
      <h3 className="mb-2.5 flex items-center gap-1.5 text-[13px] font-extrabold text-slate-700">
        {Icon && <Icon className="h-4 w-4 text-amber-500" />} {title}
      </h3>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

export function TextInput({ value, onChange, ...rest }) {
  return <input className={inputCls} value={value ?? ''} onChange={(e) => onChange(e.target.value)} {...rest} />;
}

export function NumberInput({ value, onChange, step = 1, min, max, ...rest }) {
  return (
    <input
      type="number"
      className={inputCls}
      value={Number.isFinite(value) ? Math.round(value * 100) / 100 : ''}
      step={step}
      min={min}
      max={max}
      onChange={(e) => {
        const v = parseFloat(e.target.value);
        if (Number.isFinite(v)) onChange(v);
      }}
      {...rest}
    />
  );
}

export function Select({ value, onChange, options }) {
  return (
    <select className={inputCls} value={value ?? ''} onChange={(e) => onChange(e.target.value)}>
      {options.map(([v, l]) => (
        <option key={v} value={v}>
          {l}
        </option>
      ))}
    </select>
  );
}

export function Check({ checked, onChange, label, hint }) {
  return (
    <label className="flex cursor-pointer items-start gap-2 text-sm text-slate-700">
      <input type="checkbox" checked={!!checked} onChange={(e) => onChange(e.target.checked)} className="mt-0.5 h-4 w-4 accent-amber-500" />
      <span>
        {label}
        {hint && <span className="block text-[11px] text-slate-400">{hint}</span>}
      </span>
    </label>
  );
}

export function Btn({ children, onClick, variant = 'default', className = '', ...rest }) {
  const v = {
    default: 'bg-white text-slate-700 ring-1 ring-slate-300 hover:bg-slate-50',
    primary: 'bg-amber-400 text-amber-950 hover:bg-amber-300 shadow-sm',
    danger: 'bg-white text-red-600 ring-1 ring-red-200 hover:bg-red-50',
    dark: 'bg-slate-800 text-white hover:bg-slate-700',
    ghost: 'text-slate-600 hover:bg-slate-100',
  }[variant];
  return (
    <button type="button" onClick={onClick} className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-bold transition disabled:opacity-40 ${v} ${className}`} {...rest}>
      {children}
    </button>
  );
}

/** Tombol unggah file → disimpan ke IndexedDB → onUploaded("media:<id>", file). */
export function UploadButton({ accept, onUploaded, children, variant = 'default', className = '' }) {
  const ref = useRef(null);
  const [busy, setBusy] = useState(false);
  return (
    <>
      <Btn variant={variant} className={className} onClick={() => ref.current?.click()} disabled={busy}>
        <Upload className="h-4 w-4" /> {busy ? 'Mengunggah…' : children}
      </Btn>
      <input
        ref={ref}
        type="file"
        accept={accept}
        className="hidden"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          e.target.value = '';
          if (!file) return;
          setBusy(true);
          try {
            const mediaRef = await putMedia(file, file.name);
            await onUploaded(mediaRef, file);
          } catch (err) {
            // eslint-disable-next-line no-alert
            alert(`Gagal menyimpan file: ${err.message}`);
          } finally {
            setBusy(false);
          }
        }}
      />
    </>
  );
}

export const IMAGE_ACCEPT = 'image/png,image/jpeg,image/webp,image/gif,image/svg+xml,.png,.jpg,.jpeg,.webp';
export const AUDIO_ACCEPT = 'audio/mpeg,audio/wav,audio/x-wav,audio/ogg,audio/mp4,.mp3,.wav,.ogg,.m4a';

export function Thumb({ src, className = 'h-14 w-24' }) {
  const url = useMediaUrl(src);
  return (
    <div className={`grid shrink-0 place-items-center overflow-hidden rounded-md bg-[conic-gradient(#e2e8f0_25%,#fff_0_50%,#e2e8f0_0_75%,#fff_0)] bg-[length:12px_12px] ring-1 ring-slate-200 ${className}`}>
      {url ? <img src={url} alt="" className="h-full w-full object-contain" /> : <ImageIcon className="h-5 w-5 text-slate-300" />}
    </div>
  );
}

/** Pilih gambar: unggah dari perangkat atau dari pustaka aset. */
export function ImageField({ label, value, onChange, onPickLibrary, hint, allowClear = false }) {
  return (
    <Field label={label} hint={hint}>
      <div className="flex items-center gap-2">
        <Thumb src={value} />
        <div className="flex flex-col gap-1.5">
          <UploadButton accept={IMAGE_ACCEPT} onUploaded={(ref, file) => onChange(ref, file)}>
            Unggah
          </UploadButton>
          {onPickLibrary && (
            <Btn onClick={onPickLibrary}>
              <Library className="h-4 w-4" /> Pustaka
            </Btn>
          )}
          {allowClear && value && (
            <Btn variant="ghost" onClick={() => onChange('')}>
              <Trash2 className="h-4 w-4" /> Hapus
            </Btn>
          )}
        </div>
      </div>
    </Field>
  );
}

/** Audio custom opsional (.mp3/.wav). */
export function AudioField({ label, value, onChange, hint }) {
  const url = useMediaUrl(value);
  const play = () => {
    if (url) new Audio(url).play().catch(() => {});
  };
  return (
    <Field label={label} hint={hint}>
      <div className="flex flex-wrap items-center gap-2">
        <span className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold ${value ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
          <Music className="h-3.5 w-3.5" /> {value ? 'Audio terpasang' : 'Pakai suara otomatis (TTS)'}
        </span>
        <UploadButton accept={AUDIO_ACCEPT} onUploaded={(ref) => onChange(ref)}>
          {value ? 'Ganti' : 'Unggah'}
        </UploadButton>
        {value && (
          <>
            <Btn onClick={play} aria-label="Putar audio">
              <Play className="h-4 w-4" />
            </Btn>
            <Btn variant="ghost" onClick={() => onChange('')} aria-label="Hapus audio">
              <Trash2 className="h-4 w-4" />
            </Btn>
          </>
        )}
      </div>
    </Field>
  );
}

/** Baca ukuran asli gambar (untuk menjaga rasio saat diganti). */
export function imageSize(file) {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      resolve({ w: img.naturalWidth, h: img.naturalHeight });
      URL.revokeObjectURL(url);
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

export function imageSizeFromUrl(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight });
    img.onerror = () => resolve(null);
    img.src = url;
  });
}
