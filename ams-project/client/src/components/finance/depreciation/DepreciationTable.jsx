// client/src/components/finance/depreciation/DepreciationTable.jsx

import DepreciationFilters from "./DepreciationFilters";

const C = {
  primary: "#8B1A1A",
  headerBg: "#8B1A1A",
  white: "#FFFFFF",
  text: "#333333",
  textLight: "#888888",
  border: "#EBEBEB",
  rowHover: "#FDF8F8",
  rowZebra: "#FAFAFA",
  blue: "#2563EB",
  green: "#16A34A",
  red: "#DC2626",
};

const styles = {
  page: { fontFamily: "'Segoe UI', sans-serif" },

  // ── Page header ──
  pageHeaderRow: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: "24px",
    flexWrap: "wrap",
    gap: "12px",
  },
  titleAccent: { display: "flex", alignItems: "center", gap: "10px" },
  accentBar: {
    width: "4px",
    height: "32px",
    borderRadius: "4px",
    background: "linear-gradient(180deg, #8B1A1A 0%, #C0392B 100%)",
    flexShrink: 0,
  },
  pageTitle: {
    fontSize: "26px",
    fontWeight: "700",
    color: C.primary,
    margin: 0,
    lineHeight: 1.2,
  },
  pageSubtitle: { fontSize: "13px", color: C.textLight, marginTop: "4px" },
  headerActions: { display: "flex", alignItems: "center", gap: "10px" },

  refreshBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "38px",
    height: "38px",
    border: "1.5px solid #EBEBEB",
    borderRadius: "10px",
    background: C.white,
    cursor: "pointer",
    color: C.textLight,
    transition: "all 0.15s",
  },
  runBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "linear-gradient(135deg, #8B1A1A 0%, #6E1515 100%)",
    color: C.white,
    border: "none",
    borderRadius: "50px",
    padding: "10px 22px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s",
    whiteSpace: "nowrap",
    boxShadow: "0 4px 14px rgba(139,26,26,0.35)",
  },

  // ── Card ──
  card: {
    backgroundColor: C.white,
    borderRadius: "16px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
    padding: "20px",
    border: "1px solid rgba(0,0,0,0.04)",
  },
  filtersRow: { marginBottom: "18px" },

  // ── Table ──
  tableWrapper: {
    overflowX: "auto",
    overflowY: "auto",
    maxHeight: "calc(100vh - 320px)", // ← add this
    borderRadius: "12px",
    border: `1px solid ${C.border}`,
    boxShadow: "inset 0 1px 3px rgba(0,0,0,0.03)",
  },
  table: { width: "100%", borderCollapse: "collapse", minWidth: "800px" },
  thead: { backgroundColor: C.headerBg, position: "sticky", top: 0, zIndex: 2 },
  th: {
    color: C.white,
    fontWeight: "600",
    fontSize: "13px",
    padding: "14px 16px",
    textAlign: "left",
    letterSpacing: "0.04em",
    whiteSpace: "nowrap",
    backgroundColor: C.headerBg,
  },
  thRight: { textAlign: "right" },
  thCenter: { textAlign: "center" },

  tr: { borderBottom: `1px solid ${C.border}`, transition: "background 0.15s" },
  td: {
    padding: "13px 16px",
    fontSize: "14px",
    color: C.text,
    verticalAlign: "middle",
  },

  // ── Cell content ──
  assetCode: {
    fontWeight: "700",
    fontSize: "13px",
    color: C.primary,
    letterSpacing: "0.01em",
  },
  assetName: { fontSize: "12px", color: C.textLight, marginTop: "2px" },
  assetCat: { fontSize: "11px", color: "#BBBBBB", marginTop: "1px" },

  methodBadge: (method) => ({
    display: "inline-block",
    padding: "3px 10px",
    borderRadius: "50px",
    fontSize: "11px",
    fontWeight: "700",
    backgroundColor: method === "SLM" ? "#EFF6FF" : "#F5F3FF",
    color: method === "SLM" ? "#1D4ED8" : "#6D28D9",
    border: method === "SLM" ? "1px solid #BFDBFE" : "1px solid #DDD6FE",
    marginTop: "4px",
  }),

  amtRed: { fontSize: "14px", fontWeight: "700", color: C.red },
  amtBold: { fontSize: "14px", fontWeight: "700", color: C.text },
  amtNormal: { fontSize: "14px", color: "#555" },
  rateSub: { fontSize: "11px", color: C.textLight, marginTop: "2px" },

  runByName: { fontSize: "12px", color: "#555" },
  runByDate: { fontSize: "11px", color: "#BBBBBB", marginTop: "2px" },

  actionsCell: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    justifyContent: "center",
  },
  actionBtn: (color) => ({
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "6px",
    borderRadius: "8px",
    color: color,
    display: "flex",
    alignItems: "center",
    transition: "background 0.15s, transform 0.1s",
  }),

  emptyCell: {
    textAlign: "center",
    color: C.textLight,
    padding: "48px",
    fontSize: "14px",
  },

  // ── Skeleton ──
  skeletonRow: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    padding: "14px 16px",
  },
  skeletonBox: (w) => ({
    height: "14px",
    width: w,
    backgroundColor: "#F3F4F6",
    borderRadius: "6px",
    flexShrink: 0,
  }),

  // ── Pagination ──
  paginationRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "14px 16px 0",
    marginTop: "14px",
    borderTop: `1px solid ${C.border}`,
    flexShrink: 0,
  },
  paginationText: { fontSize: "13px", color: C.textLight },
  paginationBtns: { display: "flex", alignItems: "center", gap: "8px" },
  pageBtn: (disabled) => ({
    padding: "6px 14px",
    fontSize: "13px",
    border: `1.5px solid ${C.border}`,
    borderRadius: "8px",
    background: C.white,
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.4 : 1,
    color: C.text,
    transition: "background 0.15s",
  }),
  pageInfo: { fontSize: "13px", color: C.text, fontWeight: "600" },
};

