// server/src/routes/permission.routes.js
import { Router } from "express";
import { protect } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/rbac.middleware.js";
import * as ctrl from "../controllers/permission.controller.js";

const router = Router();

// All routes require authentication
router.use(protect);

// ─────────────────────────────────────────────────────────────
//  PERMISSIONS MATRIX
// ─────────────────────────────────────────────────────────────

router.get("/my", ctrl.getMyPermissions);
router.get("/", requireRole("SuperAdmin"), ctrl.getPermissions);
router.put("/toggle", requireRole("SuperAdmin"), ctrl.togglePermission);
router.put("/bulk", requireRole("SuperAdmin"), ctrl.bulkUpdatePermissions);

// ─────────────────────────────────────────────────────────────
//  ROLES
// ─────────────────────────────────────────────────────────────

router.get("/roles", requireRole("SuperAdmin"), ctrl.getRoles);
router.post("/roles", requireRole("SuperAdmin"), ctrl.createRole);
router.put("/roles/:id", requireRole("SuperAdmin"), ctrl.updateRole);
router.delete("/roles/:id", requireRole("SuperAdmin"), ctrl.deleteRole);

// ─────────────────────────────────────────────────────────────
//  MODULES
// ─────────────────────────────────────────────────────────────

router.get("/modules", requireRole("SuperAdmin"), ctrl.getModules);
router.post("/modules", requireRole("SuperAdmin"), ctrl.createModule);
router.put("/modules/:id", requireRole("SuperAdmin"), ctrl.updateModule);
router.delete("/modules/:id", requireRole("SuperAdmin"), ctrl.deleteModule);

export default router;
