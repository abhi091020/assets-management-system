// client/src/components/disposals/DisposalTable.jsx
import { useState } from "react";
import { Eye, Pencil, Trash2, Search, ChevronDown, Plus } from "lucide-react";
import DisposalStatusBadge from "./DisposalStatusBadge";
import DisposalMethodBadge from "./DisposalMethodBadge";
import DatePicker from "../common/DatePicker";

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

const PILL_TRIGGER = {
  padding: "10px 18px",
  borderRadius: "50px",
  fontSize: "14px",
  color: C.text,
  backgroundColor: "#FAFAFA",
  outline: "none",
  boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
  borderColor: C.border,
};

const PILL_CONTAINER = { minWidth: 0, flex: "0 0 auto" };

const S = {
  page: { fontFamily: "'Segoe UI', sans-serif" },
  pageHeaderRow: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: "24px",
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
  addBtn: {
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
  card: {
    backgroundColor: C.white,
    borderRadius: "16px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
    padding: "20px",
    border: "1px solid rgba(0,0,0,0.04)",
  },
  controlsRow: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "18px",
    flexWrap: "wrap",
  },
  searchWrapper: { flex: 1, position: "relative", minWidth: "180px" },
  searchInput: {
    width: "100%",
    padding: "10px 44px 10px 18px",
    border: `1.5px solid ${C.border}`,
    borderRadius: "50px",
    fontSize: "14px",
    color: C.text,
    outline: "none",
    backgroundColor: "#FAFAFA",
    boxSizing: "border-box",
    transition: "border-color 0.2s, box-shadow 0.2s",
    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
  },
  searchIcon: {
    position: "absolute",
    right: "14px",
    top: "50%",
    transform: "translateY(-50%)",
    color: C.textLight,
    pointerEvents: "none",
  },
  filterSelect: {
    padding: "10px 18px",
    border: `1.5px solid ${C.border}`,
    borderRadius: "50px",
    fontSize: "14px",
    color: C.text,
    backgroundColor: "#FAFAFA",
    cursor: "pointer",
    outline: "none",
    whiteSpace: "nowrap",
    appearance: "none",
    WebkitAppearance: "none",
    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
  },
  filterWrapper: {
    position: "relative",
    display: "inline-flex",
    alignItems: "center",
  },
  filterChevron: {
    position: "absolute",
    right: "12px",
    pointerEvents: "none",
    color: C.textLight,
  },
  clearBtn: {
    padding: "10px 18px",
    border: `1.5px solid ${C.border}`,
    borderRadius: "50px",
    fontSize: "13px",
    color: C.primary,
    backgroundColor: "#FFF5F5",
    cursor: "pointer",
    fontWeight: "600",
    whiteSpace: "nowrap",
  },
  tableWrapper: {
    overflowX: "auto",
    overflowY: "auto",
    maxHeight: "calc(100vh - 320px)",
    borderRadius: "12px",
    border: `1px solid ${C.border}`,
    boxShadow: "inset 0 1px 3px rgba(0,0,0,0.03)",
  },
  table: { width: "100%", borderCollapse: "collapse", minWidth: "900px" },
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
  thCenter: { textAlign: "center" },
  tr: {
    borderBottom: `1px solid ${C.border}`,
    transition: "background 0.15s",
    cursor: "pointer",
  },
  td: {
    padding: "13px 16px",
    fontSize: "14px",
    color: C.text,
    verticalAlign: "middle",
  },
  codeBadge: {
    display: "inline-block",
    padding: "2px 8px",
    borderRadius: "6px",
    backgroundColor: "#F3F4F6",
    color: "#374151",
    fontSize: "12px",
    fontFamily: "monospace",
    fontWeight: "600",
  },
  nameText: { fontWeight: "600", fontSize: "13px", color: C.text },
  subText: { fontSize: "12px", color: C.textLight, marginTop: "2px" },
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
    color,
    display: "flex",
    alignItems: "center",
    transition: "background 0.15s, transform 0.1s",
  }),
  emptyRow: {
    textAlign: "center",
    color: C.textLight,
    padding: "40px",
    fontSize: "14px",
  },
  paginationRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: "14px",
    fontSize: "13px",
    color: C.textLight,
  },
  pageBtn: (disabled) => ({
    padding: "6px 16px",
    borderRadius: "50px",
    border: `1.5px solid ${C.border}`,
    background: C.white,
    fontSize: "13px",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.4 : 1,
    color: C.text,
  }),
};

