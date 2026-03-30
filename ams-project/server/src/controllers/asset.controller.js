// server/src/controllers/asset.controller.js

import AssetModel from "../models/Asset.model.js";
import { generateAssetCode } from "../utils/assetCodeGen.js";
import { generateQRCode } from "../utils/qrGenerator.js";
import { success, error } from "../utils/responseHelper.js";
import { logAudit, getRequestMeta } from "../utils/auditLogger.js";
import { getPool } from "../config/db.js";
import fs from "fs";
import path from "path";

// ── Create Asset ─────────────────────────────────────────────────────────────
export const createAsset = async (req, res) => {
  try {
    const {
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
    } = req.body;

    if (!assetName) return error(res, "Asset name is required.", 400);
    if (!categoryId) return error(res, "Category is required.", 400);
    if (!locationId) return error(res, "Location is required.", 400);
    if (!departmentId) return error(res, "Department is required.", 400);
    if (!purchaseDate) return error(res, "Purchase date is required.", 400);
    if (!purchaseCost) return error(res, "Purchase cost is required.", 400);

    const validConditions = ["New", "Good", "Fair", "Poor", "Scrap"];
    if (condition && !validConditions.includes(condition))
      return error(
        res,
        "condition must be: New, Good, Fair, Poor, or Scrap.",
        400,
      );

    const assetCode = await generateAssetCode();
    const { qrToken, qrCodeImagePath } = await generateQRCode();

    const asset = await AssetModel.create({
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
      currentBookValue: purchaseCost,
      scrapValue,
      warrantyExpiry,
      serialNumber,
      modelNumber,
      brand,
      color,
      condition: condition || "New",
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
      createdBy: req.user.id,
    });

    // ─── Audit Log ────────────────────────────────────────────────────────────
    const { ipAddress, userAgent } = getRequestMeta(req);
    await logAudit({
      userId: req.user.id,
      userName: req.user.full_name || req.user.email,
      userRole: req.user.role,
      action: "CREATE",
      entity: "Asset",
      entityId: asset.id,
      entityCode: assetCode,
      newValue: {
        assetName,
        categoryId,
        locationId,
        departmentId,
        purchaseCost,
        condition: condition || "New",
      },
      ipAddress,
      userAgent,
    });

    return success(res, asset, "Asset created successfully.", 201);
  } catch (err) {
    return error(res, err.message);
  }
};

