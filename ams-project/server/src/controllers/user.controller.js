// src/controllers/user.controller.js
import bcrypt from "bcryptjs";
import UserModel from "../models/User.model.js";
import { success, error } from "../utils/responseHelper.js";
import { logAudit, getRequestMeta } from "../utils/auditLogger.js";

// ─── ME ENDPOINTS (self-service) ─────────────────────────────────────────────

// GET /api/users/me — own profile
export const getMe = async (req, res) => {
  try {
    const user = await UserModel.findById(req.user.id);
    if (!user) return error(res, "User not found", 404);
    return success(res, { user }, "Profile fetched successfully");
  } catch (err) {
    console.error("getMe error:", err.message);
    return error(res, "Failed to fetch profile");
  }
};

// PUT /api/users/me — update own name, phone, and profile photo
// Route must have uploadProfilePhoto.single("photo") middleware before this
export const updateMe = async (req, res) => {
  try {
    const { fullName, phone } = req.body;
    if (!fullName || !fullName.trim())
      return error(res, "fullName is required", 400);

    const existing = await UserModel.findById(req.user.id);
    if (!existing) return error(res, "User not found", 404);

    // ── Resolve profile photo URL ─────────────────────────────────────────────
    // req.file present      → new upload, build public URL from filename
    // remove_photo = "true" → user explicitly cleared photo
    // otherwise             → keep existing value unchanged
    let profilePhotoUrl;
    if (req.file) {
      // req.file.filename = "user-1-1234567890.jpg"
      // Express serves /uploads → <project-root>/uploads (via express.static)
      // Vite proxy forwards /uploads → http://192.168.10.110:5000
      profilePhotoUrl = `/uploads/profile-photos/${req.file.filename}`;
    } else if (req.body.remove_photo === "true") {
      profilePhotoUrl = null;
    } else {
      profilePhotoUrl = existing.profile_photo_url ?? null;
    }

    // ── Persist using the new updateMe model method ───────────────────────────
    const updated = await UserModel.updateMe(req.user.id, {
      fullName: fullName.trim(),
      phone: phone?.trim() || null,
      profilePhotoUrl,
    });

    // ─── Audit Log ────────────────────────────────────────────────────────────
    const { ipAddress, userAgent } = getRequestMeta(req);
    await logAudit({
      userId: req.user.id,
      userName: req.user.full_name || req.user.email,
      userRole: req.user.role,
      action: "UPDATE",
      entity: "User",
      entityId: req.user.id,
      entityCode: existing.email,
      oldValue: {
        fullName: existing.full_name,
        phone: existing.phone,
        profile_photo_url: existing.profile_photo_url,
      },
      newValue: { fullName, phone, profilePhotoUrl },
      ipAddress,
      userAgent,
    });

    return success(res, { user: updated }, "Profile updated successfully");
  } catch (err) {
    console.error("updateMe error:", err.message);
    return error(res, "Failed to update profile");
  }
};

// PUT /api/users/me/password — change own password
export const changeMyPassword = async (req, res) => {
  try {
    const { current_password, new_password, confirm_password } = req.body;

    if (!current_password || !new_password || !confirm_password) {
      return error(
        res,
        "current_password, new_password and confirm_password are required",
        400,
      );
    }
    if (new_password.length < 6) {
      return error(res, "new_password must be at least 6 characters", 400);
    }
    if (new_password !== confirm_password) {
      return error(res, "new_password and confirm_password do not match", 400);
    }
    if (new_password === current_password) {
      return error(
        res,
        "New password must be different from current password",
        400,
      );
    }

    const userWithHash = await UserModel.findByEmail(req.user.email);
    if (!userWithHash) return error(res, "User not found", 404);

    const isMatch = await bcrypt.compare(
      current_password,
      userWithHash.password_hash,
    );
    if (!isMatch) return error(res, "Current password is incorrect", 401);

    const passwordHash = await bcrypt.hash(new_password, 12);
    await UserModel.updatePassword(req.user.id, passwordHash);

    const { ipAddress, userAgent } = getRequestMeta(req);
    await logAudit({
      userId: req.user.id,
      userName: req.user.full_name || req.user.email,
      userRole: req.user.role,
      action: "UPDATE",
      entity: "User",
      entityId: req.user.id,
      entityCode: req.user.email,
      newValue: { action: "Password changed (self-service)" },
      ipAddress,
      userAgent,
    });

    return success(res, null, "Password changed successfully");
  } catch (err) {
    console.error("changeMyPassword error:", err.message);
    return error(res, "Failed to change password");
  }
};

