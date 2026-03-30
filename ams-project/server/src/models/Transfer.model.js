// server/src/models/Transfer.model.js
import sql from "mssql";
import { getPool } from "../config/db.js";

// ── Auto-generate transfer code TRF-YYYY-00001 ────────────────
async function generateTransferCode() {
  const pool = await getPool();
  const year = new Date().getFullYear();
  const result = await pool.request().query(`
    SELECT MAX(transfer_code) AS last_code
    FROM Transfers
    WHERE transfer_code LIKE 'TRF-${year}-%'
  `);
  const lastCode = result.recordset[0].last_code;
  const lastNum = lastCode ? parseInt(lastCode.split("-")[2]) : 0;
  return `TRF-${year}-${String(lastNum + 1).padStart(5, "0")}`;
}

// ── RAISE TRANSFER ────────────────────────────────────────────
export async function raiseTransfer({
  assetId,
  fromLocationId,
  fromDepartmentId,
  fromEmployeeId,
  toLocationId,
  toDepartmentId,
  toEmployeeId,
  reason,
  userId,
}) {
  const pool = await getPool();
  const code = await generateTransferCode();
  const result = await pool
    .request()
    .input("transfer_code", sql.NVarChar, code)
    .input("asset_id", sql.Int, assetId)
    .input("from_location_id", sql.Int, fromLocationId ?? null)
    .input("from_department_id", sql.Int, fromDepartmentId ?? null)
    .input("from_employee_id", sql.Int, fromEmployeeId ?? null)
    .input("to_location_id", sql.Int, toLocationId)
    .input("to_department_id", sql.Int, toDepartmentId)
    .input("to_employee_id", sql.Int, toEmployeeId ?? null)
    .input("reason", sql.NVarChar, reason ?? null)
    .input("raised_by", sql.Int, userId)
    .input("created_by", sql.Int, userId).query(`
      INSERT INTO Transfers (
        transfer_code, asset_id,
        from_location_id, from_department_id, from_employee_id,
        to_location_id, to_department_id, to_employee_id,
        reason, raised_by, created_by
      )
      OUTPUT INSERTED.*
      VALUES (
        @transfer_code, @asset_id,
        @from_location_id, @from_department_id, @from_employee_id,
        @to_location_id, @to_department_id, @to_employee_id,
        @reason, @raised_by, @created_by
      )
    `);
  return result.recordset[0];
}

// ── UPDATE TRANSFER (Pending only) ───────────────────────────
export async function updateTransfer(
  id,
  { toLocationId, toDepartmentId, toEmployeeId, reason, userId },
) {
  const pool = await getPool();
  const result = await pool
    .request()
    .input("id", sql.Int, id)
    .input("to_location_id", sql.Int, toLocationId)
    .input("to_department_id", sql.Int, toDepartmentId)
    .input("to_employee_id", sql.Int, toEmployeeId ?? null)
    .input("reason", sql.NVarChar, reason ?? null)
    .input("updated_by", sql.Int, userId).query(`
      UPDATE Transfers SET
        to_location_id   = @to_location_id,
        to_department_id = @to_department_id,
        to_employee_id   = @to_employee_id,
        reason           = @reason,
        updated_by       = @updated_by,
        updated_at       = GETDATE()
      OUTPUT INSERTED.*
      WHERE id = @id AND status = 'Pending' AND is_deleted = 0
    `);
  return result.recordset[0] ?? null;
}

// ── GET ALL (with filters) ────────────────────────────────────
export async function getAllTransfers({
  status,
  assetId,
  page = 1,
  limit = 20,
} = {}) {
  const pool = await getPool();
  const req = pool.request();
  const where = [`t.is_deleted = 0`];

  if (status) {
    req.input("status", sql.NVarChar, status);
    where.push(`t.status = @status`);
  }
  if (assetId) {
    req.input("asset_id", sql.Int, assetId);
    where.push(`t.asset_id = @asset_id`);
  }

  const offset = (page - 1) * limit;
  const whereStr = where.join(" AND ");

  const data = await req.query(`
    SELECT
      t.*,
      a.asset_code, a.asset_name,
      fl.location_name  AS from_location_name,
      tl.location_name  AS to_location_name,
      fd.dept_name      AS from_dept_name,
      td.dept_name      AS to_dept_name,
      fe.full_name      AS from_employee_name,
      te.full_name      AS to_employee_name,
      ur.full_name      AS raised_by_name,
      ua.full_name      AS approved_by_name
    FROM Transfers t
    JOIN  Assets      a  ON a.id  = t.asset_id
    LEFT JOIN Locations  fl ON fl.id = t.from_location_id
    LEFT JOIN Locations  tl ON tl.id = t.to_location_id
    LEFT JOIN Departments fd ON fd.id = t.from_department_id
    LEFT JOIN Departments td ON td.id = t.to_department_id
    LEFT JOIN Employees  fe ON fe.id = t.from_employee_id
    LEFT JOIN Employees  te ON te.id = t.to_employee_id
    LEFT JOIN Users      ur ON ur.id = t.raised_by
    LEFT JOIN Users      ua ON ua.id = t.approved_by
    WHERE ${whereStr}
    ORDER BY t.created_at DESC
    OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY
  `);

  const count = await pool
    .request()
    .query(`SELECT COUNT(*) AS total FROM Transfers t WHERE ${whereStr}`);
  return { transfers: data.recordset, total: count.recordset[0].total };
}

