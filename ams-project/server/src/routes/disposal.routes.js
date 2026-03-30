// server/src/routes/disposal.routes.js
import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { checkPermission } from "../middleware/rbac.middleware.js";
import * as ctrl from "../controllers/disposal.controller.js";

const router = express.Router();

router.use(protect);

router.get("/", checkPermission("disposals", "can_view"), ctrl.getDisposals);
router.get(
  "/:id",
  checkPermission("disposals", "can_view"),
  ctrl.getDisposalById,
);
router.post("/", checkPermission("disposals", "can_add"), ctrl.raiseDisposal);
router.put(
  "/:id",
  checkPermission("disposals", "can_edit"),
  ctrl.updateDisposal,
);

router.put(
  "/:id/approve",
  checkPermission("disposals", "can_approve"),
  ctrl.approveDisposal,
);
router.put(
  "/:id/reject",
  checkPermission("disposals", "can_approve"),
  ctrl.rejectDisposal,
);
router.delete(
  "/:id",
  checkPermission("disposals", "can_delete"),
  ctrl.deleteDisposal,
);

export default router;
