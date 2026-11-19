/**
 * SettingsTab — Pengaturan umum game: judul, PIN, suara, aturan kuis, suara benar/salah.
 */
import { useState } from 'react';
import { Gamepad2, KeyRound, Mic, PartyPopper, Volume2 } from 'lucide-react';
import { AudioField, Btn, Check, Field, NumberInput, Section, Select, TextInput } from './fields';
import { useProject } from '../lib/projectStore';
import { useAudio } from '../audio/AudioProvider';

export default function SettingsTab() {
  const { project, setProject, updateSettings } = useProject();
  const s = project.settings;
  const { speak } = useAudio();
  const [pin1, setPin1] = useState('');
  const [pin2, setPin2] = useState('');
  const [pinMsg, setPinMsg] = useState('');

  const savePin = () => {
    if (!/^\d{4,8}$/.test(pin1)) return setPinMsg('PIN harus 4–8 angka.');
    if (pin1 !== pin2) return setPinMsg('Konfirmasi PIN tidak sama.');
    updateSettings({ pin: pin1 });
    setPin1('');
    setPin2('');
    return setPinMsg('PIN baru tersimpan ✓');
  };

  return (
    <div className="admin-scroll h-full overflow-auto bg-slate-100 p-3 sm:p-6">
      <div className="mx-auto grid max-w-5xl gap-4 lg:grid-cols-2">
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
          <Section title="Identitas Game" icon={Gamepad2}>
            <Field label="Judul game">
              <TextInput value={project.title} onChange={(v) => setProject((p) => ({ ...p, title: v }))} />
            </Field>
            <Field label="Subjudul (halaman pembuka)">
              <TextInput value={project.subtitle} onChange={(v) => setProject((p) => ({ ...p, subtitle: v }))} />
            </Field>
          </Section>
          <Section title="Keamanan Admin" icon={KeyRound}>
            <Check checked={s.requirePin} onChange={(v) => updateSettings({ requirePin: v })} label="Minta PIN saat membuka Admin Panel" hint="Matikan jika perangkat hanya dipakai guru/pengelola." />
            <div className="grid grid-cols-2 gap-2">
              <Field label="PIN baru">
                <TextInput type="password" inputMode="numeric" value={pin1} onChange={(v) => setPin1(v.replace(/\D/g, ''))} />
              </Field>
              <Field label="Ulangi PIN">
                <TextInput type="password" inputMode="numeric" value={pin2} onChange={(v) => setPin2(v.replace(/\D/g, ''))} />
              </Field>
            </div>
            <div className="flex items-center gap-2">
              <Btn variant="dark" onClick={savePin}>
                Simpan PIN
              </Btn>
              {pinMsg && <span className="text-xs font-semibold text-slate-600">{pinMsg}</span>}
            </div>
          </Section>
        </div>

        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
          <Section title="Suara Baca (Text-to-Speech)" icon={Mic}>
            <Field label="Bahasa suara" hint="Otomatis = mendeteksi kalimat Inggris / Indonesia. Pemain juga bisa mengganti lewat tombol bahasa di layar game.">
              <Select value={s.voiceLang} onChange={(v) => updateSettings({ voiceLang: v })} options={[['auto', 'Otomatis (EN/ID)'], ['en-US', 'Selalu Inggris'], ['id-ID', 'Selalu Indonesia']]} />
            </Field>
            <Field label="Bahasa utama materi">
              <Select value={s.defaultLang} onChange={(v) => updateSettings({ defaultLang: v })} options={[['en-US', 'Inggris (en-US)'], ['id-ID', 'Indonesia (id-ID)']]} />
            </Field>
            <Field label={`Kecepatan bicara: ${s.speechRate}×`}>
              <div className="flex items-center gap-2">
                <input type="range" min={0.5} max={1.4} step={0.05} value={s.speechRate} onChange={(e) => updateSettings({ speechRate: Number(e.target.value) })} className="flex-1 accent-amber-500" />
                <Btn onClick={() => speak({ id: 'rate-test', text: 'Hello! What is this animal?', lang: 'en-US' })}>
                  <Volume2 className="h-4 w-4" /> Tes
                </Btn>
              </div>
            </Field>
            <Check checked={s.autoRead} onChange={(v) => updateSettings({ autoRead: v })} label="Bacakan otomatis teks bertanda saat slide dibuka" />
            <Check checked={s.showSpeakerIcons} onChange={(v) => updateSettings({ showSpeakerIcons: v })} label="Tampilkan ikon speaker kecil di teks yang bisa dibacakan" />
          </Section>
        </div>

        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
          <Section title="Aturan Kuis" icon={Gamepad2}>
            <Field label="Jika jawaban salah">
              <Select value={s.wrongMode} onChange={(v) => updateSettings({ wrongMode: v })} options={[['retry', 'Boleh mencoba lagi sampai benar'], ['next', 'Tampilkan jawaban benar lalu lanjut']]} />
            </Field>
            <div className="grid grid-cols-3 gap-2">
              <Field label="Poin benar">
                <NumberInput value={s.pointsCorrect} min={0} onChange={(v) => updateSettings({ pointsCorrect: v })} />
              </Field>
              <Field label="Poin setelah salah">
                <NumberInput value={s.pointsRetry} min={0} onChange={(v) => updateSettings({ pointsRetry: v })} />
              </Field>
              <Field label="Lanjut otomatis (dtk)" hint="0 = tunggu tombol Lanjut">
                <NumberInput value={s.autoNextDelay} min={0} step={0.5} onChange={(v) => updateSettings({ autoNextDelay: v })} />
              </Field>
            </div>
          </Section>
        </div>

        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
          <Section title="Umpan Balik Benar / Salah" icon={PartyPopper}>
            <Field label="Ucapan saat BENAR">
              <TextInput value={s.correctVoice} onChange={(v) => updateSettings({ correctVoice: v })} />
            </Field>
            <AudioField label="Efek suara BENAR (opsional)" value={s.correctAudio} onChange={(ref) => updateSettings({ correctAudio: ref })} hint="Kosong = bunyi 'ding' bawaan." />
            <Field label="Ucapan saat SALAH">
              <TextInput value={s.wrongVoice} onChange={(v) => updateSettings({ wrongVoice: v })} />
            </Field>
            <AudioField label="Efek suara SALAH (opsional)" value={s.wrongAudio} onChange={(ref) => updateSettings({ wrongAudio: ref })} hint="Kosong = bunyi 'buzz' bawaan." />
          </Section>
        </div>
      </div>
    </div>
  );
}
