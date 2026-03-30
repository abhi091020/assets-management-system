// server/src/models/Disposal.model.js
import sql from "mssql";
import { getPool } from "../config/db.js";

// ── Auto-generate disposal code DIS-YYYY-00001 ────────────────
async function generateDisposalCode() {
  const pool = await getPool();
  const year = new Date().getFullYear();
  const result = await pool.request().query(`
    SELECT MAX(disposal_code) AS last_code
    FROM Disposals
    WHERE disposal_code LIKE 'DIS-${year}-%'
  `);
  const lastCode = result.recordset[0].last_code;
  const lastNum = lastCode ? parseInt(lastCode.split("-")[2]) : 0;
  return `DIS-${year}-${String(lastNum + 1).padStart(5, "0")}`;
}

// ── RAISE DISPOSAL ────────────────────────────────────────────
export async function raiseDisposal({
  assetId,
  reason,
  disposalMethod,
  saleAmount,
  disposalDate,
  buyerDetails,
  userId,
}) {
  const pool = await getPool();
  const code = await generateDisposalCode();
  const result = await pool
    .request()
    .input("disposal_code", sql.NVarChar, code)
    .input("asset_id", sql.Int, assetId)
    .input("reason", sql.NVarChar, reason)
    .input("disposal_method", sql.NVarChar, disposalMethod)
    .input("sale_amount", sql.Decimal(15, 2), saleAmount ?? null)
    .input("disposal_date", sql.Date, disposalDate ?? null)
    .input("buyer_details", sql.NVarChar, buyerDetails ?? null)
    .input("raised_by", sql.Int, userId)
    .input("created_by", sql.Int, userId).query(`
      INSERT INTO Disposals (
        disposal_code, asset_id, reason, disposal_method,
        sale_amount, disposal_date, buyer_details,
        raised_by, created_by
      )
      OUTPUT INSERTED.*
      VALUES (
        @disposal_code, @asset_id, @reason, @disposal_method,
        @sale_amount, @disposal_date, @buyer_details,
        @raised_by, @created_by
      )
    `);
  return result.recordset[0];
}

// ── UPDATE DISPOSAL (Pending only) ───────────────────────────
export async function updateDisposal(
  id,
  { reason, disposalMethod, saleAmount, disposalDate, buyerDetails, userId },
) {
  const pool = await getPool();
  const result = await pool
    .request()
    .input("id", sql.Int, id)
    .input("reason", sql.NVarChar, reason)
    .input("disposal_method", sql.NVarChar, disposalMethod)
    .input("sale_amount", sql.Decimal(15, 2), saleAmount ?? null)
    .input("disposal_date", sql.Date, disposalDate ?? null)
    .input("buyer_details", sql.NVarChar, buyerDetails ?? null)
    .input("updated_by", sql.Int, userId).query(`
      UPDATE Disposals SET
        reason          = @reason,
        disposal_method = @disposal_method,
        sale_amount     = @sale_amount,
        disposal_date   = @disposal_date,
        buyer_details   = @buyer_details,
        updated_by      = @updated_by,
        updated_at      = GETDATE()
      OUTPUT INSERTED.*
      WHERE id = @id AND status = 'Pending' AND is_deleted = 0
    `);
  return result.recordset[0] ?? null;
}

// ── GET ALL (with filters) ────────────────────────────────────
export async function getAllDisposals({
  status,
  assetId,
  page = 1,
  limit = 20,
} = {}) {
  const pool = await getPool();

  const where = [`d.is_deleted = 0`];
  // Build literal WHERE for count query (safe — values are controlled server-side)
  if (status) where.push(`d.status = '${status}'`);
  if (assetId) where.push(`d.asset_id = ${Number(assetId)}`);

  const whereStr = where.join(" AND ");
  const offset = (page - 1) * limit;

  const data = await pool.request().query(`
    SELECT
      d.*,
      a.asset_code, a.asset_name, a.purchase_cost, a.current_book_value,
      a.location_id, a.department_id,
      (SELECT TOP 1 location_name FROM Locations WHERE id = a.location_id) AS location_name,
      (SELECT TOP 1 dept_name FROM Departments WHERE id = a.department_id) AS dept_name,
      ur.full_name AS raised_by_name,
      ua.full_name AS approved_by_name
    FROM Disposals d
    JOIN  Assets a  ON a.id  = d.asset_id
    LEFT JOIN Users ur ON ur.id = d.raised_by
    LEFT JOIN Users ua ON ua.id = d.approved_by
    WHERE ${whereStr}
    ORDER BY d.created_at DESC
    OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY
  `);

  const count = await pool
    .request()
    .query(`SELECT COUNT(*) AS total FROM Disposals d WHERE ${whereStr}`);

  return { disposals: data.recordset, total: count.recordset[0].total };
}

