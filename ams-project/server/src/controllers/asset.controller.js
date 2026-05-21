// server/src/controllers/asset.controller.js

import AssetModel from "../models/Asset.model.js";
import { generateAssetCode } from "../utils/assetCodeGen.js";
import { generateQRCode, generateQRCodesBulk } from "../utils/qrGenerator.js";
import { success, error } from "../utils/responseHelper.js";
import { logAudit, getRequestMeta } from "../utils/auditLogger.js";
import { getPool } from "../config/db.js";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";

// ── Create Asset ─────────────────────────────────────────────────────────────
export const createAsset = async (req, res) => {
  try {
    const {
      assetName, description, categoryId, assetType,
      locationId, departmentId,
      assignedEmployeeId, assignedAt,
      purchaseDate, purchaseCost, depreciationMethod, usefulLifeYears,
      vendor, invoiceNumber, invoiceDate, scrapValue, warrantyExpiry,
      serialNumber, modelNumber, brand, color, condition,
      insurancePolicyNo, insuranceCompany, insuranceStartDate,
      insuranceExpiryDate, insurancePremium,
      amcVendor, amcContractNo, amcStartDate, amcExpiryDate, amcCost,
    } = req.body;

    if (!assetName)    return error(res, "Asset name is required.", 400);
    if (!categoryId)   return error(res, "Category is required.", 400);
    if (!locationId)   return error(res, "Location is required.", 400);
    if (!departmentId) return error(res, "Department is required.", 400);
    if (!purchaseDate) return error(res, "Purchase date is required.", 400);
    if (!purchaseCost) return error(res, "Purchase cost is required.", 400);

    if (assignedEmployeeId && !assignedAt)
      return error(res, "Assignment date & time is required when assigning an employee.", 400);

    const validConditions = ["New", "Good", "Fair", "Poor", "Damaged", "Scrap"];
    if (condition && !validConditions.includes(condition))
      return error(res, "condition must be: New, Good, Fair, Poor, or Scrap.", 400);

    const assetCode = await generateAssetCode();
    const { qrToken, qrCodeImagePath } = await generateQRCode();

    const asset = await AssetModel.create({
      assetCode, assetName, description, categoryId, assetType,
      locationId, departmentId,
      assignedEmployeeId: assignedEmployeeId || null,
      assignedAt: assignedEmployeeId && assignedAt ? assignedAt : null,
      purchaseDate, purchaseCost, depreciationMethod, usefulLifeYears,
      vendor, invoiceNumber, invoiceDate,
      currentBookValue: purchaseCost,
      scrapValue, warrantyExpiry,
      serialNumber, modelNumber, brand, color,
      condition: condition || "New",
      qrToken, qrCodeImagePath,
      insurancePolicyNo, insuranceCompany, insuranceStartDate,
      insuranceExpiryDate, insurancePremium,
      amcVendor, amcContractNo, amcStartDate, amcExpiryDate, amcCost,
      createdBy: req.user.id,
    });

    if (assignedEmployeeId && assignedAt) {
      await AssetModel.logHistory({
        assetId:          asset.id,
        actionType:       "Assigned",
        toEmployeeId:     parseInt(assignedEmployeeId),
        fromEmployeeId:   null,
        assignedAt,
        collectedAt:      null,
        conditionAtReturn: null,
        notes:            "Assigned at creation",
        performedBy:      req.user.id,
      });
    }

    const { ipAddress, userAgent } = getRequestMeta(req);
    await logAudit({
      userId:   req.user.id,
      userName: req.user.full_name || req.user.email,
      userRole: req.user.role,
      action:   "CREATE",
      entity:   "Asset",
      entityId:   asset.id,
      entityCode: assetCode,
      newValue: {
        assetName, categoryId, assetType, locationId, departmentId,
        purchaseCost, condition: condition || "New",
        assignedEmployeeId: assignedEmployeeId || null,
      },
      ipAddress, userAgent,
    });

    return success(res, asset, "Asset created successfully.", 201);
  } catch (err) {
    return error(res, err.message);
  }
};

