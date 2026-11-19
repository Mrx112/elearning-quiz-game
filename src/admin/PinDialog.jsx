/**
 * PinDialog — Kunci sederhana sebelum masuk Mode Pengelola. PIN default: 1234.
 */
import { useEffect, useRef, useState } from 'react';
import { Delete, Lock, X } from 'lucide-react';

export default function PinDialog({ pin = '1234', onSuccess, onCancel }) {
  const [value, setValue] = useState('');
  const [error, setError] = useState(false);
  const inputRef = useRef(null);
  const target = String(pin || '');

  useEffect(() => inputRef.current?.focus(), []);

  const check = (v) => {
    if (v === target) {
      onSuccess();
    } else if (v.length >= Math.max(4, target.length)) {
      setError(true);
      setTimeout(() => {
        setError(false);
        setValue('');
      }, 700);
    }
  };

  const press = (d) => {
    const v = (value + d).slice(0, 8);
    setValue(v);
    check(v);
  };

  return (
    <div className="fixed inset-0 z-[1000] grid place-items-center bg-slate-950/70 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Masukkan PIN Admin">
      <div className={`w-full max-w-xs animate-slide-up rounded-3xl bg-white p-6 text-center shadow-2xl ${error ? 'animate-shake' : ''}`}>
        <div className="flex justify-end">
          <button type="button" onClick={onCancel} className="rounded-full p-1 text-slate-400 hover:bg-slate-100" aria-label="Batal">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="mx-auto -mt-3 grid h-14 w-14 place-items-center rounded-full bg-amber-100 text-amber-600">
          <Lock className="h-7 w-7" />
        </div>
        <h2 className="mt-3 font-display text-xl font-bold text-slate-800">Mode Pengelola</h2>
        <p className="text-sm text-slate-500">Masukkan PIN admin (default: 1234)</p>
        <input
          ref={inputRef}
          value={value}
          inputMode="numeric"
          type="password"
          aria-label="PIN"
          onChange={(e) => {
            const v = e.target.value.replace(/\D/g, '').slice(0, 8);
            setValue(v);
            check(v);
          }}
          onKeyDown={(e) => e.key === 'Escape' && onCancel()}
          className={`mt-4 w-full rounded-xl border-2 py-2 text-center font-display text-3xl tracking-[0.5em] outline-none ${
            error ? 'border-red-400 text-red-500' : 'border-slate-200 focus:border-amber-400'
          }`}
        />
        <div className="mt-4 grid grid-cols-3 gap-2">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
            <button key={d} type="button" onClick={() => press(d)} className="rounded-xl bg-slate-100 py-3 font-display text-xl font-bold text-slate-700 hover:bg-slate-200">
              {d}
            </button>
          ))}
          <span />
          <button type="button" onClick={() => press('0')} className="rounded-xl bg-slate-100 py-3 font-display text-xl font-bold text-slate-700 hover:bg-slate-200">
            0
          </button>
          <button type="button" onClick={() => setValue((v) => v.slice(0, -1))} className="grid place-items-center rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200" aria-label="Hapus">
            <Delete className="h-5 w-5" />
          </button>
        </div>
        {error && <p className="mt-3 text-sm font-semibold text-red-500">PIN salah, coba lagi.</p>}
      </div>
    </div>
  );
}
