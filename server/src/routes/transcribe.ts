/* eslint-disable @typescript-eslint/no-var-requires */
const express = require('express');
const router = express.Router();

const GOODTAPE_KEY = process.env.GOODTAPE_API_KEY;

// Accept raw audio for this endpoint only
router.post('/', express.raw({ type: '*/*', limit: '25mb' }), async (req: any, res: any) => {
  try {
    if (!GOODTAPE_KEY) return res.status(500).json({ error: 'Missing Good Tape key' });

    // TODO: replace with the real Good Tape endpoint from your docs
    const url = 'https://api.goodtape.example/transcribe';
    const contentType = (req.headers['content-type'] as string) || 'application/octet-stream';
    const buf: Buffer = req.body;
    if (!buf?.length) return res.status(400).json({ error: 'No audio body' });
    const ab = buf.buffer.slice(buf.byteOffset, buf.byteLength + buf.byteOffset);
    // turn Node Buffer -> ArrayBuffer (exact slice), then -> Blob
    const body = new Blob([ab as any], { type: contentType });

    const r = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${GOODTAPE_KEY}`,
        'Content-Type': contentType,
      } as Record<string, string>,
      body, // Blob is a valid BodyInit
    });

    if (!r.ok) {
      const msg = await r.text().catch(() => '');
      return res.status(502).json({ error: 'Transcription failed', details: msg });
    }

    const data = (await r.json()) as any;
    res.json({ text: (data.text || '').trim() });
  } catch (e: any) {
    res.status(500).json({ error: 'transcribe failed', details: e?.message });
  }
});

// If you add more handlers later here, re-enable JSON:
// router.use(express.json());

export = router;