function formatINR(value) {
  if (value == null) return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);
}

export default function DepreciationTable({
  data = [],
  loading = false,
  page,
  pageSize,
  totalCount,
  onPageChange,
  onViewLedger,
  onReRun,
  onRunAll,
  onRefresh,
  canAdd = false,
  currentFY,
  filters,
  onFilterChange,
  onClearFilters,
}) {
  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div style={styles.page}>
      {/* ── Page Header ── */}
      <div style={styles.pageHeaderRow}>
        <div style={styles.titleAccent}>
          <div style={styles.accentBar} />
          <div>
            <h1 style={styles.pageTitle}>Depreciation</h1>
            <p style={styles.pageSubtitle}>
              {currentFY
                ? `Financial Year ${currentFY}`
                : "Asset depreciation ledger"}
            </p>
          </div>
        </div>

        <div style={styles.headerActions}>
          {/* Run Depreciation */}
          {canAdd && (
            <button
              style={styles.runBtn}
              onClick={onRunAll}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow =
                  "0 6px 18px rgba(139,26,26,0.45)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "0 4px 14px rgba(139,26,26,0.35)";
              }}
            >
              <svg
                width="16"
                height="16"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Run Depreciation
            </button>
          )}
        </div>
      </div>

      {/* ── Card ── */}
      <div style={styles.card}>
        {/* Filters */}
        <div style={styles.filtersRow}>
          <DepreciationFilters
            filters={filters}
            onFilterChange={onFilterChange}
            onClearFilters={onClearFilters}
            currentFY={currentFY}
          />
        </div>

        {/* Table */}
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead style={styles.thead}>
              <tr>
                <th style={styles.th}>Asset</th>
                <th style={styles.th}>FY / Method</th>
                <th style={{ ...styles.th, ...styles.thRight }}>
                  Opening Value
                </th>
                <th style={{ ...styles.th, ...styles.thRight }}>
                  Depreciation
                </th>
                <th style={{ ...styles.th, ...styles.thRight }}>
                  Closing Value
                </th>
                <th style={styles.th}>Rate</th>
                <th style={styles.th}>Run By</th>
                <th style={{ ...styles.th, ...styles.thCenter }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} style={styles.tr}>
                    <td colSpan={8} style={{ padding: 0 }}>
                      <div style={styles.skeletonRow}>
                        <div style={styles.skeletonBox("80px")} />
                        <div
                          style={{ ...styles.skeletonBox("140px"), flex: 1 }}
                        />
                        <div style={styles.skeletonBox("80px")} />
                        <div style={styles.skeletonBox("90px")} />
                        <div style={styles.skeletonBox("90px")} />
                        <div style={styles.skeletonBox("50px")} />
                        <div style={styles.skeletonBox("70px")} />
                        <div style={styles.skeletonBox("60px")} />
                      </div>
                    </td>
                  </tr>
                ))
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={8} style={styles.emptyCell}>
                    No depreciation records found. Run depreciation to see
                    results.
                  </td>
                </tr>
              ) : (
                data.map((row, idx) => (
                  <tr
                    key={row.id}
                    style={{
                      ...styles.tr,
                      backgroundColor: idx % 2 === 1 ? C.rowZebra : C.white,
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = C.rowHover)
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor =
                        idx % 2 === 1 ? C.rowZebra : C.white)
                    }
                  >
                    {/* Asset */}
                    <td style={styles.td}>
                      <div style={styles.assetCode}>{row.asset_code}</div>
                      <div style={styles.assetName}>{row.asset_name}</div>
                      <div style={styles.assetCat}>{row.category_name}</div>
                    </td>

                    {/* FY / Method */}
                    <td style={styles.td}>
                      <div
                        style={{
                          fontSize: "13px",
                          fontWeight: "600",
                          color: C.text,
                        }}
                      >
                        FY {row.financial_year}
                      </div>
                      <span style={styles.methodBadge(row.method)}>
                        {row.method}
                      </span>
                    </td>

                    {/* Opening */}
                    <td style={{ ...styles.td, textAlign: "right" }}>
                      <span style={styles.amtNormal}>
                        {formatINR(row.opening_value)}
                      </span>
                    </td>

                    {/* Depreciation */}
                    <td style={{ ...styles.td, textAlign: "right" }}>
                      <span style={styles.amtRed}>
                        − {formatINR(row.depreciation_amount)}
                      </span>
                    </td>

                    {/* Closing */}
                    <td style={{ ...styles.td, textAlign: "right" }}>
                      <span style={styles.amtBold}>
                        {formatINR(row.closing_value)}
                      </span>
                    </td>

                    {/* Rate */}
                    <td style={styles.td}>
                      <span style={{ fontSize: "13px", color: C.text }}>
                        {row.rate_used}%
                      </span>
                      {row.useful_life_years && (
                        <div style={styles.rateSub}>
                          {row.useful_life_years} yrs
                        </div>
                      )}
                    </td>

                    {/* Run By */}
                    <td style={styles.td}>
                      <div style={styles.runByName}>
                        {row.run_by || "System"}
                      </div>
                      <div style={styles.runByDate}>
                        {row.created_at
                          ? new Date(row.created_at).toLocaleDateString("en-IN")
                          : "—"}
                      </div>
                    </td>

                    {/* Actions */}
                    <td style={{ ...styles.td, padding: "13px 8px" }}>
                      <div style={styles.actionsCell}>
                        {/* View Ledger */}
                        <button
                          style={styles.actionBtn(C.blue)}
                          onClick={() => onViewLedger(row.asset_id)}
                          title="View full ledger"
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background =
                              "rgba(37,99,235,0.08)";
                            e.currentTarget.style.transform = "scale(1.1)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "none";
                            e.currentTarget.style.transform = "scale(1)";
                          }}
                        >
                          <svg
                            width="16"
                            height="16"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M9 17v-2a4 4 0 0 1 4-4h0a4 4 0 0 1 4 4v2M3 3h18M3 8h18M3 13h6"
                            />
                          </svg>
                        </button>

                        {/* Re-run */}
                        {canAdd && (
                          <button
                            style={styles.actionBtn(C.green)}
                            onClick={() => onReRun(row)}
                            title="Re-run depreciation"
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background =
                                "rgba(22,163,74,0.08)";
                              e.currentTarget.style.transform = "scale(1.1)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = "none";
                              e.currentTarget.style.transform = "scale(1)";
                            }}
                          >
                            <svg
                              width="16"
                              height="16"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M4 4v5h.582M20 20v-5h-.581M5.635 15A9 9 0 1 0 4.582 9"
                              />
                            </svg>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div style={styles.paginationRow}>
            <span style={styles.paginationText}>
              Showing {(page - 1) * pageSize + 1}–
              {Math.min(page * pageSize, totalCount)} of{" "}
              <strong>{totalCount}</strong> records
            </span>
            <div style={styles.paginationBtns}>
              <button
                style={styles.pageBtn(page === 1)}
                onClick={() => onPageChange(page - 1)}
                disabled={page === 1}
              >
                Previous
              </button>
              <span style={styles.pageInfo}>
                {page} / {totalPages}
              </span>
              <button
                style={styles.pageBtn(page === totalPages)}
                onClick={() => onPageChange(page + 1)}
                disabled={page === totalPages}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
