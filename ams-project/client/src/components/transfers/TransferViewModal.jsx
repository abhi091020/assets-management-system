// client/src/components/transfers/TransferViewModal.jsx
import TransferStatusBadge from "./TransferStatusBadge";

// ── Date helpers ──────────────────────────────────────────────────────────────
function fmtDateTime(str) {
  if (!str) return "—";
  return new Date(str.replace(/Z$/, "")).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
}

function InfoRow({ label, value }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-1 py-2 border-b border-gray-100 last:border-0">
      <span className="text-xs font-semibold text-gray-500 sm:w-40 shrink-0">
        {label}
      </span>
      <span className="text-sm text-gray-900">{value || "—"}</span>
    </div>
  );
}

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
        <h3 className="text-lg font-bold text-gray-900">Reject Transfer</h3>
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

export default function TransferViewModal({
  transfer,
  onClose,
  onApprove,
  onReject,
  rejectModalOpen,
  openRejectModal,
  closeRejectModal,
  rejectionReason,
  setRejectionReason,
  isSubmitting,
  canAdmin,
}) {
  if (!transfer) return null;

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
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                {transfer.transfer_code}
              </h2>
              <div className="mt-1">
                <TransferStatusBadge status={transfer.status} />
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
              <InfoRow label="Asset Code" value={transfer.asset_code} />
              <InfoRow label="Asset Name" value={transfer.asset_name} />
            </div>

            {/* From → To */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                <p className="text-xs font-bold text-red-600 uppercase tracking-wide mb-2">
                  From
                </p>
                <p className="text-sm font-medium text-gray-800">
                  {transfer.from_location_name || "—"}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  {transfer.from_dept_name || "—"}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {transfer.from_employee_name || "No employee"}
                </p>
              </div>
              <div className="bg-green-50 border border-green-100 rounded-xl p-4">
                <p className="text-xs font-bold text-green-600 uppercase tracking-wide mb-2">
                  To
                </p>
                <p className="text-sm font-medium text-gray-800">
                  {transfer.to_location_name || "—"}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  {transfer.to_dept_name || "—"}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {transfer.to_employee_name || "No employee"}
                </p>
              </div>
            </div>

            {/* Audit Trail */}
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">
                Audit Trail
              </p>
              <InfoRow label="Raised By" value={transfer.raised_by_name} />
              <InfoRow
                label="Raised On"
                value={fmtDateTime(transfer.created_at)}
              />
              <InfoRow label="Approved By" value={transfer.approved_by_name} />
              <InfoRow
                label="Approved On"
                value={fmtDateTime(transfer.approved_at)}
              />
              {transfer.reason && (
                <InfoRow label="Reason" value={transfer.reason} />
              )}
              {transfer.rejection_reason && (
                <InfoRow
                  label="Rejection Reason"
                  value={transfer.rejection_reason}
                />
              )}
            </div>
          </div>

          {/* Footer */}
          {canAdmin && transfer.status === "Pending" && (
            <div className="px-6 py-4 border-t border-gray-100 flex gap-3 justify-end sticky bottom-0 bg-white">
              <button
                onClick={() => openRejectModal(transfer)}
                className="px-4 py-2.5 text-sm font-semibold text-red-700 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 transition"
              >
                Reject
              </button>
              <button
                onClick={() => onApprove(transfer)}
                disabled={isSubmitting}
                className="px-5 py-2.5 text-sm font-semibold text-white bg-green-600 rounded-xl hover:bg-green-700 transition disabled:opacity-60 flex items-center gap-2"
              >
                {isSubmitting && (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                Approve Transfer
              </button>
            </div>
          )}
        </div>
      </div>

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
