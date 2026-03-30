// client/src/components/finance/amc/AMCTable.jsx
// Card only — no page header (header lives in AMCTrackerPage)

import { useState } from "react";
import AMCStatusBadge from "./AMCStatusBadge";
import AMCFilters from "./AMCFilters";

const C = {
  primary: "#8B1A1A",
  headerBg: "#8B1A1A",
  white: "#FFFFFF",
  text: "#333333",
  textLight: "#888888",
  border: "#EBEBEB",
  rowHover: "#FDF8F8",
  rowZebra: "#FAFAFA",
};

const styles = {
  card: {
    backgroundColor: C.white,
    borderRadius: "16px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
    padding: "20px",
    border: "1px solid rgba(0,0,0,0.04)",
    fontFamily: "'Segoe UI', sans-serif",
  },
  filtersRow: { marginBottom: "18px" },
  tableWrapper: {
    overflowX: "auto",
    overflowY: "auto",
    maxHeight: "calc(100vh - 320px)", // ← add this
    borderRadius: "12px",
    border: `1px solid ${C.border}`,
    boxShadow: "inset 0 1px 3px rgba(0,0,0,0.03)",
  },
  table: { width: "100%", borderCollapse: "collapse", minWidth: "700px" },
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
  tr: { borderBottom: `1px solid ${C.border}`, transition: "background 0.15s" },
  td: {
    padding: "13px 16px",
    fontSize: "14px",
    color: C.text,
    verticalAlign: "middle",
  },
  assetCode: {
    fontWeight: "700",
    fontSize: "13px",
    color: C.primary,
    letterSpacing: "0.01em",
  },
  assetName: { fontSize: "12px", color: C.textLight, marginTop: "2px" },
  assetCat: { fontSize: "11px", color: "#BBBBBB", marginTop: "1px" },
  dimText: { fontSize: "11px", color: "#BBBBBB", marginTop: "2px" },
  monoText: { fontSize: "12px", color: "#555", fontFamily: "monospace" },
  expiryDate: { fontSize: "13px", fontWeight: "600", color: C.text },
  emptyCell: {
    textAlign: "center",
    color: C.textLight,
    padding: "48px",
    fontSize: "14px",
  },
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
  paginationRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "14px 0 0",
    marginTop: "14px",
    borderTop: `1px solid ${C.border}`,
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

function rowBg(daysRemaining, idx) {
  if (daysRemaining < 0) return "#FFF5F5";
  if (daysRemaining <= 30) return "#FFFBEB";
  return idx % 2 === 1 ? C.rowZebra : C.white;
}

export default function AMCTable({
  data = [],
  loading = false,
  type = "amc",
  page,
  pageSize,
  totalCount,
  onPageChange,
  days,
  onDaysChange,
}) {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const dateField =
    type === "amc" ? "amc_expiry_date" : "insurance_expiry_date";
  const vendorField = type === "amc" ? "amc_vendor" : "insurance_company";
  const vendorLabel = type === "amc" ? "AMC Vendor" : "Insurer";
  const dateLabel = type === "amc" ? "AMC Expiry" : "Insurance Expiry";

  // Client-side date range — only active when All (days=0) is selected
  const filteredData =
    days === 0 && (fromDate || toDate)
      ? data.filter((row) => {
          const expiry = row[dateField] ? new Date(row[dateField]) : null;
          if (!expiry) return true;
          if (fromDate && expiry < new Date(fromDate)) return false;
          if (toDate && expiry > new Date(toDate)) return false;
          return true;
        })
      : data;

  const totalPages = Math.ceil(totalCount / pageSize);
  const colSpan = type === "insurance" ? 7 : 6;
  const displayCount =
    days === 0 && (fromDate || toDate) ? filteredData.length : totalCount;

  return (
    <div style={styles.card}>
      {/* Filters */}
      <div style={styles.filtersRow}>
        <AMCFilters
          days={days}
          onDaysChange={(val) => {
            onDaysChange(val);
            setFromDate("");
            setToDate("");
          }}
          totalCount={displayCount}
          type={type}
          fromDate={fromDate}
          toDate={toDate}
          onFromDateChange={setFromDate}
          onToDateChange={setToDate}
        />
      </div>

      {/* Table */}
      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead style={styles.thead}>
            <tr>
              <th style={styles.th}>Asset</th>
              <th style={styles.th}>{vendorLabel}</th>
              {type === "insurance" && <th style={styles.th}>Policy No.</th>}
              <th style={styles.th}>Location / Dept</th>
              <th style={styles.th}>Assigned To</th>
              <th style={styles.th}>{dateLabel}</th>
              <th style={styles.th}>Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} style={styles.tr}>
                  <td colSpan={colSpan} style={{ padding: 0 }}>
                    <div style={styles.skeletonRow}>
                      <div style={styles.skeletonBox("80px")} />
                      <div
                        style={{ ...styles.skeletonBox("140px"), flex: 1 }}
                      />
                      <div style={styles.skeletonBox("100px")} />
                      <div style={styles.skeletonBox("80px")} />
                      <div style={styles.skeletonBox("90px")} />
                      <div style={styles.skeletonBox("70px")} />
                    </div>
                  </td>
                </tr>
              ))
            ) : filteredData.length === 0 ? (
              <tr>
                <td colSpan={colSpan} style={styles.emptyCell}>
                  No {type === "amc" ? "AMC contracts" : "insurance policies"}{" "}
                  expiring in this period.
                </td>
              </tr>
            ) : (
              filteredData.map((row, idx) => {
                const bg = rowBg(row.days_remaining, idx);
                return (
                  <tr
                    key={row.id}
                    style={{ ...styles.tr, backgroundColor: bg }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = C.rowHover)
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = bg)
                    }
                  >
                    <td style={styles.td}>
                      <div style={styles.assetCode}>{row.asset_code}</div>
                      <div style={styles.assetName}>{row.asset_name}</div>
                      <div style={styles.assetCat}>{row.category_name}</div>
                    </td>
                    <td style={styles.td}>
                      <span style={{ fontSize: "13px", color: C.text }}>
                        {row[vendorField] || "—"}
                      </span>
                    </td>
                    {type === "insurance" && (
                      <td style={styles.td}>
                        <span style={styles.monoText}>
                          {row.insurance_policy_no || "—"}
                        </span>
                      </td>
                    )}
                    <td style={styles.td}>
                      <div style={{ fontSize: "12px", color: C.text }}>
                        {row.location_name || "—"}
                      </div>
                      <div style={styles.dimText}>{row.dept_name || "—"}</div>
                    </td>
                    <td style={styles.td}>
                      {row.employee_name ? (
                        <>
                          <div style={{ fontSize: "12px", color: C.text }}>
                            {row.employee_name}
                          </div>
                          <div style={styles.dimText}>{row.employee_code}</div>
                        </>
                      ) : (
                        <span style={{ fontSize: "12px", color: "#BBBBBB" }}>
                          Unassigned
                        </span>
                      )}
                    </td>
                    <td style={styles.td}>
                      <span style={styles.expiryDate}>
                        {row[dateField]
                          ? new Date(row[dateField]).toLocaleDateString("en-IN")
                          : "—"}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <AMCStatusBadge daysRemaining={row.days_remaining} />
                    </td>
                  </tr>
                );
              })
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
            <strong>{totalCount}</strong>
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
  );
}
