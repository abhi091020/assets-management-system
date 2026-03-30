// src/pages/employees/EmployeesPage.jsx
import { useState } from "react";
import { useEmployees } from "../../hooks/useEmployees";
import useAuthStore from "../../store/authStore";
import EmployeeTable from "../../components/employees/EmployeeTable";
import EmployeeForm from "../../components/employees/EmployeeForm";
import EmployeeViewModal from "../../components/employees/EmployeeViewModal";
import ConfirmModal from "../../components/common/ConfirmModal";

export default function EmployeesPage() {
  const { user } = useAuthStore();
  const canAdmin = ["SuperAdmin", "Admin"].includes(user?.role);
  const canManager = ["SuperAdmin", "Admin", "AssetManager"].includes(
    user?.role,
  );

  const {
    employees,
    loading,
    total,
    page,
    totalPages,
    setPage,
    locations,
    departments,
    loadingDepts,
    formOpen,
    editingEmployee,
    form,
    formErrors,
    setFormErrors,
    submitting,
    openAddForm,
    openEditForm,
    closeForm,
    handleChange,
    handleSubmit,
    viewingEmployee,
    setViewingEmployee,
    deletingEmployee,
    deleting,
    openDeleteModal,
    handleDelete,
    setDeletingEmployee,
    handleToggleStatus,
  } = useEmployees();

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

  function confirmToggleStatus(emp) {
    const active = emp.is_active;
    setConfirm({
      title: active ? "Deactivate Employee?" : "Activate Employee?",
      message: active
        ? "This employee will be marked inactive."
        : "This employee will be marked active.",
      subText: emp.full_name,
      confirmLabel: active ? "Deactivate" : "Activate",
      confirmColor: active ? "orange" : "green",
      onConfirm: () => {
        closeConfirm();
        handleToggleStatus(emp);
      },
    });
  }

  function confirmDelete(emp) {
    openDeleteModal(emp);
    setConfirm({
      title: "Delete Employee?",
      message: "Employee will be soft deleted. Assigned assets remain intact.",
      subText: emp.full_name,
      confirmLabel: "Delete",
      confirmColor: "red",
      onConfirm: () => {
        closeConfirm();
        handleDelete();
      },
    });
  }

  return (
    <>
      <EmployeeTable
        employees={employees}
        loading={loading}
        total={total}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        canAdmin={canAdmin}
        canManager={canManager}
        locations={locations}
        onAdd={canManager ? openAddForm : undefined}
        onView={(emp) => setViewingEmployee(emp)}
        onEdit={openEditForm}
        onToggleStatus={confirmToggleStatus}
        onDelete={confirmDelete}
      />

      <EmployeeForm
        open={formOpen}
        onClose={closeForm}
        editingEmployee={editingEmployee}
        form={form}
        formErrors={formErrors}
        setFormErrors={setFormErrors}
        onChange={handleChange}
        onSubmit={requestSubmit}
        submitting={submitting}
        locations={locations}
        departments={departments}
        loadingDepts={loadingDepts}
      />

      <ConfirmModal
        open={pendingSubmit}
        title={editingEmployee ? "Update Employee?" : "Create Employee?"}
        message={
          editingEmployee
            ? "Are you sure you want to save these changes?"
            : "Are you sure you want to create this employee?"
        }
        subText={form.full_name}
        confirmLabel={editingEmployee ? "Update" : "Create"}
        confirmColor="blue"
        onConfirm={executeSubmit}
        onCancel={() => setPendingSubmit(false)}
        loading={submitting}
      />

      <EmployeeViewModal
        employee={viewingEmployee}
        onClose={() => setViewingEmployee(null)}
        locations={locations}
        departments={departments}
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
          setDeletingEmployee(null);
        }}
        loading={deleting}
      />
    </>
  );
}
