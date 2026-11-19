import { readFileSync } from 'fs';
import path from 'path';

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }
  if (req.method !== 'GET') {
    res.status(405).json({ ok: false, error: 'Method not allowed' });
    return;
  }

  try {
    const filePath = path.join(process.cwd(), 'data', 'slides.json');
    const raw = readFileSync(filePath, 'utf-8');
    const data = JSON.parse(raw);
    res.status(200).json({
      ok: true,
      slides: Array.isArray(data.slides) ? data.slides : [],
      settings: data.settings || {},
    });
  } catch (err) {
    res.status(500).json({ ok: false, error: 'Gagal membaca data slide' });
  }
}
