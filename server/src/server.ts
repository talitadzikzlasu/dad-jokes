/* eslint-disable @typescript-eslint/no-var-requires */
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const jokesRouter = require('./routes/jokes');
const transcribeRouter = require('./routes/transcribe');
const historyRouter = require('./routes/history');

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));
// app.use('/api');

app.use('/api/jokes', jokesRouter);
app.use('/api/transcribe', transcribeRouter);
app.use('/api/history', historyRouter);

app.use((err: any, _req: any, res: any, _next: any) => {
  console.error(err);
  res.status(500).json({ error: 'internal', details: err?.message ?? String(err) });
});

const PORT = Number(process.env.PORT || 3001);
app.listen(PORT, () => {
  console.log(`API listening at http://localhost:${PORT}`);
});
