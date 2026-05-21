// server/src/routes/asset.routes.js

import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { checkPermission } from "../middleware/rbac.middleware.js";
import upload from "../middleware/upload.middleware.js";
import { bulkCreateAssets } from "../controllers/asset.controller.js";
import {
  createAsset,
  getAssets,
  getAssetById,
  updateAsset,
  updateAssetStatus,
  deleteAsset,
  // ★ New
  assignEmployee,
  collectAsset,
  reassignEmployee,
  getAssignmentHistory,
  // Photos
  uploadPhoto,
  getPhotos,
  deletePhoto,
  // Expiring
  getExpiringAMC,
  getExpiringInsurance,
} from "../controllers/asset.controller.js";

const router = express.Router();

// ── Expiring AMC / Insurance ──────────────────────────────────────────────────
// IMPORTANT: Must stay BEFORE /:id routes
router.get(
  "/expiring-amc",
  protect,
  checkPermission("amc_tracker", "can_view"),
  getExpiringAMC,
);
router.get(
  "/expiring-insurance",
  protect,
  checkPermission("amc_tracker", "can_view"),
  getExpiringInsurance,
);

// ── Asset CRUD ────────────────────────────────────────────────────────────────
router.get(
  "/",
  protect,
  checkPermission("assets", "can_view"),
  getAssets,
);
router.post(
  "/",
  protect,
  checkPermission("assets", "can_add"),
  createAsset,
);
router.post(
  "/bulk",
  protect,
  checkPermission("assets", "can_add"),
  bulkCreateAssets,
);
router.get(
  "/:id",
  protect,
  checkPermission("assets", "can_view"),
  getAssetById,
);
router.put(
  "/:id",
  protect,
  checkPermission("assets", "can_edit"),
  updateAsset,
);
router.put(
  "/:id/status",
  protect,
  checkPermission("assets", "can_edit"),
  updateAssetStatus,
);
router.delete(
  "/:id",
  protect,
  checkPermission("assets", "can_delete"),
  deleteAsset,
);

// ── Assignment ────────────────────────────────────────────────────────────────
// POST /assets/:id/assign      → assign employee to unassigned asset
// POST /assets/:id/collect     → collect asset back from employee
// POST /assets/:id/reassign    → move asset directly from Emp1 → Emp2
// GET  /assets/:id/assignment-history → full history log
router.post(
  "/:id/assign",
  protect,
  checkPermission("assets", "can_edit"),
  assignEmployee,
);
router.post(
  "/:id/collect",
  protect,
  checkPermission("assets", "can_edit"),
  collectAsset,
);
router.post(
  "/:id/reassign",
  protect,
  checkPermission("assets", "can_edit"),
  reassignEmployee,
);
router.get(
  "/:id/assignment-history",
  protect,
  checkPermission("assets", "can_view"),
  getAssignmentHistory,
);

// ── Photos ────────────────────────────────────────────────────────────────────
router.get(
  "/:id/photos",
  protect,
  checkPermission("assets", "can_view"),
  getPhotos,
);
router.post(
  "/:id/photos",
  protect,
  checkPermission("assets", "can_edit"),
  upload.single("photo"),
  uploadPhoto,
);
router.delete(
  "/:id/photos/:photoId",
  protect,
  checkPermission("assets", "can_edit"),
  deletePhoto,
);

export default router;