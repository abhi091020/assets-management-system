// src/utils/assetCodeGen.js
import { getPool } from "../config/db.js";

/**
 * Generates the next asset code for the current year.
 * Format: AST-{YEAR}-{5-digit-padded}
 * Example: AST-2026-00001, AST-2026-00042
 */
export const generateAssetCode = async () => {
  const pool = getPool();
  const year = new Date().getFullYear();

  const result = await pool.request().query(`
    SELECT COUNT(*) as total
    FROM Assets
    WHERE asset_code LIKE 'AST-${year}-%'
  `);

  const next = result.recordset[0].total + 1;
  return `AST-${year}-${String(next).padStart(5, "0")}`;
};
