/** Toggle — Saklar on/off untuk pengaturan (SFX, Voice). */
export default function Toggle({ checked, onChange, label, description, icon: Icon }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-left ring-1 ring-slate-200 transition hover:bg-slate-100 focus-visible:outline-4 focus-visible:outline-indigo-300"
    >
      {Icon && (
        <span
          className={`grid size-10 shrink-0 place-items-center rounded-xl transition ${
            checked ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'
          }`}
        >
          <Icon className="size-5" />
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="block font-extrabold text-slate-800">{label}</span>
        {description && <span className="block text-sm font-semibold text-slate-500">{description}</span>}
      </span>
      <span
        aria-hidden
        className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${checked ? 'bg-emerald-500' : 'bg-slate-300'}`}
      >
        <span
          className={`absolute top-1 size-5 rounded-full bg-white shadow transition-all ${checked ? 'left-6' : 'left-1'}`}
        />
      </span>
    </button>
  );
}
