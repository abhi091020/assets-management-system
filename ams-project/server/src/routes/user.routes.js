// server/src/routes/user.routes.js
import express from "express";
import {
  getMe,
  updateMe,
  changeMyPassword,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  hardDeleteUser,
  updateUserStatus,
  changePassword,
} from "../controllers/user.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { checkPermission, requireRole } from "../middleware/rbac.middleware.js";
import { uploadProfilePhoto } from "../middleware/upload.middleware.js";

const router = express.Router();

router.use(protect);

// ─── Self-service (all roles) — no module permission needed ──────────────────
router.get("/me", getMe);
router.put("/me", uploadProfilePhoto.single("photo"), updateMe);
router.put("/me/password", changeMyPassword);

// ─── Admin routes — guarded by DB permission ─────────────────────────────────
router.get("/", checkPermission("users", "can_view"), getAllUsers);
router.get("/:id", checkPermission("users", "can_view"), getUserById);
router.put("/:id", checkPermission("users", "can_edit"), updateUser);
router.delete("/:id", checkPermission("users", "can_delete"), deleteUser);
router.delete("/:id/permanent", requireRole("SuperAdmin"), hardDeleteUser);
router.put(
  "/:id/status",
  checkPermission("users", "can_edit"),
  updateUserStatus,
);
router.put(
  "/:id/password",
  checkPermission("users", "can_edit"),
  changePassword,
);

export default router;
