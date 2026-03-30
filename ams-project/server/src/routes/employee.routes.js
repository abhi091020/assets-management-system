// server/src/routes/employee.routes.js
import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { checkPermission } from "../middleware/rbac.middleware.js";
import {
  getEmployees,
  getActiveEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  updateEmployeeStatus,
  deleteEmployee,
} from "../controllers/employee.controller.js";

const router = express.Router();

router.get(
  "/active",
  protect,
  checkPermission("employees", "can_view"),
  getActiveEmployees,
);
router.get(
  "/",
  protect,
  checkPermission("employees", "can_view"),
  getEmployees,
);
router.get(
  "/:id",
  protect,
  checkPermission("employees", "can_view"),
  getEmployeeById,
);
router.post(
  "/",
  protect,
  checkPermission("employees", "can_add"),
  createEmployee,
);
router.put(
  "/:id",
  protect,
  checkPermission("employees", "can_edit"),
  updateEmployee,
);
router.put(
  "/:id/status",
  protect,
  checkPermission("employees", "can_edit"),
  updateEmployeeStatus,
);
router.delete(
  "/:id",
  protect,
  checkPermission("employees", "can_delete"),
  deleteEmployee,
);

export default router;