// ── Get All Assets ───────────────────────────────────────────────────────────
export const getAssets = async (req, res) => {
  try {
    const data = await AssetModel.findAll(req.query);
    return success(res, data, "Assets fetched successfully.");
  } catch (err) {
    return error(res, err.message);
  }
};

// ── Get Asset by ID ──────────────────────────────────────────────────────────
export const getAssetById = async (req, res) => {
  try {
    const asset = await AssetModel.findById(parseInt(req.params.id));
    if (!asset) return error(res, "Asset not found.", 404);
    const photos = await AssetModel.getPhotos(asset.id);
    asset.photos = photos;
    return success(res, asset, "Asset fetched successfully.");
  } catch (err) {
    return error(res, err.message);
  }
};

// ── Update Asset ─────────────────────────────────────────────────────────────
export const updateAsset = async (req, res) => {
  try {
    const {
      assetName, description, categoryId, assetType,
      locationId, departmentId,
      purchaseDate, purchaseCost, depreciationMethod, usefulLifeYears,
      vendor, invoiceNumber, invoiceDate, scrapValue, warrantyExpiry,
      serialNumber, modelNumber, brand, color, condition,
      insurancePolicyNo, insuranceCompany, insuranceStartDate,
      insuranceExpiryDate, insurancePremium,
      amcVendor, amcContractNo, amcStartDate, amcExpiryDate, amcCost,
    } = req.body;

    if (!assetName)    return error(res, "Asset name is required.", 400);
    if (!categoryId)   return error(res, "Category is required.", 400);
    if (!locationId)   return error(res, "Location is required.", 400);
    if (!departmentId) return error(res, "Department is required.", 400);
    if (!purchaseDate) return error(res, "Purchase date is required.", 400);
    if (!purchaseCost) return error(res, "Purchase cost is required.", 400);

    const existing = await AssetModel.findById(parseInt(req.params.id));
    if (!existing) return error(res, "Asset not found.", 404);

    const asset = await AssetModel.update(parseInt(req.params.id), {
      assetName, description, categoryId, assetType,
      locationId, departmentId,
      purchaseDate, purchaseCost, depreciationMethod, usefulLifeYears,
      vendor, invoiceNumber, invoiceDate, scrapValue, warrantyExpiry,
      serialNumber, modelNumber, brand, color, condition,
      insurancePolicyNo, insuranceCompany, insuranceStartDate,
      insuranceExpiryDate, insurancePremium,
      amcVendor, amcContractNo, amcStartDate, amcExpiryDate, amcCost,
      updatedBy: req.user.id,
    });

    if (!asset) return error(res, "Asset not found.", 404);

    const { ipAddress, userAgent } = getRequestMeta(req);
    await logAudit({
      userId: req.user.id, userName: req.user.full_name || req.user.email,
      userRole: req.user.role, action: "UPDATE", entity: "Asset",
      entityId: parseInt(req.params.id), entityCode: existing.asset_code,
      oldValue: { assetName: existing.asset_name, assetType: existing.asset_type,
        locationId: existing.location_id, departmentId: existing.department_id,
        condition: existing.condition, purchaseCost: existing.purchase_cost },
      newValue: { assetName, assetType, locationId, departmentId, condition, purchaseCost },
      ipAddress, userAgent,
    });

    return success(res, asset, "Asset updated successfully.");
  } catch (err) {
    return error(res, err.message);
  }
};

// ── Update Asset Status ──────────────────────────────────────────────────────
export const updateAssetStatus = async (req, res) => {
  try {
    const { status, statusReason } = req.body;
    const validStatuses = ["Active", "InRepair", "InTransit", "Disposed", "Missing"];
    if (!status || !validStatuses.includes(status))
      return error(res, "status must be: Active, InRepair, InTransit, Disposed, or Missing.", 400);

    const existing = await AssetModel.findById(parseInt(req.params.id));
    if (!existing) return error(res, "Asset not found.", 404);

    const asset = await AssetModel.updateStatus(parseInt(req.params.id), status, statusReason, req.user.id);
    if (!asset) return error(res, "Asset not found.", 404);

    const { ipAddress, userAgent } = getRequestMeta(req);
    await logAudit({
      userId: req.user.id, userName: req.user.full_name || req.user.email,
      userRole: req.user.role, action: "UPDATE", entity: "Asset",
      entityId: parseInt(req.params.id), entityCode: existing.asset_code,
      oldValue: { status: existing.status },
      newValue: { status, statusReason },
      ipAddress, userAgent,
    });

    return success(res, asset, `Asset status updated to ${status}.`);
  } catch (err) {
    return error(res, err.message);
  }
};

