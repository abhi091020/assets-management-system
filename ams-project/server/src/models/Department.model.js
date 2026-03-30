// server/src/models/Department.model.js
import { getPool, sql } from "../config/db.js";

const DepartmentModel = {
  findAll: async ({
    search = "",
    locationId = "",
    isActive = "",
    page = 1,
    limit = 10,
  }) => {
    const pool = getPool();
    const offset = (page - 1) * limit;

    let where = "WHERE d.is_deleted = 0";
    if (search) where += ` AND d.dept_name LIKE '%${search}%'`;
    if (locationId) where += ` AND d.location_id = ${parseInt(locationId)}`;
    if (isActive !== "")
      where += ` AND d.is_active = ${isActive === "true" ? 1 : 0}`;

    const countResult = await pool
      .request()
      .query(`SELECT COUNT(*) as total FROM Departments d ${where}`);
    const total = countResult.recordset[0].total;

    const result = await pool.request().query(`
      SELECT
        d.id, d.dept_name, d.cost_center, d.location_id,
        l.location_name, d.is_active, d.created_at, d.updated_at
      FROM Departments d
      LEFT JOIN Locations l ON d.location_id = l.id
      ${where}
      ORDER BY d.created_at DESC
      OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY
    `);

    return {
      departments: result.recordset,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit),
    };
  },

  findAllActive: async (locationId = null) => {
    const pool = getPool();
    let where = "WHERE is_deleted = 0 AND is_active = 1";
    if (locationId) where += ` AND location_id = ${parseInt(locationId)}`;
    const result = await pool.request().query(`
      SELECT id, dept_name, cost_center, location_id
      FROM Departments ${where}
      ORDER BY dept_name ASC
    `);
    return result.recordset;
  },

  findById: async (id) => {
    const pool = getPool();
    const result = await pool.request().input("id", sql.Int, id).query(`
        SELECT
          d.id, d.dept_name, d.cost_center, d.location_id,
          l.location_name, d.is_active, d.created_at, d.updated_at
        FROM Departments d
        LEFT JOIN Locations l ON d.location_id = l.id
        WHERE d.id = @id AND d.is_deleted = 0
      `);
    return result.recordset[0];
  },

  create: async ({ deptName, costCenter, locationId, createdBy }) => {
    const pool = getPool();
    const result = await pool
      .request()
      .input("deptName", sql.NVarChar, deptName)
      .input("costCenter", sql.NVarChar, costCenter || null)
      .input("locationId", sql.Int, locationId)
      .input("createdBy", sql.Int, createdBy).query(`
        INSERT INTO Departments (dept_name, cost_center, location_id, created_by, updated_by, created_at, updated_at)
        OUTPUT
          INSERTED.id, INSERTED.dept_name, INSERTED.cost_center,
          INSERTED.location_id, INSERTED.is_active, INSERTED.created_at
        VALUES (@deptName, @costCenter, @locationId, @createdBy, @createdBy, GETDATE(), GETDATE())
      `);
    return result.recordset[0];
  },

  update: async (id, { deptName, costCenter, locationId, updatedBy }) => {
    const pool = getPool();
    const result = await pool
      .request()
      .input("id", sql.Int, id)
      .input("deptName", sql.NVarChar, deptName)
      .input("costCenter", sql.NVarChar, costCenter || null)
      .input("locationId", sql.Int, locationId)
      .input("updatedBy", sql.Int, updatedBy).query(`
        UPDATE Departments
        SET dept_name = @deptName, cost_center = @costCenter,
            location_id = @locationId, updated_by = @updatedBy, updated_at = GETDATE()
        OUTPUT
          INSERTED.id, INSERTED.dept_name, INSERTED.cost_center,
          INSERTED.location_id, INSERTED.is_active, INSERTED.updated_at
        WHERE id = @id AND is_deleted = 0
      `);
    return result.recordset[0];
  },

  updateStatus: async (id, isActive, updatedBy) => {
    const pool = getPool();
    const result = await pool
      .request()
      .input("id", sql.Int, id)
      .input("isActive", sql.Bit, isActive)
      .input("updatedBy", sql.Int, updatedBy).query(`
        UPDATE Departments
        SET is_active = @isActive, updated_by = @updatedBy, updated_at = GETDATE()
        OUTPUT INSERTED.id, INSERTED.dept_name, INSERTED.is_active, INSERTED.updated_at
        WHERE id = @id AND is_deleted = 0
      `);
    return result.recordset[0];
  },

  softDelete: async (id, deletedBy) => {
    const pool = getPool();
    const result = await pool
      .request()
      .input("id", sql.Int, id)
      .input("deletedBy", sql.Int, deletedBy).query(`
        UPDATE Departments
        SET is_deleted = 1, deleted_at = GETDATE(), deleted_by = @deletedBy, updated_at = GETDATE()
        OUTPUT INSERTED.id
        WHERE id = @id AND is_deleted = 0
      `);
    return result.recordset[0];
  },
};

export default DepartmentModel;