// ── GET BY ID ─────────────────────────────────────────────────
export async function getTransferById(id) {
  const pool = await getPool();
  const result = await pool.request().input("id", sql.Int, id).query(`
      SELECT
        t.*,
        a.asset_code, a.asset_name,
        fl.location_name AS from_location_name,
        tl.location_name AS to_location_name,
        fd.dept_name     AS from_dept_name,
        td.dept_name     AS to_dept_name,
        fe.full_name     AS from_employee_name,
        te.full_name     AS to_employee_name,
        ur.full_name     AS raised_by_name,
        ua.full_name     AS approved_by_name
      FROM Transfers t
      JOIN  Assets     a  ON a.id  = t.asset_id
      LEFT JOIN Locations  fl ON fl.id = t.from_location_id
      LEFT JOIN Locations  tl ON tl.id = t.to_location_id
      LEFT JOIN Departments fd ON fd.id = t.from_department_id
      LEFT JOIN Departments td ON td.id = t.to_department_id
      LEFT JOIN Employees  fe ON fe.id = t.from_employee_id
      LEFT JOIN Employees  te ON te.id = t.to_employee_id
      LEFT JOIN Users      ur ON ur.id = t.raised_by
      LEFT JOIN Users      ua ON ua.id = t.approved_by
      WHERE t.id = @id AND t.is_deleted = 0
    `);
  return result.recordset[0] ?? null;
}

// ── APPROVE — updates asset location/dept/employee ────────────
export async function approveTransfer(id, userId) {
  const pool = await getPool();
  const transfer = await getTransferById(id);
  if (!transfer || transfer.status !== "Pending") return null;

  const tx = new sql.Transaction(pool);
  await tx.begin();
  try {
    await new sql.Request(tx)
      .input("id", sql.Int, id)
      .input("approved_by", sql.Int, userId)
      .input("updated_by", sql.Int, userId).query(`
        UPDATE Transfers
        SET status = 'Approved', approved_by = @approved_by,
            approved_at = GETDATE(), updated_at = GETDATE(), updated_by = @updated_by
        WHERE id = @id
      `);

    await new sql.Request(tx)
      .input("location_id", sql.Int, transfer.to_location_id)
      .input("department_id", sql.Int, transfer.to_department_id)
      .input("assigned_employee_id", sql.Int, transfer.to_employee_id ?? null)
      .input("updated_by", sql.Int, userId)
      .input("asset_id", sql.Int, transfer.asset_id).query(`
        UPDATE Assets
        SET location_id          = @location_id,
            department_id        = @department_id,
            assigned_employee_id = @assigned_employee_id,
            updated_at           = GETDATE(),
            updated_by           = @updated_by
        WHERE id = @asset_id
      `);

    await tx.commit();
    return await getTransferById(id);
  } catch (err) {
    await tx.rollback();
    throw err;
  }
}

// ── REJECT ────────────────────────────────────────────────────
export async function rejectTransfer(id, rejectionReason, userId) {
  const pool = await getPool();
  const result = await pool
    .request()
    .input("id", sql.Int, id)
    .input("rejection_reason", sql.NVarChar, rejectionReason ?? null)
    .input("approved_by", sql.Int, userId)
    .input("updated_by", sql.Int, userId).query(`
      UPDATE Transfers
      SET status = 'Rejected', rejection_reason = @rejection_reason,
          approved_by = @approved_by, approved_at = GETDATE(),
          updated_at = GETDATE(), updated_by = @updated_by
      OUTPUT INSERTED.*
      WHERE id = @id AND status = 'Pending' AND is_deleted = 0
    `);
  return result.recordset[0] ?? null;
}

// ── SOFT DELETE ───────────────────────────────────────────────
export async function deleteTransfer(id, userId) {
  const pool = await getPool();
  await pool
    .request()
    .input("id", sql.Int, id)
    .input("updated_by", sql.Int, userId).query(`
      UPDATE Transfers
      SET is_deleted = 1, updated_at = GETDATE(), updated_by = @updated_by
      WHERE id = @id AND status = 'Pending'
    `);
}
