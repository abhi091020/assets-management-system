// client/src/components/disposals/DisposalViewModal.jsx
import DisposalStatusBadge from "./DisposalStatusBadge";
import DisposalMethodBadge from "./DisposalMethodBadge";

// ── Date helpers ──────────────────────────────────────────────────────────────
function formatDate(dateStr) {
  if (!dateStr) return "N/A";
  const d = new Date(dateStr);
  if (isNaN(d)) return "N/A";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yy = String(d.getFullYear()).slice(-2);
  return `${dd}/${mm}/${yy}`;
}

function formatDateTime(dateStr) {
  if (!dateStr) return "N/A";
  const d = new Date(dateStr);
  if (isNaN(d)) return "N/A";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yy = String(d.getFullYear()).slice(-2);
  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${dd}/${mm}/${yy} ${hh}:${min}`;
}

function InfoRow({ label, value }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-1 py-2 border-b border-gray-100 last:border-0">
      <span className="text-xs font-semibold text-gray-500 sm:w-40 shrink-0">
        {label}
      </span>
      <span className="text-sm text-gray-900">{value || "N/A"}</span>
    </div>
  );
}

// ── Reject Modal ──────────────────────────────────────────────────────────────
function RejectModal({
  open,
  onClose,
  onConfirm,
  rejectionReason,
  setRejectionReason,
  isSubmitting,
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
        <h3 className="text-lg font-bold text-gray-900">Reject Disposal</h3>
        <p className="text-sm text-gray-500">
          Provide a reason for rejection (optional).
        </p>
        <textarea
          value={rejectionReason}
          onChange={(e) => setRejectionReason(e.target.value)}
          rows={3}
          placeholder="Rejection reason..."
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
        />
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isSubmitting}
            className="px-4 py-2.5 text-sm font-semibold text-white bg-red-600 rounded-xl hover:bg-red-700 transition disabled:opacity-60 flex items-center gap-2"
          >
            {isSubmitting && (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            Confirm Reject
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Approve Confirm Modal ─────────────────────────────────────────────────────
function ApproveConfirmModal({
  open,
  disposal,
  onClose,
  onConfirm,
  isSubmitting,
}) {
  if (!open || !disposal) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mx-auto">
          <svg
            className="w-6 h-6 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <div className="text-center">
          <h3 className="text-lg font-bold text-gray-900">Approve Disposal?</h3>
          <p className="text-sm text-gray-500 mt-1">
            This will permanently mark the asset as <strong>Disposed</strong>.
            This action cannot be undone.
          </p>
          <p className="text-xs text-gray-400 mt-2 font-mono bg-gray-50 rounded-lg px-3 py-1.5">
            {disposal.disposal_code} — {disposal.asset_code}
          </p>
        </div>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isSubmitting}
            className="px-5 py-2.5 text-sm font-semibold text-white bg-green-600 rounded-xl hover:bg-green-700 transition disabled:opacity-60 flex items-center gap-2"
          >
            {isSubmitting && (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            Yes, Approve
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Modal ────────────────────────────────────────────────────────────────
export default function DisposalViewModal({
  disposal,
  onClose,
  onApprove,
  onReject,
  onDelete,
  rejectModalOpen,
  openRejectModal,
  closeRejectModal,
  rejectionReason,
  setRejectionReason,
  isSubmitting,
  canAdmin,
  approveConfirmOpen,
  openApproveConfirm,
  closeApproveConfirm,
}) {
  if (!disposal) return null;

  const isPending = disposal.status === "Pending";
  const isApproved = disposal.status === "Approved";

  // Show footer if canAdmin and there's at least one action available
  const showFooter = canAdmin;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm"
          onClick={onClose}
        />
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-gray-900">
                {disposal.disposal_code}
              </h2>
              <div className="flex items-center gap-2">
                <DisposalStatusBadge status={disposal.status} />
                <DisposalMethodBadge method={disposal.disposal_method} />
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-gray-100 transition"
            >
              <svg
                className="w-5 h-5 text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-5 space-y-5">
            {/* Asset */}
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">
                Asset
              </p>
              <InfoRow label="Asset Code" value={disposal.asset_code} />
              <InfoRow label="Asset Name" value={disposal.asset_name} />
              <InfoRow label="Serial Number" value={disposal.serial_number} />
              <InfoRow label="Location" value={disposal.location_name} />
              <InfoRow label="Department" value={disposal.dept_name} />
              <InfoRow
                label="Purchase Cost"
                value={
                  disposal.purchase_cost
                    ? `₹${Number(disposal.purchase_cost).toLocaleString()}`
                    : null
                }
              />
              <InfoRow
                label="Current Book Value"
                value={
                  disposal.current_book_value
                    ? `₹${Number(disposal.current_book_value).toLocaleString()}`
                    : null
                }
              />
            </div>

            {/* Disposal Details */}
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">
                Disposal Details
              </p>
              <InfoRow label="Reason" value={disposal.reason} />
              <InfoRow label="Method" value={disposal.disposal_method} />
              <InfoRow
                label="Disposal Date"
                value={formatDate(disposal.disposal_date)}
              />
              {disposal.disposal_method === "Sold" && (
                <>
                  <InfoRow
                    label="Sale Amount"
                    value={
                      disposal.sale_amount
                        ? `₹${Number(disposal.sale_amount).toLocaleString()}`
                        : null
                    }
                  />
                  <InfoRow
                    label="Buyer Details"
                    value={disposal.buyer_details}
                  />
                </>
              )}
              {disposal.rejection_reason && (
                <InfoRow
                  label="Rejection Reason"
                  value={disposal.rejection_reason}
                />
              )}
            </div>

            {/* Audit Trail */}
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">
                Audit Trail
              </p>
              <InfoRow label="Raised By" value={disposal.raised_by_name} />
              <InfoRow
                label="Raised On"
                value={formatDateTime(disposal.created_at)}
              />
              <InfoRow
                label="Approved / Rejected By"
                value={disposal.approved_by_name}
              />
              <InfoRow
                label="Approved / Rejected On"
                value={formatDateTime(disposal.approved_at)}
              />
            </div>
          </div>

          {/* Footer
              ┌─────────────────────────────────────────────────────┐
              │ Status    │ Delete │ Reject │ Approve               │
              │ Pending   │  ✓     │  ✓     │  ✓                    │
              │ Approved  │  ✓     │  ✓     │  —                    │
              │ Rejected  │  ✓     │  —     │  —                    │
              └─────────────────────────────────────────────────────┘
          */}
          {showFooter && (
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between sticky bottom-0 bg-white">
              {/* Delete — always visible for canAdmin */}
              <button
                onClick={() => onDelete?.(disposal)}
                className="px-4 py-2.5 text-sm font-semibold text-red-700 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 transition flex items-center gap-2"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                Delete
              </button>

              {/* Right side actions */}
              <div className="flex gap-3">
                {/* Reject — Pending or Approved */}
                {(isPending || isApproved) && (
                  <button
                    onClick={() => openRejectModal(disposal)}
                    className="px-4 py-2.5 text-sm font-semibold text-orange-700 bg-orange-50 border border-orange-200 rounded-xl hover:bg-orange-100 transition"
                  >
                    Reject
                  </button>
                )}

                {/* Approve — Pending only */}
                {isPending && (
                  <button
                    onClick={() => openApproveConfirm(disposal)}
                    disabled={isSubmitting}
                    className="px-5 py-2.5 text-sm font-semibold text-white bg-green-600 rounded-xl hover:bg-green-700 transition disabled:opacity-60 flex items-center gap-2"
                  >
                    {isSubmitting && (
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    )}
                    Approve Disposal
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Approve Confirm */}
      <ApproveConfirmModal
        open={approveConfirmOpen}
        disposal={disposal}
        onClose={closeApproveConfirm}
        onConfirm={() => {
          closeApproveConfirm();
          onApprove(disposal);
        }}
        isSubmitting={isSubmitting}
      />

      {/* Reject Modal */}
      <RejectModal
        open={rejectModalOpen}
        onClose={closeRejectModal}
        onConfirm={onReject}
        rejectionReason={rejectionReason}
        setRejectionReason={setRejectionReason}
        isSubmitting={isSubmitting}
      />
    </>
  );
}
