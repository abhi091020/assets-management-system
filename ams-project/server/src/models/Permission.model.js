// server/src/models/Permission.model.js
import sql from "mssql";
import { getPool } from "../config/db.js";

// ─────────────────────────────────────────────────────────────
//  PERMISSION CACHE  (in-memory, refreshes every 5 minutes)
//  Avoids hitting DB on every single API request
// ─────────────────────────────────────────────────────────────
let _cache = null;
let _cacheTime = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function isCacheValid() {
  return _cache !== null && Date.now() - _cacheTime < CACHE_TTL;
}

export function invalidateCache() {
  _cache = null;
  _cacheTime = 0;
}

// ─────────────────────────────────────────────────────────────
//  GET ALL PERMISSIONS  (full matrix — for SuperAdmin UI)
// ─────────────────────────────────────────────────────────────
export async function getAllPermissions() {
  const pool = await getPool();

  const rolesResult = await pool.request().query(`
    SELECT id, role_name, display_name, description, is_system, is_active
    FROM Roles
    WHERE is_deleted = 0
    ORDER BY is_system DESC, display_name
  `);

  const modulesResult = await pool.request().query(`
    SELECT id, module_key, display_name, description, icon, sort_order, is_system, is_active
    FROM Modules
    WHERE is_deleted = 0
    ORDER BY sort_order
  `);

  const permsResult = await pool.request().query(`
    SELECT
      rp.id, rp.role_id, rp.module_id,
      rp.can_view, rp.can_add, rp.can_edit,
      rp.can_delete, rp.can_approve, rp.can_export,
      rp.updated_at, rp.updated_by
    FROM RolePermissions rp
    WHERE rp.is_deleted = 0
  `);

  return {
    roles: rolesResult.recordset,
    modules: modulesResult.recordset,
    permissions: permsResult.recordset,
  };
}

// ─────────────────────────────────────────────────────────────
//  GET PERMISSIONS BY ROLE  (used on login + middleware cache)
// ─────────────────────────────────────────────────────────────
export async function getPermissionsByRole(roleName) {
  // SuperAdmin always gets everything — skip DB
  if (roleName === "SuperAdmin") {
    return _buildSuperAdminPermissions();
  }

  // Check cache first
  if (isCacheValid() && _cache[roleName]) {
    return _cache[roleName];
  }

  const pool = await getPool();
  const result = await pool.request().input("roleName", sql.NVarChar, roleName)
    .query(`
      SELECT
        m.module_key,
        m.display_name  AS module_name,
        rp.can_view, rp.can_add, rp.can_edit,
        rp.can_delete, rp.can_approve, rp.can_export
      FROM RolePermissions rp
      JOIN Roles   r ON r.id = rp.role_id
      JOIN Modules m ON m.id = rp.module_id
      WHERE r.role_name = @roleName
        AND r.is_deleted = 0
        AND m.is_deleted = 0
        AND rp.is_deleted = 0
      ORDER BY m.sort_order
    `);

  const permissions = {};
  for (const row of result.recordset) {
    permissions[row.module_key] = {
      module_name: row.module_name,
      can_view: !!row.can_view,
      can_add: !!row.can_add,
      can_edit: !!row.can_edit,
      can_delete: !!row.can_delete,
      can_approve: !!row.can_approve,
      can_export: !!row.can_export,
    };
  }

  // Store in cache
  if (!_cache) _cache = {};
  _cache[roleName] = permissions;
  _cacheTime = Date.now();

  return permissions;
}

