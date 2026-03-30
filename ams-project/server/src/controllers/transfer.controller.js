// server/src/controllers/transfer.controller.js
import { success, error } from "../utils/responseHelper.js";
import * as TransferModel from "../models/Transfer.model.js";
import CategoryModel from "../models/Category.model.js";
import { logAudit, getRequestMeta } from "../utils/auditLogger.js";

// ── Guard: block transfers for Static assets ──────────────────────────────────
async function checkMovable(assetId, res) {
  const category = await CategoryModel.findByAssetId(assetId);
  if (category?.asset_type === "Static") {
    error(
      res,
      `This asset belongs to the "${category.category_name}" category which is classified as Static (Immovable). Static assets cannot be transferred.`,
      422,
    );
    return false;
  }
  return true;
}

export async function raiseTransfer(req, res) {
  try {
    const {
      assetId,
      fromLocationId,
      fromDepartmentId,
      fromEmployeeId,
      toLocationId,
      toDepartmentId,
      toEmployeeId,
      reason,
    } = req.body;

    if (!assetId) return error(res, "assetId is required", 400);
    if (!toLocationId) return error(res, "toLocationId is required", 400);
    if (!toDepartmentId) return error(res, "toDepartmentId is required", 400);

    // ── Block Static assets ───────────────────────────────────────────────
    if (!(await checkMovable(assetId, res))) return;

    const transfer = await TransferModel.raiseTransfer({
      assetId,
      fromLocationId,
      fromDepartmentId,
      fromEmployeeId,
      toLocationId,
      toDepartmentId,
      toEmployeeId,
      reason,
      userId: req.user.id,
    });

    const { ipAddress, userAgent } = getRequestMeta(req);
    await logAudit({
      userId: req.user.id,
      userName: req.user.full_name || req.user.email,
      userRole: req.user.role,
      action: "CREATE",
      entity: "Transfer",
      entityId: transfer.id,
      entityCode: transfer.transfer_code,
      newValue: { assetId, toLocationId, toDepartmentId, toEmployeeId, reason },
      ipAddress,
      userAgent,
    });

    return success(res, transfer, "Transfer raised successfully", 201);
  } catch (err) {
    return error(res, err.message);
  }
}

export async function getTransfers(req, res) {
  try {
    const { status, assetId, page, limit } = req.query;
    const data = await TransferModel.getAllTransfers({
      status,
      assetId: assetId ? Number(assetId) : undefined,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
    });
    return success(res, data, "Transfers fetched");
  } catch (err) {
    return error(res, err.message);
  }
}

export async function getTransferById(req, res) {
  try {
    const transfer = await TransferModel.getTransferById(Number(req.params.id));
    if (!transfer) return error(res, "Transfer not found", 404);
    return success(res, transfer, "Transfer fetched");
  } catch (err) {
    return error(res, err.message);
  }
}

export async function updateTransfer(req, res) {
  try {
    const { toLocationId, toDepartmentId, toEmployeeId, reason } = req.body;
    if (!toLocationId) return error(res, "toLocationId is required", 400);
    if (!toDepartmentId) return error(res, "toDepartmentId is required", 400);

    const existing = await TransferModel.getTransferById(Number(req.params.id));
    const transfer = await TransferModel.updateTransfer(Number(req.params.id), {
      toLocationId,
      toDepartmentId,
      toEmployeeId,
      reason,
      userId: req.user.id,
    });
    if (!transfer)
      return error(res, "Transfer not found or not in Pending state", 400);

    const { ipAddress, userAgent } = getRequestMeta(req);
    await logAudit({
      userId: req.user.id,
      userName: req.user.full_name || req.user.email,
      userRole: req.user.role,
      action: "UPDATE",
      entity: "Transfer",
      entityId: Number(req.params.id),
      entityCode: existing?.transfer_code,
      oldValue: {
        toLocationId: existing?.to_location_id,
        toDepartmentId: existing?.to_department_id,
        reason: existing?.reason,
      },
      newValue: { toLocationId, toDepartmentId, toEmployeeId, reason },
      ipAddress,
      userAgent,
    });

    return success(res, transfer, "Transfer updated successfully");
  } catch (err) {
    return error(res, err.message);
  }
}

export async function approveTransfer(req, res) {
  try {
    const existing = await TransferModel.getTransferById(Number(req.params.id));
    const transfer = await TransferModel.approveTransfer(
      Number(req.params.id),
      req.user.id,
    );
    if (!transfer)
      return error(res, "Transfer not found or not in Pending state", 400);

    const { ipAddress, userAgent } = getRequestMeta(req);
    await logAudit({
      userId: req.user.id,
      userName: req.user.full_name || req.user.email,
      userRole: req.user.role,
      action: "APPROVE",
      entity: "Transfer",
      entityId: Number(req.params.id),
      entityCode: existing?.transfer_code,
      oldValue: { status: "Pending" },
      newValue: { status: "Approved" },
      ipAddress,
      userAgent,
    });

    return success(res, transfer, "Transfer approved — asset location updated");
  } catch (err) {
    return error(res, err.message);
  }
}

export async function rejectTransfer(req, res) {
  try {
    const { rejectionReason } = req.body;
    const existing = await TransferModel.getTransferById(Number(req.params.id));
    const transfer = await TransferModel.rejectTransfer(
      Number(req.params.id),
      rejectionReason,
      req.user.id,
    );
    if (!transfer)
      return error(res, "Transfer not found or not in Pending state", 400);

    const { ipAddress, userAgent } = getRequestMeta(req);
    await logAudit({
      userId: req.user.id,
      userName: req.user.full_name || req.user.email,
      userRole: req.user.role,
      action: "REJECT",
      entity: "Transfer",
      entityId: Number(req.params.id),
      entityCode: existing?.transfer_code,
      newValue: { status: "Rejected", rejectionReason },
      ipAddress,
      userAgent,
    });

    return success(res, transfer, "Transfer rejected");
  } catch (err) {
    return error(res, err.message);
  }
}

export async function deleteTransfer(req, res) {
  try {
    const existing = await TransferModel.getTransferById(Number(req.params.id));
    await TransferModel.deleteTransfer(Number(req.params.id), req.user.id);

    const { ipAddress, userAgent } = getRequestMeta(req);
    await logAudit({
      userId: req.user.id,
      userName: req.user.full_name || req.user.email,
      userRole: req.user.role,
      action: "DELETE",
      entity: "Transfer",
      entityId: Number(req.params.id),
      entityCode: existing?.transfer_code,
      oldValue: { status: existing?.status },
      ipAddress,
      userAgent,
    });

    return success(res, null, "Transfer deleted");
  } catch (err) {
    return error(res, err.message);
  }
}
