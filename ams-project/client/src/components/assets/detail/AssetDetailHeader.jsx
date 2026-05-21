// client/src/components/assets/detail/AssetDetailHeader.jsx

import { C, S } from "./detailStyles";

export default function AssetDetailHeader({
  asset,
  loading,
  canManage,
  canAdmin,
  onBack,
  onEdit,
  onDelete,
  // ★ Assignment callbacks
  onAssign,
  onCollect,
  onReassign,
}) {
  const isAssigned = !!asset?.assigned_employee_id;

  return (
    <div style={S.pageHeaderRow}>
      {/* Left: accent bar + title */}
      <div style={S.titleAccent}>
        <div style={S.accentBar} />
        <div>
          <h1 style={S.pageTitle}>
            {loading ? "Asset Detail" : asset?.asset_name || "Asset Detail"}
          </h1>
          <p style={S.pageSubtitle}>
            {loading ? (
              "Loading…"
            ) : asset ? (
              <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                <span style={S.codeBadge}>{asset.asset_code}</span>
                {asset.category_name && <span>{asset.category_name}</span>}
                {/* Assignment status indicator */}
                {isAssigned ? (
                  <span style={{ fontSize: "11px", fontWeight: 600, padding: "2px 8px",
                    borderRadius: 20, background: "#DCFCE7", color: "#15803D" }}>
                    Assigned to {asset.employee_name}
                  </span>
                ) : (
                  <span style={{ fontSize: "11px", fontWeight: 600, padding: "2px 8px",
                    borderRadius: 20, background: "#F1F5F9", color: "#64748B" }}>
                    Unassigned
                  </span>
                )}
              </span>
            ) : ""}
          </p>
        </div>
      </div>

      {/* Right: action buttons */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
        <button
          onClick={onBack}
          style={S.backBtn}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.primary; e.currentTarget.style.color = C.primary; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.border;  e.currentTarget.style.color = C.textLight; }}
        >
          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        {/* ★ Assignment action buttons — only shown when asset is loaded */}
        {!loading && asset && canManage && (
          <>
            {!isAssigned ? (
              /* Unassigned → show Assign button */
              <button
                onClick={onAssign}
                style={{
                  display: "inline-flex", alignItems: "center", gap: "6px",
                  padding: "8px 14px", borderRadius: "8px", border: "none",
                  background: "#15803D", color: "#fff", fontSize: "13px",
                  fontWeight: 600, cursor: "pointer",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#166534")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#15803D")}
              >
                <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Assign
              </button>
            ) : (
              /* Assigned → show Collect + Reassign */
              <>
                <button
                  onClick={onCollect}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: "6px",
                    padding: "8px 14px", borderRadius: "8px", border: "none",
                    background: "#B91C1C", color: "#fff", fontSize: "13px",
                    fontWeight: 600, cursor: "pointer",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#991B1B")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "#B91C1C")}
                >
                  <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  Collect
                </button>

                <button
                  onClick={onReassign}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: "6px",
                    padding: "8px 14px", borderRadius: "8px", border: "none",
                    background: "#1D4ED8", color: "#fff", fontSize: "13px",
                    fontWeight: 600, cursor: "pointer",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#1E40AF")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "#1D4ED8")}
                >
                  <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                  Reassign
                </button>
              </>
            )}
          </>
        )}

        {!loading && asset && canManage && (
          <button
            onClick={onEdit}
            style={S.editBtn}
            onMouseEnter={(e) => (e.currentTarget.style.background = C.rowZebra)}
            onMouseLeave={(e) => (e.currentTarget.style.background = C.white)}
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit Asset
          </button>
        )}

        {!loading && asset && canAdmin && (
          <button
            onClick={onDelete}
            style={S.deleteBtn}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#FEE2E2")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#FFF5F5")}
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete
          </button>
        )}
      </div>
    </div>
  );
}