// ── GET BY ID ─────────────────────────────────────────────────
export async function getDisposalById(id) {
  const pool = await getPool();
  const result = await pool.request().input("id", sql.Int, id).query(`
    SELECT
      d.*,
      a.asset_code, a.asset_name, a.serial_number,
      a.purchase_cost, a.current_book_value, a.scrap_value,
      a.location_id, a.department_id,
      (SELECT TOP 1 location_name FROM Locations WHERE id = a.location_id) AS location_name,
      (SELECT TOP 1 dept_name FROM Departments WHERE id = a.department_id) AS dept_name,
      ur.full_name AS raised_by_name,
      ua.full_name AS approved_by_name
    FROM Disposals d
    JOIN  Assets a  ON a.id  = d.asset_id
    LEFT JOIN Users ur ON ur.id = d.raised_by
    LEFT JOIN Users ua ON ua.id = d.approved_by
    WHERE d.id = @id AND d.is_deleted = 0
  `);
  return result.recordset[0] ?? null;
}

// ── APPROVE — updates asset status to Disposed ───────────────
export async function approveDisposal(id, userId) {
  const pool = await getPool();
  const disposal = await getDisposalById(id);
  if (!disposal || disposal.status !== "Pending") return null;

  const tx = new sql.Transaction(pool);
  await tx.begin();
  try {
    await new sql.Request(tx)
      .input("id", sql.Int, id)
      .input("approved_by", sql.Int, userId)
      .input("updated_by", sql.Int, userId).query(`
        UPDATE Disposals
        SET status = 'Approved', approved_by = @approved_by,
            approved_at = GETDATE(), updated_at = GETDATE(), updated_by = @updated_by
        WHERE id = @id
      `);

    await new sql.Request(tx)
      .input("asset_id", sql.Int, disposal.asset_id)
      .input("updated_by", sql.Int, userId).query(`
        UPDATE Assets
        SET status = 'Disposed', updated_at = GETDATE(), updated_by = @updated_by
        WHERE id = @asset_id
      `);

    await tx.commit();
    return await getDisposalById(id);
  } catch (err) {
    await tx.rollback();
    throw err;
  }
}

// ── REJECT — allowed on Pending or Approved ───────────────────
// If Approved → also reverts asset back to Active
export async function rejectDisposal(id, rejectionReason, userId) {
  const pool = await getPool();
  const disposal = await getDisposalById(id);
  if (!disposal) return null;

  const tx = new sql.Transaction(pool);
  await tx.begin();
  try {
    await new sql.Request(tx)
      .input("id", sql.Int, id)
      .input("rejection_reason", sql.NVarChar, rejectionReason ?? null)
      .input("approved_by", sql.Int, userId)
      .input("updated_by", sql.Int, userId).query(`
        UPDATE Disposals
        SET status = 'Rejected', rejection_reason = @rejection_reason,
            approved_by = @approved_by, approved_at = GETDATE(),
            updated_at = GETDATE(), updated_by = @updated_by
        WHERE id = @id AND is_deleted = 0
      `);

    if (disposal.status === "Approved") {
      await new sql.Request(tx)
        .input("asset_id", sql.Int, disposal.asset_id)
        .input("updated_by", sql.Int, userId).query(`
          UPDATE Assets
          SET status = 'Active', updated_at = GETDATE(), updated_by = @updated_by
          WHERE id = @asset_id
        `);
    }

    await tx.commit();
    return await getDisposalById(id);
  } catch (err) {
    await tx.rollback();
    throw err;
  }
}

// ── SOFT DELETE — reverts asset to Active if was Approved ─────
export async function deleteDisposal(id, userId) {
  const pool = await getPool();
  const disposal = await getDisposalById(id);
  if (!disposal) return;

  const tx = new sql.Transaction(pool);
  await tx.begin();
  try {
    await new sql.Request(tx)
      .input("id", sql.Int, id)
      .input("updated_by", sql.Int, userId).query(`
        UPDATE Disposals
        SET is_deleted = 1, updated_at = GETDATE(), updated_by = @updated_by
        WHERE id = @id AND is_deleted = 0
      `);

    if (disposal.status === "Approved") {
      await new sql.Request(tx)
        .input("asset_id", sql.Int, disposal.asset_id)
        .input("updated_by", sql.Int, userId).query(`
          UPDATE Assets
          SET status = 'Active', updated_at = GETDATE(), updated_by = @updated_by
          WHERE id = @asset_id
        `);
    }

    await tx.commit();
  } catch (err) {
    await tx.rollback();
    throw err;
  }
}
