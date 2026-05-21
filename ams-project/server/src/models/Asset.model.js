// server/src/models/Asset.model.js

import { getPool, sql } from "../config/db.js";

const AssetModel = {
  // ── Create ──────────────────────────────────────────────────────────────
  create: async ({
    assetCode,
    assetName,
    description,
    categoryId,
    assetType,
    locationId,
    departmentId,
    assignedEmployeeId,
    assignedAt,            // ★ Added
    purchaseDate,
    purchaseCost,
    depreciationMethod,
    usefulLifeYears,
    vendor,
    invoiceNumber,
    invoiceDate,
    currentBookValue,
    scrapValue,
    warrantyExpiry,
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
      .input("assetType", sql.NVarChar, assetType || null)
      .input("locationId", sql.Int, locationId)
      .input("departmentId", sql.Int, departmentId)
      .input("assignedEmployeeId", sql.Int, assignedEmployeeId || null)
      .input("assignedAt", sql.DateTime, assignedEmployeeId && assignedAt ? new Date(assignedAt) : null)  // ★ Added
      .input("purchaseDate", sql.Date, purchaseDate)
      .input("purchaseCost", sql.Decimal(15, 2), purchaseCost)
      .input("depreciationMethod", sql.NVarChar, depreciationMethod || null)
      .input("usefulLifeYears", sql.Int, usefulLifeYears || null)
      .input("vendor", sql.NVarChar, vendor || null)
      .input("invoiceNumber", sql.NVarChar, invoiceNumber || null)
      .input("invoiceDate", sql.Date, invoiceDate || null)
      .input("currentBookValue", sql.Decimal(15, 2), currentBookValue || purchaseCost)
      .input("scrapValue", sql.Decimal(15, 2), scrapValue || null)
      .input("warrantyExpiry", sql.Date, warrantyExpiry || null)
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
          asset_code, asset_name, description, category_id, asset_type,
          location_id, department_id, assigned_employee_id, assigned_at,
          purchase_date, purchase_cost, depreciation_method, useful_life_years,
          vendor, invoice_number, invoice_date,
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
          INSERTED.asset_type, INSERTED.status, INSERTED.condition,
          INSERTED.purchase_cost, INSERTED.depreciation_method,
          INSERTED.useful_life_years, INSERTED.current_book_value,
          INSERTED.created_at, INSERTED.qr_token, INSERTED.qr_code_image_path,
          INSERTED.assigned_employee_id, INSERTED.assigned_at
        VALUES (
          @assetCode, @assetName, @description, @categoryId, @assetType,
          @locationId, @departmentId, @assignedEmployeeId, @assignedAt,
          @purchaseDate, @purchaseCost, @depreciationMethod, @usefulLifeYears,
          @vendor, @invoiceNumber, @invoiceDate,
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
  // No changes needed here — assigned_at not shown in list view
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
      "created_at", "purchase_date", "asset_name",
      "asset_code", "purchase_cost", "current_book_value",
    ];
    const validOrders = ["ASC", "DESC"];
    const safeSort = validSortCols.includes(sortBy) ? `a.${sortBy}` : "a.created_at";
    const safeOrder = validOrders.includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : "DESC";

    let where = "WHERE a.is_deleted = 0";
    if (search)
      where += ` AND (a.asset_name LIKE '%${search}%' OR a.asset_code LIKE '%${search}%' OR a.serial_number LIKE '%${search}%')`;
    if (categoryId) where += ` AND a.category_id = ${parseInt(categoryId)}`;
    if (locationId) where += ` AND a.location_id = ${parseInt(locationId)}`;
    if (departmentId) where += ` AND a.department_id = ${parseInt(departmentId)}`;
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
        a.id, a.asset_code, a.asset_name, a.asset_type, a.status, a.condition,
        a.purchase_date, a.purchase_cost, a.current_book_value,
        a.brand, a.model_number, a.serial_number,
        a.qr_token, a.qr_code_image_path,
        a.category_id,   c.category_name,
        a.location_id,   l.location_name,
        a.department_id, d.dept_name,
        a.assigned_employee_id, e.full_name AS employee_name, e.employee_code,
        a.assigned_at,
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
          e.full_name AS employee_name, e.employee_code,
          e.designation, e.email AS employee_email
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
  // NOTE: assignedEmployeeId is REMOVED from here — assignment is now
  // handled exclusively via assign / collect / reassign methods below
  update: async (
    id,
    {
      assetName,
      description,
      categoryId,
      assetType,
      locationId,
      departmentId,
      purchaseDate,
      purchaseCost,
      depreciationMethod,
      usefulLifeYears,
      vendor,
      invoiceNumber,
      invoiceDate,
      scrapValue,
      warrantyExpiry,
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
      .input("assetType", sql.NVarChar, assetType || null)
      .input("locationId", sql.Int, locationId)
      .input("departmentId", sql.Int, departmentId)
      .input("purchaseDate", sql.Date, purchaseDate)
      .input("purchaseCost", sql.Decimal(15, 2), purchaseCost)
      .input("depreciationMethod", sql.NVarChar, depreciationMethod || null)
      .input("usefulLifeYears", sql.Int, usefulLifeYears || null)
      .input("vendor", sql.NVarChar, vendor || null)
      .input("invoiceNumber", sql.NVarChar, invoiceNumber || null)
      .input("invoiceDate", sql.Date, invoiceDate || null)
      .input("scrapValue", sql.Decimal(15, 2), scrapValue || null)
      .input("warrantyExpiry", sql.Date, warrantyExpiry || null)
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
          category_id = @categoryId, asset_type = @assetType,
          location_id = @locationId, department_id = @departmentId,
          purchase_date = @purchaseDate, purchase_cost = @purchaseCost,
          depreciation_method = @depreciationMethod, useful_life_years = @usefulLifeYears,
          vendor = @vendor, invoice_number = @invoiceNumber, invoice_date = @invoiceDate,
          scrap_value = @scrapValue, warranty_expiry = @warrantyExpiry,
          serial_number = @serialNumber, model_number = @modelNumber,
          brand = @brand, color = @color, condition = @condition,
          insurance_policy_no = @insurancePolicyNo, insurance_company = @insuranceCompany,
          insurance_start_date = @insuranceStartDate, insurance_expiry_date = @insuranceExpiryDate,
          insurance_premium = @insurancePremium,
          amc_vendor = @amcVendor, amc_contract_no = @amcContractNo,
          amc_start_date = @amcStartDate, amc_expiry_date = @amcExpiryDate, amc_cost = @amcCost,
          updated_by = @updatedBy, updated_at = GETDATE()
        OUTPUT
          INSERTED.id, INSERTED.asset_code, INSERTED.asset_name,
          INSERTED.asset_type, INSERTED.status, INSERTED.condition,
          INSERTED.depreciation_method, INSERTED.useful_life_years,
          INSERTED.updated_at
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
        OUTPUT INSERTED.id, INSERTED.asset_code, INSERTED.asset_name,
               INSERTED.status, INSERTED.updated_at
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

  // ════════════════════════════════════════════════════════════════════════
  // ★★ NEW — Assignment Methods
  // ════════════════════════════════════════════════════════════════════════

  // ── Assign employee to asset ─────────────────────────────────────────────
  assign: async (id, { employeeId, assignedAt, condition, performedBy }) => {
  const pool = getPool();
  const result = await pool
    .request()
    .input("id", sql.Int, id)
    .input("employeeId", sql.Int, employeeId)
    .input("assignedAt", sql.DateTime, new Date(assignedAt))
    .input("condition", sql.NVarChar, condition || null)
    .input("performedBy", sql.Int, performedBy).query(`
      UPDATE Assets SET
        assigned_employee_id = @employeeId,
        assigned_at          = @assignedAt,
        condition            = ISNULL(@condition, condition),
        updated_by           = @performedBy,
        updated_at           = GETDATE()
        OUTPUT
          INSERTED.id, INSERTED.asset_code, INSERTED.asset_name,
          INSERTED.assigned_employee_id, INSERTED.assigned_at
        WHERE id = @id AND is_deleted = 0
      `);
    return result.recordset[0];
  },

  // ── Collect asset back from employee ────────────────────────────────────
  collect: async (id, { conditionAtReturn, notes, performedBy }) => {
    const pool = getPool();
    const result = await pool
      .request()
      .input("id", sql.Int, id)
      .input("conditionAtReturn", sql.NVarChar, conditionAtReturn || null)
      .input("performedBy", sql.Int, performedBy).query(`
        UPDATE Assets SET
          assigned_employee_id = NULL,
          assigned_at          = NULL,
          condition            = ISNULL(@conditionAtReturn, condition),
          updated_by           = @performedBy,
          updated_at           = GETDATE()
        OUTPUT
          INSERTED.id, INSERTED.asset_code, INSERTED.asset_name,
          INSERTED.assigned_employee_id, INSERTED.condition
        WHERE id = @id AND is_deleted = 0
      `);
    return result.recordset[0];
  },

  // ── Reassign directly from Emp1 → Emp2 ──────────────────────────────────
  reassign: async (id, { toEmployeeId, assignedAt, conditionAtReturn, notes, performedBy }) => {
    const pool = getPool();
    const result = await pool
      .request()
      .input("id", sql.Int, id)
      .input("toEmployeeId", sql.Int, toEmployeeId)
      .input("assignedAt", sql.DateTime, new Date(assignedAt))
      .input("conditionAtReturn", sql.NVarChar, conditionAtReturn || null)
      .input("performedBy", sql.Int, performedBy).query(`
        UPDATE Assets SET
          assigned_employee_id = @toEmployeeId,
          assigned_at          = @assignedAt,
          condition            = ISNULL(@conditionAtReturn, condition),
          updated_by           = @performedBy,
          updated_at           = GETDATE()
        OUTPUT
          INSERTED.id, INSERTED.asset_code, INSERTED.asset_name,
          INSERTED.assigned_employee_id, INSERTED.assigned_at, INSERTED.condition
        WHERE id = @id AND is_deleted = 0
      `);
    return result.recordset[0];
  },

  // ── Log to AssetAssignmentHistory ────────────────────────────────────────
  logHistory: async ({
    assetId,
    actionType,
    toEmployeeId,
    fromEmployeeId,
    assignedAt,
    collectedAt,
    conditionAtReturn,
    notes,
    performedBy,
  }) => {
    const pool = getPool();
    const result = await pool
      .request()
      .input("assetId", sql.Int, assetId)
      .input("actionType", sql.NVarChar, actionType)
      .input("toEmployeeId", sql.Int, toEmployeeId || null)
      .input("fromEmployeeId", sql.Int, fromEmployeeId || null)
      .input("assignedAt", sql.DateTime, assignedAt ? new Date(assignedAt) : null)
      .input("collectedAt", sql.DateTime, collectedAt ? new Date(collectedAt) : null)
      .input("conditionAtReturn", sql.NVarChar, conditionAtReturn || null)
      .input("notes", sql.NVarChar, notes || null)
      .input("performedBy", sql.Int, performedBy).query(`
        INSERT INTO AssetAssignmentHistory (
          asset_id, action_type,
          to_employee_id, from_employee_id,
          assigned_at, collected_at,
          condition_at_return, notes,
          performed_by, created_at
        )
        OUTPUT
          INSERTED.id, INSERTED.asset_id, INSERTED.action_type,
          INSERTED.to_employee_id, INSERTED.from_employee_id,
          INSERTED.assigned_at, INSERTED.collected_at,
          INSERTED.condition_at_return, INSERTED.notes,
          INSERTED.performed_by, INSERTED.created_at
        VALUES (
          @assetId, @actionType,
          @toEmployeeId, @fromEmployeeId,
          @assignedAt, @collectedAt,
          @conditionAtReturn, @notes,
          @performedBy, GETDATE()
        )
      `);
    return result.recordset[0];
  },
  // ADD inside AssetModel object

// ── Bulk Create ───────────────────────────────────────────────────────────────
// items[]  : each item already has qrToken, qrCodeImagePath, and per-item fields
// createdBy: req.user.id
// batchId  : UUID-based batch identifier
bulkCreate: async (items, createdBy, batchId) => {
  const pool = getPool();
  const transaction = new sql.Transaction(pool);

  try {
    await transaction.begin(sql.ISOLATION_LEVEL.SERIALIZABLE);

    // ── Step 1: Generate all codes atomically inside transaction ──────────────
    const codeReq = new sql.Request(transaction);
    const year = new Date().getFullYear();
    const codeRes = await codeReq.query(`
      SELECT ISNULL(MAX(CAST(SUBSTRING(asset_code, 10, LEN(asset_code) - 9) AS INT)), 0) AS maxSeq
      FROM Assets WITH (UPDLOCK, HOLDLOCK)
      WHERE asset_code LIKE 'AST-${year}-%'
    `);
    const startSeq = codeRes.recordset[0].maxSeq + 1;
    const codes = Array.from({ length: items.length }, (_, i) =>
      `AST-${year}-${String(startSeq + i).padStart(5, "0")}`
    );

    // ── Step 2: Insert each asset within the same transaction ─────────────────
    const results = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const req = new sql.Request(transaction);

      const res = await req
        .input("assetCode",          sql.NVarChar,       codes[i])
        .input("assetName",          sql.NVarChar,       item.assetName)
        .input("description",        sql.NVarChar,       item.description || null)
        .input("categoryId",         sql.Int,            item.categoryId)
        .input("assetType",          sql.NVarChar,       item.assetType || null)
        .input("locationId",         sql.Int,            item.locationId)
        .input("departmentId",       sql.Int,            item.departmentId)
        .input("purchaseDate",       sql.Date,           item.purchaseDate)
        .input("purchaseCost",       sql.Decimal(15, 2), item.purchaseCost)
        .input("depreciationMethod", sql.NVarChar,       item.depreciationMethod || null)
        .input("usefulLifeYears",    sql.Int,            item.usefulLifeYears || null)
        .input("vendor",             sql.NVarChar,       item.vendor || null)
        .input("invoiceNumber",      sql.NVarChar,       item.invoiceNumber || null)
        .input("invoiceDate",        sql.Date,           item.invoiceDate || null)
        .input("currentBookValue",   sql.Decimal(15, 2), item.purchaseCost)
        .input("scrapValue",         sql.Decimal(15, 2), item.scrapValue || null)
        .input("warrantyExpiry",     sql.Date,           item.warrantyExpiry || null)
        .input("serialNumber",       sql.NVarChar,       item.serialNumber || null)
        .input("modelNumber",        sql.NVarChar,       item.modelNumber || null)
        .input("brand",              sql.NVarChar,       item.brand || null)
        .input("color",              sql.NVarChar,       item.color || null)
        .input("condition",          sql.NVarChar,       item.condition || "New")
        .input("qrToken",            sql.NVarChar,       item.qrToken)
        .input("qrCodeImagePath",    sql.NVarChar,       item.qrCodeImagePath)
        .input("insurancePolicyNo",  sql.NVarChar,       item.insurancePolicyNo || null)
        .input("insuranceCompany",   sql.NVarChar,       item.insuranceCompany || null)
        .input("insuranceStartDate", sql.Date,           item.insuranceStartDate || null)
        .input("insuranceExpiryDate",sql.Date,           item.insuranceExpiryDate || null)
        .input("insurancePremium",   sql.Decimal(15, 2), item.insurancePremium || null)
        .input("amcVendor",          sql.NVarChar,       item.amcVendor || null)
        .input("amcContractNo",      sql.NVarChar,       item.amcContractNo || null)
        .input("amcStartDate",       sql.Date,           item.amcStartDate || null)
        .input("amcExpiryDate",      sql.Date,           item.amcExpiryDate || null)
        .input("amcCost",            sql.Decimal(15, 2), item.amcCost || null)
        .input("bulkBatchId",        sql.NVarChar,       batchId)
        .input("createdBy",          sql.Int,            createdBy)
        .query(`
          INSERT INTO Assets (
            asset_code, asset_name, description, category_id, asset_type,
            location_id, department_id,
            purchase_date, purchase_cost, depreciation_method, useful_life_years,
            vendor, invoice_number, invoice_date,
            current_book_value, scrap_value, warranty_expiry,
            serial_number, model_number, brand, color, condition,
            qr_token, qr_code_image_path,
            insurance_policy_no, insurance_company, insurance_start_date,
            insurance_expiry_date, insurance_premium,
            amc_vendor, amc_contract_no, amc_start_date, amc_expiry_date, amc_cost,
            bulk_batch_id,
            created_by, updated_by, created_at, updated_at
          )
          OUTPUT
            INSERTED.id, INSERTED.asset_code, INSERTED.asset_name,
            INSERTED.status, INSERTED.condition,
            INSERTED.purchase_cost, INSERTED.qr_token, INSERTED.qr_code_image_path,
            INSERTED.serial_number, INSERTED.color, INSERTED.bulk_batch_id
          VALUES (
            @assetCode, @assetName, @description, @categoryId, @assetType,
            @locationId, @departmentId,
            @purchaseDate, @purchaseCost, @depreciationMethod, @usefulLifeYears,
            @vendor, @invoiceNumber, @invoiceDate,
            @currentBookValue, @scrapValue, @warrantyExpiry,
            @serialNumber, @modelNumber, @brand, @color, @condition,
            @qrToken, @qrCodeImagePath,
            @insurancePolicyNo, @insuranceCompany, @insuranceStartDate,
            @insuranceExpiryDate, @insurancePremium,
            @amcVendor, @amcContractNo, @amcStartDate, @amcExpiryDate, @amcCost,
            @bulkBatchId,
            @createdBy, @createdBy, GETDATE(), GETDATE()
          )
        `);

      results.push(res.recordset[0]);
    }

    await transaction.commit();
    return results;

  } catch (err) {
    try { await transaction.rollback(); } catch (rbErr) {
      console.error("[BulkCreate] Rollback failed:", rbErr.message);
    }
    throw err;
  }
},

  // ── Get Assignment History for an asset ─────────────────────────────────
  getAssignmentHistory: async (assetId) => {
    const pool = getPool();
    const result = await pool
      .request()
      .input("assetId", sql.Int, assetId).query(`
        SELECT
          h.id, h.action_type,
          h.assigned_at, h.collected_at,
          h.condition_at_return, h.notes,
          h.created_at,

          -- To employee
          te.id AS to_employee_id,
          te.full_name AS to_employee_name,
          te.employee_code AS to_employee_code,
          te.designation AS to_employee_designation,

          -- From employee
          fe.id AS from_employee_id,
          fe.full_name AS from_employee_name,
          fe.employee_code AS from_employee_code,
          fe.designation AS from_employee_designation,

          -- Performed by (user/admin)
          u.id AS performed_by_id,
          u.full_name AS performed_by_name,
          u.role AS performed_by_role

        FROM AssetAssignmentHistory h
        LEFT JOIN Employees te ON h.to_employee_id   = te.id
        LEFT JOIN Employees fe ON h.from_employee_id = fe.id
        LEFT JOIN Users     u  ON h.performed_by     = u.id
        WHERE h.asset_id = @assetId
        ORDER BY h.created_at DESC
      `);
    return result.recordset;
  },

  // ════════════════════════════════════════════════════════════════════════
  // Photos — unchanged
  // ════════════════════════════════════════════════════════════════════════

  addPhoto: async ({ assetId, fileName, filePath, photoType, caption, fileSizeKb, uploadedBy }) => {
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
        OUTPUT INSERTED.id, INSERTED.asset_id, INSERTED.file_name, INSERTED.file_path,
               INSERTED.photo_type, INSERTED.caption, INSERTED.uploaded_at
        VALUES (@assetId, @fileName, @filePath, @photoType, @caption, @fileSizeKb, @uploadedBy, GETDATE())
      `);
    return result.recordset[0];
  },

  getPhotos: async (assetId) => {
    const pool = getPool();
    const result = await pool.request().input("assetId", sql.Int, assetId).query(`
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