// ── Delete Asset ─────────────────────────────────────────────────────────────
export const deleteAsset = async (req, res) => {
  try {
    const existing = await AssetModel.findById(parseInt(req.params.id));
    if (!existing) return error(res, "Asset not found.", 404);

    const result = await AssetModel.softDelete(parseInt(req.params.id), req.user.id);
    if (!result) return error(res, "Asset not found.", 404);

    const { ipAddress, userAgent } = getRequestMeta(req);
    await logAudit({
      userId: req.user.id, userName: req.user.full_name || req.user.email,
      userRole: req.user.role, action: "DELETE", entity: "Asset",
      entityId: parseInt(req.params.id), entityCode: existing.asset_code,
      oldValue: { assetName: existing.asset_name, status: existing.status },
      ipAddress, userAgent,
    });

    return success(res, null, "Asset deleted successfully.");
  } catch (err) {
    return error(res, err.message);
  }
};

// ════════════════════════════════════════════════════════════════════════════
// Assignment Controllers
// ════════════════════════════════════════════════════════════════════════════

export const assignEmployee = async (req, res) => {
  try {
    const assetId = parseInt(req.params.id);
    const { employeeId, assignedAt, condition, notes } = req.body;

    if (!employeeId) return error(res, "Employee is required.", 400);
    if (!assignedAt) return error(res, "Assignment date & time is required.", 400);
    if (!condition)  return error(res, "Condition is required.", 400);

    const validConditions = ["New", "Good", "Fair", "Poor", "Damaged", "Scrap"];
    if (!validConditions.includes(condition))
      return error(res, "condition must be: New, Good, Fair, Poor, Damaged, or Scrap.", 400);

    const existing = await AssetModel.findById(assetId);
    if (!existing) return error(res, "Asset not found.", 404);
    if (existing.assigned_employee_id)
      return error(res, "Asset is already assigned. Use reassign or collect first.", 400);

    const asset = await AssetModel.assign(assetId, {
      employeeId: parseInt(employeeId), assignedAt,
      condition, performedBy: req.user.id,
    });

    await AssetModel.logHistory({
      assetId, actionType: "Assigned",
      toEmployeeId: parseInt(employeeId), fromEmployeeId: null,
      assignedAt, collectedAt: null,
      conditionAtReturn: condition,
      notes: notes || null,
      performedBy: req.user.id,
    });

    const { ipAddress, userAgent } = getRequestMeta(req);
    await logAudit({
      userId: req.user.id, userName: req.user.full_name || req.user.email,
      userRole: req.user.role, action: "UPDATE", entity: "Asset",
      entityId: assetId, entityCode: existing.asset_code,
      oldValue: { assignedEmployeeId: null },
      newValue: { assignedEmployeeId: employeeId, assignedAt },
      ipAddress, userAgent,
    });

    return success(res, asset, "Asset assigned successfully.");
  } catch (err) {
    return error(res, err.message);
  }
};

