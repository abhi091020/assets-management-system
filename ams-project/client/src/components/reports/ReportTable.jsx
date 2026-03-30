// src/components/reports/ReportTable.jsx

const C = {
  primary: "#8B1A1A",
  headerBg: "#8B1A1A",
  white: "#FFFFFF",
  text: "#333333",
  textLight: "#888888",
  border: "#EBEBEB",
  rowZebra: "#FAFAFA",
  rowHover: "#FDF8F8",
};

// ─── Badge colors ─────────────────────────────────────────────────────────────
const BADGE = {
  status: {
    Active: { bg: "#DCFCE7", color: "#15803D" },
    "In Repair": { bg: "#FEF3C7", color: "#B45309" },
    Disposed: { bg: "#FEE2E2", color: "#B91C1C" },
    Missing: { bg: "#F3F4F6", color: "#374151" },
  },
  opstatus: {
    Pending: { bg: "#FEF3C7", color: "#B45309" },
    Approved: { bg: "#DCFCE7", color: "#15803D" },
    Rejected: { bg: "#FEE2E2", color: "#B91C1C" },
    Cancelled: { bg: "#F3F4F6", color: "#6B7280" },
  },
  vstatus: {
    Open: { bg: "#DBEAFE", color: "#1D4ED8" },
    Closed: { bg: "#DCFCE7", color: "#15803D" },
    Cancelled: { bg: "#F3F4F6", color: "#6B7280" },
  },
  method: {
    Sold: { bg: "#DBEAFE", color: "#1D4ED8" },
    Scrapped: { bg: "#F3F4F6", color: "#374151" },
    Donated: { bg: "#F3E8FF", color: "#7E22CE" },
    WriteOff: { bg: "#FEE2E2", color: "#B91C1C" },
  },
};

const badgeStyle = (map, value) => {
  const t = map[value] || { bg: "#F3F4F6", color: "#374151" };
  return {
    display: "inline-flex",
    alignItems: "center",
    padding: "3px 10px",
    borderRadius: "50px",
    fontSize: "12px",
    fontWeight: "600",
    background: t.bg,
    color: t.color,
    whiteSpace: "nowrap",
  };
};

