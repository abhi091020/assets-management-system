// src/pages/assets/AssetsPage.jsx
import { useState } from "react";
import { useAssets } from "../../hooks/useAssets";
import useAuthStore from "../../store/authStore";
import AssetTable from "../../components/assets/AssetTable";
import AssetForm from "../../components/assets/AssetForm";
import AssetViewModal from "../../components/assets/AssetViewModal";
import ConfirmModal from "../../components/common/ConfirmModal";

export default function AssetsPage() {
  const { user } = useAuthStore();
  const canAdmin = ["SuperAdmin", "Admin"].includes(user?.role);
  const canManage = ["SuperAdmin", "Admin", "AssetManager"].includes(
    user?.role,
  );

  const {
    assets,
    totalCount,
    loading,
    page,
    pageSize,
    setPage,
    filters,
    handleSearchChange,
    handleFilterChange,
    handleClearFilters,
    filterDepartments,
    drawerOpen,
    viewModalOpen,
    deleteModalOpen,
    selectedAsset,
    editingAsset,
    isSubmitting,
    form,
    formErrors,
    handleFormChange,
    handleSubmit,
    locations,
    filteredDepartments,
    categories,
    employees,
    dropdownsLoading,
    openAddDrawer,
    openEditDrawer,
    openViewModal,
    openDeleteModal,
    closeDrawer,
    closeViewModal,
    closeDeleteModal,
    handleDelete,
  } = useAssets();

  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  const hasFilters = !!(
    filters.search ||
    filters.status ||
    filters.categoryId ||
    filters.locationId ||
    filters.departmentId ||
    filters.condition
  );

  const [confirm, setConfirm] = useState(null);
  const closeConfirm = () => setConfirm(null);

  // ── Form save intercept — handleSubmit() takes no args ────────────────────
  const [pendingSubmit, setPendingSubmit] = useState(false);

  function requestSubmit() {
    setPendingSubmit(true);
  }
  function executeSubmit() {
    setPendingSubmit(false);
    handleSubmit();
  }

  // ── Delete wrapper ────────────────────────────────────────────────────────
  function confirmDelete(asset) {
    openDeleteModal(asset);
    setConfirm({
      title: "Delete Asset?",
      message: "Asset will be soft deleted. QR code and history remain intact.",
      subText: `${asset.asset_code ?? ""} — ${asset.asset_name}`.replace(
        /^ — /,
        "",
      ),
      confirmLabel: "Delete",
      confirmColor: "red",
      onConfirm: () => {
        closeConfirm();
        handleDelete(asset);
      },
    });
  }

  return (
    <>
      <AssetTable
        assets={assets}
        loading={loading}
        totalCount={totalCount}
        page={page}
        pageSize={pageSize}
        totalPages={totalPages}
        onPageChange={setPage}
        hasFilters={hasFilters}
        onClearFilters={handleClearFilters}
        onEdit={openEditDrawer}
        onDelete={confirmDelete}
        canManage={canManage}
        canAdmin={canAdmin}
        onAdd={canManage ? openAddDrawer : undefined}
        filters={filters}
        onSearchChange={handleSearchChange}
        onFilterChange={handleFilterChange}
        locations={locations}
        categories={categories}
        filterDepartments={filterDepartments}
      />

      <AssetForm
        open={drawerOpen}
        onClose={closeDrawer}
        isEditing={!!editingAsset}
        editingAsset={editingAsset}
        form={form}
        formErrors={formErrors}
        onFormChange={handleFormChange}
        onSubmit={requestSubmit}
        isSubmitting={isSubmitting}
        locations={locations}
        filteredDepartments={filteredDepartments}
        categories={categories}
        employees={employees}
        dropdownsLoading={dropdownsLoading}
      />

      {/* Confirm: create / update */}
      <ConfirmModal
        open={pendingSubmit}
        title={editingAsset ? "Update Asset?" : "Register Asset?"}
        message={
          editingAsset
            ? "Are you sure you want to save these changes?"
            : "Are you sure you want to register this asset?"
        }
        subText={form.asset_name}
        confirmLabel={editingAsset ? "Update" : "Register"}
        confirmColor="blue"
        onConfirm={executeSubmit}
        onCancel={() => setPendingSubmit(false)}
        loading={isSubmitting}
      />

      <AssetViewModal
        isOpen={viewModalOpen}
        onClose={closeViewModal}
        asset={selectedAsset}
        canManage={canManage}
      />

      {/* Confirm: delete */}
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
        loading={isSubmitting}
      />
    </>
  );
}
