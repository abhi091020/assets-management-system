// src/pages/operations/TransferPage.jsx
import { useState } from "react";
import { useTransfers } from "../../hooks/useTransfers";
import TransferTable from "../../components/transfers/TransferTable";
import TransferForm from "../../components/transfers/TransferForm";
import TransferViewModal from "../../components/transfers/TransferViewModal";
import ConfirmModal from "../../components/common/ConfirmModal";

export default function TransferPage() {
  const {
    transfers,
    totalCount,
    loading,
    page,
    pageSize,
    setPage,
    filters,
    handleFilterChange,
    handleClearFilters,
    locations,
    toDepartments,
    employees,
    assets,
    dropdownsLoading,
    drawerOpen,
    editingTransfer,
    openRaiseDrawer,
    openEditDrawer,
    closeDrawer,
    viewModalOpen,
    openViewModal,
    closeViewModal,
    rejectModalOpen,
    openRejectModal,
    closeRejectModal,
    rejectionReason,
    setRejectionReason,
    selectedTransfer,
    form,
    formErrors,
    handleFormChange,
    handleSubmit,
    handleApprove,
    handleReject,
    handleDelete,
    isSubmitting,
    canAdmin,
    canManage,
  } = useTransfers();

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

  // ── Action wrappers ───────────────────────────────────────────────────────
  function confirmDelete(transfer) {
    setConfirm({
      title: "Delete Transfer?",
      message: "This transfer request will be permanently removed.",
      subText: transfer.transfer_code,
      confirmLabel: "Delete",
      confirmColor: "red",
      onConfirm: () => {
        closeConfirm();
        handleDelete(transfer);
      },
    });
  }

  return (
    <>
      <TransferTable
        transfers={transfers}
        loading={loading}
        page={page}
        pageSize={pageSize}
        totalCount={totalCount}
        onPageChange={setPage}
        onView={openViewModal}
        onEdit={openEditDrawer}
        onDelete={confirmDelete}
        canAdmin={canAdmin}
        canManage={canManage}
        onAdd={canManage ? openRaiseDrawer : undefined}
      />

      <TransferForm
        open={drawerOpen}
        onClose={closeDrawer}
        form={form}
        formErrors={formErrors}
        onChange={handleFormChange}
        onSubmit={requestSubmit}
        isSubmitting={isSubmitting}
        assets={assets}
        locations={locations}
        toDepartments={toDepartments}
        employees={employees}
        dropdownsLoading={dropdownsLoading}
        isEditing={!!editingTransfer}
      />

      {/* Confirm: raise / update */}
      <ConfirmModal
        open={pendingSubmit}
        title={editingTransfer ? "Update Transfer?" : "Raise Transfer?"}
        message={
          editingTransfer
            ? "Are you sure you want to save these changes?"
            : "Are you sure you want to raise this transfer request?"
        }
        confirmLabel={editingTransfer ? "Update" : "Raise Transfer"}
        confirmColor="blue"
        onConfirm={executeSubmit}
        onCancel={() => setPendingSubmit(false)}
        loading={isSubmitting}
      />

      {viewModalOpen && (
        <TransferViewModal
          transfer={selectedTransfer}
          onClose={closeViewModal}
          onApprove={handleApprove}
          onReject={handleReject}
          rejectModalOpen={rejectModalOpen}
          openRejectModal={openRejectModal}
          closeRejectModal={closeRejectModal}
          rejectionReason={rejectionReason}
          setRejectionReason={setRejectionReason}
          isSubmitting={isSubmitting}
          canAdmin={canAdmin}
        />
      )}

      {/* Confirm: delete */}
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
