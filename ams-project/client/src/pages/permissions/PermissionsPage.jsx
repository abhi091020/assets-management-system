// client/src/pages/permissions/PermissionsPage.jsx
import { useEffect } from "react";
import { usePermissions } from "../../hooks/usePermissions";
import PermissionMatrix from "../../components/permissions/PermissionMatrix";
import RoleFormModal from "../../components/permissions/RoleFormModal";
import ModuleFormModal from "../../components/permissions/ModuleFormModal";
import ConfirmModal from "../../components/common/ConfirmModal";

export default function PermissionsPage() {
  const {
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
    loadMatrix,
    handleToggle,
    handleSaveRole,
    handleDeleteRole,
    handleSaveModule,
    handleDeleteModule,
    openAddRole,
    openEditRole,
    openAddModule,
    openEditModule,
  } = usePermissions();

  useEffect(() => {
    loadMatrix();
  }, [loadMatrix]);

  const isDeleteRole = deleteTarget?.type === "role";
  const isDeleteModule = deleteTarget?.type === "module";

  const existingModuleKeys = modules.map((m) => m.module_key);

  return (
    <>
      <PermissionMatrix
        roles={roles}
        modules={modules}
        permissions={permissions}
        loading={loading}
        saving={saving}
        onToggle={handleToggle}
        onAddRole={openAddRole}
        onEditRole={openEditRole}
        onDeleteRole={(role) => setDeleteTarget({ type: "role", item: role })}
        onAddModule={openAddModule}
        onEditModule={openEditModule}
        onDeleteModule={(mod) => setDeleteTarget({ type: "module", item: mod })}
      />

      <RoleFormModal
        open={roleModalOpen}
        onClose={() => setRoleModalOpen(false)}
        editingRole={editingRole}
        onSave={handleSaveRole}
        saving={saving}
      />

      <ModuleFormModal
        open={moduleModalOpen}
        onClose={() => setModuleModalOpen(false)}
        editingModule={editingModule}
        onSave={handleSaveModule}
        saving={saving}
        existingModuleKeys={existingModuleKeys}
      />

      <ConfirmModal
        open={!!deleteTarget && isDeleteRole}
        title="Delete Role?"
        message="This role and all its permissions will be removed. Users assigned this role will lose access."
        subText={deleteTarget?.item?.display_name}
        confirmLabel="Delete Role"
        confirmColor="red"
        onConfirm={handleDeleteRole}
        onCancel={() => setDeleteTarget(null)}
        loading={saving}
      />

      <ConfirmModal
        open={!!deleteTarget && isDeleteModule}
        title="Delete Module?"
        message="This module will be removed from the permissions matrix for all roles."
        subText={deleteTarget?.item?.display_name}
        confirmLabel="Delete Module"
        confirmColor="red"
        onConfirm={handleDeleteModule}
        onCancel={() => setDeleteTarget(null)}
        loading={saving}
      />
    </>
  );
}
