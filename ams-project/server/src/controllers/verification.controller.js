// server/src/controllers/verification.controller.js
import { success, error } from "../utils/responseHelper.js";
import * as BatchModel from "../models/VerificationBatch.model.js";
import * as ItemModel from "../models/VerificationItem.model.js";
import { logAudit, getRequestMeta } from "../utils/auditLogger.js";

export async function createBatch(req, res) {
  try {
    const { title, locationId, departmentId, remarks } = req.body;
    if (!title?.trim()) return error(res, "Batch title is required", 400);

    // ── Duplicate title check ──────────────────────────────────────────────
    const duplicate = await BatchModel.findBatchByTitle(title.trim());
    if (duplicate) {
      return error(res, `A batch named "${title.trim()}" already exists`, 409);
    }

    const batch = await BatchModel.createBatch({
      title: title.trim(),
      locationId,
      departmentId,
      remarks,
      userId: req.user.id,
    });

    const { ipAddress, userAgent } = getRequestMeta(req);
    await logAudit({
      userId: req.user.id,
      userName: req.user.full_name || req.user.email,
      userRole: req.user.role,
      action: "CREATE",
      entity: "Verification",
      entityId: batch.id,
      entityCode: batch.batch_code,
      newValue: { title, locationId, departmentId },
      ipAddress,
      userAgent,
    });

    return success(res, batch, "Verification batch created", 201);
  } catch (err) {
    return error(res, err.message);
  }
}

export async function getBatches(req, res) {
  try {
    const { status, locationId, departmentId, page, limit } = req.query;
    const data = await BatchModel.getAllBatches({
      status,
      locationId: locationId ? Number(locationId) : undefined,
      departmentId: departmentId ? Number(departmentId) : undefined,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
    });
    return success(res, data, "Batches fetched");
  } catch (err) {
    return error(res, err.message);
  }
}

export async function getBatchById(req, res) {
  try {
    const batch = await BatchModel.getBatchById(Number(req.params.id));
    if (!batch) return error(res, "Batch not found", 404);
    return success(res, batch, "Batch fetched");
  } catch (err) {
    return error(res, err.message);
  }
}

export async function closeBatch(req, res) {
  try {
    const existing = await BatchModel.getBatchById(Number(req.params.id));
    const batch = await BatchModel.closeBatch(
      Number(req.params.id),
      req.user.id,
    );
    if (!batch) return error(res, "Batch not found or already closed", 400);

    const { ipAddress, userAgent } = getRequestMeta(req);
    await logAudit({
      userId: req.user.id,
      userName: req.user.full_name || req.user.email,
      userRole: req.user.role,
      action: "CLOSE",
      entity: "Verification",
      entityId: Number(req.params.id),
      entityCode: existing?.batch_code,
      oldValue: { status: "Open" },
      newValue: { status: "Closed" },
      ipAddress,
      userAgent,
    });

    return success(res, batch, "Batch closed successfully");
  } catch (err) {
    return error(res, err.message);
  }
}

export async function reopenBatch(req, res) {
  try {
    const existing = await BatchModel.getBatchById(Number(req.params.id));
    if (!existing) return error(res, "Batch not found", 404);
    if (existing.status !== "Closed")
      return error(res, "Only closed batches can be re-opened", 400);

    const batch = await BatchModel.reopenBatch(
      Number(req.params.id),
      req.user.id,
    );

    const { ipAddress, userAgent } = getRequestMeta(req);
    await logAudit({
      userId: req.user.id,
      userName: req.user.full_name || req.user.email,
      userRole: req.user.role,
      action: "UPDATE",
      entity: "Verification",
      entityId: Number(req.params.id),
      entityCode: existing?.batch_code,
      oldValue: { status: "Closed" },
      newValue: { status: "Open" },
      ipAddress,
      userAgent,
    });

    return success(res, batch, "Batch re-opened successfully");
  } catch (err) {
    return error(res, err.message);
  }
}

