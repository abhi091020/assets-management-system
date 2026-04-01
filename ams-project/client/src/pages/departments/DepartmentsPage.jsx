// src/pages/departments/DepartmentsPage.jsx
import { useState } from "react";
import { useDepartments } from "../../hooks/useDepartments";
import useAuthStore from "../../store/authStore";
import DepartmentTable from "../../components/departments/DepartmentTable";
import DepartmentForm from "../../components/departments/DepartmentForm";
import DepartmentViewModal from "../../components/departments/DepartmentViewModal";
import ConfirmModal from "../../components/common/ConfirmModal";

export default function DepartmentsPage() {
  const { user } = useAuthStore();
  const canAdmin = ["SuperAdmin", "Admin"].includes(user?.role);

  const {
    departments,
    loading,
    total,
    page,
    totalPages,
    setPage,
    locations,
    formOpen,
    editingDepartment,
    form,
    formErrors,
    setFormErrors,
    submitting,
    openAddForm,
    openEditForm,
    closeForm,
    handleChange,
    handleSubmit,
    viewingDepartment,
    setViewingDepartment,
    deletingDepartment,
    deleting,
    openDeleteModal,
    handleDelete,
    setDeletingDepartment,
    handleToggleStatus,
  } = useDepartments();

  const [confirm, setConfirm] = useState(null);
  const closeConfirm = () => setConfirm(null);

  const [pendingSubmit, setPendingSubmit] = useState(false);

  function requestSubmit(e) {
    e.preventDefault();
    setPendingSubmit(true);
  }
  function executeSubmit() {
    setPendingSubmit(false);
    handleSubmit({ preventDefault: () => {} });
  }

  function confirmToggleStatus(dept) {
    const active = dept.is_active === true || dept.is_active === 1;
    setConfirm({
      title: active ? "Deactivate Department?" : "Activate Department?",
      message: active
        ? "This department will be marked inactive."
        : "This department will be marked active.",
      subText: dept.dept_name,
      confirmLabel: active ? "Deactivate" : "Activate",
      confirmColor: active ? "orange" : "green",
      onConfirm: () => {
        closeConfirm();
        handleToggleStatus(dept);
      },
    });
  }

  function confirmDelete(dept) {
    // ✅ Fix: removed openDeleteModal(dept) — was causing stale closure
    // Pass dept.id directly so closure always has the correct id
    setConfirm({
      title: "Delete Department?",
      message: "Department will be soft deleted. Linked data remains intact.",
      subText: dept.dept_name,
      confirmLabel: "Delete",
      confirmColor: "red",
      onConfirm: () => {
        closeConfirm();
        handleDelete(dept.id); // ✅ id captured directly, never stale
      },
    });
  }

  return (
    <>
      <DepartmentTable
        departments={departments}
        loading={loading}
        total={total}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        canAdmin={canAdmin}
        locations={locations}
        onAdd={canAdmin ? openAddForm : undefined}
        onView={(dept) => setViewingDepartment(dept)}
        onEdit={openEditForm}
        onToggleStatus={confirmToggleStatus}
        onDelete={confirmDelete}
      />

      <DepartmentForm
        open={formOpen}
        onClose={closeForm}
        editingDepartment={editingDepartment}
        form={form}
        formErrors={formErrors}
        setFormErrors={setFormErrors}
        onChange={handleChange}
        onSubmit={requestSubmit}
        submitting={submitting}
        locations={locations}
      />

      <ConfirmModal
        open={pendingSubmit}
        title={editingDepartment ? "Update Department?" : "Create Department?"}
        message={
          editingDepartment
            ? "Are you sure you want to save these changes?"
            : "Are you sure you want to create this department?"
        }
        subText={form.dept_name}
        confirmLabel={editingDepartment ? "Update" : "Create"}
        confirmColor="blue"
        onConfirm={executeSubmit}
        onCancel={() => setPendingSubmit(false)}
        loading={submitting}
      />

      <DepartmentViewModal
        department={viewingDepartment}
        onClose={() => setViewingDepartment(null)}
        locations={locations}
      />

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
          setDeletingDepartment(null);
        }}
        loading={deleting}
      />
    </>
  );
}