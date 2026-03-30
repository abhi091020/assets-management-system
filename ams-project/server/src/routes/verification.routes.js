// server/src/routes/verification.routes.js
import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { checkPermission } from "../middleware/rbac.middleware.js";
import * as ctrl from "../controllers/verification.controller.js";

const router = express.Router();

router.use(protect);

// ── BATCHES ───────────────────────────────────────────────────
router.get(
  "/batches",
  checkPermission("verification", "can_view"),
  ctrl.getBatches,
);
router.get(
  "/batches/:id",
  checkPermission("verification", "can_view"),
  ctrl.getBatchById,
);
router.post(
  "/batches",
  checkPermission("verification", "can_add"),
  ctrl.createBatch,
);
router.put(
  "/batches/:id/close",
  checkPermission("verification", "can_edit"),
  ctrl.closeBatch,
);
router.put(
  "/batches/:id/reopen",
  checkPermission("verification", "can_approve"),
  ctrl.reopenBatch,
);
router.delete(
  "/batches/:id",
  checkPermission("verification", "can_delete"),
  ctrl.deleteBatch,
);

// ── ITEMS ─────────────────────────────────────────────────────
router.get(
  "/batches/:id/items",
  checkPermission("verification", "can_view"),
  ctrl.getItems,
);
router.post(
  "/batches/:id/items",
  checkPermission("verification", "can_add"),
  ctrl.addItem,
);
router.put(
  "/items/:itemId/verify",
  checkPermission("verification", "can_edit"),
  ctrl.verifyItem,
);
router.delete(
  "/items/:itemId",
  checkPermission("verification", "can_delete"),
  ctrl.removeItem,
);

export default router;
