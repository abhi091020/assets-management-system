// server/src/routes/category.routes.js
import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { checkPermission } from "../middleware/rbac.middleware.js";
import {
  getCategories,
  getActiveCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  updateCategoryStatus,
  deleteCategory,
} from "../controllers/category.controller.js";

const router = express.Router();

// /active is used in dropdowns — only needs can_view
router.get(
  "/active",
  protect,
  checkPermission("categories", "can_view"),
  getActiveCategories,
);
router.get(
  "/",
  protect,
  checkPermission("categories", "can_view"),
  getCategories,
);
router.get(
  "/:id",
  protect,
  checkPermission("categories", "can_view"),
  getCategoryById,
);
router.post(
  "/",
  protect,
  checkPermission("categories", "can_add"),
  createCategory,
);
router.put(
  "/:id",
  protect,
  checkPermission("categories", "can_edit"),
  updateCategory,
);
router.put(
  "/:id/status",
  protect,
  checkPermission("categories", "can_edit"),
  updateCategoryStatus,
);
router.delete(
  "/:id",
  protect,
  checkPermission("categories", "can_delete"),
  deleteCategory,
);

export default router;
