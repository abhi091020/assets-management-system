// server/src/routes/transfer.routes.js
import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { checkPermission } from "../middleware/rbac.middleware.js";
import * as ctrl from "../controllers/transfer.controller.js";

const router = express.Router();

router.use(protect);

router.get("/", checkPermission("transfers", "can_view"), ctrl.getTransfers);
router.get(
  "/:id",
  checkPermission("transfers", "can_view"),
  ctrl.getTransferById,
);
router.post("/", checkPermission("transfers", "can_add"), ctrl.raiseTransfer);
router.put(
  "/:id",
  checkPermission("transfers", "can_edit"),
  ctrl.updateTransfer,
);

router.put(
  "/:id/approve",
  checkPermission("transfers", "can_approve"),
  ctrl.approveTransfer,
);
router.put(
  "/:id/reject",
  checkPermission("transfers", "can_approve"),
  ctrl.rejectTransfer,
);
router.delete(
  "/:id",
  checkPermission("transfers", "can_delete"),
  ctrl.deleteTransfer,
);

export default router;
