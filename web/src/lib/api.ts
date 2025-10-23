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
