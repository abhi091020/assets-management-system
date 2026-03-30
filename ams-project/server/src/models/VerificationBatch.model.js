// server/src/models/VerificationBatch.model.js
import sql from "mssql";
import { getPool } from "../config/db.js";

// ── Auto-generate batch code VRF-YYYY-00001 ──────────────────
async function generateBatchCode() {
  const pool = await getPool();
  const year = new Date().getFullYear();
  const result = await pool.request().query(`
    SELECT MAX(batch_code) AS last_code
    FROM VerificationBatches
    WHERE batch_code LIKE 'VRF-${year}-%'
  `);
  const lastCode = result.recordset[0].last_code;
  const lastNum = lastCode ? parseInt(lastCode.split("-")[2], 10) : 0;
  const seq = String(lastNum + 1).padStart(5, "0");
  return `VRF-${year}-${seq}`;
}

// ── CREATE ────────────────────────────────────────────────────
export async function createBatch({
  title,
  locationId,
  departmentId,
  remarks,
  userId,
}) {
  const pool = await getPool();
  const code = await generateBatchCode();
  const result = await pool
    .request()
    .input("batch_code", sql.NVarChar, code)
    .input("title", sql.NVarChar, title ?? null)
    .input("location_id", sql.Int, locationId ?? null)
    .input("department_id", sql.Int, departmentId ?? null)
    .input("remarks", sql.NVarChar, remarks ?? null)
    .input("opened_by", sql.Int, userId)
    .input("created_by", sql.Int, userId).query(`
      INSERT INTO VerificationBatches
        (batch_code, title, location_id, department_id, remarks, opened_by, created_by)
      OUTPUT INSERTED.*
      VALUES
        (@batch_code, @title, @location_id, @department_id, @remarks, @opened_by, @created_by)
    `);
  return result.recordset[0];
}

// ── GET ALL (with optional filters) ──────────────────────────
export async function getAllBatches({
  status,
  locationId,
  departmentId,
  page = 1,
  limit = 20,
} = {}) {
  const pool = await getPool();
  const req = pool.request();
  const where = [`b.is_deleted = 0`];

  if (status) {
    req.input("status", sql.NVarChar, status);
    where.push(`b.status = @status`);
  }
  if (locationId) {
    req.input("location_id", sql.Int, locationId);
    where.push(`b.location_id = @location_id`);
  }
  if (departmentId) {
    req.input("dept_id", sql.Int, departmentId);
    where.push(`b.department_id = @dept_id`);
  }

  const offset = (page - 1) * limit;
  const whereStr = where.join(" AND ");

  const data = await req.query(`
    SELECT
      b.*,
      l.location_name,
      d.dept_name,
      u1.full_name AS opened_by_name,
      u2.full_name AS closed_by_name,
      (SELECT COUNT(*) FROM VerificationItems vi WHERE vi.batch_id = b.id AND vi.is_deleted = 0) AS total_items,
      (SELECT COUNT(*) FROM VerificationItems vi WHERE vi.batch_id = b.id AND vi.status = 'Verified' AND vi.is_deleted = 0) AS verified_items
    FROM VerificationBatches b
    LEFT JOIN Locations    l  ON l.id = b.location_id
    LEFT JOIN Departments  d  ON d.id = b.department_id
    LEFT JOIN Users        u1 ON u1.id = b.opened_by
    LEFT JOIN Users        u2 ON u2.id = b.closed_by
    WHERE ${whereStr}
    ORDER BY b.created_at DESC
    OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY
  `);

  const count = await pool
    .request()
    .query(
      `SELECT COUNT(*) AS total FROM VerificationBatches b WHERE ${whereStr}`,
    );
  return { batches: data.recordset, total: count.recordset[0].total };
}

// ── GET BY ID ─────────────────────────────────────────────────
export async function getBatchById(id) {
  const pool = await getPool();
  const result = await pool.request().input("id", sql.Int, id).query(`
      SELECT
        b.*,
        l.location_name,
        d.dept_name,
        u1.full_name AS opened_by_name,
        u2.full_name AS closed_by_name
      FROM VerificationBatches b
      LEFT JOIN Locations   l  ON l.id = b.location_id
      LEFT JOIN Departments d  ON d.id = b.department_id
      LEFT JOIN Users       u1 ON u1.id = b.opened_by
      LEFT JOIN Users       u2 ON u2.id = b.closed_by
      WHERE b.id = @id AND b.is_deleted = 0
    `);
  return result.recordset[0] ?? null;
}

// ── CLOSE BATCH ───────────────────────────────────────────────
export async function closeBatch(id, userId) {
  const pool = await getPool();
  const result = await pool
    .request()
    .input("id", sql.Int, id)
    .input("closed_by", sql.Int, userId)
    .input("updated_by", sql.Int, userId).query(`
      UPDATE VerificationBatches
      SET status = 'Closed', closed_by = @closed_by, closed_at = GETDATE(),
          updated_at = GETDATE(), updated_by = @updated_by
      OUTPUT INSERTED.*
      WHERE id = @id AND status = 'Open' AND is_deleted = 0
    `);
  return result.recordset[0] ?? null;
}

// ── SOFT DELETE ───────────────────────────────────────────────
export async function deleteBatch(id, userId) {
  const pool = await getPool();
  await pool
    .request()
    .input("id", sql.Int, id)
    .input("updated_by", sql.Int, userId).query(`
      UPDATE VerificationBatches
      SET is_deleted = 1, updated_at = GETDATE(), updated_by = @updated_by
      WHERE id = @id
    `);
}
export async function reopenBatch(batchId, userId) {
  const pool = await getPool();
  const result = await pool
    .request()
    .input("id", sql.Int, batchId)
    .input("userId", sql.Int, userId).query(`
      UPDATE VerificationBatches
      SET
        status     = 'Open',
        closed_at  = NULL,
        updated_at = GETDATE(),
        updated_by = @userId
      WHERE id = @id
        AND is_deleted = 0
        AND status = 'Closed';

      SELECT * FROM VerificationBatches WHERE id = @id;
    `);
  return result.recordset[0] || null;
}
export async function findBatchByTitle(title) {
  const pool = await getPool();
  const result = await pool.request().input("title", sql.NVarChar(255), title)
    .query(`
      SELECT TOP 1 id, title
      FROM VerificationBatches
      WHERE title = @title
        AND is_deleted = 0
    `);
  return result.recordset[0] || null;
}
