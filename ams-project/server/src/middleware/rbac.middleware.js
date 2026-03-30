// server/src/middleware/rbac.middleware.js
import { error as sendError } from "../utils/responseHelper.js";
import { getPermissionsByRole } from "../models/Permission.model.js";

// ─────────────────────────────────────────────────────────────
//  1. authorizeRoles  (LEGACY — unchanged, no breaking change)
// ─────────────────────────────────────────────────────────────
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return sendError(res, "Access denied. You do not have permission.", 403);
    }
    next();
  };
};

// ─────────────────────────────────────────────────────────────
//  2. requireRole  (alias for authorizeRoles)
// ─────────────────────────────────────────────────────────────
export const requireRole = (...roles) => authorizeRoles(...roles);

// ─────────────────────────────────────────────────────────────
//  3. checkPermission  (DB-driven, uses permission cache)
//     Usage: checkPermission("assets", "can_add")
// ─────────────────────────────────────────────────────────────
export const checkPermission = (moduleKey, action) => {
  return async (req, res, next) => {
    try {
      const role = req.user?.role;
      if (!role) return sendError(res, "Unauthorized", 401);

      if (role === "SuperAdmin") return next();

      const permissions = await getPermissionsByRole(role);
      const modulePerms = permissions?.[moduleKey];

      if (!modulePerms || !modulePerms[action]) {
        return sendError(
          res,
          `Access denied. Your role does not have '${action}' permission on '${moduleKey}'.`,
          403,
        );
      }
      next();
    } catch (err) {
      return sendError(res, "Permission check failed: " + err.message, 500);
    }
  };
};

// ─────────────────────────────────────────────────────────────
//  4. checkAnyPermission  (passes if user has ANY listed action)
//     Usage: checkAnyPermission("assets", ["can_add", "can_edit"])
// ─────────────────────────────────────────────────────────────
export const checkAnyPermission = (moduleKey, actions = []) => {
  return async (req, res, next) => {
    try {
      const role = req.user?.role;
      if (!role) return sendError(res, "Unauthorized", 401);

      if (role === "SuperAdmin") return next();

      const permissions = await getPermissionsByRole(role);
      const modulePerms = permissions?.[moduleKey];

      if (!actions.some((a) => modulePerms?.[a])) {
        return sendError(
          res,
          `Access denied. Requires one of: ${actions.join(", ")} on '${moduleKey}'.`,
          403,
        );
      }
      next();
    } catch (err) {
      return sendError(res, "Permission check failed: " + err.message, 500);
    }
  };
};

// ─────────────────────────────────────────────────────────────
//  5. attachPermissions  (attaches full map to req.permissions)
//     Usage: router.get("/", attachPermissions, ctrl.getAll)
// ─────────────────────────────────────────────────────────────
export const attachPermissions = async (req, res, next) => {
  try {
    const role = req.user?.role;
    if (!role) return sendError(res, "Unauthorized", 401);
    req.permissions = await getPermissionsByRole(role);
    next();
  } catch (err) {
    return sendError(res, "Failed to load permissions: " + err.message, 500);
  }
};