export const collectAsset = async (req, res) => {
  try {
    const assetId = parseInt(req.params.id);
    const { conditionAtReturn, reason, notes } = req.body;

    const validConditions = ["New", "Good", "Fair", "Poor", "Damaged", "Scrap"];
    if (conditionAtReturn && !validConditions.includes(conditionAtReturn))
      return error(res, "conditionAtReturn must be: New, Good, Fair, Poor, Damaged, or Scrap.", 400);

    const existing = await AssetModel.findById(assetId);
    if (!existing) return error(res, "Asset not found.", 404);
    if (!existing.assigned_employee_id)
      return error(res, "Asset is not currently assigned to anyone.", 400);

    const fromEmployeeId = existing.assigned_employee_id;
    const collectedAt = new Date().toISOString();

    const mergedNotes = [
      reason ? `Reason: ${reason}` : null,
      notes  ? notes               : null,
    ]
      .filter(Boolean)
      .join(" | ") || null;

    const asset = await AssetModel.collect(assetId, {
      conditionAtReturn,
      notes: mergedNotes,
      performedBy: req.user.id,
    });

    await AssetModel.logHistory({
      assetId,
      actionType:        "Collected",
      toEmployeeId:      null,
      fromEmployeeId,
      assignedAt:        existing.assigned_at,
      collectedAt,
      conditionAtReturn: conditionAtReturn || null,
      notes:             mergedNotes,
      performedBy:       req.user.id,
    });

    const { ipAddress, userAgent } = getRequestMeta(req);
    await logAudit({
      userId:   req.user.id,
      userName: req.user.full_name || req.user.email,
      userRole: req.user.role,
      action:   "UPDATE",
      entity:   "Asset",
      entityId:   assetId,
      entityCode: existing.asset_code,
      oldValue: { assignedEmployeeId: fromEmployeeId },
      newValue: { assignedEmployeeId: null, conditionAtReturn, collectedAt, reason },
      ipAddress,
      userAgent,
    });

    return success(res, asset, "Asset collected successfully.");
  } catch (err) {
    return error(res, err.message);
  }
};

export const reassignEmployee = async (req, res) => {
  try {
    const assetId = parseInt(req.params.id);
    const { toEmployeeId, assignedAt, conditionAtReturn, notes } = req.body;

    if (!toEmployeeId) return error(res, "Target employee is required.", 400);
    if (!assignedAt)   return error(res, "Assignment date & time is required.", 400);

    const validConditions = ["New", "Good", "Fair", "Poor", "Damaged", "Scrap"];
    if (conditionAtReturn && !validConditions.includes(conditionAtReturn))
      return error(res, "conditionAtReturn must be: New, Good, Fair, Poor, or Scrap.", 400);

    const existing = await AssetModel.findById(assetId);
    if (!existing) return error(res, "Asset not found.", 404);
    if (!existing.assigned_employee_id)
      return error(res, "Asset is not currently assigned. Use assign instead.", 400);
    if (existing.assigned_employee_id === parseInt(toEmployeeId))
      return error(res, "Asset is already assigned to this employee.", 400);

    const fromEmployeeId = existing.assigned_employee_id;
    const collectedAt    = new Date().toISOString();

    const asset = await AssetModel.reassign(assetId, {
      toEmployeeId: parseInt(toEmployeeId), assignedAt,
      conditionAtReturn, notes, performedBy: req.user.id,
    });

    await AssetModel.logHistory({
      assetId, actionType: "Reassigned",
      toEmployeeId: parseInt(toEmployeeId), fromEmployeeId,
      assignedAt, collectedAt,
      conditionAtReturn: conditionAtReturn || null, notes: notes || null,
      performedBy: req.user.id,
    });

    const { ipAddress, userAgent } = getRequestMeta(req);
    await logAudit({
      userId: req.user.id, userName: req.user.full_name || req.user.email,
      userRole: req.user.role, action: "UPDATE", entity: "Asset",
      entityId: assetId, entityCode: existing.asset_code,
      oldValue: { assignedEmployeeId: fromEmployeeId },
      newValue: { assignedEmployeeId: toEmployeeId, assignedAt, conditionAtReturn },
      ipAddress, userAgent,
    });

    return success(res, asset, "Asset reassigned successfully.");
  } catch (err) {
    return error(res, err.message);
  }
};

export const getAssignmentHistory = async (req, res) => {
  try {
    const assetId = parseInt(req.params.id);
    const existing = await AssetModel.findById(assetId);
    if (!existing) return error(res, "Asset not found.", 404);
    const history = await AssetModel.getAssignmentHistory(assetId);
    return success(res, history, "Assignment history fetched successfully.");
  } catch (err) {
    return error(res, err.message);
  }
};

