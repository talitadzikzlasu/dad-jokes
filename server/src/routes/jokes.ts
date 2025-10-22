/* eslint-disable @typescript-eslint/no-var-requires */
const express = require('express');
const router = express.Router();

// Node 18+ has global fetch and URL.
// If you're on Node <18, install node-fetch@2 and uncomment:
// const fetch = require("node-fetch") as typeof import("node-fetch");

router.get('/search', async (req: any, res: any) => {
  try {
    const term = String(req.query.term || '');
    const limit = Number(req.query.limit || 20);
    const page = Number(req.query.page || 1);

    const url = new URL('https://icanhazdadjoke.com/search');
    if (term) url.searchParams.set('term', term);
    url.searchParams.set('limit', String(limit));
    url.searchParams.set('page', String(page));

    const r = await fetch(url as unknown as string, {
      headers: {
        Accept: 'application/json',
        'User-Agent': process.env.USER_AGENT || 'GoodTape DadJokes Demo',
      },
    });

    if (!r.ok) return res.status(502).json({ error: 'icanhaz error' });

    const data = (await r.json()) as any;
    const results = (data.results || []).map((j: any) => ({
      id: j.id,
      joke: j.joke,
      length: j.joke ? j.joke.length : 0,
    }));

    res.json({
      results,
      total: data.total_jokes ?? results.length,
      page: data.current_page ?? page,
      pages: data.total_pages ?? 1,
    });
  } catch (e: any) {
    res.status(500).json({ error: 'search failed', details: e?.message });
  }
});

router.get('/random', async (_req: any, res: any) => {
  try {
    const r = await fetch('https://icanhazdadjoke.com/', {
      headers: {
        Accept: 'application/json',
        'User-Agent': process.env.USER_AGENT || 'GoodTape DadJokes Demo',
      },
    });

    if (!r.ok) return res.status(502).json({ error: 'icanhaz error' });

    const data = (await r.json()) as any;
    res.json({ id: data.id, joke: data.joke, length: data.joke ? data.joke.length : 0 });
  } catch (e: any) {
    res.status(500).json({ error: 'random failed', details: e?.message });
  }
});

export = router;
