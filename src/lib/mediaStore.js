/**
 * mediaStore.js — Penyimpanan file unggahan (gambar Canva & audio) di IndexedDB.
 *
 * Kenapa bukan localStorage? localStorage hanya muat ±5 MB teks, sedangkan satu PNG
 * ekspor Canva bisa 1–3 MB. Data slide (teks, posisi, kunci jawaban) tetap disimpan di
 * localStorage; isi file-nya di IndexedDB. Keduanya ikut ter-ekspor ke file backup .json.
 *
 * Referensi aset di data slide:
 *   "s01/bg.webp"        → file bawaan di public/assets/slides/
 *   "media:<id>"         → file unggahan klien (IndexedDB)
 *   "data:..."/"http..." → dipakai apa adanya
 */
const DB_NAME = 'elearning-quiz-media';
const STORE = 'files';
const BASE = import.meta.env.BASE_URL;

let dbPromise = null;
const urlCache = new Map(); // id → objectURL

function openDB() {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB tidak tersedia'));
      return;
    }
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbPromise;
}

function tx(mode, fn) {
  return openDB().then(
    (db) =>
      new Promise((resolve, reject) => {
        const t = db.transaction(STORE, mode);
        const store = t.objectStore(STORE);
        const result = fn(store);
        t.oncomplete = () => resolve(result?.result ?? result);
        t.onerror = () => reject(t.error);
        t.onabort = () => reject(t.error);
      }),
  );
}

const newId = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

/** Simpan File/Blob → kembalikan referensi "media:<id>". */
export async function putMedia(blob, name = '') {
  const id = newId();
  await tx('readwrite', (s) => s.put({ blob, name, type: blob.type, size: blob.size, date: Date.now() }, id));
  return `media:${id}`;
}

export async function getMediaRecord(ref) {
  const id = ref.slice(6);
  return tx('readonly', (s) => s.get(id));
}

export async function listMedia() {
  const keys = await tx('readonly', (s) => s.getAllKeys());
  return keys.map((k) => `media:${k}`);
}

export async function deleteMedia(ref) {
  const id = ref.slice(6);
  if (urlCache.has(id)) {
    URL.revokeObjectURL(urlCache.get(id));
    urlCache.delete(id);
  }
  return tx('readwrite', (s) => s.delete(id));
}

export async function clearMedia() {
  urlCache.forEach((u) => URL.revokeObjectURL(u));
  urlCache.clear();
  return tx('readwrite', (s) => s.clear());
}

/** URL yang bisa dipakai <img>/<audio>. Untuk media: berupa objectURL (async). */
export async function resolveMediaUrl(ref) {
  if (!ref) return '';
  if (!isMediaRef(ref)) return staticUrl(ref);
  const id = ref.slice(6);
  if (urlCache.has(id)) return urlCache.get(id);
  const rec = await getMediaRecord(ref);
  if (!rec?.blob) return '';
  const url = URL.createObjectURL(rec.blob);
  urlCache.set(id, url);
  return url;
}

/** Versi sinkron: langsung untuk aset bawaan, atau dari cache untuk media. */
export function resolveUrlSync(ref) {
  if (!ref) return '';
  if (!isMediaRef(ref)) return staticUrl(ref);
  return urlCache.get(ref.slice(6)) || '';
}

export const isMediaRef = (ref) => typeof ref === 'string' && ref.startsWith('media:');

export function staticUrl(ref) {
  if (!ref) return '';
  if (/^(data:|blob:|https?:|\/)/.test(ref)) return ref;
  return `${BASE}assets/slides/${ref}`;
}

// ───────── backup: media ⇄ data URL ─────────
const blobToDataURL = (blob) =>
  new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = () => reject(r.error);
    r.readAsDataURL(blob);
  });

export async function exportMedia(refs) {
  const out = {};
  for (const ref of refs) {
    const rec = await getMediaRecord(ref).catch(() => null);
    if (rec?.blob) out[ref] = { name: rec.name, data: await blobToDataURL(rec.blob) };
  }
  return out;
}

export async function importMedia(map) {
  for (const [ref, { name, data }] of Object.entries(map || {})) {
    const blob = await (await fetch(data)).blob();
    const id = ref.slice(6);
    await tx('readwrite', (s) => s.put({ blob, name, type: blob.type, size: blob.size, date: Date.now() }, id));
  }
}
