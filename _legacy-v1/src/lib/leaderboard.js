/**
 * leaderboard.js — Papan peringkat lokal (tersimpan di browser perangkat ini).
 * Untuk peringkat bersama antar-perangkat, ganti dua fungsi ini dengan
 * panggilan ke backend (mis. Firebase / Supabase) — komponen lain tidak perlu diubah.
 */
import { GAME_SETTINGS } from '../config/gameConfig';
import { storage } from './storage';

const { storageKey, size } = GAME_SETTINGS.leaderboard;

export function loadLeaderboard() {
  const list = storage.get(storageKey, []);
  return Array.isArray(list) ? list : [];
}

/** Simpan skor baru, kembalikan daftar teratas yang sudah diurutkan. */
export function saveScore(entry) {
  const list = [...loadLeaderboard(), entry]
    .sort((a, b) => b.score - a.score || a.date - b.date)
    .slice(0, size);
  storage.set(storageKey, list);
  return list;
}
