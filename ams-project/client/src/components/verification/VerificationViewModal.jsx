// client/src/components/verification/VerificationViewModal.jsx
import { useState } from "react";
import { BatchStatusBadge, ItemStatusBadge } from "./VerificationStatusBadge";

// ── Date helper ───────────────────────────────────────────────────────────────
function formatDate(dateStr) {
  if (!dateStr) return "N/A";
  const d = new Date(dateStr);
  if (isNaN(d)) return "N/A";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yy = String(d.getFullYear()).slice(-2);
  return `${dd}/${mm}/${yy}`;
}

// ── Verify Item Modal ─────────────────────────────────────────────────────────
function VerifyItemModal({
  open,
  item,
  form,
  setForm,
  onClose,
  onSubmit,
  isSubmitting,
}) {
  if (!open || !item) return null;

  const statuses = [
    {
      value: "Verified",
      label: "Verified",
      activeStyle: {
        backgroundColor: "#16A34A",
        color: "#fff",
        borderColor: "#16A34A",
      },
      icon: (
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ),
    },
    {
      value: "NotFound",
      label: "Not Found",
      activeStyle: {
        backgroundColor: "#DC2626",
        color: "#fff",
        borderColor: "#DC2626",
      },
      icon: (
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      ),
    },
    {
      value: "Pending",
      label: "Pending",
      activeStyle: {
        backgroundColor: "#D97706",
        color: "#fff",
        borderColor: "#D97706",
      },
      icon: (
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      ),
    },
  ];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
        <h3 className="text-lg font-bold text-gray-900">
          {form.isReVerify ? "Re-verify Asset" : "Verify Asset"}
        </h3>

        <div className="bg-gray-50 rounded-xl p-3">
          <p className="text-sm font-semibold text-gray-800">
            {item.asset_code}
          </p>
          <p className="text-xs text-gray-500">{item.asset_name}</p>
          {form.isReVerify && item.status !== "Pending" && (
            <p className="text-xs text-gray-400 mt-1">
              Currently:{" "}
              <span className="font-semibold">
                {item.status === "NotFound" ? "Not Found" : item.status}
              </span>
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-2">
            Verification Result
          </label>
          <div className="flex gap-2">
            {statuses.map((s) => {
              const isActive = form.status === s.value;
              return (
                <button
                  key={s.value}
                  onClick={() =>
                    setForm((prev) => ({ ...prev, status: s.value }))
                  }
                  style={
                    isActive
                      ? {
                          ...s.activeStyle,
                          flex: 1,
                          padding: "8px 4px",
                          borderRadius: "10px",
                          fontSize: "12px",
                          fontWeight: "600",
                          border: "2px solid",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "5px",
                          transition: "all 0.15s",
                          cursor: "pointer",
                        }
                      : {
                          flex: 1,
                          padding: "8px 4px",
                          borderRadius: "10px",
                          fontSize: "12px",
                          fontWeight: "600",
                          border: "2px solid #E5E7EB",
                          backgroundColor: "#fff",
                          color: "#6B7280",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "5px",
                          transition: "all 0.15s",
                          cursor: "pointer",
                        }
                  }
                >
                  {s.icon}
                  {s.label}
                </button>
              );
            })}
          </div>
        </div>

        {form.status === "Verified" && (
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Condition Found
            </label>
            <select
              value={form.conditionFound}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, conditionFound: e.target.value }))
              }
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">Select condition...</option>
              {["New", "Good", "Fair", "Poor", "Scrap"].map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">
            Remarks (optional)
          </label>
          <textarea
            value={form.remarks}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, remarks: e.target.value }))
            }
            rows={2}
            placeholder="Any notes..."
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
          />
        </div>

        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={isSubmitting}
            className="px-5 py-2.5 text-sm font-semibold text-white bg-red-600 rounded-xl hover:bg-red-700 transition disabled:opacity-60 flex items-center gap-2"
          >
            {isSubmitting && (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Inline action buttons ─────────────────────────────────────────────────────
function ItemActions({
  item,
  isOpen,
  canVerify,
  canManage,
  onVerify,
  onNotFound,
  onReVerify,
  onRemove,
  loadingItemId,
}) {
  const isLoading = loadingItemId === item.id;
  const isPending = item.status === "Pending";
  const isDone = item.status === "Verified" || item.status === "NotFound";
  if (!isOpen) return null;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "6px",
        flexShrink: 0,
      }}
    >
      {isPending && canVerify && (
        <>
          <button
            onClick={() => onVerify(item)}
            disabled={isLoading}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              padding: "4px 11px",
              borderRadius: "99px",
              fontSize: "11.5px",
              fontWeight: "600",
              border: "1.5px solid #BBF7D0",
              backgroundColor: "#F0FDF4",
              color: "#166534",
              cursor: isLoading ? "not-allowed" : "pointer",
              opacity: isLoading ? 0.6 : 1,
              transition: "all 0.15s",
              whiteSpace: "nowrap",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#DCFCE7";
              e.currentTarget.style.borderColor = "#86EFAC";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#F0FDF4";
              e.currentTarget.style.borderColor = "#BBF7D0";
            }}
          >
            {isLoading ? (
              <span
                style={{
                  width: "10px",
                  height: "10px",
                  border: "1.5px solid #166834",
                  borderTopColor: "transparent",
                  borderRadius: "50%",
                  display: "inline-block",
                  animation: "spin 0.6s linear infinite",
                }}
              />
            ) : (
              <svg
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
            Verified
          </button>
          <button
            onClick={() => onNotFound(item)}
            disabled={isLoading}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              padding: "4px 11px",
              borderRadius: "99px",
              fontSize: "11.5px",
              fontWeight: "600",
              border: "1.5px solid #FECACA",
              backgroundColor: "#FEF2F2",
              color: "#991B1B",
              cursor: isLoading ? "not-allowed" : "pointer",
              opacity: isLoading ? 0.6 : 1,
              transition: "all 0.15s",
              whiteSpace: "nowrap",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#FEE2E2";
              e.currentTarget.style.borderColor = "#FCA5A5";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#FEF2F2";
              e.currentTarget.style.borderColor = "#FECACA";
            }}
          >
            {isLoading ? (
              <span
                style={{
                  width: "10px",
                  height: "10px",
                  border: "1.5px solid #991B1B",
                  borderTopColor: "transparent",
                  borderRadius: "50%",
                  display: "inline-block",
                  animation: "spin 0.6s linear infinite",
                }}
              />
            ) : (
              <svg
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            )}
            Not Found
          </button>
        </>
      )}
      {isDone && canVerify && (
        <button
          onClick={() => onReVerify(item)}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
            padding: "4px 10px",
            borderRadius: "99px",
            fontSize: "11px",
            fontWeight: "500",
            border: "1.5px solid #E5E7EB",
            backgroundColor: "transparent",
            color: "#6B7280",
            cursor: "pointer",
            transition: "all 0.15s",
            whiteSpace: "nowrap",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#F9FAFB";
            e.currentTarget.style.borderColor = "#D1D5DB";
            e.currentTarget.style.color = "#374151";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.borderColor = "#E5E7EB";
            e.currentTarget.style.color = "#6B7280";
          }}
        >
          <svg
            width="10"
            height="10"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
          Re-verify
        </button>
      )}
      {canManage && (
        <button
          onClick={() => onRemove(item.id)}
          className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition"
          title="Remove from batch"
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
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ── Filter Tab ────────────────────────────────────────────────────────────────
function FilterTab({ label, count, color, active, onClick }) {
  const styles = {
    all: {
      activeBg: "#1F2937",
      activeColor: "#fff",
      activeBorder: "#1F2937",
      dot: null,
    },
    pending: {
      activeBg: "#FFFBEB",
      activeColor: "#92400E",
      activeBorder: "#FDE68A",
      dot: "#F59E0B",
    },
    verified: {
      activeBg: "#F0FDF4",
      activeColor: "#166534",
      activeBorder: "#BBF7D0",
      dot: "#22C55E",
    },
    notfound: {
      activeBg: "#FEF2F2",
      activeColor: "#991B1B",
      activeBorder: "#FECACA",
      dot: "#EF4444",
    },
  };
  const s = styles[color] || styles.all;
  return (
    <button
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "5px",
        padding: "5px 12px",
        borderRadius: "99px",
        fontSize: "12px",
        fontWeight: "600",
        border: `1.5px solid ${active ? s.activeBorder : "#E5E7EB"}`,
        backgroundColor: active ? s.activeBg : "transparent",
        color: active ? s.activeColor : "#6B7280",
        cursor: "pointer",
        transition: "all 0.15s",
        whiteSpace: "nowrap",
      }}
      onMouseEnter={(e) => {
        if (!active) {
          e.currentTarget.style.backgroundColor = "#F9FAFB";
          e.currentTarget.style.borderColor = "#D1D5DB";
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.backgroundColor = "transparent";
          e.currentTarget.style.borderColor = "#E5E7EB";
        }
      }}
    >
      {s.dot && (
        <span
          style={{
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            backgroundColor: s.dot,
            flexShrink: 0,
          }}
        />
      )}
      {label}
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          minWidth: "18px",
          height: "18px",
          padding: "0 4px",
          borderRadius: "99px",
          fontSize: "10px",
          fontWeight: "700",
          backgroundColor: active ? "rgba(0,0,0,0.12)" : "#F3F4F6",
          color: active ? "inherit" : "#6B7280",
        }}
      >
        {count}
      </span>
    </button>
  );
}

