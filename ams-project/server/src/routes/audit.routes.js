// server/src/routes/audit.routes.js
import express from "express";
import { getAuditLogs } from "../controllers/audit.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { checkPermission } from "../middleware/rbac.middleware.js";

const router = express.Router();

router.get(
  "/",
  protect,
  checkPermission("audit_logs", "can_view"),
  getAuditLogs,
);

export default router;