// ── Get All Assets ───────────────────────────────────────────────────────────
export const getAssets = async (req, res) => {
  try {
    const {
      search,
      categoryId,
      locationId,
      departmentId,
      status,
      condition,
      assignedEmployeeId,
      fromDate,
      toDate,
      page,
      limit,
      sortBy,
      sortOrder,
    } = req.query;

    const data = await AssetModel.findAll({
      search,
      categoryId,
      locationId,
      departmentId,
      status,
      condition,
      assignedEmployeeId,
      fromDate,
      toDate,
      page,
      limit,
      sortBy,
      sortOrder,
    });

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
    } = req.body;

    if (!assetName) return error(res, "Asset name is required.", 400);
    if (!categoryId) return error(res, "Category is required.", 400);
    if (!locationId) return error(res, "Location is required.", 400);
    if (!departmentId) return error(res, "Department is required.", 400);
    if (!purchaseDate) return error(res, "Purchase date is required.", 400);
    if (!purchaseCost) return error(res, "Purchase cost is required.", 400);

    const existing = await AssetModel.findById(parseInt(req.params.id));
    if (!existing) return error(res, "Asset not found.", 404);

    const asset = await AssetModel.update(parseInt(req.params.id), {
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
      updatedBy: req.user.id,
    });

    if (!asset) return error(res, "Asset not found.", 404);

    // ─── Audit Log ────────────────────────────────────────────────────────────
    const { ipAddress, userAgent } = getRequestMeta(req);
    await logAudit({
      userId: req.user.id,
      userName: req.user.full_name || req.user.email,
      userRole: req.user.role,
      action: "UPDATE",
      entity: "Asset",
      entityId: parseInt(req.params.id),
      entityCode: existing.asset_code,
      oldValue: {
        assetName: existing.asset_name,
        locationId: existing.location_id,
        departmentId: existing.department_id,
        condition: existing.condition,
        purchaseCost: existing.purchase_cost,
      },
      newValue: {
        assetName,
        locationId,
        departmentId,
        condition,
        purchaseCost,
      },
      ipAddress,
      userAgent,
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
    const validStatuses = [
      "Active",
      "InRepair",
      "InTransit",
      "Disposed",
      "Missing",
    ];
    if (!status || !validStatuses.includes(status))
      return error(
        res,
        "status must be: Active, InRepair, InTransit, Disposed, or Missing.",
        400,
      );

    const existing = await AssetModel.findById(parseInt(req.params.id));
    if (!existing) return error(res, "Asset not found.", 404);

    const asset = await AssetModel.updateStatus(
      parseInt(req.params.id),
      status,
      statusReason,
      req.user.id,
    );
    if (!asset) return error(res, "Asset not found.", 404);

    // ─── Audit Log ────────────────────────────────────────────────────────────
    const { ipAddress, userAgent } = getRequestMeta(req);
    await logAudit({
      userId: req.user.id,
      userName: req.user.full_name || req.user.email,
      userRole: req.user.role,
      action: "UPDATE",
      entity: "Asset",
      entityId: parseInt(req.params.id),
      entityCode: existing.asset_code,
      oldValue: { status: existing.status },
      newValue: { status, statusReason },
      ipAddress,
      userAgent,
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

    const result = await AssetModel.softDelete(
      parseInt(req.params.id),
      req.user.id,
    );
    if (!result) return error(res, "Asset not found.", 404);

    // ─── Audit Log ────────────────────────────────────────────────────────────
    const { ipAddress, userAgent } = getRequestMeta(req);
    await logAudit({
      userId: req.user.id,
      userName: req.user.full_name || req.user.email,
      userRole: req.user.role,
      action: "DELETE",
      entity: "Asset",
      entityId: parseInt(req.params.id),
      entityCode: existing.asset_code,
      oldValue: { assetName: existing.asset_name, status: existing.status },
      ipAddress,
      userAgent,
    });

    return success(res, null, "Asset deleted successfully.");
  } catch (err) {
    return error(res, err.message);
  }
};

// ── Upload Photo ─────────────────────────────────────────────────────────────
export const uploadPhoto = async (req, res) => {
  try {
    if (!req.file) return error(res, "No file uploaded.", 400);

    const assetId = parseInt(req.params.id);
    const asset = await AssetModel.findById(assetId);
    if (!asset) {
      fs.unlinkSync(req.file.path);
      return error(res, "Asset not found.", 404);
    }

    const { photoType, caption } = req.body;
    const validTypes = [
      "AssetPhoto",
      "InvoiceScan",
      "DamagePhoto",
      "VerificationPhoto",
    ];
    if (photoType && !validTypes.includes(photoType))
      return error(
        res,
        "photoType must be: AssetPhoto, InvoiceScan, DamagePhoto, or VerificationPhoto.",
        400,
      );

    const fileSizeKb = Math.round(req.file.size / 1024);
    const filePath = req.file.path.replace(/\\/g, "/");

    const photo = await AssetModel.addPhoto({
      assetId,
      fileName: req.file.filename,
      filePath,
      photoType: photoType || "AssetPhoto",
      caption,
      fileSizeKb,
      uploadedBy: req.user.id,
    });

    // ─── Audit Log ────────────────────────────────────────────────────────────
    const { ipAddress, userAgent } = getRequestMeta(req);
    await logAudit({
      userId: req.user.id,
      userName: req.user.full_name || req.user.email,
      userRole: req.user.role,
      action: "UPDATE",
      entity: "Asset",
      entityId: assetId,
      entityCode: asset.asset_code,
      newValue: {
        action: "Photo uploaded",
        photoType: photoType || "AssetPhoto",
        fileName: req.file.filename,
      },
      ipAddress,
      userAgent,
    });

    return success(res, photo, "Photo uploaded successfully.", 201);
  } catch (err) {
    return error(res, err.message);
  }
};

// ── Get Photos ───────────────────────────────────────────────────────────────
export const getPhotos = async (req, res) => {
  try {
    const photos = await AssetModel.getPhotos(parseInt(req.params.id));
    return success(res, photos, "Photos fetched successfully.");
  } catch (err) {
    return error(res, err.message);
  }
};

// ── Delete Photo ─────────────────────────────────────────────────────────────
export const deletePhoto = async (req, res) => {
  try {
    const { id: assetId, photoId } = req.params;
    const photo = await AssetModel.deletePhoto(
      parseInt(photoId),
      parseInt(assetId),
    );
    if (!photo) return error(res, "Photo not found.", 404);

    if (fs.existsSync(photo.file_path)) fs.unlinkSync(photo.file_path);

    // ─── Audit Log ────────────────────────────────────────────────────────────
    const asset = await AssetModel.findById(parseInt(assetId));
    const { ipAddress, userAgent } = getRequestMeta(req);
    await logAudit({
      userId: req.user.id,
      userName: req.user.full_name || req.user.email,
      userRole: req.user.role,
      action: "DELETE",
      entity: "Asset",
      entityId: parseInt(assetId),
      entityCode: asset?.asset_code || null,
      oldValue: { action: "Photo deleted", fileName: photo.file_name },
      ipAddress,
      userAgent,
    });

    return success(res, null, "Photo deleted successfully.");
  } catch (err) {
    return error(res, err.message);
  }
};

// ── Get Expiring AMC ─────────────────────────────────────────────────────────
export const getExpiringAMC = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 20;
    const offset = (page - 1) * pageSize;

    const pool = getPool();

    const dateFilter =
      days === 0
        ? `AND a.amc_expiry_date IS NOT NULL`
        : `AND a.amc_expiry_date IS NOT NULL
           AND a.amc_expiry_date <= DATEADD(DAY, ${days}, CAST(GETDATE() AS DATE))`;

    const countRes = await pool.request().query(`
      SELECT COUNT(*) AS total
      FROM Assets a
      WHERE a.is_deleted = 0 AND a.status != 'Disposed'
      ${dateFilter}
    `);
    const total = countRes.recordset[0].total;

    const dataRes = await pool.request().query(`
      SELECT
        a.id, a.asset_code, a.asset_name, a.status,
        a.amc_vendor, a.amc_expiry_date,
        DATEDIFF(DAY, CAST(GETDATE() AS DATE), a.amc_expiry_date) AS days_remaining,
        c.category_name, l.location_name, d.dept_name,
        e.full_name AS employee_name, e.employee_code
      FROM Assets a
      LEFT JOIN Categories  c ON a.category_id         = c.id
      LEFT JOIN Locations   l ON a.location_id          = l.id
      LEFT JOIN Departments d ON a.department_id        = d.id
      LEFT JOIN Employees   e ON a.assigned_employee_id = e.id
      WHERE a.is_deleted = 0 AND a.status != 'Disposed'
      ${dateFilter}
      ORDER BY a.amc_expiry_date ASC
      OFFSET ${offset} ROWS FETCH NEXT ${pageSize} ROWS ONLY
    `);

    return success(
      res,
      {
        data: dataRes.recordset,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
        days,
      },
      "Expiring AMC assets fetched.",
    );
  } catch (err) {
    return error(res, err.message);
  }
};

// ── Get Expiring Insurance ────────────────────────────────────────────────────
export const getExpiringInsurance = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 20;
    const offset = (page - 1) * pageSize;

    const pool = getPool();

    const dateFilter =
      days === 0
        ? `AND a.insurance_expiry_date IS NOT NULL`
        : `AND a.insurance_expiry_date IS NOT NULL
           AND a.insurance_expiry_date <= DATEADD(DAY, ${days}, CAST(GETDATE() AS DATE))`;

    const countRes = await pool.request().query(`
      SELECT COUNT(*) AS total
      FROM Assets a
      WHERE a.is_deleted = 0 AND a.status != 'Disposed'
      ${dateFilter}
    `);
    const total = countRes.recordset[0].total;

    const dataRes = await pool.request().query(`
      SELECT
        a.id, a.asset_code, a.asset_name, a.status,
        a.insurance_policy_no, a.insurance_company, a.insurance_expiry_date,
        DATEDIFF(DAY, CAST(GETDATE() AS DATE), a.insurance_expiry_date) AS days_remaining,
        c.category_name, l.location_name, d.dept_name,
        e.full_name AS employee_name, e.employee_code
      FROM Assets a
      LEFT JOIN Categories  c ON a.category_id         = c.id
      LEFT JOIN Locations   l ON a.location_id          = l.id
      LEFT JOIN Departments d ON a.department_id        = d.id
      LEFT JOIN Employees   e ON a.assigned_employee_id = e.id
      WHERE a.is_deleted = 0 AND a.status != 'Disposed'
      ${dateFilter}
      ORDER BY a.insurance_expiry_date ASC
      OFFSET ${offset} ROWS FETCH NEXT ${pageSize} ROWS ONLY
    `);

    return success(
      res,
      {
        data: dataRes.recordset,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
        days,
      },
      "Expiring insurance assets fetched.",
    );
  } catch (err) {
    return error(res, err.message);
  }
};
