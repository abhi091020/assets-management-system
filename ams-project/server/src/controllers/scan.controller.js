// server/src/controllers/scan.controller.js

import sql from "mssql";
import { getPool } from "../config/db.js";
import { success, error } from "../utils/responseHelper.js";

export const getAssetByQRToken = async (req, res) => {
  const { token } = req.params;

  if (!token || typeof token !== "string" || token.trim().length === 0) {
    return error(res, "Invalid QR token.", 400);
  }

  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(token.trim())) {
    return error(res, "Invalid QR token format.", 400);
  }

  try {
    const pool = await getPool();

    const result = await pool
      .request()
      .input("qr_token", sql.NVarChar(100), token.trim()).query(`
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

          c.category_name,

          l.location_name,
          l.city,
          l.state,

          d.dept_name,

          e.full_name        AS assigned_employee_name,
          e.employee_code    AS assigned_employee_code,
          e.designation      AS assigned_employee_designation,
          e.email            AS assigned_employee_email

        FROM Assets a
        LEFT JOIN Categories   c ON c.id = a.category_id           AND c.is_deleted = 0
        LEFT JOIN Locations    l ON l.id = a.location_id           AND l.is_deleted = 0
        LEFT JOIN Departments  d ON d.id = a.department_id         AND d.is_deleted = 0
        LEFT JOIN Employees    e ON e.id = a.assigned_employee_id  AND e.is_deleted = 0

        WHERE a.qr_token = @qr_token AND a.is_deleted = 0
      `);

    if (!result.recordset || result.recordset.length === 0) {
      return error(
        res,
        "Asset not found. This QR code may be invalid or the asset has been removed.",
        404,
      );
    }

    const asset = result.recordset[0];

    const publicAsset = {
      id: asset.id,
      assetCode: asset.asset_code,
      assetName: asset.asset_name,
      description: asset.description || null,
      brand: asset.brand || null,
      modelNumber: asset.model_number || null,
      serialNumber: asset.serial_number || null,
      color: asset.color || null,
      condition: asset.condition,
      status: asset.status,
      qrCodeImagePath: asset.qr_code_image_path || null,

      category: asset.category_name || null,

      location: {
        name: asset.location_name || null,
        city: asset.city || null,
        state: asset.state || null,
      },

      department: asset.dept_name || null,

      assignedTo: asset.assigned_employee_name
        ? {
            name: asset.assigned_employee_name,
            code: asset.assigned_employee_code || null,
            designation: asset.assigned_employee_designation || null,
            email: asset.assigned_employee_email || null,
          }
        : null,
    };

    return success(res, publicAsset, "Asset details fetched successfully.");
  } catch (err) {
    console.error("[ScanController] getAssetByQRToken error:", err);
    return error(res, "Server error. Please try again.", 500);
  }
};