// ─────────────────────────────────────────────────────────────
//  UPDATE PERMISSION  (single toggle from UI)
// ─────────────────────────────────────────────────────────────
export async function updatePermission({
  roleId,
  moduleId,
  action,
  value,
  updatedBy,
}) {
  const allowedActions = [
    "can_view",
    "can_add",
    "can_edit",
    "can_delete",
    "can_approve",
    "can_export",
  ];
  if (!allowedActions.includes(action)) {
    throw new Error(`Invalid permission action: ${action}`);
  }

  const pool = await getPool();

  // Check row exists
  const exists = await pool
    .request()
    .input("roleId", sql.Int, roleId)
    .input("moduleId", sql.Int, moduleId).query(`
      SELECT id FROM RolePermissions
      WHERE role_id = @roleId AND module_id = @moduleId AND is_deleted = 0
    `);

  if (exists.recordset.length === 0) {
    // Row doesn't exist yet — insert it with only this action set
    const fields = allowedActions
      .map((a) => `${a} = ${a === action ? (value ? 1 : 0) : 0}`)
      .join(", ");
    await pool
      .request()
      .input("roleId", sql.Int, roleId)
      .input("moduleId", sql.Int, moduleId)
      .input("updatedBy", sql.Int, updatedBy).query(`
        INSERT INTO RolePermissions
          (role_id, module_id, can_view, can_add, can_edit, can_delete, can_approve, can_export, updated_by, updated_at)
        VALUES
          (@roleId, @moduleId,
           ${allowedActions.map((a) => (a === action ? (value ? 1 : 0) : 0)).join(",")},
           @updatedBy, GETDATE())
      `);
  } else {
    // Update the specific column dynamically (safe — validated against allowedActions whitelist)
    await pool
      .request()
      .input("roleId", sql.Int, roleId)
      .input("moduleId", sql.Int, moduleId)
      .input("updatedBy", sql.Int, updatedBy)
      .input("value", sql.Bit, value ? 1 : 0).query(`
        UPDATE RolePermissions
        SET ${action} = @value,
            updated_at = GETDATE(),
            updated_by = @updatedBy
        WHERE role_id = @roleId
          AND module_id = @moduleId
          AND is_deleted = 0
      `);
  }

  // Invalidate cache so next request fetches fresh data
  invalidateCache();
  return true;
}

