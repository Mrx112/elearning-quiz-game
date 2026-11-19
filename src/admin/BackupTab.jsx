/**
 * BackupTab — Export / Import backup (.json) dan Reset ke Default (aset ICT ELEMENT).
 */
import { useEffect, useRef, useState } from 'react';
import { Download, HardDrive, RotateCcw, Upload } from 'lucide-react';
import { Btn } from './fields';
import { useProject } from '../lib/projectStore';

const fmt = (b) => (b > 1e6 ? `${(b / 1e6).toFixed(1)} MB` : `${Math.round(b / 1e3)} KB`);

export default function BackupTab() {
  const { project, exportBackup, importBackup, resetProject } = useProject();
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [usage, setUsage] = useState(null);
  const fileRef = useRef(null);

  useEffect(() => {
    navigator.storage?.estimate?.().then((e) => setUsage(e)).catch(() => {});
  }, [project]);

  const run = async (fn, ok) => {
    setBusy(true);
    setMsg(null);
    try {
      const r = await fn();
      setMsg({ type: 'ok', text: ok(r) });
    } catch (e) {
      setMsg({ type: 'err', text: e.message || String(e) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="admin-scroll h-full overflow-auto bg-slate-100 p-3 sm:p-6">
      <div className="mx-auto max-w-3xl space-y-4">
        {msg && <div className={`rounded-xl px-4 py-3 text-sm font-semibold ${msg.type === 'ok' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-700'}`}>{msg.text}</div>}

        <Card icon={Download} title="Export Backup (.json)" desc="Unduh seluruh isi game — slide, teks, kunci jawaban, pengaturan, DAN semua gambar/audio yang Anda unggah — dalam satu file. Simpan file ini untuk dipindahkan ke perangkat lain atau sebagai cadangan.">
          <Btn variant="primary" disabled={busy} onClick={() => run(exportBackup, (r) => `Backup diunduh: ${r.slides} slide, ${r.files} file unggahan.`)}>
            <Download className="h-4 w-4" /> Unduh backup
          </Btn>
        </Card>

        <Card icon={Upload} title="Import Backup (.json)" desc="Pulihkan game dari file backup. Isi game saat ini akan DIGANTI dengan isi file backup.">
          <Btn variant="dark" disabled={busy} onClick={() => fileRef.current?.click()}>
            <Upload className="h-4 w-4" /> Pilih file backup…
          </Btn>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              e.target.value = '';
              if (f) run(() => importBackup(f), (r) => `Backup dipulihkan: ${r.slides} slide, ${r.files} file.`);
            }}
          />
        </Card>

        <Card icon={RotateCcw} title="Reset ke Default (Aset ICT ELEMENT)" desc="Kembalikan semua slide, teks, dan pengaturan ke versi bawaan dari folder ICT ELEMENT. Semua perubahan & file unggahan akan dihapus. Disarankan Export Backup dulu.">
          {!confirm ? (
            <Btn variant="danger" disabled={busy} onClick={() => setConfirm(true)}>
              <RotateCcw className="h-4 w-4" /> Reset ke default…
            </Btn>
          ) : (
            <div className="flex flex-wrap items-center gap-2 rounded-xl bg-red-50 p-3">
              <span className="text-sm font-bold text-red-700">Yakin? Tindakan ini tidak bisa dibatalkan.</span>
              <Btn
                variant="danger"
                className="!bg-red-600 !text-white"
                onClick={() => {
                  setConfirm(false);
                  run(resetProject, () => 'Game dikembalikan ke isi bawaan ICT ELEMENT.');
                }}
              >
                Ya, reset sekarang
              </Btn>
              <Btn onClick={() => setConfirm(false)}>Batal</Btn>
            </div>
          )}
        </Card>

        <Card icon={HardDrive} title="Penyimpanan di perangkat ini" desc="Data slide disimpan otomatis di localStorage browser; file unggahan di IndexedDB browser. Data hanya ada di browser & perangkat ini — gunakan Export Backup untuk memindahkannya.">
          <p className="text-sm text-slate-600">
            {project.slides.length} slide · {project.slides.reduce((n, s) => n + s.elements.length, 0)} elemen
            {usage?.usage != null && ` · terpakai ${fmt(usage.usage)} dari kuota ±${fmt(usage.quota)}`}
          </p>
        </Card>
      </div>
    </div>
  );
}

function Card({ icon: Icon, title, desc, children }) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:p-5">
      <h3 className="flex items-center gap-2 font-display text-lg font-bold text-slate-800">
        <Icon className="h-5 w-5 text-amber-500" /> {title}
      </h3>
      <p className="mb-3 mt-1 text-sm text-slate-500">{desc}</p>
      {children}
    </div>
  );
}
