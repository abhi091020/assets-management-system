// src/pages/operations/VerificationPage.jsx
import { useState } from "react";
import { useVerification } from "../../hooks/useVerification";
import VerificationTable from "../../components/verification/VerificationTable";
import VerificationForm from "../../components/verification/VerificationForm";
import VerificationViewModal from "../../components/verification/VerificationViewModal";
import ConfirmModal from "../../components/common/ConfirmModal";

export default function VerificationPage() {
  const {
    batches,
    totalCount,
    loading,
    page,
    pageSize,
    setPage,
    locations,
    departments,
    assets,
    dropdownsLoading,
    drawerOpen,
    openCreateDrawer,
    closeDrawer,
    batchForm,
    batchFormErrors,
    handleBatchFormChange,
    handleCreateBatch,
    viewModalOpen,
    openViewModal,
    closeViewModal,
    selectedBatch,
    batchItems,
    itemsLoading,
    addAssetId,
    setAddAssetId,
    handleAddAsset,
    addingAsset,
    handleRemoveItem,
    handleCloseBatch,
    handleReopenBatch,
    handleDeleteBatch,
    verifyModalOpen,
    openVerifyModal,
    closeVerifyModal,
    selectedItem,
    verifyForm,
    setVerifyForm,
    handleVerifyItem,
    handleVerifyInline,
    loadingItemId,
    isSubmitting,
    canAdmin,
    canManage,
    canVerify,
  } = useVerification();

  const [confirm, setConfirm] = useState(null);
  const closeConfirm = () => setConfirm(null);

  // ── Create batch confirm ──────────────────────────────────────────────────
  const [pendingCreate, setPendingCreate] = useState(false);
  function requestCreate() {
    setPendingCreate(true);
  }
  function executeCreate() {
    setPendingCreate(false);
    handleCreateBatch();
  }

  // ── Close batch confirm ───────────────────────────────────────────────────
  function confirmCloseBatch(batch) {
    setConfirm({
      title: "Close Batch?",
      message:
        "Once closed, no new assets can be added. You can re-open it later if needed.",
      subText: `${batch.batch_code ?? ""} — ${batch.title}`.replace(/^ — /, ""),
      confirmLabel: "Close Batch",
      confirmColor: "orange",
      onConfirm: () => {
        closeConfirm();
        handleCloseBatch(batch);
      },
    });
  }

  // ── Re-open batch confirm ─────────────────────────────────────────────────
  function confirmReopenBatch(batch) {
    setConfirm({
      title: "Re-open Batch?",
      message:
        "This batch will be re-opened. Team can continue adding assets and verifying.",
      subText: `${batch.batch_code ?? ""} — ${batch.title}`.replace(/^ — /, ""),
      confirmLabel: "Re-open",
      confirmColor: "blue",
      onConfirm: () => {
        closeConfirm();
        handleReopenBatch(batch);
      },
    });
  }

  // ── Delete batch confirm ──────────────────────────────────────────────────
  function confirmDeleteBatch(batch) {
    setConfirm({
      title: "Delete Verification Batch?",
      message: "Batch and all its items will be permanently removed.",
      subText: `${batch.batch_code ?? ""} — ${batch.title}`.replace(/^ — /, ""),
      confirmLabel: "Delete",
      confirmColor: "red",
      onConfirm: () => {
        closeConfirm();
        handleDeleteBatch(batch);
      },
    });
  }

  return (
    <>
      <VerificationTable
        batches={batches}
        loading={loading}
        page={page}
        pageSize={pageSize}
        totalCount={totalCount}
        onPageChange={setPage}
        onView={openViewModal}
        onDelete={confirmDeleteBatch}
        canAdmin={canAdmin}
        canManage={canManage}
        onAdd={canManage ? openCreateDrawer : undefined}
        locations={locations}
      />

      <VerificationForm
        open={drawerOpen}
        onClose={closeDrawer}
        form={batchForm}
        formErrors={batchFormErrors}
        onChange={handleBatchFormChange}
        onSubmit={requestCreate}
        isSubmitting={isSubmitting}
        locations={locations}
        departments={departments}
        dropdownsLoading={dropdownsLoading}
      />

      {/* Confirm: create batch */}
      <ConfirmModal
        open={pendingCreate}
        title="Create Verification Batch?"
        message="Are you sure you want to create this verification batch?"
        subText={batchForm.title}
        confirmLabel="Create Batch"
        confirmColor="blue"
        onConfirm={executeCreate}
        onCancel={() => setPendingCreate(false)}
        loading={isSubmitting}
      />

      {viewModalOpen && (
        <VerificationViewModal
          batch={selectedBatch}
          onClose={closeViewModal}
          items={batchItems}
          itemsLoading={itemsLoading}
          assets={assets}
          addAssetId={addAssetId}
          setAddAssetId={setAddAssetId}
          handleAddAsset={handleAddAsset}
          addingAsset={addingAsset}
          handleRemoveItem={handleRemoveItem}
          handleCloseBatch={confirmCloseBatch}
          handleReopenBatch={confirmReopenBatch}
          verifyModalOpen={verifyModalOpen}
          openVerifyModal={openVerifyModal}
          closeVerifyModal={closeVerifyModal}
          selectedItem={selectedItem}
          verifyForm={verifyForm}
          setVerifyForm={setVerifyForm}
          handleVerifyItem={handleVerifyItem}
          handleVerifyInline={handleVerifyInline}
          loadingItemId={loadingItemId}
          canManage={canManage}
          canVerify={canVerify}
          canAdmin={canAdmin}
          isSubmitting={isSubmitting}
        />
      )}

      {/* Confirm: close / re-open / delete batch */}
      <ConfirmModal
        open={!!confirm}
        title={confirm?.title}
        message={confirm?.message}
        subText={confirm?.subText}
        confirmLabel={confirm?.confirmLabel}
        confirmColor={confirm?.confirmColor}
        onConfirm={confirm?.onConfirm}
        onCancel={closeConfirm}
        loading={isSubmitting}
      />
    </>
  );
}
