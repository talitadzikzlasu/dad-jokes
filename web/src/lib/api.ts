export async function transcribeAudio(blob: Blob, contentType = 'audio/webm'): Promise<string> {
  const res = await fetch('/api/transcribe', {
    method: 'POST',
    headers: { 'Content-Type': contentType },
    body: blob,
  });
  if (!res.ok) {
    const msg = await res.text().catch(() => '');
    throw new Error(`Transcribe failed: ${res.status} ${msg}`);
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = (await res.json()) as any;

  return (data.text || '').trim();
}

export async function searchJokesMulti(words: string[], limit = 20) {
  const kw = words
    .map((w) => w.trim().toLowerCase())
    .filter(Boolean)
    .slice(0, 5)
    .join(',');
  const r = await fetch(`/api/jokes/search-multi?kw=${encodeURIComponent(kw)}&limit=${limit}`);
  if (!r.ok) throw new Error('search-multi failed');
  return (await r.json()).results as Array<{ id: string; joke: string; length: number }>;
}
