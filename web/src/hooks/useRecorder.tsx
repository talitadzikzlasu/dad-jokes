import { useCallback, useRef, useState } from 'react';

type UseRecorderOpts = {
  // You can pass preferred mime; we'll auto-fallback
  preferMimeType?: string; // e.g., "audio/webm;codecs=opus"
};

export function useRecorder(opts: UseRecorderOpts = {}) {
  const [recording, setRecording] = useState(false);
  const [supportedMime, setSupportedMime] = useState<string | null>(null);
  const mediaRecRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);

  const pickMime = useCallback(() => {
    const candidates = [
      opts.preferMimeType || '',
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/ogg;codecs=opus',
      'audio/mp4', // Safari may fall back to this (MediaRecorder support is limited)
    ].filter(Boolean);
    for (const t of candidates) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((window as any).MediaRecorder && MediaRecorder.isTypeSupported?.(t)) return t;
    }
    // If none claim support, return empty => let browser decide
    return '';
  }, [opts.preferMimeType]);

  const start = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error('This browser does not support getUserMedia.');
    }
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mime = pickMime();
    setSupportedMime(mime || null);

    const rec = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
    chunksRef.current = [];
    rec.ondataavailable = (e) => {
      if (e.data.size) chunksRef.current.push(e.data);
    };
    rec.start();
    mediaRecRef.current = rec;
    setRecording(true);
  }, [pickMime]);

  const stop = useCallback(async (): Promise<{ blob: Blob; mime: string }> => {
    const rec = mediaRecRef.current;
    if (!rec) throw new Error('Recorder not started.');
    if (rec.state !== 'recording') throw new Error('Recorder not in recording state.');

    const stopPromise = new Promise<void>((resolve) => {
      rec.onstop = () => resolve();
    });
    rec.stop();

    await stopPromise;
    const mime = supportedMime || rec.mimeType || 'audio/webm';
    const blob = new Blob(chunksRef.current, { type: mime || 'application/octet-stream' });

    // close mic
    rec.stream.getTracks().forEach((t) => t.stop());
    mediaRecRef.current = null;
    setRecording(false);
    return { blob, mime };
  }, [supportedMime]);

  return { recording, start, stop };
}