// ─── ADMIN ENDPOINTS ──────────────────────────────────────────────────────────

// GET ALL USERS
export const getAllUsers = async (req, res) => {
  try {
    const { search, role, isActive, page, limit } = req.query;
    const result = await UserModel.findAll({
      search,
      role,
      isActive,
      page,
      limit,
    });
    return success(res, result, "Users fetched successfully");
  } catch (err) {
    console.error("Get all users error:", err.message);
    return error(res, "Failed to fetch users");
  }
};

// GET SINGLE USER
export const getUserById = async (req, res) => {
  try {
    const user = await UserModel.findById(req.params.id);
    if (!user) return error(res, "User not found", 404);
    return success(res, { user }, "User fetched successfully");
  } catch (err) {
    console.error("Get user error:", err.message);
    return error(res, "Failed to fetch user");
  }
};

// UPDATE USER (admin)
export const updateUser = async (req, res) => {
  try {
    const { fullName, phone, role, department_id, location_id } = req.body;
    if (!fullName) return error(res, "fullName is required", 400);

    const existing = await UserModel.findById(req.params.id);
    if (!existing) return error(res, "User not found", 404);

    if (existing.role === "SuperAdmin") {
      return error(res, "SuperAdmin accounts cannot be edited", 403);
    }

    const updated = await UserModel.update(req.params.id, {
      fullName,
      phone,
      role,
      departmentId: department_id,
      locationId: location_id,
      updatedBy: req.user.id,
    });

    const { ipAddress, userAgent } = getRequestMeta(req);
    await logAudit({
      userId: req.user.id,
      userName: req.user.full_name || req.user.email,
      userRole: req.user.role,
      action: "UPDATE",
      entity: "User",
      entityId: parseInt(req.params.id),
      entityCode: existing.email,
      oldValue: {
        fullName: existing.full_name,
        phone: existing.phone,
        role: existing.role,
        department_id: existing.department_id,
        location_id: existing.location_id,
      },
      newValue: { fullName, phone, role, department_id, location_id },
      ipAddress,
      userAgent,
    });

    return success(res, { user: updated }, "User updated successfully");
  } catch (err) {
    console.error("Update user error:", err.message);
    return error(res, "Failed to update user");
  }
};

// SOFT DELETE USER
export const deleteUser = async (req, res) => {
  try {
    if (parseInt(req.params.id) === req.user.id) {
      return error(res, "You cannot delete your own account", 400);
    }

    const existing = await UserModel.findById(req.params.id);
    if (!existing) return error(res, "User not found", 404);

    if (existing.role === "SuperAdmin") {
      return error(res, "SuperAdmin accounts cannot be deleted", 403);
    }

    await UserModel.softDelete(req.params.id, req.user.id);

    const { ipAddress, userAgent } = getRequestMeta(req);
    await logAudit({
      userId: req.user.id,
      userName: req.user.full_name || req.user.email,
      userRole: req.user.role,
      action: "DELETE",
      entity: "User",
      entityId: parseInt(req.params.id),
      entityCode: existing.email,
      oldValue: {
        fullName: existing.full_name,
        role: existing.role,
        email: existing.email,
      },
      ipAddress,
      userAgent,
    });

    return success(res, null, "User deleted successfully");
  } catch (err) {
    console.error("Delete user error:", err.message);
    return error(res, "Failed to delete user");
  }
};

