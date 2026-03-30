// server/src/models/Asset.model.js

import { getPool, sql } from "../config/db.js";

const AssetModel = {
  // ── Create ──────────────────────────────────────────────────────────────
  create: async ({
    assetCode,
    assetName,
    description,
    categoryId,
    locationId,
    departmentId,
    assignedEmployeeId,
    purchaseDate,
    purchaseCost,
    vendor,
    invoiceNumber,
    invoiceDate,
    currentBookValue,
    scrapValue,
    warrantyExpiry, // ★ Added
    serialNumber,
    modelNumber,
    brand,
    color,
    condition,
    qrToken,
    qrCodeImagePath,
    insurancePolicyNo,
    insuranceCompany,
    insuranceStartDate,
    insuranceExpiryDate,
    insurancePremium,
    amcVendor,
    amcContractNo,
    amcStartDate,
    amcExpiryDate,
    amcCost,
    createdBy,
  }) => {
    const pool = getPool();
    const result = await pool
      .request()
      .input("assetCode", sql.NVarChar, assetCode)
      .input("assetName", sql.NVarChar, assetName)
      .input("description", sql.NVarChar, description || null)
      .input("categoryId", sql.Int, categoryId)
      .input("locationId", sql.Int, locationId)
      .input("departmentId", sql.Int, departmentId)
      .input("assignedEmployeeId", sql.Int, assignedEmployeeId || null)
      .input("purchaseDate", sql.Date, purchaseDate)
      .input("purchaseCost", sql.Decimal(15, 2), purchaseCost)
      .input("vendor", sql.NVarChar, vendor || null)
      .input("invoiceNumber", sql.NVarChar, invoiceNumber || null)
      .input("invoiceDate", sql.Date, invoiceDate || null)
      .input(
        "currentBookValue",
        sql.Decimal(15, 2),
        currentBookValue || purchaseCost,
      )
      .input("scrapValue", sql.Decimal(15, 2), scrapValue || null)
      .input("warrantyExpiry", sql.Date, warrantyExpiry || null) // ★ Added
      .input("serialNumber", sql.NVarChar, serialNumber || null)
      .input("modelNumber", sql.NVarChar, modelNumber || null)
      .input("brand", sql.NVarChar, brand || null)
      .input("color", sql.NVarChar, color || null)
      .input("condition", sql.NVarChar, condition || "New")
      .input("qrToken", sql.NVarChar, qrToken)
      .input("qrCodeImagePath", sql.NVarChar, qrCodeImagePath)
      .input("insurancePolicyNo", sql.NVarChar, insurancePolicyNo || null)
      .input("insuranceCompany", sql.NVarChar, insuranceCompany || null)
      .input("insuranceStartDate", sql.Date, insuranceStartDate || null)
      .input("insuranceExpiryDate", sql.Date, insuranceExpiryDate || null)
      .input("insurancePremium", sql.Decimal(15, 2), insurancePremium || null)
      .input("amcVendor", sql.NVarChar, amcVendor || null)
      .input("amcContractNo", sql.NVarChar, amcContractNo || null)
      .input("amcStartDate", sql.Date, amcStartDate || null)
      .input("amcExpiryDate", sql.Date, amcExpiryDate || null)
      .input("amcCost", sql.Decimal(15, 2), amcCost || null)
      .input("createdBy", sql.Int, createdBy).query(`
        INSERT INTO Assets (
          asset_code, asset_name, description, category_id,
          location_id, department_id, assigned_employee_id,
          purchase_date, purchase_cost, vendor, invoice_number, invoice_date,
          current_book_value, scrap_value, warranty_expiry,
          serial_number, model_number, brand, color, condition,
          qr_token, qr_code_image_path,
          insurance_policy_no, insurance_company, insurance_start_date,
          insurance_expiry_date, insurance_premium,
          amc_vendor, amc_contract_no, amc_start_date, amc_expiry_date, amc_cost,
          created_by, updated_by, created_at, updated_at
        )
        OUTPUT
          INSERTED.id, INSERTED.asset_code, INSERTED.asset_name,
          INSERTED.status, INSERTED.condition, INSERTED.purchase_cost,
          INSERTED.current_book_value, INSERTED.created_at,
          INSERTED.qr_token, INSERTED.qr_code_image_path
        VALUES (
          @assetCode, @assetName, @description, @categoryId,
          @locationId, @departmentId, @assignedEmployeeId,
          @purchaseDate, @purchaseCost, @vendor, @invoiceNumber, @invoiceDate,
          @currentBookValue, @scrapValue, @warrantyExpiry,
          @serialNumber, @modelNumber, @brand, @color, @condition,
          @qrToken, @qrCodeImagePath,
          @insurancePolicyNo, @insuranceCompany, @insuranceStartDate,
          @insuranceExpiryDate, @insurancePremium,
          @amcVendor, @amcContractNo, @amcStartDate, @amcExpiryDate, @amcCost,
          @createdBy, @createdBy, GETDATE(), GETDATE()
        )
      `);
    return result.recordset[0];
  },

  // ── Find All (with filters + pagination) ────────────────────────────────
  findAll: async ({
    search = "",
    categoryId = "",
    locationId = "",
    departmentId = "",
    status = "",
    condition = "",
    assignedEmployeeId = "",
    fromDate = "",
    toDate = "",
    page = 1,
    limit = 20,
    sortBy = "created_at",
    sortOrder = "DESC",
  }) => {
    const pool = getPool();
    const offset = (page - 1) * limit;

    const validSortCols = [
      "created_at",
      "purchase_date",
      "asset_name",
      "asset_code",
      "purchase_cost",
      "current_book_value",
    ];
    const validOrders = ["ASC", "DESC"];
    const safeSort = validSortCols.includes(sortBy)
      ? `a.${sortBy}`
      : "a.created_at";
    const safeOrder = validOrders.includes(sortOrder.toUpperCase())
      ? sortOrder.toUpperCase()
      : "DESC";

    let where = "WHERE a.is_deleted = 0";
    if (search)
      where += ` AND (a.asset_name LIKE '%${search}%' OR a.asset_code LIKE '%${search}%' OR a.serial_number LIKE '%${search}%')`;
    if (categoryId) where += ` AND a.category_id = ${parseInt(categoryId)}`;
    if (locationId) where += ` AND a.location_id = ${parseInt(locationId)}`;
    if (departmentId)
      where += ` AND a.department_id = ${parseInt(departmentId)}`;
    if (status) where += ` AND a.status = '${status}'`;
    if (condition) where += ` AND a.condition = '${condition}'`;
    if (assignedEmployeeId)
      where += ` AND a.assigned_employee_id = ${parseInt(assignedEmployeeId)}`;
    if (fromDate) where += ` AND a.purchase_date >= '${fromDate}'`;
    if (toDate) where += ` AND a.purchase_date <= '${toDate}'`;

    const countResult = await pool
      .request()
      .query(`SELECT COUNT(*) as total FROM Assets a ${where}`);
    const total = countResult.recordset[0].total;

    const result = await pool.request().query(`
      SELECT
        a.id, a.asset_code, a.asset_name, a.status, a.condition,
        a.purchase_date, a.purchase_cost, a.current_book_value,
        a.brand, a.model_number, a.serial_number,
        a.qr_token, a.qr_code_image_path,
        a.category_id,   c.category_name,
        a.location_id,   l.location_name,
        a.department_id, d.dept_name,
        a.assigned_employee_id, e.full_name AS employee_name, e.employee_code,
        a.warranty_expiry, a.amc_expiry_date, a.insurance_expiry_date,
        a.created_at, a.updated_at
      FROM Assets a
      LEFT JOIN Categories  c ON a.category_id         = c.id
      LEFT JOIN Locations   l ON a.location_id          = l.id
      LEFT JOIN Departments d ON a.department_id        = d.id
      LEFT JOIN Employees   e ON a.assigned_employee_id = e.id
      ${where}
      ORDER BY ${safeSort} ${safeOrder}
      OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY
    `);

    return {
      assets: result.recordset,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit),
    };
  },

  // ── Find by ID (full detail) ─────────────────────────────────────────────
  findById: async (id) => {
    const pool = getPool();
    const result = await pool.request().input("id", sql.Int, id).query(`
        SELECT
          a.*,
          c.category_name,  cp.category_name AS parent_category_name,
          l.location_name,
          d.dept_name,
          e.full_name AS employee_name, e.employee_code, e.designation
        FROM Assets a
        LEFT JOIN Categories  c  ON a.category_id         = c.id
        LEFT JOIN Categories  cp ON c.parent_category_id  = cp.id
        LEFT JOIN Locations   l  ON a.location_id          = l.id
        LEFT JOIN Departments d  ON a.department_id        = d.id
        LEFT JOIN Employees   e  ON a.assigned_employee_id = e.id
        WHERE a.id = @id AND a.is_deleted = 0
      `);
    return result.recordset[0];
  },

  // ── Update ──────────────────────────────────────────────────────────────
  update: async (
    id,
    {
      assetName,
      description,
      categoryId,
      locationId,
      departmentId,
      assignedEmployeeId,
      purchaseDate,
      purchaseCost,
      vendor,
      invoiceNumber,
      invoiceDate,
      scrapValue,
      warrantyExpiry, // ★ Added
      serialNumber,
      modelNumber,
      brand,
      color,
      condition,
      insurancePolicyNo,
      insuranceCompany,
      insuranceStartDate,
      insuranceExpiryDate,
      insurancePremium,
      amcVendor,
      amcContractNo,
      amcStartDate,
      amcExpiryDate,
      amcCost,
      updatedBy,
    },
  ) => {
    const pool = getPool();
    const result = await pool
      .request()
      .input("id", sql.Int, id)
      .input("assetName", sql.NVarChar, assetName)
      .input("description", sql.NVarChar, description || null)
      .input("categoryId", sql.Int, categoryId)
      .input("locationId", sql.Int, locationId)
      .input("departmentId", sql.Int, departmentId)
      .input("assignedEmployeeId", sql.Int, assignedEmployeeId || null)
      .input("purchaseDate", sql.Date, purchaseDate)
      .input("purchaseCost", sql.Decimal(15, 2), purchaseCost)
      .input("vendor", sql.NVarChar, vendor || null)
      .input("invoiceNumber", sql.NVarChar, invoiceNumber || null)
      .input("invoiceDate", sql.Date, invoiceDate || null)
      .input("scrapValue", sql.Decimal(15, 2), scrapValue || null)
      .input("warrantyExpiry", sql.Date, warrantyExpiry || null) // ★ Added
      .input("serialNumber", sql.NVarChar, serialNumber || null)
      .input("modelNumber", sql.NVarChar, modelNumber || null)
      .input("brand", sql.NVarChar, brand || null)
      .input("color", sql.NVarChar, color || null)
      .input("condition", sql.NVarChar, condition || null)
      .input("insurancePolicyNo", sql.NVarChar, insurancePolicyNo || null)
      .input("insuranceCompany", sql.NVarChar, insuranceCompany || null)
      .input("insuranceStartDate", sql.Date, insuranceStartDate || null)
      .input("insuranceExpiryDate", sql.Date, insuranceExpiryDate || null)
      .input("insurancePremium", sql.Decimal(15, 2), insurancePremium || null)
      .input("amcVendor", sql.NVarChar, amcVendor || null)
      .input("amcContractNo", sql.NVarChar, amcContractNo || null)
      .input("amcStartDate", sql.Date, amcStartDate || null)
      .input("amcExpiryDate", sql.Date, amcExpiryDate || null)
      .input("amcCost", sql.Decimal(15, 2), amcCost || null)
      .input("updatedBy", sql.Int, updatedBy).query(`
        UPDATE Assets SET
          asset_name = @assetName, description = @description,
          category_id = @categoryId, location_id = @locationId,
          department_id = @departmentId, assigned_employee_id = @assignedEmployeeId,
          purchase_date = @purchaseDate, purchase_cost = @purchaseCost,
          vendor = @vendor, invoice_number = @invoiceNumber, invoice_date = @invoiceDate,
          scrap_value = @scrapValue, warranty_expiry = @warrantyExpiry,
          serial_number = @serialNumber,
          model_number = @modelNumber, brand = @brand, color = @color,
          condition = @condition,
          insurance_policy_no = @insurancePolicyNo, insurance_company = @insuranceCompany,
          insurance_start_date = @insuranceStartDate, insurance_expiry_date = @insuranceExpiryDate,
          insurance_premium = @insurancePremium,
          amc_vendor = @amcVendor, amc_contract_no = @amcContractNo,
          amc_start_date = @amcStartDate, amc_expiry_date = @amcExpiryDate, amc_cost = @amcCost,
          updated_by = @updatedBy, updated_at = GETDATE()
        OUTPUT
          INSERTED.id, INSERTED.asset_code, INSERTED.asset_name,
          INSERTED.status, INSERTED.condition, INSERTED.updated_at
        WHERE id = @id AND is_deleted = 0
      `);
    return result.recordset[0];
  },

  // ── Update Status ────────────────────────────────────────────────────────
  updateStatus: async (id, status, statusReason, updatedBy) => {
    const pool = getPool();
    const result = await pool
      .request()
      .input("id", sql.Int, id)
      .input("status", sql.NVarChar, status)
      .input("statusReason", sql.NVarChar, statusReason || null)
      .input("updatedBy", sql.Int, updatedBy).query(`
        UPDATE Assets SET
          status = @status, status_reason = @statusReason,
          status_changed_at = GETDATE(),
          updated_by = @updatedBy, updated_at = GETDATE()
        OUTPUT INSERTED.id, INSERTED.asset_code, INSERTED.asset_name, INSERTED.status, INSERTED.updated_at
        WHERE id = @id AND is_deleted = 0
      `);
    return result.recordset[0];
  },

  // ── Soft Delete ──────────────────────────────────────────────────────────
  softDelete: async (id, deletedBy) => {
    const pool = getPool();
    const result = await pool
      .request()
      .input("id", sql.Int, id)
      .input("deletedBy", sql.Int, deletedBy).query(`
        UPDATE Assets SET
          is_deleted = 1, deleted_at = GETDATE(),
          deleted_by = @deletedBy, updated_at = GETDATE()
        OUTPUT INSERTED.id
        WHERE id = @id AND is_deleted = 0
      `);
    return result.recordset[0];
  },

  // ── Photos ───────────────────────────────────────────────────────────────
  addPhoto: async ({
    assetId,
    fileName,
    filePath,
    photoType,
    caption,
    fileSizeKb,
    uploadedBy,
  }) => {
    const pool = getPool();
    const result = await pool
      .request()
      .input("assetId", sql.Int, assetId)
      .input("fileName", sql.NVarChar, fileName)
      .input("filePath", sql.NVarChar, filePath)
      .input("photoType", sql.NVarChar, photoType || "AssetPhoto")
      .input("caption", sql.NVarChar, caption || null)
      .input("fileSizeKb", sql.Int, fileSizeKb || null)
      .input("uploadedBy", sql.Int, uploadedBy).query(`
        INSERT INTO AssetPhotos (asset_id, file_name, file_path, photo_type, caption, file_size_kb, uploaded_by, uploaded_at)
        OUTPUT INSERTED.id, INSERTED.asset_id, INSERTED.file_name, INSERTED.file_path, INSERTED.photo_type, INSERTED.caption, INSERTED.uploaded_at
        VALUES (@assetId, @fileName, @filePath, @photoType, @caption, @fileSizeKb, @uploadedBy, GETDATE())
      `);
    return result.recordset[0];
  },

  getPhotos: async (assetId) => {
    const pool = getPool();
    const result = await pool.request().input("assetId", sql.Int, assetId)
      .query(`
        SELECT id, asset_id, file_name, file_path, photo_type, caption, file_size_kb, uploaded_at
        FROM AssetPhotos
        WHERE asset_id = @assetId
        ORDER BY uploaded_at ASC
      `);
    return result.recordset;
  },

  deletePhoto: async (photoId, assetId) => {
    const pool = getPool();
    const result = await pool
      .request()
      .input("photoId", sql.Int, photoId)
      .input("assetId", sql.Int, assetId).query(`
        DELETE FROM AssetPhotos
        OUTPUT DELETED.id, DELETED.file_path
        WHERE id = @photoId AND asset_id = @assetId
      `);
    return result.recordset[0];
  },
};

export default AssetModel;