// ════════════════════════════════════════════════════════════════════════════
// Photos
// ════════════════════════════════════════════════════════════════════════════

export const uploadPhoto = async (req, res) => {
  try {
    if (!req.file) return error(res, "No file uploaded.", 400);
    const assetId = parseInt(req.params.id);
    const asset = await AssetModel.findById(assetId);
    if (!asset) { fs.unlinkSync(req.file.path); return error(res, "Asset not found.", 404); }

    const { photoType, caption } = req.body;
    const validTypes = ["AssetPhoto", "InvoiceScan", "DamagePhoto", "VerificationPhoto"];
    if (photoType && !validTypes.includes(photoType))
      return error(res, "photoType must be: AssetPhoto, InvoiceScan, DamagePhoto, or VerificationPhoto.", 400);

    const fileSizeKb = Math.round(req.file.size / 1024);
    const filePath   = req.file.path.replace(/\\/g, "/");

    const photo = await AssetModel.addPhoto({
      assetId, fileName: req.file.filename, filePath,
      photoType: photoType || "AssetPhoto", caption, fileSizeKb,
      uploadedBy: req.user.id,
    });

    const { ipAddress, userAgent } = getRequestMeta(req);
    await logAudit({
      userId: req.user.id, userName: req.user.full_name || req.user.email,
      userRole: req.user.role, action: "UPDATE", entity: "Asset",
      entityId: assetId, entityCode: asset.asset_code,
      newValue: { action: "Photo uploaded", photoType: photoType || "AssetPhoto", fileName: req.file.filename },
      ipAddress, userAgent,
    });

    return success(res, photo, "Photo uploaded successfully.", 201);
  } catch (err) {
    return error(res, err.message);
  }
};

export const getPhotos = async (req, res) => {
  try {
    const photos = await AssetModel.getPhotos(parseInt(req.params.id));
    return success(res, photos, "Photos fetched successfully.");
  } catch (err) {
    return error(res, err.message);
  }
};

export const deletePhoto = async (req, res) => {
  try {
    const { id: assetId, photoId } = req.params;
    const photo = await AssetModel.deletePhoto(parseInt(photoId), parseInt(assetId));
    if (!photo) return error(res, "Photo not found.", 404);
    if (fs.existsSync(photo.file_path)) fs.unlinkSync(photo.file_path);

    const asset = await AssetModel.findById(parseInt(assetId));
    const { ipAddress, userAgent } = getRequestMeta(req);
    await logAudit({
      userId: req.user.id, userName: req.user.full_name || req.user.email,
      userRole: req.user.role, action: "DELETE", entity: "Asset",
      entityId: parseInt(assetId), entityCode: asset?.asset_code || null,
      oldValue: { action: "Photo deleted", fileName: photo.file_name },
      ipAddress, userAgent,
    });

    return success(res, null, "Photo deleted successfully.");
  } catch (err) {
    return error(res, err.message);
  }
};

// ════════════════════════════════════════════════════════════════════════════
// Expiring AMC / Insurance
// ════════════════════════════════════════════════════════════════════════════

