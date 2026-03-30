// server/src/models/Category.model.js
import { getPool, sql } from "../config/db.js";

const CategoryModel = {
  findAll: async ({ search = "", isActive = "", page = 1, limit = 10 }) => {
    const pool = getPool();
    const offset = (page - 1) * limit;

    let where = "WHERE c.is_deleted = 0";
    if (search) where += ` AND c.category_name LIKE '%${search}%'`;
    if (isActive !== "")
      where += ` AND c.is_active = ${isActive === "true" ? 1 : 0}`;

    const countResult = await pool
      .request()
      .query(`SELECT COUNT(*) as total FROM Categories c ${where}`);
    const total = countResult.recordset[0].total;

    const result = await pool.request().query(`
      SELECT
        c.id, c.category_name, c.parent_category_id,
        c.asset_type,
        p.category_name AS parent_category_name,
        c.is_active, c.created_at, c.updated_at
      FROM Categories c
      LEFT JOIN Categories p ON c.parent_category_id = p.id
      ${where}
      ORDER BY c.parent_category_id ASC, c.category_name ASC
      OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY
    `);

    return {
      categories: result.recordset,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit),
    };
  },

  // FIX: Added c.is_active to SELECT — was missing, causing subMap entries
  // to have is_active = undefined (falsy), so all subcats showed as Inactive
  // in the table even when they were active in the DB.
  findAllActive: async () => {
    const pool = getPool();
    const result = await pool.request().query(`
      SELECT
        c.id, c.category_name, c.parent_category_id,
        c.asset_type, c.is_active,
        p.category_name AS parent_category_name
      FROM Categories c
      LEFT JOIN Categories p ON c.parent_category_id = p.id
      WHERE c.is_deleted = 0 AND c.is_active = 1
      ORDER BY c.parent_category_id ASC, c.category_name ASC
    `);
    return result.recordset;
  },

  findById: async (id) => {
    const pool = getPool();
    const result = await pool.request().input("id", sql.Int, id).query(`
      SELECT
        c.id, c.category_name, c.parent_category_id,
        c.asset_type,
        p.category_name AS parent_category_name,
        c.is_active, c.created_at, c.updated_at
      FROM Categories c
      LEFT JOIN Categories p ON c.parent_category_id = p.id
      WHERE c.id = @id AND c.is_deleted = 0
    `);
    return result.recordset[0];
  },

  findByAssetId: async (assetId) => {
    const pool = getPool();
    const result = await pool.request().input("assetId", sql.Int, assetId)
      .query(`
        SELECT c.id, c.category_name, c.asset_type
        FROM Categories c
        INNER JOIN Assets a ON a.category_id = c.id
        WHERE a.id = @assetId AND c.is_deleted = 0
      `);
    return result.recordset[0];
  },

  create: async ({
    categoryName,
    parentCategoryId,
    assetType = null,
    createdBy,
  }) => {
    const pool = getPool();
    const result = await pool
      .request()
      .input("categoryName", sql.NVarChar, categoryName)
      .input("parentCategoryId", sql.Int, parentCategoryId || null)
      .input("assetType", sql.NVarChar(10), assetType || null)
      .input("createdBy", sql.Int, createdBy).query(`
        INSERT INTO Categories
          (category_name, parent_category_id, asset_type, is_active,
           created_by, updated_by, created_at, updated_at)
        OUTPUT
          INSERTED.id, INSERTED.category_name, INSERTED.parent_category_id,
          INSERTED.asset_type, INSERTED.is_active, INSERTED.created_at
        VALUES
          (@categoryName, @parentCategoryId, @assetType, 1,
           @createdBy, @createdBy, GETDATE(), GETDATE())
      `);
    return result.recordset[0];
  },

  bulkCreate: async (subcategories, parentId, createdBy) => {
    if (!subcategories || subcategories.length === 0) return [];
    const pool = getPool();
    const created = [];

    for (const sub of subcategories) {
      const result = await pool
        .request()
        .input("categoryName", sql.NVarChar, sub.categoryName)
        .input("parentCategoryId", sql.Int, parentId)
        .input("assetType", sql.NVarChar(10), sub.assetType || null)
        .input("createdBy", sql.Int, createdBy).query(`
          INSERT INTO Categories
            (category_name, parent_category_id, asset_type, is_active,
             created_by, updated_by, created_at, updated_at)
          OUTPUT
            INSERTED.id, INSERTED.category_name, INSERTED.parent_category_id,
            INSERTED.asset_type, INSERTED.is_active, INSERTED.created_at
          VALUES
            (@categoryName, @parentCategoryId, @assetType, 1,
             @createdBy, @createdBy, GETDATE(), GETDATE())
        `);
      if (result.recordset[0]) created.push(result.recordset[0]);
    }
    return created;
  },

  update: async (
    id,
    { categoryName, parentCategoryId, assetType, updatedBy },
  ) => {
    const pool = getPool();
    const result = await pool
      .request()
      .input("id", sql.Int, id)
      .input("categoryName", sql.NVarChar, categoryName)
      .input("parentCategoryId", sql.Int, parentCategoryId || null)
      .input("assetType", sql.NVarChar(10), assetType || null)
      .input("updatedBy", sql.Int, updatedBy).query(`
        UPDATE Categories
        SET category_name      = @categoryName,
            parent_category_id = @parentCategoryId,
            asset_type         = @assetType,
            updated_by         = @updatedBy,
            updated_at         = GETDATE()
        OUTPUT
          INSERTED.id, INSERTED.category_name, INSERTED.parent_category_id,
          INSERTED.asset_type, INSERTED.is_active, INSERTED.updated_at
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
        UPDATE Categories
        SET is_active = @isActive, updated_by = @updatedBy, updated_at = GETDATE()
        OUTPUT INSERTED.id, INSERTED.category_name, INSERTED.is_active, INSERTED.updated_at
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
        UPDATE Categories
        SET is_deleted = 1, deleted_at = GETDATE(), deleted_by = @deletedBy, updated_at = GETDATE()
        OUTPUT INSERTED.id
        WHERE id = @id AND is_deleted = 0
      `);
    return result.recordset[0];
  },
};

export default CategoryModel;
