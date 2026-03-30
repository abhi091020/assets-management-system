// server/src/models/Location.model.js
import { getPool, sql } from "../config/db.js";

const LocationModel = {
  findAll: async ({ search = "", isActive = "", page = 1, limit = 10 }) => {
    const pool = getPool();
    const offset = (page - 1) * limit;

    let where = "WHERE is_deleted = 0";
    if (search)
      where += ` AND (location_name LIKE '%${search}%' OR city LIKE '%${search}%')`;
    if (isActive !== "")
      where += ` AND is_active = ${isActive === "true" ? 1 : 0}`;

    const countResult = await pool
      .request()
      .query(`SELECT COUNT(*) as total FROM Locations ${where}`);
    const total = countResult.recordset[0].total;

    const result = await pool.request().query(`
      SELECT id, location_name, address, city, state, pin_code, is_active, created_at, updated_at
      FROM Locations
      ${where}
      ORDER BY created_at DESC
      OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY
    `);

    return {
      locations: result.recordset,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit),
    };
  },

  findAllActive: async () => {
    const pool = getPool();
    const result = await pool.request().query(`
      SELECT id, location_name, city, state
      FROM Locations
      WHERE is_deleted = 0 AND is_active = 1
      ORDER BY location_name ASC
    `);
    return result.recordset;
  },

  findById: async (id) => {
    const pool = getPool();
    const result = await pool.request().input("id", sql.Int, id).query(`
        SELECT id, location_name, address, city, state, pin_code, is_active, created_at, updated_at
        FROM Locations
        WHERE id = @id AND is_deleted = 0
      `);
    return result.recordset[0];
  },

  create: async ({
    locationName,
    address,
    city,
    state,
    pinCode,
    createdBy,
  }) => {
    const pool = getPool();
    const result = await pool
      .request()
      .input("locationName", sql.NVarChar, locationName)
      .input("address", sql.NVarChar, address || null)
      .input("city", sql.NVarChar, city || null)
      .input("state", sql.NVarChar, state || null)
      .input("pinCode", sql.NVarChar, pinCode || null)
      .input("createdBy", sql.Int, createdBy).query(`
        INSERT INTO Locations (location_name, address, city, state, pin_code, created_by, updated_by, created_at, updated_at)
        OUTPUT
          INSERTED.id, INSERTED.location_name, INSERTED.address,
          INSERTED.city, INSERTED.state, INSERTED.pin_code,
          INSERTED.is_active, INSERTED.created_at
        VALUES (@locationName, @address, @city, @state, @pinCode, @createdBy, @createdBy, GETDATE(), GETDATE())
      `);
    return result.recordset[0];
  },

  update: async (
    id,
    { locationName, address, city, state, pinCode, updatedBy },
  ) => {
    const pool = getPool();
    const result = await pool
      .request()
      .input("id", sql.Int, id)
      .input("locationName", sql.NVarChar, locationName)
      .input("address", sql.NVarChar, address || null)
      .input("city", sql.NVarChar, city || null)
      .input("state", sql.NVarChar, state || null)
      .input("pinCode", sql.NVarChar, pinCode || null)
      .input("updatedBy", sql.Int, updatedBy).query(`
        UPDATE Locations
        SET location_name = @locationName, address = @address, city = @city,
            state = @state, pin_code = @pinCode,
            updated_by = @updatedBy, updated_at = GETDATE()
        OUTPUT
          INSERTED.id, INSERTED.location_name, INSERTED.address,
          INSERTED.city, INSERTED.state, INSERTED.pin_code,
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
        UPDATE Locations
        SET is_active = @isActive, updated_by = @updatedBy, updated_at = GETDATE()
        OUTPUT INSERTED.id, INSERTED.location_name, INSERTED.is_active, INSERTED.updated_at
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
        UPDATE Locations
        SET is_deleted = 1, deleted_at = GETDATE(), deleted_by = @deletedBy, updated_at = GETDATE()
        OUTPUT INSERTED.id
        WHERE id = @id AND is_deleted = 0
      `);
    return result.recordset[0];
  },
};

export default LocationModel;
