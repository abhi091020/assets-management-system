// server/src/models/VerificationItem.model.js
import sql from "mssql";
import { getPool } from "../config/db.js";

// ── ADD ASSET TO BATCH ────────────────────────────────────────
export async function addItemToBatch({ batchId, assetId, userId }) {
  const pool = await getPool();
  const result = await pool
    .request()
    .input("batch_id", sql.Int, batchId)
    .input("asset_id", sql.Int, assetId)
    .input("created_by", sql.Int, userId).query(`
      INSERT INTO VerificationItems (batch_id, asset_id, created_by)
      OUTPUT INSERTED.*
      VALUES (@batch_id, @asset_id, @created_by)
    `);
  return result.recordset[0];
}

// ── GET ITEMS BY BATCH ────────────────────────────────────────
export async function getItemsByBatch(batchId) {
  const pool = await getPool();
  const result = await pool.request().input("batch_id", sql.Int, batchId)
    .query(`
      SELECT
        vi.*,
        a.asset_code,
        a.asset_name,
        a.serial_number,
        a.condition        AS current_condition,
        a.status           AS current_status,
        c.category_name,
        u.full_name        AS verified_by_name
      FROM VerificationItems vi
      JOIN  Assets     a ON a.id = vi.asset_id
      LEFT JOIN Categories c ON c.id = a.category_id
      LEFT JOIN Users      u ON u.id = vi.verified_by
      WHERE vi.batch_id = @batch_id AND vi.is_deleted = 0
      ORDER BY vi.created_at ASC
    `);
  return result.recordset;
}

// ── VERIFY ITEM (mark as Verified / NotFound) ─────────────────
export async function verifyItem({
  itemId,
  status,
  conditionFound,
  remarks,
  userId,
  updatedBy,
}) {
  const pool = await getPool();

  // When resetting to Pending — clear all verification fields
  if (status === "Pending") {
    const result = await pool
      .request()
      .input("id", sql.Int, itemId)
      .input("updatedBy", sql.Int, updatedBy).query(`
        UPDATE VerificationItems
        SET
          status          = 'Pending',
          condition_found = NULL,
          remarks         = NULL,
          verified_by     = NULL,
          verified_at     = NULL,
          updated_at      = GETDATE(),
          updated_by      = @updatedBy
        WHERE id = @id
          AND is_deleted  = 0;

        SELECT
          vi.*,
          a.asset_code,
          a.asset_name,
          u.full_name AS verified_by_name
        FROM VerificationItems vi
        LEFT JOIN Assets  a ON a.id = vi.asset_id
        LEFT JOIN Users   u ON u.id = vi.verified_by
        WHERE vi.id = @id;
      `);
    return result.recordset[0] || null;
  }

  // Verified or NotFound — normal update
  const result = await pool
    .request()
    .input("id", sql.Int, itemId)
    .input("status", sql.VarChar(20), status)
    .input("conditionFound", sql.VarChar(50), conditionFound || null)
    .input("remarks", sql.NVarChar(500), remarks || null)
    .input("userId", sql.Int, userId).query(`
      UPDATE VerificationItems
      SET
        status          = @status,
        condition_found = @conditionFound,
        remarks         = @remarks,
        verified_by     = @userId,
        verified_at     = GETDATE(),
        updated_at      = GETDATE(),
        updated_by      = @userId
      WHERE id = @id
        AND is_deleted  = 0;

      SELECT
        vi.*,
        a.asset_code,
        a.asset_name,
        u.full_name AS verified_by_name
      FROM VerificationItems vi
      LEFT JOIN Assets  a ON a.id = vi.asset_id
      LEFT JOIN Users   u ON u.id = vi.verified_by
      WHERE vi.id = @id;
    `);
  return result.recordset[0] || null;
}

// ── REMOVE ITEM FROM BATCH (soft delete) ──────────────────────
export async function removeItemFromBatch(itemId, userId) {
  const pool = await getPool();
  await pool
    .request()
    .input("id", sql.Int, itemId)
    .input("updated_by", sql.Int, userId).query(`
      UPDATE VerificationItems
      SET is_deleted = 1, updated_at = GETDATE(), updated_by = @updated_by
      WHERE id = @id
    `);
}