export const getExpiringAMC = async (req, res) => {
  try {
    const days     = parseInt(req.query.days) || 30;
    const page     = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 20;
    const offset   = (page - 1) * pageSize;
    const pool     = getPool();

    const dateFilter = days === 0
      ? `AND a.amc_expiry_date IS NOT NULL`
      : `AND a.amc_expiry_date IS NOT NULL AND a.amc_expiry_date <= DATEADD(DAY, ${days}, CAST(GETDATE() AS DATE))`;

    const countRes = await pool.request().query(`
      SELECT COUNT(*) AS total FROM Assets a
      WHERE a.is_deleted = 0 AND a.status != 'Disposed' ${dateFilter}
    `);
    const dataRes = await pool.request().query(`
      SELECT a.id, a.asset_code, a.asset_name, a.status,
        a.amc_vendor, a.amc_expiry_date,
        DATEDIFF(DAY, CAST(GETDATE() AS DATE), a.amc_expiry_date) AS days_remaining,
        c.category_name, l.location_name, d.dept_name,
        e.full_name AS employee_name, e.employee_code
      FROM Assets a
      LEFT JOIN Categories  c ON a.category_id         = c.id
      LEFT JOIN Locations   l ON a.location_id          = l.id
      LEFT JOIN Departments d ON a.department_id        = d.id
      LEFT JOIN Employees   e ON a.assigned_employee_id = e.id
      WHERE a.is_deleted = 0 AND a.status != 'Disposed' ${dateFilter}
      ORDER BY a.amc_expiry_date ASC
      OFFSET ${offset} ROWS FETCH NEXT ${pageSize} ROWS ONLY
    `);

    return success(res, {
      data: dataRes.recordset, total: countRes.recordset[0].total,
      page, pageSize, totalPages: Math.ceil(countRes.recordset[0].total / pageSize), days,
    }, "Expiring AMC assets fetched.");
  } catch (err) {
    return error(res, err.message);
  }
};

export const getExpiringInsurance = async (req, res) => {
  try {
    const days     = parseInt(req.query.days) || 30;
    const page     = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 20;
    const offset   = (page - 1) * pageSize;
    const pool     = getPool();

    const dateFilter = days === 0
      ? `AND a.insurance_expiry_date IS NOT NULL`
      : `AND a.insurance_expiry_date IS NOT NULL AND a.insurance_expiry_date <= DATEADD(DAY, ${days}, CAST(GETDATE() AS DATE))`;

    const countRes = await pool.request().query(`
      SELECT COUNT(*) AS total FROM Assets a
      WHERE a.is_deleted = 0 AND a.status != 'Disposed' ${dateFilter}
    `);
    const dataRes = await pool.request().query(`
      SELECT a.id, a.asset_code, a.asset_name, a.status,
        a.insurance_policy_no, a.insurance_company, a.insurance_expiry_date,
        DATEDIFF(DAY, CAST(GETDATE() AS DATE), a.insurance_expiry_date) AS days_remaining,
        c.category_name, l.location_name, d.dept_name,
        e.full_name AS employee_name, e.employee_code
      FROM Assets a
      LEFT JOIN Categories  c ON a.category_id         = c.id
      LEFT JOIN Locations   l ON a.location_id          = l.id
      LEFT JOIN Departments d ON a.department_id        = d.id
      LEFT JOIN Employees   e ON a.assigned_employee_id = e.id
      WHERE a.is_deleted = 0 AND a.status != 'Disposed' ${dateFilter}
      ORDER BY a.insurance_expiry_date ASC
      OFFSET ${offset} ROWS FETCH NEXT ${pageSize} ROWS ONLY
    `);

    return success(res, {
      data: dataRes.recordset, total: countRes.recordset[0].total,
      page, pageSize, totalPages: Math.ceil(countRes.recordset[0].total / pageSize), days,
    }, "Expiring insurance assets fetched.");
  } catch (err) {
    return error(res, err.message);
  }
};

// ════════════════════════════════════════════════════════════════════════════
// Bulk Create Assets
// ════════════════════════════════════════════════════════════════════════════

