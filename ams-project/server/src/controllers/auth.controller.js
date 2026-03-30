// server/src/controllers/auth.controller.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import path from "path";
import UserModel from "../models/User.model.js";
import { success, error } from "../utils/responseHelper.js";
import { logAudit, getRequestMeta } from "../utils/auditLogger.js";
import { uploadProfilePhoto } from "../middleware/upload.middleware.js";

// ─── Helper: build public URL from multer filename ────────────────────────────
// req.file.path is an absolute disk path — unusable as a URL.
// req.file.filename is just "user-1-1234567890.jpg" — safe to embed.
// Express serves:  app.use("/uploads", express.static("<project-root>/uploads"))
// So the public URL becomes:  /uploads/profile-photos/user-1-1234567890.jpg
const toPublicUrl = (filename) => {
  if (!filename) return null;
  return `/uploads/profile-photos/${filename}`;
};

// ─────────────────────────────────────────────────────────────────────────────
export const signup = async (req, res) => {
  try {
    const {
      fullName,
      email,
      password,
      role,
      phone,
      department_id,
      location_id,
    } = req.body;

    if (!fullName || !email || !password) {
      return error(res, "fullName, email and password are required", 400);
    }

    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
      return error(res, "Email already registered", 409);
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const newUser = await UserModel.create({
      fullName,
      email,
      passwordHash,
      role,
      phone,
      departmentId: department_id,
      locationId: location_id,
    });

    const { ipAddress, userAgent } = getRequestMeta(req);
    await logAudit({
      userId: req.user?.id || null,
      userName: req.user?.full_name || fullName,
      userRole: req.user?.role || role || "Unknown",
      action: "CREATE",
      entity: "User",
      entityId: newUser.id,
      entityCode: newUser.email,
      newValue: { fullName, email, role, phone, department_id, location_id },
      ipAddress,
      userAgent,
    });

    return success(res, { user: newUser }, "Account created successfully", 201);
  } catch (err) {
    console.error("Signup error:", err.message);
    return error(res, "Signup failed. Please try again.");
  }
};

// ─────────────────────────────────────────────────────────────────────────────
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const { ipAddress, userAgent } = getRequestMeta(req);

    if (!email || !password) {
      return error(res, "Email and password are required", 400);
    }

    const user = await UserModel.findByEmail(email);

    if (!user) {
      await logAudit({
        userName: email,
        userRole: "Unknown",
        action: "LOGIN_FAILED",
        entity: "Auth",
        entityCode: email,
        newValue: { reason: "User not found" },
        ipAddress,
        userAgent,
      });
      return error(res, "Invalid email or password", 401);
    }

    if (!user.is_active) {
      await logAudit({
        userId: user.id,
        userName: user.full_name,
        userRole: user.role,
        action: "LOGIN_FAILED",
        entity: "Auth",
        entityId: user.id,
        entityCode: user.email,
        newValue: { reason: "Account deactivated" },
        ipAddress,
        userAgent,
      });
      return error(res, "Account deactivated. Contact admin.", 403);
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      await logAudit({
        userId: user.id,
        userName: user.full_name,
        userRole: user.role,
        action: "LOGIN_FAILED",
        entity: "Auth",
        entityId: user.id,
        entityCode: user.email,
        newValue: { reason: "Wrong password" },
        ipAddress,
        userAgent,
      });
      return error(res, "Invalid email or password", 401);
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "8h" },
    );

    await UserModel.updateLastLogin(user.id);

    await logAudit({
      userId: user.id,
      userName: user.full_name,
      userRole: user.role,
      action: "LOGIN",
      entity: "Auth",
      entityId: user.id,
      entityCode: user.email,
      ipAddress,
      userAgent,
    });

    return success(
      res,
      {
        token,
        user: {
          id: user.id,
          fullName: user.full_name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          department_id: user.department_id,
          location_id: user.location_id,
          profile_photo_url: user.profile_photo_url || null,
        },
      },
      "Login successful",
    );
  } catch (err) {
    console.error("Login error:", err.message);
    return error(res, "Login failed. Please try again.");
  }
};

// ─────────────────────────────────────────────────────────────────────────────
export const getMe = async (req, res) => {
  try {
    const user = await UserModel.findById(req.user.id);
    if (!user) return error(res, "User not found", 404);
    return success(res, { user }, "User fetched");
  } catch (err) {
    return error(res, "Failed to fetch user");
  }
};

// ── PUT /users/me ─────────────────────────────────────────────────────────────
// Handles multipart/form-data (with optional photo) via uploadProfilePhoto middleware.
// Route registration example in user.routes.js:
//   router.put("/me", authenticate, uploadProfilePhoto.single("photo"), updateMe);
export const updateMe = async (req, res) => {
  try {
    const { fullName, phone } = req.body;

    if (!fullName || !fullName.trim()) {
      return error(res, "Full name is required", 400);
    }

    // Determine the new photo URL:
    //   • req.file present  → new upload, build URL
    //   • body.remove_photo === "true" → user explicitly removed photo, set null
    //   • otherwise → leave unchanged (re-fetch current value)
    let profilePhotoUrl;

    if (req.file) {
      // multer saved the file; build the public URL from filename only
      profilePhotoUrl = toPublicUrl(req.file.filename);
    } else if (req.body.remove_photo === "true") {
      profilePhotoUrl = null;
    } else {
      // No change to photo — read current value from DB so we don't wipe it
      const current = await UserModel.findById(req.user.id);
      profilePhotoUrl = current?.profile_photo_url ?? null;
    }

    const updated = await UserModel.updateMe(req.user.id, {
      fullName: fullName.trim(),
      phone: phone?.trim() || null,
      profilePhotoUrl,
    });

    if (!updated) return error(res, "User not found", 404);

    const { ipAddress, userAgent } = getRequestMeta(req);
    await logAudit({
      userId: req.user.id,
      userName: updated.full_name,
      userRole: req.user.role,
      action: "UPDATE",
      entity: "User",
      entityId: req.user.id,
      entityCode: updated.email,
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

// ── PUT /users/me/password ────────────────────────────────────────────────────
export const changeMyPassword = async (req, res) => {
  try {
    const { current_password, new_password, confirm_password } = req.body;

    if (!current_password || !new_password || !confirm_password) {
      return error(res, "All fields are required", 400);
    }
    if (new_password !== confirm_password) {
      return error(res, "Passwords do not match", 400);
    }
    if (new_password.length < 6) {
      return error(res, "New password must be at least 6 characters", 400);
    }
    if (new_password === current_password) {
      return error(res, "New password must differ from current password", 400);
    }

    const user = await UserModel.findByEmail(req.user.email);
    if (!user) return error(res, "User not found", 404);

    const isMatch = await bcrypt.compare(current_password, user.password_hash);
    if (!isMatch) return error(res, "Current password is incorrect", 401);

    const newHash = await bcrypt.hash(new_password, 12);
    await UserModel.updatePassword(req.user.id, newHash);

    const { ipAddress, userAgent } = getRequestMeta(req);
    await logAudit({
      userId: req.user.id,
      userName: user.full_name,
      userRole: req.user.role,
      action: "PASSWORD_CHANGE",
      entity: "User",
      entityId: req.user.id,
      entityCode: user.email,
      ipAddress,
      userAgent,
    });

    return success(res, {}, "Password changed successfully");
  } catch (err) {
    console.error("changeMyPassword error:", err.message);
    return error(res, "Failed to change password");
  }
};
