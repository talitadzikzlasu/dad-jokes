/* eslint-disable @typescript-eslint/no-var-requires */
const express = require('express');
const router = express.Router();



// GET /api/jokes/search-multi?kw=word1,word2&limit=20
router.get('/search-multi', async (req: any, res: any) => {
  try {
    const kw = String(req.query.kw || '')
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean)
      .slice(0, 5);
    const limit = Number(req.query.limit || 20);

    if (kw.length === 0) return res.json({ results: [] });

    const headers = {
      Accept: 'application/json',
      'User-Agent': process.env.USER_AGENT || 'DadJokes Demo',
    };

    const build = (term: string) => {
      const u = new URL('https://icanhazdadjoke.com/search');
      u.searchParams.set('term', term);
      u.searchParams.set('limit', String(limit));
      return u;
    };

    // combined
    const r1 = await fetch(build(kw.join(' ')), { headers });
    const t1 = await r1.text();
    const d1 = r1.ok ? JSON.parse(t1) : { results: [] };
    const combined = (d1.results || []).map((j: any) => ({
      id: j.id,
      joke: j.joke,
      length: (j.joke || '').length,
    }));

    // per-keyword
    const per = await Promise.all(
      kw.map(async (w) => {
        const rr = await fetch(build(w), { headers });
        const tt = await rr.text();
        if (!rr.ok) return [];
        const dd = JSON.parse(tt);
        return (dd.results || []).map((j: any) => ({
          id: j.id,
          joke: j.joke,
          length: (j.joke || '').length,
        }));
      })
    );

    // merge + score
    const byId = new Map<string, { id: string; joke: string; length: number; score: number }>();
    const scoreIt = (arr: any[], weight = 1) => {
      for (const j of arr) {
        const lower = j.joke.toLowerCase();
        const matches = kw.reduce((n, w) => n + (lower.includes(w) ? 1 : 0), 0);
        const prev = byId.get(j.id);
        const score = matches + weight;
        if (!prev || score > prev.score) byId.set(j.id, { ...j, score });
      }
    };
    scoreIt(combined, 1.5);
    per.forEach((set) => scoreIt(set, 1));

    const results = [...byId.values()]
      .sort((a, b) => b.score - a.score || a.length - b.length || a.id.localeCompare(b.id))
      .slice(0, limit)
      .map(({ id, joke, length }) => ({ id, joke, length }));

    res.json({ results });
  } catch (e: any) {
    console.error('search-multi failed:', e);
    res.status(500).json({ error: 'search-multi failed', details: e?.message });
  }
});

export = router;
