// server/src/routes/asset.routes.js

import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { checkPermission } from "../middleware/rbac.middleware.js";
import upload from "../middleware/upload.middleware.js";
import {
  createAsset,
  getAssets,
  getAssetById,
  updateAsset,
  updateAssetStatus,
  deleteAsset,
  uploadPhoto,
  getPhotos,
  deletePhoto,
  getExpiringAMC,
  getExpiringInsurance,
} from "../controllers/asset.controller.js";

const router = express.Router();

// ── Expiring AMC / Insurance ──────────────────────────────────
// IMPORTANT: These must be defined BEFORE /:id routes to avoid
// Express matching "expiring-amc" as an :id param
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

// ── Asset CRUD ────────────────────────────────────────────────
router.get("/", protect, checkPermission("assets", "can_view"), getAssets);
router.get(
  "/:id",
  protect,
  checkPermission("assets", "can_view"),
  getAssetById,
);
router.post("/", protect, checkPermission("assets", "can_add"), createAsset);
router.put("/:id", protect, checkPermission("assets", "can_edit"), updateAsset);
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

// ── Photos ────────────────────────────────────────────────────
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
