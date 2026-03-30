// server/src/routes/department.routes.js
import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { checkPermission } from "../middleware/rbac.middleware.js";
import {
  getDepartments,
  getActiveDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  updateDepartmentStatus,
  deleteDepartment,
} from "../controllers/department.controller.js";

const router = express.Router();

router.get(
  "/active",
  protect,
  checkPermission("departments", "can_view"),
  getActiveDepartments,
);
router.get(
  "/",
  protect,
  checkPermission("departments", "can_view"),
  getDepartments,
);
router.get(
  "/:id",
  protect,
  checkPermission("departments", "can_view"),
  getDepartmentById,
);
router.post(
  "/",
  protect,
  checkPermission("departments", "can_add"),
  createDepartment,
);
router.put(
  "/:id",
  protect,
  checkPermission("departments", "can_edit"),
  updateDepartment,
);
router.put(
  "/:id/status",
  protect,
  checkPermission("departments", "can_edit"),
  updateDepartmentStatus,
);
router.delete(
  "/:id",
  protect,
  checkPermission("departments", "can_delete"),
  deleteDepartment,
);

export default router;