// ─────────────────────────────────────────────────────────────
//  BULK UPDATE PERMISSIONS  (paste full role matrix at once)
// ─────────────────────────────────────────────────────────────
export async function bulkUpdatePermissions({
  roleId,
  permissions,
  updatedBy,
}) {
  // permissions = [{ moduleId, can_view, can_add, can_edit, can_delete, can_approve, can_export }]
  const pool = await getPool();
  const transaction = new sql.Transaction(pool);
  await transaction.begin();

  try {
    for (const perm of permissions) {
      const req = new sql.Request(transaction);
      await req
        .input("roleId", sql.Int, roleId)
        .input("moduleId", sql.Int, perm.moduleId)
        .input("can_view", sql.Bit, perm.can_view ? 1 : 0)
        .input("can_add", sql.Bit, perm.can_add ? 1 : 0)
        .input("can_edit", sql.Bit, perm.can_edit ? 1 : 0)
        .input("can_delete", sql.Bit, perm.can_delete ? 1 : 0)
        .input("can_approve", sql.Bit, perm.can_approve ? 1 : 0)
        .input("can_export", sql.Bit, perm.can_export ? 1 : 0)
        .input("updatedBy", sql.Int, updatedBy).query(`
          MERGE RolePermissions AS target
          USING (SELECT @roleId AS role_id, @moduleId AS module_id) AS source
            ON target.role_id = source.role_id
           AND target.module_id = source.module_id
           AND target.is_deleted = 0
          WHEN MATCHED THEN
            UPDATE SET
              can_view    = @can_view,
              can_add     = @can_add,
              can_edit    = @can_edit,
              can_delete  = @can_delete,
              can_approve = @can_approve,
              can_export  = @can_export,
              updated_at  = GETDATE(),
              updated_by  = @updatedBy
          WHEN NOT MATCHED THEN
            INSERT (role_id, module_id, can_view, can_add, can_edit, can_delete, can_approve, can_export, updated_by, updated_at)
            VALUES (@roleId, @moduleId, @can_view, @can_add, @can_edit, @can_delete, @can_approve, @can_export, @updatedBy, GETDATE());
        `);
    }
    await transaction.commit();
    invalidateCache();
    return true;
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────
//  ROLES CRUD  (dynamic role management)
// ─────────────────────────────────────────────────────────────
export async function getAllRoles() {
  const pool = await getPool();
  const result = await pool.request().query(`
    SELECT id, role_name, display_name, description, is_system, is_active,
           created_at, updated_at
    FROM Roles
    WHERE is_deleted = 0
    ORDER BY is_system DESC, display_name
  `);
  return result.recordset;
}

export async function createRole({
  roleName,
  displayName,
  description,
  createdBy,
}) {
  const pool = await getPool();

  // Check duplicate
  const dup = await pool
    .request()
    .input("roleName", sql.NVarChar, roleName)
    .query(
      `SELECT id FROM Roles WHERE role_name = @roleName AND is_deleted = 0`,
    );
  if (dup.recordset.length > 0) throw new Error("Role name already exists");

  const result = await pool
    .request()
    .input("roleName", sql.NVarChar, roleName)
    .input("displayName", sql.NVarChar, displayName)
    .input("description", sql.NVarChar, description || null)
    .input("createdBy", sql.Int, createdBy).query(`
      INSERT INTO Roles (role_name, display_name, description, is_system, is_active, created_by)
      OUTPUT INSERTED.id
      VALUES (@roleName, @displayName, @description, 0, 1, @createdBy)
    `);

  const newRoleId = result.recordset[0].id;

  // Auto-seed all modules with zero permissions for new role
  await pool
    .request()
    .input("roleId", sql.Int, newRoleId)
    .input("createdBy", sql.Int, createdBy).query(`
      INSERT INTO RolePermissions (role_id, module_id, can_view, can_add, can_edit, can_delete, can_approve, can_export, updated_by)
      SELECT @roleId, id, 0, 0, 0, 0, 0, 0, @createdBy
      FROM Modules
      WHERE is_deleted = 0 AND is_active = 1
    `);

  invalidateCache();
  return newRoleId;
}

export async function updateRole({
  id,
  displayName,
  description,
  isActive,
  updatedBy,
}) {
  const pool = await getPool();

  // Prevent editing system roles' names
  await pool
    .request()
    .input("id", sql.Int, id)
    .input("displayName", sql.NVarChar, displayName)
    .input("description", sql.NVarChar, description || null)
    .input("isActive", sql.Bit, isActive ? 1 : 0).query(`
      UPDATE Roles
      SET display_name = @displayName,
          description  = @description,
          is_active    = @isActive,
          updated_at   = GETDATE()
      WHERE id = @id AND is_deleted = 0
    `);

  invalidateCache();
}

export async function deleteRole(id) {
  const pool = await getPool();

  // Cannot delete system roles
  const role = await pool
    .request()
    .input("id", sql.Int, id)
    .query(`SELECT is_system FROM Roles WHERE id = @id AND is_deleted = 0`);

  if (!role.recordset.length) throw new Error("Role not found");
  if (role.recordset[0].is_system)
    throw new Error("System roles cannot be deleted");

  await pool.request().input("id", sql.Int, id).query(`
      UPDATE Roles          SET is_deleted = 1, updated_at = GETDATE() WHERE id = @id;
      UPDATE RolePermissions SET is_deleted = 1, updated_at = GETDATE() WHERE role_id = @id;
    `);

  invalidateCache();
}

// ─────────────────────────────────────────────────────────────
//  MODULES CRUD  (dynamic module management)
// ─────────────────────────────────────────────────────────────
export async function getAllModules() {
  const pool = await getPool();
  const result = await pool.request().query(`
    SELECT id, module_key, display_name, description, icon, sort_order, is_system, is_active,
           created_at, updated_at
    FROM Modules
    WHERE is_deleted = 0
    ORDER BY sort_order
  `);
  return result.recordset;
}

export async function createModule({
  moduleKey,
  displayName,
  description,
  icon,
  sortOrder,
  createdBy,
}) {
  const pool = await getPool();

  // Check duplicate
  const dup = await pool
    .request()
    .input("moduleKey", sql.NVarChar, moduleKey)
    .query(
      `SELECT id FROM Modules WHERE module_key = @moduleKey AND is_deleted = 0`,
    );
  if (dup.recordset.length > 0) throw new Error("Module key already exists");

  const result = await pool
    .request()
    .input("moduleKey", sql.NVarChar, moduleKey)
    .input("displayName", sql.NVarChar, displayName)
    .input("description", sql.NVarChar, description || null)
    .input("icon", sql.NVarChar, icon || null)
    .input("sortOrder", sql.Int, sortOrder || 99)
    .input("createdBy", sql.Int, createdBy).query(`
      INSERT INTO Modules (module_key, display_name, description, icon, sort_order, is_system, is_active, created_by)
      OUTPUT INSERTED.id
      VALUES (@moduleKey, @displayName, @description, @icon, @sortOrder, 0, 1, @createdBy)
    `);

  const newModuleId = result.recordset[0].id;

  // Auto-seed all existing roles with zero permissions for new module
  await pool
    .request()
    .input("moduleId", sql.Int, newModuleId)
    .input("createdBy", sql.Int, createdBy).query(`
      INSERT INTO RolePermissions (role_id, module_id, can_view, can_add, can_edit, can_delete, can_approve, can_export, updated_by)
      SELECT id, @moduleId, 0, 0, 0, 0, 0, 0, @createdBy
      FROM Roles
      WHERE is_deleted = 0 AND is_active = 1
    `);

  invalidateCache();
  return newModuleId;
}

export async function updateModule({
  id,
  displayName,
  description,
  icon,
  sortOrder,
  isActive,
}) {
  const pool = await getPool();
  await pool
    .request()
    .input("id", sql.Int, id)
    .input("displayName", sql.NVarChar, displayName)
    .input("description", sql.NVarChar, description || null)
    .input("icon", sql.NVarChar, icon || null)
    .input("sortOrder", sql.Int, sortOrder || 99)
    .input("isActive", sql.Bit, isActive ? 1 : 0).query(`
      UPDATE Modules
      SET display_name = @displayName,
          description  = @description,
          icon         = @icon,
          sort_order   = @sortOrder,
          is_active    = @isActive,
          updated_at   = GETDATE()
      WHERE id = @id AND is_deleted = 0
    `);
  invalidateCache();
}

export async function deleteModule(id) {
  const pool = await getPool();

  const mod = await pool
    .request()
    .input("id", sql.Int, id)
    .query(`SELECT is_system FROM Modules WHERE id = @id AND is_deleted = 0`);

  if (!mod.recordset.length) throw new Error("Module not found");
  if (mod.recordset[0].is_system)
    throw new Error("System modules cannot be deleted");

  await pool.request().input("id", sql.Int, id).query(`
      UPDATE Modules          SET is_deleted = 1, updated_at = GETDATE() WHERE id = @id;
      UPDATE RolePermissions  SET is_deleted = 1, updated_at = GETDATE() WHERE module_id = @id;
    `);

  invalidateCache();
}

// ─────────────────────────────────────────────────────────────
//  INTERNAL HELPER — SuperAdmin gets all permissions as true
// ─────────────────────────────────────────────────────────────
async function _buildSuperAdminPermissions() {
  const pool = await getPool();
  const result = await pool.request().query(`
    SELECT module_key FROM Modules WHERE is_deleted = 0
  `);
  const permissions = {};
  for (const row of result.recordset) {
    permissions[row.module_key] = {
      can_view: true,
      can_add: true,
      can_edit: true,
      can_delete: true,
      can_approve: true,
      can_export: true,
    };
  }
  return permissions;
}