export async function deleteBatch(req, res) {
  try {
    const existing = await BatchModel.getBatchById(Number(req.params.id));
    await BatchModel.deleteBatch(Number(req.params.id), req.user.id);

    const { ipAddress, userAgent } = getRequestMeta(req);
    await logAudit({
      userId: req.user.id,
      userName: req.user.full_name || req.user.email,
      userRole: req.user.role,
      action: "DELETE",
      entity: "Verification",
      entityId: Number(req.params.id),
      entityCode: existing?.batch_code,
      oldValue: { title: existing?.title, status: existing?.status },
      ipAddress,
      userAgent,
    });

    return success(res, null, "Batch deleted");
  } catch (err) {
    return error(res, err.message);
  }
}

export async function addItem(req, res) {
  try {
    const batchId = Number(req.params.id);
    const { assetId } = req.body;
    if (!assetId) return error(res, "assetId is required", 400);

    const batch = await BatchModel.getBatchById(batchId);
    if (!batch) return error(res, "Batch not found", 404);
    if (batch.status !== "Open")
      return error(res, "Cannot add items to a closed batch", 400);

    const item = await ItemModel.addItemToBatch({
      batchId,
      assetId,
      userId: req.user.id,
    });

    const { ipAddress, userAgent } = getRequestMeta(req);
    await logAudit({
      userId: req.user.id,
      userName: req.user.full_name || req.user.email,
      userRole: req.user.role,
      action: "UPDATE",
      entity: "Verification",
      entityId: batchId,
      entityCode: batch?.batch_code,
      newValue: { action: "Asset added", assetId },
      ipAddress,
      userAgent,
    });

    return success(res, item, "Asset added to batch", 201);
  } catch (err) {
    if (err.message?.includes("uq_batch_asset"))
      return error(res, "Asset is already in this batch", 409);
    return error(res, err.message);
  }
}

export async function getItems(req, res) {
  try {
    const items = await ItemModel.getItemsByBatch(Number(req.params.id));
    return success(res, items, "Items fetched");
  } catch (err) {
    return error(res, err.message);
  }
}

export async function verifyItem(req, res) {
  try {
    const { status, conditionFound, remarks } = req.body;
    if (!status) return error(res, "status is required", 400);
    if (!["Verified", "NotFound", "Pending"].includes(status))
      return error(res, "status must be Verified, NotFound or Pending", 400);

    const item = await ItemModel.verifyItem({
      itemId: Number(req.params.itemId),
      status,
      conditionFound: status === "Pending" ? null : conditionFound || null,
      remarks: status === "Pending" ? null : remarks?.trim() || null,
      userId: status === "Pending" ? null : req.user.id,
      updatedBy: req.user.id,
    });
    if (!item) return error(res, "Item not found", 404);

    const { ipAddress, userAgent } = getRequestMeta(req);
    await logAudit({
      userId: req.user.id,
      userName: req.user.full_name || req.user.email,
      userRole: req.user.role,
      action: "VERIFY",
      entity: "Verification",
      entityId: Number(req.params.itemId),
      newValue: { status, conditionFound, remarks },
      ipAddress,
      userAgent,
    });

    return success(res, item, "Item updated");
  } catch (err) {
    return error(res, err.message);
  }
}

export async function removeItem(req, res) {
  try {
    await ItemModel.removeItemFromBatch(Number(req.params.itemId), req.user.id);

    const { ipAddress, userAgent } = getRequestMeta(req);
    await logAudit({
      userId: req.user.id,
      userName: req.user.full_name || req.user.email,
      userRole: req.user.role,
      action: "DELETE",
      entity: "Verification",
      entityId: Number(req.params.itemId),
      newValue: { action: "Item removed from batch" },
      ipAddress,
      userAgent,
    });

    return success(res, null, "Item removed from batch");
  } catch (err) {
    return error(res, err.message);
  }
}
