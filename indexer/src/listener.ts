import { rpc, xdr, scValToNative } from '@stellar/stellar-sdk';
import dotenv from 'dotenv';
import { pool } from './db';

dotenv.config();

const server = new rpc.Server(process.env.SOROBAN_RPC_URL!);
const CONTRACT_ID = process.env.CONTRACT_ID!;
const POLL_INTERVAL_MS = 5000;

async function getLastProcessedLedger(): Promise<number> {
  const result = await pool.query(
    "SELECT value FROM sync_state WHERE key = 'last_ledger'"
  );
  if (result.rows.length === 0) {
    const latest = await server.getLatestLedger();
    return latest.sequence - 100; // small lookback on first run
  }
  return parseInt(result.rows[0].value, 10);
}

async function setLastProcessedLedger(ledger: number) {
  await pool.query(
    `INSERT INTO sync_state (key, value) VALUES ('last_ledger', $1)
     ON CONFLICT (key) DO UPDATE SET value = $1`,
    [ledger.toString()]
  );
}

async function pollEvents() {
  const startLedger = await getLastProcessedLedger();

  const response = await server.getEvents({
    startLedger,
    filters: [
      {
        type: 'contract',
        contractIds: [CONTRACT_ID],
      },
    ],
  });

  for (const event of response.events) {
    try {
      const topics = event.topic.map((t) => scValToNative(t));
      const value = scValToNative(event.value);

      await pool.query(
        `INSERT INTO attestations (issuer, subject, schema_id, data, tx_hash, block_time)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (tx_hash) DO NOTHING`,
        [
          value.issuer?.toString() ?? '',
          value.subject?.toString() ?? '',
          value.schema_id?.toString() ?? '',
          JSON.stringify(value.data ?? {}),
          event.id,
          new Date(event.ledgerClosedAt),
        ]
      );

      console.log(`Indexed event ${event.id}`);
    } catch (err) {
      console.error(`Failed to process event ${event.id}:`, err);
    }
  }

  if (response.events.length > 0) {
    const lastLedger = Math.max(...response.events.map((e) => e.ledger));
    await setLastProcessedLedger(lastLedger + 1);
  }
}

async function run() {
  console.log('Starting attestation event listener...');
  while (true) {
    try {
      await pollEvents();
    } catch (err) {
      console.error('Poll error:', err);
    }
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  }
}

run();