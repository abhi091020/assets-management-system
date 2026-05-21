// server/src/controllers/scan.controller.js

import sql from "mssql";
import { getPool } from "../config/db.js";
import { success, error } from "../utils/responseHelper.js";

export const getAssetByQRToken = async (req, res) => {
  const { token } = req.params;

  if (!token || typeof token !== "string" || token.trim().length === 0)
    return error(res, "Invalid QR token.", 400);

  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(token.trim()))
    return error(res, "Invalid QR token format.", 400);

  try {
    const pool = await getPool();

    // ── Main asset query ───────────────────────────────────────────────────
    const result = await pool
      .request()
      .input("qr_token", sql.NVarChar(100), token.trim())
      .query(`
        SELECT
          a.id,
          a.asset_code,
          a.asset_name,
          a.description,
          a.brand,
          a.model_number,
          a.serial_number,
          a.color,
          a.condition,
          a.status,
          a.qr_code_image_path,

          -- Purchase
          a.purchase_date,
          a.purchase_cost,
          a.vendor,
          a.invoice_number,
          a.warranty_expiry,

          -- AMC
          a.amc_vendor,
          a.amc_expiry_date,

          -- Insurance
          a.insurance_company,
          a.insurance_policy_no,
          a.insurance_expiry_date,

          -- Assignment
          a.assigned_at,

          c.category_name,

          l.location_name,
          l.city,
          l.state,

          d.dept_name,

          e.full_name     AS assigned_employee_name,
          e.employee_code AS assigned_employee_code,
          e.designation   AS assigned_employee_designation,
          e.email         AS assigned_employee_email

        FROM Assets a
        LEFT JOIN Categories  c ON c.id = a.category_id          AND c.is_deleted = 0
        LEFT JOIN Locations   l ON l.id = a.location_id          AND l.is_deleted = 0
        LEFT JOIN Departments d ON d.id = a.department_id        AND d.is_deleted = 0
        LEFT JOIN Employees   e ON e.id = a.assigned_employee_id AND e.is_deleted = 0
        WHERE a.qr_token = @qr_token AND a.is_deleted = 0
      `);

    if (!result.recordset?.length)
      return error(res, "Asset not found. This QR code may be invalid or the asset has been removed.", 404);

    const a = result.recordset[0];

    // ── Photos query ───────────────────────────────────────────────────────
    const photoResult = await pool
      .request()
      .input("asset_id", sql.Int, a.id)
      .query(`
        SELECT id, file_path, photo_type, caption
        FROM   AssetPhotos
        WHERE  asset_id = @asset_id
        ORDER  BY uploaded_at ASC
      `);

    // ── Shape response ─────────────────────────────────────────────────────
    const publicAsset = {
      id:              a.id,
      assetCode:       a.asset_code,
      assetName:       a.asset_name,
      description:     a.description    || null,
      brand:           a.brand          || null,
      modelNumber:     a.model_number   || null,
      serialNumber:    a.serial_number  || null,
      color:           a.color          || null,
      condition:       a.condition,
      status:          a.status,
      qrCodeImagePath: a.qr_code_image_path || null,

      // Purchase & warranty
      purchaseDate:   a.purchase_date        || null,
      purchaseCost:   a.purchase_cost        ?? null,
      vendor:         a.vendor               || null,
      invoiceNumber:  a.invoice_number       || null,
      warrantyExpiry: a.warranty_expiry      || null,

      // AMC
      amcVendor:      a.amc_vendor           || null,
      amcExpiryDate:  a.amc_expiry_date      || null,

      // Insurance
      insuranceCompany:    a.insurance_company     || null,
      insurancePolicyNo:   a.insurance_policy_no   || null,
      insuranceExpiryDate: a.insurance_expiry_date || null,

      category:   a.category_name || null,
      department: a.dept_name     || null,

      location: {
        name:  a.location_name || null,
        city:  a.city          || null,
        state: a.state         || null,
      },

      assignedAt: a.assigned_at || null,

      assignedTo: a.assigned_employee_name
        ? {
            name:        a.assigned_employee_name,
            code:        a.assigned_employee_code        || null,
            designation: a.assigned_employee_designation || null,
            email:       a.assigned_employee_email       || null,
          }
        : null,

      photos: photoResult.recordset.map((p) => ({
        id:        p.id,
        filePath:  p.file_path,
        photoType: p.photo_type,
        caption:   p.caption || null,
      })),
    };

    return success(res, publicAsset, "Asset details fetched successfully.");
  } catch (err) {
    console.error("[ScanController] getAssetByQRToken error:", err);
    return error(res, "Server error. Please try again.", 500);
  }
};