// HARD DELETE USER
export const hardDeleteUser = async (req, res) => {
  try {
    if (parseInt(req.params.id) === req.user.id) {
      return error(res, "You cannot hard delete your own account", 400);
    }

    const existing = await UserModel.findById(req.params.id);
    if (!existing) return error(res, "User not found", 404);

    if (existing.role === "SuperAdmin") {
      return error(
        res,
        "SuperAdmin accounts cannot be permanently deleted",
        403,
      );
    }

    await UserModel.hardDelete(req.params.id);

    const { ipAddress, userAgent } = getRequestMeta(req);
    await logAudit({
      userId: req.user.id,
      userName: req.user.full_name || req.user.email,
      userRole: req.user.role,
      action: "DELETE",
      entity: "User",
      entityId: parseInt(req.params.id),
      entityCode: existing.email,
      oldValue: {
        fullName: existing.full_name,
        role: existing.role,
        email: existing.email,
        type: "HARD_DELETE",
      },
      ipAddress,
      userAgent,
    });

    return success(res, null, "User permanently deleted");
  } catch (err) {
    console.error("Hard delete error:", err.message);
    return error(res, "Failed to permanently delete user");
  }
};

// UPDATE STATUS
export const updateUserStatus = async (req, res) => {
  try {
    const { is_active } = req.body;
    if (is_active === undefined)
      return error(res, "is_active is required", 400);

    if (parseInt(req.params.id) === req.user.id) {
      return error(res, "You cannot change your own status", 400);
    }

    const existing = await UserModel.findById(req.params.id);
    if (!existing) return error(res, "User not found", 404);

    if (existing.role === "SuperAdmin") {
      return error(res, "SuperAdmin status cannot be changed", 403);
    }

    const updated = await UserModel.updateStatus(
      req.params.id,
      is_active,
      req.user.id,
    );

    const { ipAddress, userAgent } = getRequestMeta(req);
    await logAudit({
      userId: req.user.id,
      userName: req.user.full_name || req.user.email,
      userRole: req.user.role,
      action: "UPDATE",
      entity: "User",
      entityId: parseInt(req.params.id),
      entityCode: existing.email,
      oldValue: { is_active: existing.is_active },
      newValue: { is_active, status: is_active ? "Activated" : "Deactivated" },
      ipAddress,
      userAgent,
    });

    return success(
      res,
      { user: updated },
      `User ${is_active ? "activated" : "deactivated"} successfully`,
    );
  } catch (err) {
    console.error("Update status error:", err.message);
    return error(res, "Failed to update user status");
  }
};

// CHANGE PASSWORD (Admin — by ID)
export const changePassword = async (req, res) => {
  try {
    const { current_password, new_password } = req.body;

    if (!current_password || !new_password) {
      return error(res, "current_password and new_password are required", 400);
    }
    if (new_password.length < 6) {
      return error(res, "new_password must be at least 6 characters", 400);
    }
    if (parseInt(req.params.id) !== req.user.id) {
      return error(res, "You can only change your own password", 403);
    }

    const user = await UserModel.findById(req.params.id);
    if (!user) return error(res, "User not found", 404);

    const userWithHash = await UserModel.findByEmail(user.email);
    const isMatch = await bcrypt.compare(
      current_password,
      userWithHash.password_hash,
    );
    if (!isMatch) return error(res, "Current password is incorrect", 401);

    const passwordHash = await bcrypt.hash(new_password, 12);
    await UserModel.updatePassword(req.params.id, passwordHash);

    const { ipAddress, userAgent } = getRequestMeta(req);
    await logAudit({
      userId: req.user.id,
      userName: req.user.full_name || req.user.email,
      userRole: req.user.role,
      action: "UPDATE",
      entity: "User",
      entityId: parseInt(req.params.id),
      entityCode: user.email,
      newValue: { action: "Password changed" },
      ipAddress,
      userAgent,
    });

    return success(res, null, "Password changed successfully");
  } catch (err) {
    console.error("Change password error:", err.message);
    return error(res, "Failed to change password");
  }
};