// ── Main Modal ────────────────────────────────────────────────────────────────
export default function VerificationViewModal({
  batch,
  onClose,
  items,
  itemsLoading,
  assets,
  addAssetId,
  setAddAssetId,
  handleAddAsset,
  addingAsset,
  handleRemoveItem,
  handleCloseBatch,
  handleReopenBatch,
  verifyModalOpen,
  openVerifyModal,
  closeVerifyModal,
  selectedItem,
  verifyForm,
  setVerifyForm,
  handleVerifyItem,
  canManage,
  canVerify,
  canAdmin,
  isSubmitting,
  handleVerifyInline,
  loadingItemId,
}) {
  if (!batch) return null;

  const [activeFilter, setActiveFilter] = useState("pending");

  const verified = items.filter((i) => i.status === "Verified").length;
  const notFound = items.filter((i) => i.status === "NotFound").length;
  const pending = items.filter((i) => i.status === "Pending").length;
  const total = items.length;
  const isOpen = batch.status === "Open";
  const isClosed = batch.status === "Closed";

  const availableAssets = assets.filter(
    (a) => !items.find((i) => String(i.asset_id) === String(a.id)),
  );
  const locationFiltered = batch.location_id
    ? availableAssets.filter(
        (a) => String(a.location_id) === String(batch.location_id),
      )
    : availableAssets;
  const filteredAssets = batch.department_id
    ? locationFiltered.filter(
        (a) => String(a.department_id) === String(batch.department_id),
      )
    : locationFiltered;

  const assetScopeLabel = batch.department_id
    ? `Showing assets in ${batch.dept_name || "selected department"}`
    : batch.location_id
      ? `Showing assets in ${batch.location_name || "selected location"}`
      : "Showing all assets";

  const filteredItems = items.filter((i) => {
    if (activeFilter === "pending") return i.status === "Pending";
    if (activeFilter === "verified") return i.status === "Verified";
    if (activeFilter === "notfound") return i.status === "NotFound";
    return true;
  });

  const verifiedPct = total ? (verified / total) * 100 : 0;
  const notFoundPct = total ? (notFound / total) * 100 : 0;

  const handleVerifyClick = (item) => {
    setVerifyForm({
      status: "Verified",
      conditionFound: "",
      remarks: "",
      isReVerify: false,
    });
    openVerifyModal(item);
  };
  const handleNotFoundClick = (item) => {
    if (handleVerifyInline) {
      handleVerifyInline(item, "NotFound", {
        status: "NotFound",
        conditionFound: "",
        remarks: "",
      });
    } else {
      setVerifyForm({
        status: "NotFound",
        conditionFound: "",
        remarks: "",
        isReVerify: false,
      });
      openVerifyModal(item);
    }
  };
  const handleReVerifyClick = (item) => {
    setVerifyForm({
      status: item.status,
      conditionFound: item.condition_found || "",
      remarks: "",
      isReVerify: true,
    });
    openVerifyModal(item);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm"
          onClick={onClose}
        />
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col">
          {/* ── Header ── */}
          <div className="flex items-start justify-between px-6 py-4 border-b border-gray-100">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-lg font-bold text-gray-900">
                  {batch.batch_code}
                </h2>
                <BatchStatusBadge status={batch.status} />
              </div>
              <p className="text-sm text-gray-700 font-medium mt-0.5">
                {batch.title}
              </p>
              {(batch.location_name || batch.dept_name) && (
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  {batch.location_name && (
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        padding: "2px 9px",
                        borderRadius: "99px",
                        fontSize: "11px",
                        fontWeight: "500",
                        backgroundColor: "#EFF6FF",
                        color: "#1D4ED8",
                        border: "1px solid #BFDBFE",
                      }}
                    >
                      <svg
                        width="10"
                        height="10"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 1 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      {batch.location_name}
                    </span>
                  )}
                  {batch.dept_name && (
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        padding: "2px 9px",
                        borderRadius: "99px",
                        fontSize: "11px",
                        fontWeight: "500",
                        backgroundColor: "#F5F3FF",
                        color: "#6D28D9",
                        border: "1px solid #DDD6FE",
                      }}
                    >
                      <svg
                        width="10"
                        height="10"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                      {batch.dept_name}
                    </span>
                  )}
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-gray-100 transition ml-3 flex-shrink-0"
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

          {/* ── Closed batch banner ── */}
          {isClosed && (
            <div className="mx-6 mt-4 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <svg
                  className="w-4 h-4 text-gray-400 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M7 11V7a5 5 0 0 1 10 0v4"
                  />
                </svg>
                <span>
                  This batch is <strong>closed</strong>. No changes allowed.
                </span>
              </div>
              {canAdmin && (
                <button
                  onClick={() => handleReopenBatch(batch)}
                  disabled={isSubmitting}
                  className="px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition disabled:opacity-60 whitespace-nowrap flex items-center gap-1.5"
                >
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  Re-open Batch
                </button>
              )}
            </div>
          )}

          {/* ── Progress Bar ── */}
          <div className="px-6 pt-4">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
              <span>{verified} verified</span>
              <span>{total} total</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden flex">
              {verifiedPct > 0 && (
                <div
                  className="h-full bg-green-500 transition-all"
                  style={{
                    width: `${verifiedPct}%`,
                    borderRadius:
                      verifiedPct === 100 ? "99px" : "99px 0 0 99px",
                  }}
                />
              )}
              {notFoundPct > 0 && (
                <div
                  className="h-full bg-red-400 transition-all"
                  style={{
                    width: `${notFoundPct}%`,
                    borderRadius:
                      verifiedPct === 0 && pending === 0
                        ? "99px"
                        : pending === 0
                          ? "0 99px 99px 0"
                          : "0",
                  }}
                />
              )}
            </div>
            <div className="flex gap-4 mt-2 text-xs">
              <span className="text-green-600 font-semibold">
                ✓ {verified} Verified
              </span>
              <span className="text-red-500 font-semibold">
                ✕ {notFound} Not Found
              </span>
              <span className="text-amber-600 font-semibold">
                ○ {pending} Pending
              </span>
            </div>
          </div>

          {/* ── Add asset row ── */}
          {isOpen && canVerify && (
            <div className="px-6 pt-3 mt-3 border-b border-gray-100 pb-3">
              <div className="flex gap-3">
                <select
                  value={addAssetId}
                  onChange={(e) => setAddAssetId(e.target.value)}
                  className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="">
                    {filteredAssets.length === 0
                      ? "No more assets available"
                      : "Select asset to add..."}
                  </option>
                  {filteredAssets.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.asset_code} — {a.asset_name}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleAddAsset}
                  disabled={addingAsset || !addAssetId}
                  className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-xl hover:bg-red-700 transition disabled:opacity-60 flex items-center gap-2 whitespace-nowrap"
                >
                  {addingAsset && (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  )}
                  Add Asset
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
                <svg
                  className="w-3 h-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                {assetScopeLabel} — {filteredAssets.length} asset
                {filteredAssets.length !== 1 ? "s" : ""} available
              </p>
            </div>
          )}

          {/* ── Filter Tabs ── */}
          {total > 0 && (
            <div className="px-6 pt-3 pb-1 flex items-center gap-2 flex-wrap border-b border-gray-100">
              <FilterTab
                label="All"
                count={total}
                color="all"
                active={activeFilter === "all"}
                onClick={() => setActiveFilter("all")}
              />
              <FilterTab
                label="Pending"
                count={pending}
                color="pending"
                active={activeFilter === "pending"}
                onClick={() => setActiveFilter("pending")}
              />
              <FilterTab
                label="Verified"
                count={verified}
                color="verified"
                active={activeFilter === "verified"}
                onClick={() => setActiveFilter("verified")}
              />
              <FilterTab
                label="Not Found"
                count={notFound}
                color="notfound"
                active={activeFilter === "notfound"}
                onClick={() => setActiveFilter("notfound")}
              />
            </div>
          )}

          {/* ── Items list ── */}
          <div className="flex-1 overflow-y-auto px-6 py-3">
            {itemsLoading ? (
              <div className="flex items-center justify-center h-24">
                <div className="w-6 h-6 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : total === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-gray-400">
                <svg
                  className="w-10 h-10 mb-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                <p className="text-sm">No assets in this batch yet</p>
                {isOpen && (
                  <p className="text-xs mt-1">
                    Use the dropdown above to add assets
                  </p>
                )}
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-24 text-gray-400">
                <p className="text-sm font-medium">
                  {activeFilter === "pending" &&
                    "🎉 All done — no pending assets left!"}
                  {activeFilter === "verified" && "No verified assets yet"}
                  {activeFilter === "notfound" &&
                    "No assets marked as Not Found"}
                </p>
                <button
                  onClick={() => setActiveFilter("all")}
                  className="mt-2 text-xs text-red-600 hover:underline font-medium"
                >
                  View all assets
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900">
                        {item.asset_code}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {item.asset_name}
                      </p>
                      {item.verified_by_name && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          by {item.verified_by_name}
                        </p>
                      )}
                    </div>
                    <ItemStatusBadge status={item.status} />
                    <ItemActions
                      item={item}
                      isOpen={isOpen}
                      canVerify={canVerify}
                      canManage={canManage}
                      onVerify={handleVerifyClick}
                      onNotFound={handleNotFoundClick}
                      onReVerify={handleReVerifyClick}
                      onRemove={handleRemoveItem}
                      loadingItemId={loadingItemId}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Footer ── */}
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-xs text-gray-500">
              Opened {formatDate(batch.opened_at)}
            </p>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition"
              >
                Close
              </button>
              {isOpen && canManage && (
                <button
                  onClick={() => handleCloseBatch(batch)}
                  disabled={isSubmitting}
                  className="px-4 py-2.5 text-sm font-semibold text-white bg-gray-800 rounded-xl hover:bg-gray-900 transition disabled:opacity-60 flex items-center gap-2"
                >
                  {isSubmitting && (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  )}
                  Close Batch
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <VerifyItemModal
        open={verifyModalOpen}
        item={selectedItem}
        form={verifyForm}
        setForm={setVerifyForm}
        onClose={closeVerifyModal}
        onSubmit={handleVerifyItem}
        isSubmitting={isSubmitting}
      />
    </>
  );
}
