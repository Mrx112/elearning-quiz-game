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
    const pin = body.pin || '';
    // Baca PIN default dari data/slides.json (tidak ada fs import di sini sengaja ringkas; pakai default)
    const correctPin = '1234';

    if (String(pin) === String(correctPin)) {
      res.status(200).json({ ok: true });
    } else {
      res.status(401).json({ ok: false, error: 'PIN salah' });
    }
  } catch (err) {
    res.status(500).json({ ok: false, error: 'Gagal login' });
  }
}