// ─── Column definitions per report ───────────────────────────────────────────
const COLUMNS = {
  "asset-register": [
    { key: "asset_code", label: "Code" },
    { key: "asset_name", label: "Asset Name" },
    { key: "category_name", label: "Category" },
    { key: "location_name", label: "Location" },
    { key: "dept_name", label: "Department" },
    { key: "employee_name", label: "Assigned To" },
    { key: "status", label: "Status", type: "status" },
    { key: "condition", label: "Condition" },
    { key: "purchase_date", label: "Purchase Date" },
    { key: "purchase_cost", label: "Cost", type: "currency" },
    { key: "vendor", label: "Vendor" },
    { key: "serial_number", label: "Serial No" },
  ],
  "by-category": [
    { key: "category_name", label: "Category" },
    { key: "parent_category_name", label: "Parent" },
    { key: "total", label: "Total", type: "number" },
    { key: "active", label: "Active", type: "number" },
    { key: "in_repair", label: "In Repair", type: "number" },
    { key: "disposed", label: "Disposed", type: "number" },
    { key: "total_cost", label: "Total Cost", type: "currency" },
  ],
  "by-location": [
    { key: "location_name", label: "Location" },
    { key: "city", label: "City" },
    { key: "total", label: "Total", type: "number" },
    { key: "active", label: "Active", type: "number" },
    { key: "in_repair", label: "In Repair", type: "number" },
    { key: "disposed", label: "Disposed", type: "number" },
    { key: "total_cost", label: "Total Cost", type: "currency" },
  ],
  "by-department": [
    { key: "dept_name", label: "Department" },
    { key: "cost_center", label: "Cost Center" },
    { key: "location_name", label: "Location" },
    { key: "total", label: "Total", type: "number" },
    { key: "active", label: "Active", type: "number" },
    { key: "in_repair", label: "In Repair", type: "number" },
    { key: "disposed", label: "Disposed", type: "number" },
    { key: "total_cost", label: "Total Cost", type: "currency" },
  ],
  "by-status": [
    { key: "status", label: "Status", type: "status" },
    { key: "total", label: "Total", type: "number" },
    { key: "total_cost", label: "Total Cost", type: "currency" },
  ],
  "assigned-employees": [
    { key: "employee_code", label: "Emp Code" },
    { key: "employee_name", label: "Employee" },
    { key: "designation", label: "Designation" },
    { key: "dept_name", label: "Department" },
    { key: "location_name", label: "Location" },
    { key: "asset_code", label: "Asset Code" },
    { key: "asset_name", label: "Asset Name" },
    { key: "category_name", label: "Category" },
    { key: "status", label: "Status", type: "status" },
    { key: "purchase_cost", label: "Cost", type: "currency" },
  ],
  "asset-age": [
    { key: "asset_code", label: "Code" },
    { key: "asset_name", label: "Asset Name" },
    { key: "category_name", label: "Category" },
    { key: "location_name", label: "Location" },
    { key: "dept_name", label: "Department" },
    { key: "purchase_date", label: "Purchase Date" },
    { key: "age_years", label: "Age (Yrs)", type: "number" },
    { key: "status", label: "Status", type: "status" },
    { key: "purchase_cost", label: "Cost", type: "currency" },
  ],
  transfers: [
    { key: "transfer_code", label: "Code" },
    { key: "asset_code", label: "Asset Code" },
    { key: "asset_name", label: "Asset Name" },
    { key: "from_location", label: "From Location" },
    { key: "to_location", label: "To Location" },
    { key: "to_department", label: "To Dept" },
    { key: "status", label: "Status", type: "opstatus" },
    { key: "raised_by_name", label: "Raised By" },
    { key: "created_at", label: "Date" },
  ],
  disposals: [
    { key: "disposal_code", label: "Code" },
    { key: "asset_code", label: "Asset Code" },
    { key: "asset_name", label: "Asset Name" },
    { key: "category_name", label: "Category" },
    { key: "disposal_method", label: "Method", type: "method" },
    { key: "sale_amount", label: "Sale Amt", type: "currency" },
    { key: "status", label: "Status", type: "opstatus" },
    { key: "raised_by_name", label: "Raised By" },
    { key: "created_at", label: "Date" },
  ],
  verification: [
    { key: "batch_code", label: "Batch Code" },
    { key: "title", label: "Title" },
    { key: "location_name", label: "Location" },
    { key: "status", label: "Status", type: "vstatus" },
    { key: "total_items", label: "Total", type: "number" },
    { key: "verified", label: "Verified", type: "number" },
    { key: "not_found", label: "Not Found", type: "number" },
    { key: "pending", label: "Pending", type: "number" },
    { key: "opened_by_name", label: "Opened By" },
    { key: "opened_at", label: "Opened At" },
  ],
};

// ─── Cell renderer ────────────────────────────────────────────────────────────
function renderCell(col, value) {
  if (value === null || value === undefined || value === "")
    return <span style={{ color: C.textLight }}>—</span>;

  switch (col.type) {
    case "currency":
      return (
        <span style={{ fontFamily: "monospace", fontSize: "13px" }}>
          ₹
          {parseFloat(value).toLocaleString("en-IN", {
            minimumFractionDigits: 0,
          })}
        </span>
      );
    case "number":
      return (
        <span style={{ fontWeight: "600", fontFamily: "monospace" }}>
          {parseInt(value).toLocaleString()}
        </span>
      );
    case "status":
      return <span style={badgeStyle(BADGE.status, value)}>{value}</span>;
    case "opstatus":
      return <span style={badgeStyle(BADGE.opstatus, value)}>{value}</span>;
    case "vstatus":
      return <span style={badgeStyle(BADGE.vstatus, value)}>{value}</span>;
    case "method":
      return <span style={badgeStyle(BADGE.method, value)}>{value}</span>;
    default:
      return (
        <span style={{ fontSize: "13px", color: C.text }}>{String(value)}</span>
      );
  }
}

