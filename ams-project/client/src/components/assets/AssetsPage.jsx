// client/src/pages/assets/AssetsPage.jsx

import { useState } from "react";
import { useAssets }     from "../../hooks/useAssets";
import { useBulkAssets } from "../../hooks/useBulkAssets";  // ★ NEW
import useAuthStore      from "../../store/authStore";
import AssetTable        from "../../components/assets/AssetTable";
import AssetForm         from "../../components/assets/AssetForm";
import AssetViewModal    from "../../components/assets/AssetViewModal";
import BulkAssetModal    from "../../components/assets/BulkAssetModal";  // ★ NEW
import ConfirmModal      from "../../components/common/ConfirmModal";

export default function AssetsPage() {
  const { user } = useAuthStore();
  const canAdmin  = ["SuperAdmin", "Admin"].includes(user?.role);
  const canManage = ["SuperAdmin", "Admin", "AssetManager"].includes(user?.role);

  const {
    assets, totalCount, loading,
    page, pageSize, setPage,
    filters, handleSearchChange, handleFilterChange, handleClearFilters,
    filterDepartments,
    drawerOpen, viewModalOpen, deleteModalOpen,
    selectedAsset, editingAsset, isSubmitting,
    form, formErrors, handleFormChange, handleSubmit,
    locations, filteredDepartments,
    filteredEmployees,
    categories, dropdownsLoading,
    openAddDrawer, openEditDrawer, openViewModal, openDeleteModal,
    closeDrawer, closeViewModal, closeDeleteModal,
    handleDelete, refresh,
    categoryPath, handleCategoryChange,
  } = useAssets();

  // ★ Bulk registration hook
  const {
    open: bulkOpen, openModal: openBulkModal, closeModal: closeBulkModal,
    step, goToStep2, goToStep3, goBack,
    commonForm, commonErrors, handleCommonChange,
    categoryPath: bulkCategoryPath, handleCategoryChange: handleBulkCategoryChange,
    locations: bulkLocations, filteredDepartments: bulkDepts,
    categories: bulkCategories, dropdownsLoading: bulkDropdownsLoading,
    quantity, setQuantity,
    items, updateItem,
    quickFill, setQuickFill, applyQuickFill,
    isSubmitting: bulkSubmitting, handleSubmit: handleBulkSubmit, result: bulkResult,
  } = useBulkAssets();

  // ── Refresh asset list after bulk registration closes ─────────────────────
  const handleBulkClose = () => {
    closeBulkModal();
    if (bulkResult) refresh(); // ★ refresh only if something was registered
  };

  const totalPages = Math.ceil(totalCount / pageSize) || 1;
  const hasFilters = !!(
    filters.search || filters.status || filters.categoryId ||
    filters.locationId || filters.departmentId || filters.condition
  );

  const [confirm, setConfirm]           = useState(null);
  const [pendingSubmit, setPendingSubmit] = useState(false);

  function confirmDelete(asset) {
    openDeleteModal(asset);
    setConfirm({
      title: "Delete Asset?",
      message: "Asset will be soft deleted. QR code and history remain intact.",
      subText: `${asset.asset_code ?? ""} — ${asset.asset_name}`.replace(/^ — /, ""),
      confirmLabel: "Delete",
      confirmColor: "red",
      onConfirm: () => { setConfirm(null); handleDelete(asset); },
    });
  }

  return (
    <>
      <AssetTable
        assets={assets} loading={loading}
        totalCount={totalCount} page={page} pageSize={pageSize}
        totalPages={totalPages} onPageChange={setPage}
        hasFilters={hasFilters} onClearFilters={handleClearFilters}
        onEdit={openEditDrawer} onDelete={confirmDelete}
        canManage={canManage} canAdmin={canAdmin}
        onAdd={canManage ? openAddDrawer : undefined}
        onBulkAdd={canManage ? openBulkModal : undefined}  // ★ pass to table
        filters={filters} onSearchChange={handleSearchChange}
        onFilterChange={handleFilterChange}
        locations={locations} categories={categories}
        filterDepartments={filterDepartments}
      />

      {/* Single Asset Form */}
      <AssetForm
        open={drawerOpen} onClose={closeDrawer}
        isEditing={!!editingAsset} editingAsset={editingAsset}
        form={form} formErrors={formErrors}
        onFormChange={handleFormChange}
        onSubmit={() => setPendingSubmit(true)}
        isSubmitting={isSubmitting}
        locations={locations} filteredDepartments={filteredDepartments}
        employees={filteredEmployees}
        categories={categories} dropdownsLoading={dropdownsLoading}
        categoryPath={categoryPath} onCategoryChange={handleCategoryChange}
      />

      {/* ★ Bulk Asset Modal */}
      <BulkAssetModal
        open={bulkOpen} onClose={handleBulkClose}
        step={step} goToStep2={goToStep2} goToStep3={goToStep3} goBack={goBack}
        commonForm={commonForm} commonErrors={commonErrors}
        onCommonChange={handleCommonChange}
        categoryPath={bulkCategoryPath} onCategoryChange={handleBulkCategoryChange}
        locations={bulkLocations} filteredDepartments={bulkDepts}
        categories={bulkCategories} dropdownsLoading={bulkDropdownsLoading}
        quantity={quantity} onQuantityChange={setQuantity}
        items={items} onUpdateItem={updateItem}
        quickFill={quickFill}
        onQuickFillChange={(key, val) => setQuickFill((p) => ({ ...p, [key]: val }))}
        onApplyQuickFill={applyQuickFill}
        onSubmit={handleBulkSubmit} isSubmitting={bulkSubmitting}
        result={bulkResult}
      />

      {/* Confirm: create / update */}
      <ConfirmModal
        open={pendingSubmit}
        title={editingAsset ? "Update Asset?" : "Register Asset?"}
        message={editingAsset ? "Save these changes?" : "Register this asset?"}
        subText={form.asset_name}
        confirmLabel={editingAsset ? "Update" : "Register"}
        confirmColor="blue"
        onConfirm={() => { setPendingSubmit(false); handleSubmit(); }}
        onCancel={() => setPendingSubmit(false)}
        loading={isSubmitting}
      />

      {/* Confirm: delete */}
      <ConfirmModal
        open={!!confirm}
        title={confirm?.title} message={confirm?.message}
        subText={confirm?.subText} confirmLabel={confirm?.confirmLabel}
        confirmColor={confirm?.confirmColor} onConfirm={confirm?.onConfirm}
        onCancel={() => { setConfirm(null); closeDeleteModal(); }}
        loading={isSubmitting}
      />

      <AssetViewModal
        isOpen={viewModalOpen} onClose={closeViewModal}
        asset={selectedAsset} canManage={canManage} onEdit={openEditDrawer}
      />
    </>
  );
}