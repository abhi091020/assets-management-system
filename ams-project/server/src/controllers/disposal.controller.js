// server/src/controllers/disposal.controller.js
import { success, error } from "../utils/responseHelper.js";
import * as DisposalModel from "../models/Disposal.model.js";
import { logAudit, getRequestMeta } from "../utils/auditLogger.js";

const VALID_METHODS = ["Sold", "Scrapped", "Donated", "WriteOff"];

export async function raiseDisposal(req, res) {
  try {
    const {
      assetId,
      reason,
      disposalMethod,
      saleAmount,
      disposalDate,
      buyerDetails,
    } = req.body;
    if (!assetId) return error(res, "assetId is required", 400);
    if (!reason) return error(res, "reason is required", 400);
    if (!disposalMethod) return error(res, "disposalMethod is required", 400);
    if (!VALID_METHODS.includes(disposalMethod))
      return error(
        res,
        `disposalMethod must be one of: ${VALID_METHODS.join(", ")}`,
        400,
      );
    if (disposalMethod === "Sold" && !saleAmount)
      return error(res, "saleAmount is required for Sold disposal", 400);

    const disposal = await DisposalModel.raiseDisposal({
      assetId,
      reason,
      disposalMethod,
      saleAmount,
      disposalDate,
      buyerDetails,
      userId: req.user.id,
    });

    const { ipAddress, userAgent } = getRequestMeta(req);
    await logAudit({
      userId: req.user.id,
      userName: req.user.full_name || req.user.email,
      userRole: req.user.role,
      action: "CREATE",
      entity: "Disposal",
      entityId: disposal.id,
      entityCode: disposal.disposal_code,
      newValue: { assetId, disposalMethod, saleAmount, reason },
      ipAddress,
      userAgent,
    });

    return success(res, disposal, "Disposal raised successfully", 201);
  } catch (err) {
    return error(res, err.message);
  }
}

export async function getDisposals(req, res) {
  try {
    const { status, assetId, page, limit, pageSize } = req.query;
    // Accept both 'limit' and 'pageSize' from frontend
    const resolvedLimit = limit || pageSize;
    const data = await DisposalModel.getAllDisposals({
      status,
      assetId: assetId ? Number(assetId) : undefined,
      page: page ? Number(page) : 1,
      limit: resolvedLimit ? Number(resolvedLimit) : 20,
    });
    return success(res, data, "Disposals fetched");
  } catch (err) {
    return error(res, err.message);
  }
}

export async function getDisposalById(req, res) {
  try {
    const disposal = await DisposalModel.getDisposalById(Number(req.params.id));
    if (!disposal) return error(res, "Disposal not found", 404);
    return success(res, disposal, "Disposal fetched");
  } catch (err) {
    return error(res, err.message);
  }
}

export async function updateDisposal(req, res) {
  try {
    const { reason, disposalMethod, saleAmount, disposalDate, buyerDetails } =
      req.body;
    if (!reason) return error(res, "reason is required", 400);
    if (!disposalMethod) return error(res, "disposalMethod is required", 400);
    if (!VALID_METHODS.includes(disposalMethod))
      return error(
        res,
        `disposalMethod must be one of: ${VALID_METHODS.join(", ")}`,
        400,
      );
    if (disposalMethod === "Sold" && !saleAmount)
      return error(res, "saleAmount is required for Sold disposal", 400);

    const existing = await DisposalModel.getDisposalById(Number(req.params.id));
    const disposal = await DisposalModel.updateDisposal(Number(req.params.id), {
      reason,
      disposalMethod,
      saleAmount,
      disposalDate,
      buyerDetails,
      userId: req.user.id,
    });
    if (!disposal)
      return error(res, "Disposal not found or not in Pending state", 400);

    const { ipAddress, userAgent } = getRequestMeta(req);
    await logAudit({
      userId: req.user.id,
      userName: req.user.full_name || req.user.email,
      userRole: req.user.role,
      action: "UPDATE",
      entity: "Disposal",
      entityId: Number(req.params.id),
      entityCode: existing?.disposal_code,
      oldValue: {
        disposalMethod: existing?.disposal_method,
        saleAmount: existing?.sale_amount,
        reason: existing?.reason,
      },
      newValue: { disposalMethod, saleAmount, reason },
      ipAddress,
      userAgent,
    });

    return success(res, disposal, "Disposal updated successfully");
  } catch (err) {
    return error(res, err.message);
  }
}

export async function approveDisposal(req, res) {
  try {
    const existing = await DisposalModel.getDisposalById(Number(req.params.id));
    const disposal = await DisposalModel.approveDisposal(
      Number(req.params.id),
      req.user.id,
    );
    if (!disposal)
      return error(res, "Disposal not found or not in Pending state", 400);

    const { ipAddress, userAgent } = getRequestMeta(req);
    await logAudit({
      userId: req.user.id,
      userName: req.user.full_name || req.user.email,
      userRole: req.user.role,
      action: "APPROVE",
      entity: "Disposal",
      entityId: Number(req.params.id),
      entityCode: existing?.disposal_code,
      oldValue: { status: "Pending" },
      newValue: { status: "Approved" },
      ipAddress,
      userAgent,
    });

    return success(
      res,
      disposal,
      "Disposal approved — asset marked as Disposed",
    );
  } catch (err) {
    return error(res, err.message);
  }
}

export async function rejectDisposal(req, res) {
  try {
    const { rejectionReason } = req.body;
    const existing = await DisposalModel.getDisposalById(Number(req.params.id));
    const disposal = await DisposalModel.rejectDisposal(
      Number(req.params.id),
      rejectionReason,
      req.user.id,
    );
    // rejectDisposal now works on any status, remove the Pending-only error check
    if (!disposal) return error(res, "Disposal not found", 404);

    const { ipAddress, userAgent } = getRequestMeta(req);
    await logAudit({
      userId: req.user.id,
      userName: req.user.full_name || req.user.email,
      userRole: req.user.role,
      action: "REJECT",
      entity: "Disposal",
      entityId: Number(req.params.id),
      entityCode: existing?.disposal_code,
      newValue: { status: "Rejected", rejectionReason },
      ipAddress,
      userAgent,
    });

    return success(res, disposal, "Disposal rejected");
  } catch (err) {
    return error(res, err.message);
  }
}

export async function deleteDisposal(req, res) {
  try {
    const existing = await DisposalModel.getDisposalById(Number(req.params.id));
    await DisposalModel.deleteDisposal(Number(req.params.id), req.user.id);

    const { ipAddress, userAgent } = getRequestMeta(req);
    await logAudit({
      userId: req.user.id,
      userName: req.user.full_name || req.user.email,
      userRole: req.user.role,
      action: "DELETE",
      entity: "Disposal",
      entityId: Number(req.params.id),
      entityCode: existing?.disposal_code,
      oldValue: { status: existing?.status },
      ipAddress,
      userAgent,
    });

    return success(res, null, "Disposal deleted");
  } catch (err) {
    return error(res, err.message);
  }
}
