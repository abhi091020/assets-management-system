// server/src/models/User.model.js
import { getPool, sql } from "../config/db.js";

const UserModel = {
  findByEmail: async (email) => {
    const pool = getPool();
    const result = await pool.request().input("email", sql.NVarChar, email)
      .query(`
        SELECT * FROM Users 
        WHERE email = @email 
        AND is_deleted = 0
      `);
    return result.recordset[0];
  },

  create: async ({
    fullName,
    email,
    passwordHash,
    role = "Viewer",
    phone = null,
    departmentId = null,
    locationId = null,
  }) => {
    const pool = getPool();
    const result = await pool
      .request()
      .input("fullName", sql.NVarChar, fullName)
      .input("email", sql.NVarChar, email)
      .input("passwordHash", sql.NVarChar, passwordHash)
      .input("role", sql.NVarChar, role)
      .input("phone", sql.NVarChar, phone)
      .input("departmentId", sql.Int, departmentId)
      .input("locationId", sql.Int, locationId).query(`
        INSERT INTO Users 
          (full_name, email, password_hash, role, phone, department_id, location_id, is_active, is_deleted, created_at, updated_at)
        OUTPUT 
          INSERTED.id,
          INSERTED.full_name, 
          INSERTED.email, 
          INSERTED.role,
          INSERTED.phone,
          INSERTED.department_id,
          INSERTED.location_id,
          INSERTED.created_at
        VALUES 
          (@fullName, @email, @passwordHash, @role, @phone, @departmentId, @locationId, 1, 0, GETDATE(), GETDATE())
      `);
    return result.recordset[0];
  },

  findAll: async ({
    search = "",
    role = "",
    isActive = "",
    page = 1,
    limit = 10,
  }) => {
    const pool = getPool();
    const offset = (page - 1) * limit;

    let whereClause = "WHERE is_deleted = 0";
    if (search)
      whereClause += ` AND (full_name LIKE '%${search}%' OR email LIKE '%${search}%')`;
    if (role) whereClause += ` AND role = '${role}'`;
    if (isActive !== "")
      whereClause += ` AND is_active = ${isActive === "true" ? 1 : 0}`;

    const countResult = await pool
      .request()
      .query(`SELECT COUNT(*) as total FROM Users ${whereClause}`);
    const total = countResult.recordset[0].total;

    const result = await pool.request().query(`
        SELECT 
          id, full_name, email, phone, role,
          department_id, location_id, is_active,
          last_login_at, created_at, updated_at,
           profile_photo_url          
        FROM Users
        ${whereClause}
        ORDER BY created_at DESC
        OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY
      `);

    return {
      users: result.recordset,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit),
    };
  },

  // ── findById now includes profile_photo_url ──────────────────────────────
  findById: async (id) => {
    const pool = getPool();
    const result = await pool.request().input("id", sql.Int, id).query(`
        SELECT 
          id, full_name, email, role, 
          phone, department_id, location_id,
          is_active, last_login_at, created_at, updated_at,
          profile_photo_url
        FROM Users 
        WHERE id = @id 
        AND is_deleted = 0
      `);
    return result.recordset[0];
  },

  // ── updateMe: self-service update (name + phone + photo) ─────────────────
  // Called from PUT /users/me — only touches fields the user owns
  updateMe: async (id, { fullName, phone, profilePhotoUrl }) => {
    const pool = getPool();
    const result = await pool
      .request()
      .input("id", sql.Int, id)
      .input("fullName", sql.NVarChar, fullName)
      .input("phone", sql.NVarChar, phone || null)
      .input("profilePhotoUrl", sql.NVarChar(500), profilePhotoUrl ?? null)
      .query(`
        UPDATE Users
        SET full_name        = @fullName,
            phone            = @phone,
            profile_photo_url = @profilePhotoUrl,
            updated_at       = GETDATE()
        OUTPUT
          INSERTED.id,
          INSERTED.full_name,
          INSERTED.email,
          INSERTED.phone,
          INSERTED.role,
          INSERTED.department_id,
          INSERTED.location_id,
          INSERTED.is_active,
          INSERTED.last_login_at,
          INSERTED.created_at,
          INSERTED.updated_at,
          INSERTED.profile_photo_url
        WHERE id = @id AND is_deleted = 0
      `);
    return result.recordset[0];
  },

  update: async (
    id,
    { fullName, phone, role, departmentId, locationId, updatedBy },
  ) => {
    const pool = getPool();
    const result = await pool
      .request()
      .input("id", sql.Int, id)
      .input("fullName", sql.NVarChar, fullName)
      .input("phone", sql.NVarChar, phone)
      .input("role", sql.NVarChar, role)
      .input("departmentId", sql.Int, departmentId)
      .input("locationId", sql.Int, locationId)
      .input("updatedBy", sql.Int, updatedBy).query(`
        UPDATE Users
        SET full_name = @fullName,
            phone = @phone,
            role = @role,
            department_id = @departmentId,
            location_id = @locationId,
            updated_by = @updatedBy,
            updated_at = GETDATE()
        OUTPUT
          INSERTED.id,
          INSERTED.full_name,
          INSERTED.email,
          INSERTED.phone,
          INSERTED.role,
          INSERTED.department_id,
          INSERTED.location_id,
          INSERTED.updated_at
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
        UPDATE Users
        SET is_deleted = 1,
            deleted_at = GETDATE(),
            deleted_by = @deletedBy,
            updated_at = GETDATE()
        OUTPUT INSERTED.id
        WHERE id = @id AND is_deleted = 0
      `);
    return result.recordset[0];
  },

  hardDelete: async (id) => {
    const pool = getPool();
    await pool.request().input("id", sql.Int, id).query(`
        DELETE FROM Users WHERE id = @id
      `);
  },

  updateStatus: async (id, isActive, updatedBy) => {
    const pool = getPool();
    const result = await pool
      .request()
      .input("id", sql.Int, id)
      .input("isActive", sql.Bit, isActive)
      .input("updatedBy", sql.Int, updatedBy).query(`
        UPDATE Users
        SET is_active = @isActive,
            updated_by = @updatedBy,
            updated_at = GETDATE()
        OUTPUT
          INSERTED.id,
          INSERTED.full_name,
          INSERTED.email,
          INSERTED.is_active,
          INSERTED.updated_at
        WHERE id = @id AND is_deleted = 0
      `);
    return result.recordset[0];
  },

  updatePassword: async (id, passwordHash) => {
    const pool = getPool();
    await pool
      .request()
      .input("id", sql.Int, id)
      .input("passwordHash", sql.NVarChar, passwordHash).query(`
        UPDATE Users
        SET password_hash = @passwordHash,
            password_changed_at = GETDATE(),
            updated_at = GETDATE()
        WHERE id = @id AND is_deleted = 0
      `);
  },

  updateLastLogin: async (id) => {
    const pool = getPool();
    await pool.request().input("id", sql.Int, id).query(`
        UPDATE Users 
        SET last_login_at = GETDATE(),
            updated_at = GETDATE()
        WHERE id = @id
      `);
  },
};

export default UserModel;