// ─── Pagination ───────────────────────────────────────────────────────────────
function Pagination({ page, total, limit, onChangePage }) {
  const totalPages = Math.ceil(total / limit);
  if (totalPages <= 1) return null;

  const pages = [];
  for (let i = Math.max(1, page - 2); i <= Math.min(totalPages, page + 2); i++)
    pages.push(i);

  const btnBase = {
    padding: "5px 11px",
    fontSize: "12px",
    border: `1px solid ${C.border}`,
    borderRadius: "6px",
    cursor: "pointer",
    background: C.white,
    color: C.text,
  };
  const btnActive = {
    ...btnBase,
    background: C.primary,
    color: C.white,
    borderColor: C.primary,
    fontWeight: "700",
  };
  const btnDisabled = { ...btnBase, opacity: 0.4, cursor: "not-allowed" };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 16px",
        borderTop: `1px solid ${C.border}`,
        background: "#FAFAFA",
      }}
    >
      <span style={{ fontSize: "12px", color: C.textLight }}>
        Page {page} of {totalPages} · {total.toLocaleString()} records
      </span>
      <div style={{ display: "flex", gap: "4px" }}>
        <button
          style={page === 1 ? btnDisabled : btnBase}
          onClick={() => onChangePage(page - 1)}
          disabled={page === 1}
        >
          ‹ Prev
        </button>
        {pages.map((p) => (
          <button
            key={p}
            style={p === page ? btnActive : btnBase}
            onClick={() => onChangePage(p)}
          >
            {p}
          </button>
        ))}
        <button
          style={page === totalPages ? btnDisabled : btnBase}
          onClick={() => onChangePage(page + 1)}
          disabled={page === totalPages}
        >
          Next ›
        </button>
      </div>
    </div>
  );
}

// ─── Main Table ───────────────────────────────────────────────────────────────
export default function ReportTable({
  reportKey,
  data,
  total,
  page,
  limit = 50,
  onChangePage,
  loading,
}) {
  const columns = COLUMNS[reportKey] || [];

  if (loading) {
    return (
      <div
        style={{
          background: C.white,
          borderRadius: "16px",
          border: `1px solid ${C.border}`,
          padding: "60px",
          textAlign: "center",
          color: C.textLight,
          fontSize: "14px",
          fontFamily: "'Segoe UI', sans-serif",
        }}
      >
        ⏳ Loading report...
      </div>
    );
  }

  if (!data?.length) return null;

  return (
    <div
      style={{
        background: C.white,
        borderRadius: "16px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        border: "1px solid rgba(0,0,0,0.04)",
        overflow: "hidden",
        fontFamily: "'Segoe UI', sans-serif",
      }}
    >
      <div style={{ overflowX: "auto", maxHeight: "480px", overflowY: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            minWidth: "700px",
          }}
        >
          <thead style={{ position: "sticky", top: 0, zIndex: 2 }}>
            <tr style={{ background: C.headerBg }}>
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={{
                    padding: "13px 14px",
                    color: C.white,
                    fontSize: "12px",
                    fontWeight: "600",
                    textAlign: "left",
                    whiteSpace: "nowrap",
                    letterSpacing: "0.04em",
                    background: C.headerBg,
                  }}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr
                key={i}
                style={{
                  borderBottom: `1px solid ${C.border}`,
                  background: i % 2 === 1 ? C.rowZebra : C.white,
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = C.rowHover)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background =
                    i % 2 === 1 ? C.rowZebra : C.white)
                }
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    style={{
                      padding: "12px 14px",
                      verticalAlign: "middle",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {renderCell(col, row[col.key])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination
        page={page}
        total={total}
        limit={limit}
        onChangePage={onChangePage}
      />
    </div>
  );
}
