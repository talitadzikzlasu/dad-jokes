/* eslint-disable @typescript-eslint/no-var-requires */
const express = require('express');
const router = express.Router();

router.use(express.json());

type HistoryItem = { id: string; query: string; topResultId?: string; at: number };
const history: HistoryItem[] = [];

router.post('/', (req: any, res: any) => {
  const { query, topResultId } = req.body || {};
  if (!query) return res.status(400).json({ error: 'Missing query' });

  const id = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  history.unshift({ id, query, topResultId, at: Date.now() });
  if (history.length > 50) history.pop();

  res.json({ ok: true });
});

router.get('/', (req: any, res: any) => {
  const limit = Math.min(50, Math.max(1, Number(req.query.limit || 10)));
  res.json(history.slice(0, limit));
});

export = router;
