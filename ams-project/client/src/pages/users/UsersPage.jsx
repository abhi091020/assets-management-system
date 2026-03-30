// src/pages/users/UsersPage.jsx
import { useState } from "react";
import useAuthStore from "../../store/authStore";
import { useUsers } from "../../hooks/useUsers";
import UserTable from "../../components/users/UserTable";
import UserForm from "../../components/users/UserForm";
import UserViewModal from "../../components/users/UserViewModal";
import ConfirmModal from "../../components/common/ConfirmModal";

export default function UsersPage() {
  const { user: currentUser, isAdmin, isSuperAdmin } = useAuthStore();
  const [viewingUser, setViewingUser] = useState(null);

  const {
    users,
    loading,
    total,
    totalPages,
    page,
    setPage,
    drawerOpen,
    editingUser,
    form,
    formErrors,
    setFormErrors,
    submitting,
    openAddDrawer,
    openEditDrawer,
    closeDrawer,
    handleFormChange,
    handleSubmit,
    handleToggleStatus,
    deleteTarget,
    isPermanent,
    deleting,
    openDeleteModal,
    closeDeleteModal,
    handleDelete,
    locations,
    departments,
    loadingDepts,
  } = useUsers();

  const [confirm, setConfirm] = useState(null);
  const closeConfirm = () => setConfirm(null);

  // ── Form save intercept ───────────────────────────────────────────────────
  // useUsers.handleSubmit takes a synthetic event — intercept it
  const [pendingSubmit, setPendingSubmit] = useState(false);

  function requestSubmit(e) {
    e.preventDefault();
    setPendingSubmit(true);
  }
  function executeSubmit() {
    setPendingSubmit(false);
    handleSubmit({ preventDefault: () => {} });
  }

  // ── Action wrappers ───────────────────────────────────────────────────────
  function confirmToggleStatus(u) {
    const active = u.is_active;
    setConfirm({
      title: active ? "Deactivate User?" : "Activate User?",
      message: active
        ? "This user will lose access to the system."
        : "This user will regain access to the system.",
      subText: u.full_name,
      confirmLabel: active ? "Deactivate" : "Activate",
      confirmColor: active ? "orange" : "green",
      onConfirm: () => {
        closeConfirm();
        handleToggleStatus(u);
      },
    });
  }

  function confirmDelete(u, permanent = false) {
    openDeleteModal(u, permanent);
    setConfirm({
      title: permanent ? "Permanently Delete User?" : "Delete User?",
      message: permanent
        ? "This action is irreversible. All user data will be erased."
        : "User will be soft deleted and can be restored later.",
      subText: u.full_name,
      confirmLabel: permanent ? "Delete Permanently" : "Delete",
      confirmColor: "red",
      onConfirm: () => {
        closeConfirm();
        handleDelete();
      },
    });
  }

  return (
    <>
      <UserTable
        users={users}
        loading={loading}
        total={total}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        currentUserId={currentUser?.id}
        canAdmin={isAdmin()}
        canSuperAdmin={isSuperAdmin()}
        onAdd={isAdmin() ? openAddDrawer : undefined}
        onView={setViewingUser}
        onEdit={openEditDrawer}
        onToggleStatus={confirmToggleStatus}
        onDelete={(u) => confirmDelete(u, false)}
        onPermanentDelete={(u) => confirmDelete(u, true)}
      />

      <UserViewModal
        user={viewingUser}
        onClose={() => setViewingUser(null)}
        locations={locations}
        departments={departments}
      />

      <UserForm
        open={drawerOpen}
        onClose={closeDrawer}
        editingUser={editingUser}
        form={form}
        formErrors={formErrors}
        setFormErrors={setFormErrors}
        onChange={handleFormChange}
        onSubmit={requestSubmit}
        submitting={submitting}
        isSuperAdmin={isSuperAdmin()}
        locations={locations}
        departments={departments}
        loadingDepts={loadingDepts}
      />

      {/* Confirm: create / update */}
      <ConfirmModal
        open={pendingSubmit}
        title={editingUser ? "Update User?" : "Create User?"}
        message={
          editingUser
            ? "Are you sure you want to save these changes?"
            : "Are you sure you want to create this user?"
        }
        subText={form.fullName}
        confirmLabel={editingUser ? "Update" : "Create"}
        confirmColor="blue"
        onConfirm={executeSubmit}
        onCancel={() => setPendingSubmit(false)}
        loading={submitting}
      />

      {/* Confirm: delete / toggle status */}
      <ConfirmModal
        open={!!confirm}
        title={confirm?.title}
        message={confirm?.message}
        subText={confirm?.subText}
        confirmLabel={confirm?.confirmLabel}
        confirmColor={confirm?.confirmColor}
        onConfirm={confirm?.onConfirm}
        onCancel={() => {
          closeConfirm();
          closeDeleteModal();
        }}
        loading={deleting}
      />
    </>
  );
}
