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
}) {
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
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <span style={S.codeBadge}>{asset.asset_code}</span>
                {asset.category_name && <span>{asset.category_name}</span>}
              </span>
            ) : (
              ""
            )}
          </p>
        </div>
      </div>

      {/* Right: buttons */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <button
          onClick={onBack}
          style={S.backBtn}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = C.primary;
            e.currentTarget.style.color = C.primary;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = C.border;
            e.currentTarget.style.color = C.textLight;
          }}
        >
          <svg
            width="14"
            height="14"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back
        </button>

        {!loading && asset && canManage && (
          <button
            onClick={onEdit}
            style={S.editBtn}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = C.rowZebra)
            }
            onMouseLeave={(e) => (e.currentTarget.style.background = C.white)}
          >
            <svg
              width="14"
              height="14"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
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
            <svg
              width="14"
              height="14"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            Delete
          </button>
        )}
      </div>
    </div>
  );
}
