/**
 * storage.js — Pembungkus localStorage yang aman.
 * Di mode private / browser yang memblokir penyimpanan, game tetap jalan.
 */
export const storage = {
  get(key, fallback) {
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* penyimpanan tidak tersedia — abaikan */
    }
  },
};
