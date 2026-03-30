// src/pages/operations/DisposalPage.jsx
import { useState } from "react";
import { useDisposals } from "../../hooks/useDisposals";
import DisposalTable from "../../components/disposals/DisposalTable";
import DisposalForm from "../../components/disposals/DisposalForm";
import DisposalViewModal from "../../components/disposals/DisposalViewModal";
import ConfirmModal from "../../components/common/ConfirmModal";

export default function DisposalPage() {
  const {
    disposals,
    totalCount,
    loading,
    page,
    pageSize,
    setPage,
    assets,
    locations,
    departments,
    dropdownsLoading,
    pendingAssetIds,
    drawerOpen,
    editingDisposal,
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
    selectedDisposal,
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
  } = useDisposals();

  const [confirm, setConfirm] = useState(null);
  const closeConfirm = () => setConfirm(null);

  // ── Approve confirm ───────────────────────────────────────────────────────
  const [approveConfirmOpen, setApproveConfirmOpen] = useState(false);
  const openApproveConfirm = () => setApproveConfirmOpen(true);
  const closeApproveConfirm = () => setApproveConfirmOpen(false);

  // ── Form save intercept ───────────────────────────────────────────────────
  const [pendingSubmit, setPendingSubmit] = useState(false);
  function requestSubmit() {
    setPendingSubmit(true);
  }
  function executeSubmit() {
    setPendingSubmit(false);
    handleSubmit();
  }

  // ── Reject confirm — step 1 before reason modal ───────────────────────────
  const [rejectConfirmDisposal, setRejectConfirmDisposal] = useState(null);
  const openRejectConfirm = (disposal) => setRejectConfirmDisposal(disposal);
  const closeRejectConfirm = () => setRejectConfirmDisposal(null);
  const confirmAndOpenRejectModal = () => {
    const d = rejectConfirmDisposal;
    closeRejectConfirm();
    openRejectModal(d);
  };

  // ── Delete confirm ────────────────────────────────────────────────────────
  function confirmDelete(disposal) {
    setConfirm({
      title: "Delete Disposal?",
      message:
        disposal.status === "Approved"
          ? `${disposal.asset_name} will be restored to Active.`
          : "This disposal request will be permanently removed.",
      subText: disposal.disposal_code,
      confirmLabel: "Delete",
      confirmColor: "red",
      onConfirm: () => {
        closeConfirm();
        handleDelete(disposal);
      },
    });
  }

  return (
    <>
      <DisposalTable
        disposals={disposals}
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

      <DisposalForm
        open={drawerOpen}
        onClose={closeDrawer}
        form={form}
        formErrors={formErrors}
        onChange={handleFormChange}
        onSubmit={requestSubmit}
        isSubmitting={isSubmitting}
        assets={assets}
        locations={locations}
        departments={departments}
        dropdownsLoading={dropdownsLoading}
        isEditing={!!editingDisposal}
        editingDisposal={editingDisposal}
        pendingAssetIds={pendingAssetIds}
      />

      {/* Confirm: raise / update */}
      <ConfirmModal
        open={pendingSubmit}
        title={editingDisposal ? "Update Disposal?" : "Raise Disposal?"}
        message={
          editingDisposal
            ? "Are you sure you want to save these changes?"
            : "Are you sure you want to raise this disposal request?"
        }
        confirmLabel={editingDisposal ? "Update" : "Raise Disposal"}
        confirmColor="blue"
        onConfirm={executeSubmit}
        onCancel={() => setPendingSubmit(false)}
        loading={isSubmitting}
      />

      {viewModalOpen && (
        <DisposalViewModal
          disposal={selectedDisposal}
          onClose={closeViewModal}
          onApprove={handleApprove}
          onReject={handleReject}
          onDelete={(disposal) => {
            closeViewModal();
            confirmDelete(disposal);
          }}
          rejectModalOpen={rejectModalOpen}
          openRejectModal={openRejectConfirm} // ← goes to confirm first
          closeRejectModal={closeRejectModal}
          rejectionReason={rejectionReason}
          setRejectionReason={setRejectionReason}
          isSubmitting={isSubmitting}
          canAdmin={canAdmin}
          approveConfirmOpen={approveConfirmOpen}
          openApproveConfirm={openApproveConfirm}
          closeApproveConfirm={closeApproveConfirm}
        />
      )}

      {/* Confirm: reject — step 1 */}
      <ConfirmModal
        open={!!rejectConfirmDisposal}
        title="Reject Disposal?"
        message={
          rejectConfirmDisposal?.status === "Approved"
            ? `${rejectConfirmDisposal?.asset_name} will be restored to Active.`
            : "Are you sure you want to reject this disposal request?"
        }
        subText={rejectConfirmDisposal?.disposal_code}
        confirmLabel="Yes, Reject"
        confirmColor="orange"
        onConfirm={confirmAndOpenRejectModal}
        onCancel={closeRejectConfirm}
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
        onCancel={closeConfirm}
        loading={isSubmitting}
      />
    </>
  );
}
