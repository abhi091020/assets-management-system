// server/src/controllers/depreciation.controller.js

import DepreciationModel from "../models/Depreciation.model.js";
import { getCurrentFY } from "../utils/depreciationEngine.js";
import { success, error } from "../utils/responseHelper.js";
import { logAudit, getRequestMeta } from "../utils/auditLogger.js";

// ── Get Current FY ────────────────────────────────────────────────────────────
export const getCurrentFYHandler = async (req, res) => {
  try {
    return success(
      res,
      { financialYear: getCurrentFY() },
      "Current FY fetched.",
    );
  } catch (err) {
    return error(res, err.message);
  }
};

// ── Get Summary (paginated) ───────────────────────────────────────────────────
export const getSummary = async (req, res) => {
  try {
    const {
      fy,
      method,
      categoryId,
      locationId,
      departmentId,
      search,
      page,
      pageSize,
    } = req.query;

    const data = await DepreciationModel.getSummary({
      fy,
      method,
      categoryId,
      locationId,
      departmentId,
      search,
      page,
      pageSize,
    });

    return success(res, data, "Depreciation summary fetched.");
  } catch (err) {
    return error(res, err.message);
  }
};

// ── Get Ledger for One Asset ──────────────────────────────────────────────────
export const getLedger = async (req, res) => {
  try {
    const assetId = parseInt(req.params.assetId);
    if (!assetId) return error(res, "Invalid asset ID.", 400);

    const data = await DepreciationModel.getLedger(assetId);
    return success(res, data, "Depreciation ledger fetched.");
  } catch (err) {
    return error(res, err.message);
  }
};

// ── Run For Single Asset ──────────────────────────────────────────────────────
export const runForAsset = async (req, res) => {
  try {
    const assetId = parseInt(req.params.assetId);
    if (!assetId) return error(res, "Invalid asset ID.", 400);

    const { method, rate, usefulLifeYears, fy } = req.body;

    // Validations
    if (!method || !["SLM", "WDV"].includes(method))
      return error(res, "method must be SLM or WDV.", 400);
    if (!rate || isNaN(rate) || Number(rate) <= 0 || Number(rate) >= 100)
      return error(res, "rate must be a number between 0 and 100.", 400);
    if (method === "SLM" && (!usefulLifeYears || Number(usefulLifeYears) <= 0))
      return error(res, "usefulLifeYears is required for SLM.", 400);

    const result = await DepreciationModel.runForAsset({
      assetId,
      method,
      rate: Number(rate),
      usefulLifeYears: usefulLifeYears ? Number(usefulLifeYears) : null,
      fy: fy || getCurrentFY(),
      createdBy: req.user.id,
    });

    // ─── Audit Log ──────────────────────────────────────────────────────────
    const { ipAddress, userAgent } = getRequestMeta(req);
    await logAudit({
      userId: req.user.id,
      userName: req.user.full_name || req.user.email,
      userRole: req.user.role,
      action: "CREATE",
      entity: "Depreciation",
      entityId: assetId,
      entityCode: result.assetCode,
      newValue: {
        method,
        rate,
        fy: fy || getCurrentFY(),
        depreciationAmount: result.depreciation_amount,
      },
      ipAddress,
      userAgent,
    });

    return success(res, result, "Depreciation run successfully.");
  } catch (err) {
    return error(res, err.message);
  }
};

// ── Run For All Assets ────────────────────────────────────────────────────────
export const runForAll = async (req, res) => {
  try {
    const { method, rate, usefulLifeYears, fy } = req.body;

    // Validations
    if (!method || !["SLM", "WDV"].includes(method))
      return error(res, "method must be SLM or WDV.", 400);
    if (!rate || isNaN(rate) || Number(rate) <= 0 || Number(rate) >= 100)
      return error(res, "rate must be a number between 0 and 100.", 400);
    if (method === "SLM" && (!usefulLifeYears || Number(usefulLifeYears) <= 0))
      return error(res, "usefulLifeYears is required for SLM.", 400);

    const result = await DepreciationModel.runForAll({
      method,
      rate: Number(rate),
      usefulLifeYears: usefulLifeYears ? Number(usefulLifeYears) : null,
      fy: fy || getCurrentFY(),
      createdBy: req.user.id,
    });

    // ─── Audit Log ──────────────────────────────────────────────────────────
    const { ipAddress, userAgent } = getRequestMeta(req);
    await logAudit({
      userId: req.user.id,
      userName: req.user.full_name || req.user.email,
      userRole: req.user.role,
      action: "CREATE",
      entity: "Depreciation",
      entityId: null,
      entityCode: "BULK",
      newValue: {
        method,
        rate,
        fy: fy || getCurrentFY(),
        totalAssets: result.totalAssets,
        success: result.success,
        failed: result.failed,
      },
      ipAddress,
      userAgent,
    });

    return success(
      res,
      result,
      `Depreciation run complete. ${result.success} succeeded, ${result.failed} failed.`,
    );
  } catch (err) {
    return error(res, err.message);
  }
};
