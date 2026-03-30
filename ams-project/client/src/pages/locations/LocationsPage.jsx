// src/pages/locations/LocationsPage.jsx
import { useState } from "react";
import { useLocations } from "../../hooks/useLocations";
import useAuthStore from "../../store/authStore";
import LocationTable from "../../components/locations/LocationTable";
import LocationForm from "../../components/locations/LocationForm";
import LocationViewModal from "../../components/locations/LocationViewModal";
import ConfirmModal from "../../components/common/ConfirmModal";

export default function LocationsPage() {
  const { user } = useAuthStore();
  const canAdmin = ["SuperAdmin", "Admin"].includes(user?.role);

  const {
    locations,
    loading,
    total,
    page,
    totalPages,
    setPage,
    formOpen,
    editingLocation,
    form,
    formErrors,
    setFormErrors,
    submitting,
    openAddForm,
    openEditForm,
    closeForm,
    handleChange,
    handleSubmit,
    viewingLocation,
    setViewingLocation,
    deletingLocation,
    deleting,
    openDeleteModal,
    handleDelete,
    setDeletingLocation,
    handleToggleStatus,
  } = useLocations();

  // ── Confirm modal ─────────────────────────────────────────────────────────
  const [confirm, setConfirm] = useState(null);
  const closeConfirm = () => setConfirm(null);

  // ── Form save intercept ───────────────────────────────────────────────────
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
  function confirmToggleStatus(loc) {
    const active = loc.is_active;
    setConfirm({
      title: active ? "Deactivate Location?" : "Activate Location?",
      message: active
        ? "This location will be marked inactive and hidden from dropdowns."
        : "This location will be marked active and available again.",
      subText: loc.location_name,
      confirmLabel: active ? "Deactivate" : "Activate",
      confirmColor: active ? "orange" : "green",
      onConfirm: () => {
        closeConfirm();
        handleToggleStatus(loc);
      },
    });
  }

  function confirmDelete(loc) {
    openDeleteModal(loc);
    setConfirm({
      title: "Delete Location?",
      message:
        "Location will be soft deleted. Linked departments and assets remain intact.",
      subText: loc.location_name,
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
      <LocationTable
        locations={locations}
        loading={loading}
        total={total}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        canAdmin={canAdmin}
        onAdd={canAdmin ? openAddForm : undefined}
        onView={(loc) => setViewingLocation(loc)}
        onEdit={openEditForm}
        onToggleStatus={confirmToggleStatus}
        onDelete={confirmDelete}
      />

      <LocationForm
        open={formOpen}
        onClose={closeForm}
        editingLocation={editingLocation}
        form={form}
        formErrors={formErrors}
        setFormErrors={setFormErrors}
        onChange={handleChange}
        onSubmit={requestSubmit}
        submitting={submitting}
      />

      {/* Confirm: create / update */}
      <ConfirmModal
        open={pendingSubmit}
        title={editingLocation ? "Update Location?" : "Create Location?"}
        message={
          editingLocation
            ? "Are you sure you want to save these changes?"
            : "Are you sure you want to create this location?"
        }
        subText={form.location_name}
        confirmLabel={editingLocation ? "Update" : "Create"}
        confirmColor="blue"
        onConfirm={executeSubmit}
        onCancel={() => setPendingSubmit(false)}
        loading={submitting}
      />

      <LocationViewModal
        location={viewingLocation}
        onClose={() => setViewingLocation(null)}
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
          setDeletingLocation(null);
        }}
        loading={deleting}
      />
    </>
  );
}
