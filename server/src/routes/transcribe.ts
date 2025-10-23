/* eslint-disable @typescript-eslint/no-var-requires */
const express = require('express');
const router = express.Router();
const fs = require('fs');
const os = require('os');
const path = require('path');
const { randomUUID } = require('crypto');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static'); // binarka ffmpeg
ffmpeg.setFfmpegPath(ffmpegPath);

const GOODTAPE_KEY = process.env.GOODTAPE_API_KEY!;
const API_BASE = process.env.GOODTAPE_API_BASE || 'https://api.goodtape.io';

// utils
function writeTmpFile(buf: Buffer, ext: string) {
  const p = path.join(os.tmpdir(), `gt-${randomUUID()}.${ext}`);
  fs.writeFileSync(p, buf);
  return p;
}
function toWav(inputPath: string): Promise<string> {
  const outPath = inputPath.replace(/\.[^.]+$/, '.wav');
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .audioCodec('pcm_s16le')
      .format('wav')
      .on('error', reject)
      .on('end', () => resolve(outPath))
      .save(outPath);
  });
}
function pickExt(ct: string) {
  if (!ct) return 'bin';
  if (ct.includes('webm')) return 'webm';
  if (ct.includes('ogg')) return 'ogg';
  if (ct.includes('wav') || ct.includes('x-wav')) return 'wav';
  if (ct.includes('mpeg')) return 'mp3';
  if (ct.includes('mp4') || ct.includes('m4a') || ct.includes('aac')) return 'm4a';
  return 'bin';
}

router.post('/', express.raw({ type: '*/*', limit: '25mb' }), async (req: any, res: any) => {
  try {
    if (!GOODTAPE_KEY) return res.status(500).json({ error: 'Missing Good Tape key' });
    const buf: Buffer = req.body;
    if (!buf?.length) return res.status(400).json({ error: 'No audio body' });

    const contentType = (req.headers['content-type'] as string) || 'application/octet-stream';
    const inExt = pickExt(contentType);
    const inPath = writeTmpFile(buf, inExt);

    async function postSync(filePath: string, mime = 'audio/wav') {
      const fd = new FormData();
      const blob = new Blob([fs.readFileSync(filePath)], { type: mime });
      fd.append('audio', blob, path.basename(filePath));

      const r = await fetch(`${API_BASE}/transcribe/sync`, {
        method: 'POST',
        headers: { Authorization: `${GOODTAPE_KEY}` } as Record<string, string>,
        body: fd as any,
      });
      const text = await r.text();
      return { ok: r.ok, status: r.status, text };
    }

    let attempt = await postSync(inPath, contentType.includes('wav') ? 'audio/wav' : contentType);

    if (
      !attempt.ok &&
      /invalid audio|unsupported|415|bad request/i.test(attempt.text + ' ' + attempt.status)
    ) {
      const wavPath = inExt === 'wav' ? inPath : await toWav(inPath);
      attempt = await postSync(wavPath, 'audio/wav');
      try {
        if (wavPath !== inPath) fs.unlinkSync(wavPath);
      } catch {}
    }

    try {
      fs.unlinkSync(inPath);
    } catch {}

    if (!attempt.ok) {
      return res
        .status(502)
        .json({ error: 'Transcription failed', details: attempt.text, status: attempt.status });
    }

    let payload: any = null;
    try {
      payload = JSON.parse(attempt.text);
    } catch {
      payload = { raw: attempt.text };
    }

    const text = payload?.text || payload?.transcription?.text || payload?.results?.[0]?.text || '';

    return res.json({ text: (text || '').trim(), raw: payload }); // możesz raw usunąć po testach
  } catch (e: any) {
    return res.status(500).json({ error: 'transcribe failed', details: e?.message });
  }
});

export = router;
