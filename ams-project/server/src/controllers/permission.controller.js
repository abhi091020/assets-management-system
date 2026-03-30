// server/src/controllers/permission.controller.js
import { success, error } from "../utils/responseHelper.js";
import { logAudit } from "../utils/auditLogger.js";
import * as PermissionModel from "../models/Permission.model.js";

// ─────────────────────────────────────────────────────────────
//  PERMISSIONS MATRIX
// ─────────────────────────────────────────────────────────────

// GET /api/permissions  — full matrix, SuperAdmin only
export async function getPermissions(req, res) {
  try {
    const data = await PermissionModel.getAllPermissions();
    return success(res, data, "Permissions fetched");
  } catch (err) {
    return error(res, err.message);
  }
}

// GET /api/permissions/my  — current user's own permissions
export async function getMyPermissions(req, res) {
  try {
    const role = req.user?.role;
    if (!role) return error(res, "Role not found on token", 401);
    const permissions = await PermissionModel.getPermissionsByRole(role);
    return success(res, { role, permissions }, "My permissions fetched");
  } catch (err) {
    return error(res, err.message);
  }
}

// PUT /api/permissions/toggle  — toggle single cell
// Body: { roleId, moduleId, action, value }
export async function togglePermission(req, res) {
  try {
    const { roleId, moduleId, action, value } = req.body;
    if (!roleId || !moduleId || !action) {
      return error(res, "roleId, moduleId and action are required", 400);
    }

    await PermissionModel.updatePermission({
      roleId,
      moduleId,
      action,
      value: !!value,
      updatedBy: req.user.id,
    });

    await logAudit({
      userId: req.user.id,
      action: "UPDATE_PERMISSION",
      module: "permissions",
      targetId: `${roleId}-${moduleId}`,
      details: `Set ${action} = ${value} for role_id=${roleId}, module_id=${moduleId}`,
    });

    return success(res, null, "Permission updated");
  } catch (err) {
    return error(res, err.message);
  }
}

// PUT /api/permissions/bulk  — bulk update all permissions for a role
// Body: { roleId, permissions: [{ moduleId, can_view, ... }] }
export async function bulkUpdatePermissions(req, res) {
  try {
    const { roleId, permissions } = req.body;
    if (!roleId || !Array.isArray(permissions) || permissions.length === 0) {
      return error(res, "roleId and permissions array are required", 400);
    }

    await PermissionModel.bulkUpdatePermissions({
      roleId,
      permissions,
      updatedBy: req.user.id,
    });

    await logAudit({
      userId: req.user.id,
      action: "BULK_UPDATE_PERMISSIONS",
      module: "permissions",
      targetId: String(roleId),
      details: `Bulk updated ${permissions.length} module permissions for role_id=${roleId}`,
    });

    return success(res, null, "Permissions updated");
  } catch (err) {
    return error(res, err.message);
  }
}

// ─────────────────────────────────────────────────────────────
//  ROLES
// ─────────────────────────────────────────────────────────────

// GET /api/permissions/roles
export async function getRoles(req, res) {
  try {
    const roles = await PermissionModel.getAllRoles();
    return success(res, roles, "Roles fetched");
  } catch (err) {
    return error(res, err.message);
  }
}

// POST /api/permissions/roles
export async function createRole(req, res) {
  try {
    const { roleName, displayName, description } = req.body;
    if (!roleName || !displayName) {
      return error(res, "roleName and displayName are required", 400);
    }

    const newId = await PermissionModel.createRole({
      roleName,
      displayName,
      description,
      createdBy: req.user.id,
    });

    await logAudit({
      userId: req.user.id,
      action: "CREATE_ROLE",
      module: "permissions",
      targetId: String(newId),
      details: `Created role: ${roleName} (${displayName})`,
    });

    return success(res, { id: newId }, "Role created");
  } catch (err) {
    return error(res, err.message);
  }
}

// PUT /api/permissions/roles/:id
export async function updateRole(req, res) {
  try {
    const { id } = req.params;
    const { displayName, description, isActive } = req.body;
    if (!displayName) return error(res, "displayName is required", 400);

    await PermissionModel.updateRole({
      id: Number(id),
      displayName,
      description,
      isActive: isActive !== false,
      updatedBy: req.user.id,
    });

    await logAudit({
      userId: req.user.id,
      action: "UPDATE_ROLE",
      module: "permissions",
      targetId: id,
      details: `Updated role id=${id}`,
    });

    return success(res, null, "Role updated");
  } catch (err) {
    return error(res, err.message);
  }
}

// DELETE /api/permissions/roles/:id
export async function deleteRole(req, res) {
  try {
    const { id } = req.params;
    await PermissionModel.deleteRole(Number(id));

    await logAudit({
      userId: req.user.id,
      action: "DELETE_ROLE",
      module: "permissions",
      targetId: id,
      details: `Soft deleted role id=${id}`,
    });

    return success(res, null, "Role deleted");
  } catch (err) {
    return error(res, err.message);
  }
}

// ─────────────────────────────────────────────────────────────
//  MODULES
// ─────────────────────────────────────────────────────────────

// GET /api/permissions/modules
export async function getModules(req, res) {
  try {
    const modules = await PermissionModel.getAllModules();
    return success(res, modules, "Modules fetched");
  } catch (err) {
    return error(res, err.message);
  }
}

// POST /api/permissions/modules
export async function createModule(req, res) {
  try {
    const { moduleKey, displayName, description, icon, sortOrder } = req.body;
    if (!moduleKey || !displayName) {
      return error(res, "moduleKey and displayName are required", 400);
    }

    const newId = await PermissionModel.createModule({
      moduleKey,
      displayName,
      description,
      icon,
      sortOrder,
      createdBy: req.user.id,
    });

    await logAudit({
      userId: req.user.id,
      action: "CREATE_MODULE",
      module: "permissions",
      targetId: String(newId),
      details: `Created module: ${moduleKey} (${displayName})`,
    });

    return success(res, { id: newId }, "Module created");
  } catch (err) {
    return error(res, err.message);
  }
}

// PUT /api/permissions/modules/:id
export async function updateModule(req, res) {
  try {
    const { id } = req.params;
    const { displayName, description, icon, sortOrder, isActive } = req.body;
    if (!displayName) return error(res, "displayName is required", 400);

    await PermissionModel.updateModule({
      id: Number(id),
      displayName,
      description,
      icon,
      sortOrder,
      isActive: isActive !== false,
    });

    await logAudit({
      userId: req.user.id,
      action: "UPDATE_MODULE",
      module: "permissions",
      targetId: id,
      details: `Updated module id=${id}`,
    });

    return success(res, null, "Module updated");
  } catch (err) {
    return error(res, err.message);
  }
}

// DELETE /api/permissions/modules/:id
export async function deleteModule(req, res) {
  try {
    const { id } = req.params;
    await PermissionModel.deleteModule(Number(id));

    await logAudit({
      userId: req.user.id,
      action: "DELETE_MODULE",
      module: "permissions",
      targetId: id,
      details: `Soft deleted module id=${id}`,
    });

    return success(res, null, "Module deleted");
  } catch (err) {
    return error(res, err.message);
  }
}
