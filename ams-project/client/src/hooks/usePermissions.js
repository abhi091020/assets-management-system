// client/src/hooks/usePermissions.js
import { useState, useCallback } from "react";
import { toast } from "react-hot-toast";
import {
  getAllPermissionsApi,
  getRolesApi,
  getModulesApi,
  togglePermissionApi,
  bulkUpdatePermissionsApi,
  createRoleApi,
  updateRoleApi,
  deleteRoleApi,
  createModuleApi,
  updateModuleApi,
  deleteModuleApi,
} from "../api/permissionApi.js";
import useAuthStore from "../store/authStore.js";

export function usePermissions() {
  const { user, setPermissions } = useAuthStore();

  // ── Matrix page state ────────────────────────────────────────
  const [roles, setRoles] = useState([]);
  const [modules, setModules] = useState([]);
  const [permissions, setPermsState] = useState([]); // raw DB rows
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false); // tracks toggle saves

  // ── Role modal state ─────────────────────────────────────────
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);

  // ── Module modal state ───────────────────────────────────────
  const [moduleModalOpen, setModuleModalOpen] = useState(false);
  const [editingModule, setEditingModule] = useState(null);

  // ── Delete confirm state ─────────────────────────────────────
  const [deleteTarget, setDeleteTarget] = useState(null); // { type: 'role'|'module', item }

  // ─────────────────────────────────────────────────────────────
  //  LOAD full matrix
  // ─────────────────────────────────────────────────────────────
  const loadMatrix = useCallback(async () => {
    setLoading(true);
    try {
      const [matrixRes, rolesRes, modulesRes] = await Promise.all([
        getAllPermissionsApi(),
        getRolesApi(),
        getModulesApi(),
      ]);
      setPermsState(matrixRes.data.data.permissions);
      setRoles(rolesRes.data.data);
      setModules(modulesRes.data.data);
    } catch {
      toast.error("Failed to load permissions");
    } finally {
      setLoading(false);
    }
  }, []);

  // ─────────────────────────────────────────────────────────────
  //  HELPER — get permission value for a role+module+action cell
  // ─────────────────────────────────────────────────────────────
  function getCellValue(roleId, moduleId, action) {
    const row = permissions.find(
      (p) => p.role_id === roleId && p.module_id === moduleId,
    );
    return row ? !!row[action] : false;
  }

  // ─────────────────────────────────────────────────────────────
  //  TOGGLE single permission cell (optimistic UI)
  // ─────────────────────────────────────────────────────────────
  const handleToggle = useCallback(
    async (roleId, moduleId, action, currentValue) => {
      const newValue = !currentValue;

      // Optimistic update — flip locally first
      setPermsState((prev) =>
        prev.map((p) =>
          p.role_id === roleId && p.module_id === moduleId
            ? { ...p, [action]: newValue ? 1 : 0 }
            : p,
        ),
      );

      setSaving(true);
      try {
        await togglePermissionApi({
          roleId,
          moduleId,
          action,
          value: newValue,
        });
        // Silently succeed — no toast needed for toggle (too noisy)
      } catch {
        toast.error("Failed to save permission");
        // Revert optimistic update on failure
        setPermsState((prev) =>
          prev.map((p) =>
            p.role_id === roleId && p.module_id === moduleId
              ? { ...p, [action]: currentValue ? 1 : 0 }
              : p,
          ),
        );
      } finally {
        setSaving(false);
      }
    },
    [],
  );

  // ─────────────────────────────────────────────────────────────
  //  ROLES CRUD
  // ─────────────────────────────────────────────────────────────
  const handleSaveRole = useCallback(
    async (formData) => {
      setSaving(true);
      try {
        if (editingRole) {
          await updateRoleApi(editingRole.id, formData);
          toast.success(`Role "${formData.displayName}" updated`);
        } else {
          await createRoleApi(formData);
          toast.success(`Role "${formData.displayName}" created`);
        }
        setRoleModalOpen(false);
        setEditingRole(null);
        await loadMatrix();
      } catch (err) {
        toast.error(err?.response?.data?.message || "Failed to save role");
      } finally {
        setSaving(false);
      }
    },
    [editingRole, loadMatrix],
  );

  const handleDeleteRole = useCallback(async () => {
    if (!deleteTarget || deleteTarget.type !== "role") return;
    setSaving(true);
    try {
      await deleteRoleApi(deleteTarget.item.id);
      toast.success(`Role "${deleteTarget.item.display_name}" deleted`);
      setDeleteTarget(null);
      await loadMatrix();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Cannot delete system role");
    } finally {
      setSaving(false);
    }
  }, [deleteTarget, loadMatrix]);

  // ─────────────────────────────────────────────────────────────
  //  MODULES CRUD
  // ─────────────────────────────────────────────────────────────
  const handleSaveModule = useCallback(
    async (formData) => {
      setSaving(true);
      try {
        if (editingModule) {
          await updateModuleApi(editingModule.id, formData);
          toast.success(`Module "${formData.displayName}" updated`);
        } else {
          await createModuleApi(formData);
          toast.success(`Module "${formData.displayName}" created`);
        }
        setModuleModalOpen(false);
        setEditingModule(null);
        await loadMatrix();
      } catch (err) {
        toast.error(err?.response?.data?.message || "Failed to save module");
      } finally {
        setSaving(false);
      }
    },
    [editingModule, loadMatrix],
  );

  const handleDeleteModule = useCallback(async () => {
    if (!deleteTarget || deleteTarget.type !== "module") return;
    setSaving(true);
    try {
      await deleteModuleApi(deleteTarget.item.id);
      toast.success(`Module "${deleteTarget.item.display_name}" deleted`);
      setDeleteTarget(null);
      await loadMatrix();
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Cannot delete system module",
      );
    } finally {
      setSaving(false);
    }
  }, [deleteTarget, loadMatrix]);

  // ─────────────────────────────────────────────────────────────
  //  OPEN helpers
  // ─────────────────────────────────────────────────────────────
  const openAddRole = () => {
    setEditingRole(null);
    setRoleModalOpen(true);
  };
  const openEditRole = (r) => {
    setEditingRole(r);
    setRoleModalOpen(true);
  };
  const openAddModule = () => {
    setEditingModule(null);
    setModuleModalOpen(true);
  };
  const openEditModule = (m) => {
    setEditingModule(m);
    setModuleModalOpen(true);
  };

  return {
    // state
    roles,
    modules,
    permissions,
    loading,
    saving,
    roleModalOpen,
    setRoleModalOpen,
    editingRole,
    moduleModalOpen,
    setModuleModalOpen,
    editingModule,
    deleteTarget,
    setDeleteTarget,

    // actions
    loadMatrix,
    getCellValue,
    handleToggle,
    handleSaveRole,
    handleDeleteRole,
    handleSaveModule,
    handleDeleteModule,
    openAddRole,
    openEditRole,
    openAddModule,
    openEditModule,
  };
}
