// server/src/routes/depreciation.routes.js

import express from "express";
import {
  getCurrentFYHandler,
  getSummary,
  getLedger,
  runForAsset,
  runForAll,
} from "../controllers/depreciation.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { checkPermission } from "../middleware/rbac.middleware.js";

const router = express.Router();

// All routes require authentication
router.use(protect);

// ── GET /api/depreciation/current-fy ─────────────────────────────────────────
// Any authenticated user — used by frontend to pre-fill FY selector
router.get("/current-fy", getCurrentFYHandler);

// ── GET /api/depreciation/summary ────────────────────────────────────────────
// Paginated summary — can_view
router.get("/summary", checkPermission("depreciation", "can_view"), getSummary);

// ── GET /api/depreciation/ledger/:assetId ────────────────────────────────────
// Full ledger for one asset — can_view
router.get(
  "/ledger/:assetId",
  checkPermission("depreciation", "can_view"),
  getLedger,
);

// ── POST /api/depreciation/run ───────────────────────────────────────────────
// Run for ALL assets — Admin only via can_add
router.post("/run", checkPermission("depreciation", "can_add"), runForAll);

// ── POST /api/depreciation/run/:assetId ──────────────────────────────────────
// Run for single asset — can_add
router.post(
  "/run/:assetId",
  checkPermission("depreciation", "can_add"),
  runForAsset,
);

export default router;