const STATUS_OPTIONS = ["Pending", "Approved", "Rejected", "Cancelled"];

function formatDate(dateStr) {
  if (!dateStr) return "N/A";
  const d = new Date(dateStr.replace(/Z$/, ""));
  if (isNaN(d)) return "N/A";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yy = String(d.getFullYear()).slice(-2);
  return `${dd}/${mm}/${yy}`;
}

export default function DisposalTable({
  disposals = [],
  loading,
  page,
  pageSize,
  totalCount,
  onPageChange,
  onView,
  onEdit,
  onDelete,
  canAdmin,
  canManage,
  onAdd,
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const totalPages = Math.ceil(totalCount / pageSize) || 1;
  const hasActiveFilters = search || statusFilter || dateFrom || dateTo;

  const clearAll = () => {
    setSearch("");
    setStatusFilter("");
    setDateFrom("");
    setDateTo("");
  };

  const filtered = disposals.filter((d) => {
    const matchSearch =
      !search ||
      d.disposal_code?.toLowerCase().includes(search.toLowerCase()) ||
      d.asset_name?.toLowerCase().includes(search.toLowerCase()) ||
      d.asset_code?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || d.status === statusFilter;
    const rowDate = d.created_at
      ? new Date(d.created_at.replace(/Z$/, ""))
      : null;
    const matchFrom = !dateFrom || (rowDate && rowDate >= new Date(dateFrom));
    const matchTo =
      !dateTo || (rowDate && rowDate <= new Date(dateTo + "T23:59:59"));
    return matchSearch && matchStatus && matchFrom && matchTo;
  });

  const hover = (bg) => ({
    enter: (e) => {
      e.currentTarget.style.background = bg;
      e.currentTarget.style.transform = "scale(1.1)";
    },
    leave: (e) => {
      e.currentTarget.style.background = "none";
      e.currentTarget.style.transform = "scale(1)";
    },
  });

  return (
    <div style={S.page}>
      <div style={S.pageHeaderRow}>
        <div style={S.titleAccent}>
          <div style={S.accentBar} />
          <div>
            <h1 style={S.pageTitle}>Disposals</h1>
            <p style={S.pageSubtitle}>
              Raise and manage asset disposal requests
            </p>
          </div>
        </div>
        {canManage && (
          <button
            style={S.addBtn}
            onClick={onAdd}
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
            Raise Disposal <Plus size={16} strokeWidth={2.5} />
          </button>
        )}
      </div>

      <div style={S.card}>
        {/* Controls */}
        <div style={S.controlsRow}>
          <div style={S.searchWrapper}>
            <input
              type="text"
              placeholder="Search by code or asset..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={S.searchInput}
              onFocus={(e) => {
                e.target.style.borderColor = C.primary;
                e.target.style.boxShadow = "0 0 0 3px rgba(139,26,26,0.08)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = C.border;
                e.target.style.boxShadow = "0 1px 4px rgba(0,0,0,0.04)";
              }}
            />
            <span style={S.searchIcon}>
              <Search size={17} />
            </span>
          </div>

          <div style={S.filterWrapper}>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ ...S.filterSelect, paddingRight: "36px" }}
            >
              <option value="">All Status</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <span style={S.filterChevron}>
              <ChevronDown size={15} />
            </span>
          </div>

          <DatePicker
            value={dateFrom}
            onChange={setDateFrom}
            placeholder="Date From"
            triggerStyle={PILL_TRIGGER}
            containerStyle={PILL_CONTAINER}
          />
          <DatePicker
            value={dateTo}
            onChange={setDateTo}
            placeholder="Date To"
            triggerStyle={PILL_TRIGGER}
            containerStyle={PILL_CONTAINER}
            alignRight
          />

          {hasActiveFilters && (
            <button onClick={clearAll} style={S.clearBtn}>
              Clear
            </button>
          )}
        </div>

        {/* Table */}
        <div style={S.tableWrapper}>
          <table style={S.table}>
            <thead style={S.thead}>
              <tr>
                <th style={S.th}>Code</th>
                <th style={S.th}>Asset</th>
                <th style={S.th}>Location</th>
                <th style={S.th}>Department</th>
                <th style={{ ...S.th, ...S.thCenter }}>Method</th>
                <th style={S.th}>Sale Amount</th>
                <th style={{ ...S.th, ...S.thCenter }}>Status</th>
                <th style={S.th}>Raised By</th>
                <th style={S.th}>Raised On</th>
                <th style={{ ...S.th, ...S.thCenter }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={10} style={S.emptyRow}>
                    Loading...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} style={S.emptyRow}>
                    No disposals found.
                  </td>
                </tr>
              ) : (
                filtered.map((d, idx) => (
                  <tr
                    key={d.id ?? idx}
                    style={{
                      ...S.tr,
                      backgroundColor: idx % 2 === 1 ? C.rowZebra : C.white,
                    }}
                    onClick={() => onView?.(d)}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = C.rowHover)
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor =
                        idx % 2 === 1 ? C.rowZebra : C.white)
                    }
                  >
                    <td style={S.td}>
                      <span style={S.codeBadge}>{d.disposal_code}</span>
                    </td>
                    <td style={S.td}>
                      <div style={S.nameText}>{d.asset_code}</div>
                      <div style={S.subText}>{d.asset_name}</div>
                    </td>
                    <td style={S.td}>
                      <span style={{ fontSize: "13px", color: C.text }}>
                        {d.location_name || "All Locations"}
                      </span>
                    </td>
                    <td style={S.td}>
                      <span style={{ fontSize: "13px", color: C.text }}>
                        {d.dept_name || "All Departments"}
                      </span>
                    </td>
                    <td style={{ ...S.td, textAlign: "center" }}>
                      <DisposalMethodBadge method={d.disposal_method} />
                    </td>
                    <td style={S.td}>
                      <span style={{ fontSize: "13px", color: C.text }}>
                        {d.sale_amount
                          ? `₹${Number(d.sale_amount).toLocaleString()}`
                          : "N/A"}
                      </span>
                    </td>
                    <td style={{ ...S.td, textAlign: "center" }}>
                      <DisposalStatusBadge status={d.status} />
                    </td>
                    <td style={S.td}>
                      <span style={{ fontSize: "13px", color: C.textLight }}>
                        {d.raised_by_name || "N/A"}
                      </span>
                    </td>
                    <td style={S.td}>
                      <span style={{ fontSize: "12px", color: C.textLight }}>
                        {formatDate(d.created_at)}
                      </span>
                    </td>
                    <td
                      style={{ ...S.td, padding: "13px 8px" }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div style={S.actionsCell}>
                        <button
                          style={S.actionBtn("#555")}
                          onClick={() => onView?.(d)}
                          title="View"
                          onMouseEnter={hover("rgba(0,0,0,0.06)").enter}
                          onMouseLeave={hover().leave}
                        >
                          <Eye size={16} />
                        </button>
                        {canManage && d.status === "Pending" && (
                          <button
                            style={S.actionBtn("#2563EB")}
                            onClick={() => onEdit?.(d)}
                            title="Edit"
                            onMouseEnter={hover("rgba(37,99,235,0.08)").enter}
                            onMouseLeave={hover().leave}
                          >
                            <Pencil size={15} />
                          </button>
                        )}
                        {canAdmin && (
                          <button
                            style={S.actionBtn("#DC2626")}
                            onClick={() => onDelete?.(d)}
                            title="Delete"
                            onMouseEnter={hover("rgba(220,38,38,0.08)").enter}
                            onMouseLeave={hover().leave}
                          >
                            <Trash2 size={15} />
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
          <div style={S.paginationRow}>
            <span>
              Showing {(page - 1) * pageSize + 1}–
              {Math.min(page * pageSize, totalCount)} of {totalCount}
            </span>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                style={S.pageBtn(page === 1)}
                disabled={page === 1}
                onClick={() => onPageChange?.(page - 1)}
              >
                Previous
              </button>
              <button
                style={S.pageBtn(page >= totalPages)}
                disabled={page >= totalPages}
                onClick={() => onPageChange?.(page + 1)}
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
