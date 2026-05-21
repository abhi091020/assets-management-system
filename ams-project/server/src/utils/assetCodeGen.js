// server/src/utils/assetCodeGen.js

import { getPool, sql } from "../config/db.js";

const YEAR = () => new Date().getFullYear();
const buildCode = (year, seq) => `AST-${year}-${String(seq).padStart(5, "0")}`;

// Gets max sequence number query (works inside or outside transaction)
const maxSeqQuery = (year) => `
  SELECT ISNULL(MAX(CAST(SUBSTRING(asset_code, 10, LEN(asset_code) - 9) AS INT)), 0) AS maxSeq
  FROM Assets WITH (UPDLOCK, HOLDLOCK)
  WHERE asset_code LIKE 'AST-${year}-%'
`;

// ── Single asset code (race-condition safe) ───────────────────────────────────
export const generateAssetCode = async () => {
  const pool = getPool();
  const year = YEAR();
  const transaction = new sql.Transaction(pool);

  try {
    await transaction.begin(sql.ISOLATION_LEVEL.SERIALIZABLE);
    const req = new sql.Request(transaction);
    const result = await req.query(maxSeqQuery(year));
    const code = buildCode(year, result.recordset[0].maxSeq + 1);
    await transaction.commit();
    return code;
  } catch (err) {
    try { await transaction.rollback(); } catch {}
    throw err;
  }
};

// ── Bulk: N codes atomically inside a CALLER-OWNED transaction ────────────────
// Pass a sql.Request(transaction) — codes are generated and locked in one shot
export const generateAssetCodesBulkTx = async (txRequest, n) => {
  const year = YEAR();
  const result = await txRequest.query(maxSeqQuery(year));
  const startSeq = result.recordset[0].maxSeq + 1;
  return Array.from({ length: n }, (_, i) => buildCode(year, startSeq + i));
};