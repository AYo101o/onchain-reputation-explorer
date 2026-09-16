import express from 'express';
import dotenv from 'dotenv';
import { pool } from './db';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/attestations/:address', async (req, res) => {
  const { address } = req.params;

  try {
    const result = await pool.query(
      'SELECT * FROM attestations WHERE subject = $1 ORDER BY block_time DESC',
      [address]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching attestations:', err);
    res.status(500).json({ error: 'Failed to fetch attestations' });
  }
});

app.get('/attestations', async (req, res) => {
  const { schema } = req.query;

  try {
    let result;
    if (schema) {
      result = await pool.query(
        'SELECT * FROM attestations WHERE schema_id = $1 ORDER BY block_time DESC LIMIT 100',
        [schema]
      );
    } else {
      result = await pool.query(
        'SELECT * FROM attestations ORDER BY block_time DESC LIMIT 100'
      );
    }
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching attestations:', err);
    res.status(500).json({ error: 'Failed to fetch attestations' });
  }
});

app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`);
});