export const bulkCreateAssets = async (req, res) => {
  try {
    const { commonData, items } = req.body;

    if (!commonData)
      return error(res, "commonData is required.", 400);
    if (!items || !Array.isArray(items) || items.length === 0)
      return error(res, "items array is required.", 400);
    if (items.length > 200)
      return error(res, "Maximum 200 assets can be registered in one batch.", 400);

    const {
      assetName, categoryId, assetType,
      locationId, departmentId,
      purchaseDate, purchaseCost,
      depreciationMethod, usefulLifeYears,
      vendor, invoiceNumber, invoiceDate,
      scrapValue, warrantyExpiry, modelNumber, brand,
      insurancePolicyNo, insuranceCompany, insuranceStartDate,
      insuranceExpiryDate, insurancePremium,
      amcVendor, amcContractNo, amcStartDate, amcExpiryDate, amcCost,
      description,
    } = commonData;

    if (!assetName)          return error(res, "Asset name is required.", 400);
    if (!categoryId)         return error(res, "Category is required.", 400);
    if (!locationId)         return error(res, "Location is required.", 400);
    if (!departmentId)       return error(res, "Department is required.", 400);
    if (!purchaseDate)       return error(res, "Purchase date is required.", 400);
    if (!purchaseCost)       return error(res, "Purchase cost is required.", 400);
    if (!depreciationMethod) return error(res, "Depreciation method is required.", 400);
    if (!usefulLifeYears)    return error(res, "Useful life years is required.", 400);

    const validConditions = ["New", "Good", "Fair", "Poor", "Damaged", "Scrap"];
    for (let i = 0; i < items.length; i++) {
      const cond = items[i].condition || "New";
      if (!validConditions.includes(cond))
        return error(res, `Row ${i + 1}: condition must be New, Good, Fair, Poor, Damaged, or Scrap.`, 400);
    }

    // ── Generate all QR codes in parallel ──────────────────────────────────
    const qrResults = await generateQRCodesBulk(items.length);

    // ── Build batch ID ──────────────────────────────────────────────────────
    const year  = new Date().getFullYear();
    const short = uuidv4().split("-")[0].toUpperCase();
    const batchId = `BULK-${year}-${short}`;

    // ── Merge common + per-item data ────────────────────────────────────────
    const fullItems = items.map((item, i) => ({
      assetName,
      description:         description || null,
      categoryId:          Number(categoryId),
      assetType:           assetType || null,
      locationId:          Number(locationId),
      departmentId:        Number(departmentId),
      purchaseDate,
      purchaseCost:        Number(purchaseCost),
      depreciationMethod:  depreciationMethod || null,
      usefulLifeYears:     usefulLifeYears ? Number(usefulLifeYears) : null,
      vendor:              vendor || null,
      invoiceNumber:       invoiceNumber || null,
      invoiceDate:         invoiceDate || null,
      scrapValue:          scrapValue ? Number(scrapValue) : null,
      warrantyExpiry:      warrantyExpiry || null,
      modelNumber:         modelNumber || null,
      brand:               brand || null,
      insurancePolicyNo:   insurancePolicyNo || null,
      insuranceCompany:    insuranceCompany || null,
      insuranceStartDate:  insuranceStartDate || null,
      insuranceExpiryDate: insuranceExpiryDate || null,
      insurancePremium:    insurancePremium ? Number(insurancePremium) : null,
      amcVendor:           amcVendor || null,
      amcContractNo:       amcContractNo || null,
      amcStartDate:        amcStartDate || null,
      amcExpiryDate:       amcExpiryDate || null,
      amcCost:             amcCost ? Number(amcCost) : null,
      serialNumber:        item.serialNumber || null,
      color:               item.color || null,
      condition:           item.condition || "New",
      qrToken:             qrResults[i].qrToken,
      qrCodeImagePath:     qrResults[i].qrCodeImagePath,
    }));

    // ── Bulk insert — single transaction ────────────────────────────────────
    const assets = await AssetModel.bulkCreate(fullItems, req.user.id, batchId);

    // ── Audit log ───────────────────────────────────────────────────────────
    const { ipAddress, userAgent } = getRequestMeta(req);
    await logAudit({
      userId:     req.user.id,
      userName:   req.user.full_name || req.user.email,
      userRole:   req.user.role,
      action:     "BULK_CREATE",
      entity:     "Asset",
      entityId:   null,
      entityCode: batchId,
      newValue: {
        count: assets.length, batchId,
        assetName, categoryId, locationId, departmentId,
        purchaseCost, firstCode: assets[0]?.asset_code,
        lastCode: assets[assets.length - 1]?.asset_code,
      },
      ipAddress,
      userAgent,
    });

    return success(res, {
      assets,
      batchId,
      count:     assets.length,
      firstCode: assets[0]?.asset_code,
      lastCode:  assets[assets.length - 1]?.asset_code,
    }, `${assets.length} assets registered successfully.`, 201);

  } catch (err) {
    return error(res, err.message);
  }
};