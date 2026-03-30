// server/src/models/Employee.model.js
import { getPool, sql } from "../config/db.js";

const EmployeeModel = {
  // Auto-generate EMP-001, EMP-002...
  generateCode: async () => {
    const pool = getPool();
    const result = await pool.request().query(`
      SELECT COUNT(*) as total FROM Employees
    `);
    const next = result.recordset[0].total + 1;
    return `EMP-${String(next).padStart(3, "0")}`;
  },

  findAll: async ({
    search = "",
    departmentId = "",
    locationId = "",
    isActive = "",
    page = 1,
    limit = 10,
  }) => {
    const pool = getPool();
    const offset = (page - 1) * limit;

    let where = "WHERE e.is_deleted = 0";
    if (search)
      where += ` AND (e.full_name LIKE '%${search}%' OR e.employee_code LIKE '%${search}%' OR e.email LIKE '%${search}%')`;
    if (departmentId)
      where += ` AND e.department_id = ${parseInt(departmentId)}`;
    if (locationId) where += ` AND e.location_id = ${parseInt(locationId)}`;
    if (isActive !== "")
      where += ` AND e.is_active = ${isActive === "true" ? 1 : 0}`;

    const countResult = await pool
      .request()
      .query(`SELECT COUNT(*) as total FROM Employees e ${where}`);
    const total = countResult.recordset[0].total;

    const result = await pool.request().query(`
      SELECT
        e.id, e.employee_code, e.full_name, e.email, e.phone, e.designation,
        e.department_id, d.dept_name,
        e.location_id,  l.location_name,
        e.is_active, e.created_at, e.updated_at
      FROM Employees e
      LEFT JOIN Departments d ON e.department_id = d.id
      LEFT JOIN Locations   l ON e.location_id   = l.id
      ${where}
      ORDER BY e.created_at DESC
      OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY
    `);

    return {
      employees: result.recordset,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit),
    };
  },

  findAllActive: async () => {
    const pool = getPool();
    const result = await pool.request().query(`
      SELECT id, employee_code, full_name, designation, department_id, location_id
      FROM Employees
      WHERE is_deleted = 0 AND is_active = 1
      ORDER BY full_name ASC
    `);
    return result.recordset;
  },

  findById: async (id) => {
    const pool = getPool();
    const result = await pool.request().input("id", sql.Int, id).query(`
        SELECT
          e.id, e.employee_code, e.full_name, e.email, e.phone, e.designation,
          e.department_id, d.dept_name,
          e.location_id,  l.location_name,
          e.is_active, e.created_at, e.updated_at
        FROM Employees e
        LEFT JOIN Departments d ON e.department_id = d.id
        LEFT JOIN Locations   l ON e.location_id   = l.id
        WHERE e.id = @id AND e.is_deleted = 0
      `);
    return result.recordset[0];
  },

  create: async ({
    fullName,
    email,
    phone,
    designation,
    departmentId,
    locationId,
    createdBy,
  }) => {
    const pool = getPool();
    const employeeCode = await EmployeeModel.generateCode();

    const result = await pool
      .request()
      .input("employeeCode", sql.NVarChar, employeeCode)
      .input("fullName", sql.NVarChar, fullName)
      .input("email", sql.NVarChar, email || null)
      .input("phone", sql.NVarChar, phone || null)
      .input("designation", sql.NVarChar, designation || null)
      .input("departmentId", sql.Int, departmentId || null)
      .input("locationId", sql.Int, locationId || null)
      .input("createdBy", sql.Int, createdBy).query(`
        INSERT INTO Employees
          (employee_code, full_name, email, phone, designation, department_id, location_id, created_by, updated_by, created_at, updated_at)
        OUTPUT
          INSERTED.id, INSERTED.employee_code, INSERTED.full_name,
          INSERTED.email, INSERTED.phone, INSERTED.designation,
          INSERTED.department_id, INSERTED.location_id,
          INSERTED.is_active, INSERTED.created_at
        VALUES
          (@employeeCode, @fullName, @email, @phone, @designation, @departmentId, @locationId, @createdBy, @createdBy, GETDATE(), GETDATE())
      `);
    return result.recordset[0];
  },

  update: async (
    id,
    {
      fullName,
      email,
      phone,
      designation,
      departmentId,
      locationId,
      updatedBy,
    },
  ) => {
    const pool = getPool();
    const result = await pool
      .request()
      .input("id", sql.Int, id)
      .input("fullName", sql.NVarChar, fullName)
      .input("email", sql.NVarChar, email || null)
      .input("phone", sql.NVarChar, phone || null)
      .input("designation", sql.NVarChar, designation || null)
      .input("departmentId", sql.Int, departmentId || null)
      .input("locationId", sql.Int, locationId || null)
      .input("updatedBy", sql.Int, updatedBy).query(`
        UPDATE Employees
        SET full_name = @fullName, email = @email, phone = @phone,
            designation = @designation, department_id = @departmentId,
            location_id = @locationId, updated_by = @updatedBy, updated_at = GETDATE()
        OUTPUT
          INSERTED.id, INSERTED.employee_code, INSERTED.full_name,
          INSERTED.email, INSERTED.phone, INSERTED.designation,
          INSERTED.department_id, INSERTED.location_id,
          INSERTED.is_active, INSERTED.updated_at
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
        UPDATE Employees
        SET is_active = @isActive, updated_by = @updatedBy, updated_at = GETDATE()
        OUTPUT INSERTED.id, INSERTED.full_name, INSERTED.is_active, INSERTED.updated_at
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
        UPDATE Employees
        SET is_deleted = 1, deleted_at = GETDATE(), deleted_by = @deletedBy, updated_at = GETDATE()
        OUTPUT INSERTED.id
        WHERE id = @id AND is_deleted = 0
      `);
    return result.recordset[0];
  },
};

export default EmployeeModel;
