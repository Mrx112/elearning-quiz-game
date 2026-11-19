import { readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { promises as fs } from 'fs';

const DATA_FILE = path.join(process.cwd(), 'data', 'slides.json');

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, error: 'Method not allowed' });
    return;
  }

  try {
    const body = req.body || {};
    const slides = Array.isArray(body.slides) ? body.slides : [];
    const settings = body.settings && typeof body.settings === 'object' ? body.settings : {};

    const data = { slides, settings };
    const json = JSON.stringify(data, null, 2);

    // Vercel serverless filesystem is read-only; attempt write, fall back gracefully.
    try {
      writeFileSync(DATA_FILE, json, 'utf-8');
      res.status(200).json({ ok: true });
    } catch (fsErr) {
      try {
        await fs.writeFile('/tmp/slides.json', json, 'utf-8');
        res.status(200).json({ ok: true, note: 'disimpan sementara (memori)' });
      } catch (tmpErr) {
        res.status(200).json({ ok: true, note: 'hanya baca (Vercel tanpa database)' });
      }
    }
  } catch (err) {
    res.status(500).json({ ok: false, error: 'Gagal menyimpan ke server' });
  }
}
