/** SegmentedControl — Pilihan tunggal berbentuk tab (mis. bahasa suara). */
export default function SegmentedControl({ value, onChange, options, label }) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="grid auto-cols-fr grid-flow-col gap-1 rounded-2xl bg-slate-100 p-1 ring-1 ring-slate-200"
    >
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(opt.value)}
            className={`rounded-xl px-2 py-2 text-sm font-extrabold transition focus-visible:outline-2 focus-visible:outline-indigo-400 ${
              active ? 'bg-white text-indigo-700 shadow' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
