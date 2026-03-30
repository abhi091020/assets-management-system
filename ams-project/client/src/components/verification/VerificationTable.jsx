import { useState } from "react";
import { Eye, Trash2, Search, ChevronDown, Plus } from "lucide-react";
import { BatchStatusBadge } from "./VerificationStatusBadge";
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

const PILL_CONTAINER = {
  minWidth: 0,
  flex: "0 0 auto",
};

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

const STATUS_OPTIONS = ["Open", "Closed"];

// ── Format date as DD/MM/YY ───────────────────────────────────────────────────
function formatDate(dateStr) {
  if (!dateStr) return "N/A";
  const d = new Date(dateStr);
  if (isNaN(d)) return "N/A";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yy = String(d.getFullYear()).slice(-2);
  return `${dd}/${mm}/${yy}`;
}

// ── Segmented Progress Bar ────────────────────────────────────────────────────
function SegmentedProgressBar({ verified = 0, notFound = 0, total = 0 }) {
  const [hovered, setHovered] = useState(false);
  const pending = Math.max(0, total - verified - notFound);

  const verifiedPct = total ? (verified / total) * 100 : 0;
  const notFoundPct = total ? (notFound / total) * 100 : 0;

  return (
    <div
      style={{ position: "relative", display: "inline-block" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Track */}
      <div
        style={{
          width: "100px",
          height: "7px",
          backgroundColor: "#E5E7EB",
          borderRadius: "99px",
          overflow: "hidden",
          display: "flex",
        }}
      >
        {verifiedPct > 0 && (
          <div
            style={{
              height: "100%",
              width: `${verifiedPct}%`,
              backgroundColor: "#22C55E",
              transition: "width 0.3s",
              borderRadius: verifiedPct === 100 ? "99px" : "99px 0 0 99px",
            }}
          />
        )}
        {notFoundPct > 0 && (
          <div
            style={{
              height: "100%",
              width: `${notFoundPct}%`,
              backgroundColor: "#EF4444",
              transition: "width 0.3s",
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

      {/* Count label */}
      <div
        style={{
          marginTop: "4px",
          fontSize: "11px",
          color: C.textLight,
          whiteSpace: "nowrap",
        }}
      >
        {verified}/{total}
      </div>

      {/* Hover tooltip */}
      {hovered && total > 0 && (
        <div
          style={{
            position: "absolute",
            bottom: "calc(100% + 6px)",
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: "#1F2937",
            color: "#fff",
            borderRadius: "8px",
            padding: "7px 11px",
            fontSize: "11.5px",
            whiteSpace: "nowrap",
            zIndex: 20,
            boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
            pointerEvents: "none",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
            <span>
              <span style={{ color: "#4ADE80", fontWeight: 600 }}>●</span>{" "}
              Verified: <strong>{verified}</strong>
            </span>
            <span>
              <span style={{ color: "#F87171", fontWeight: 600 }}>●</span> Not
              Found: <strong>{notFound}</strong>
            </span>
            <span>
              <span style={{ color: "#9CA3AF", fontWeight: 600 }}>●</span>{" "}
              Pending: <strong>{pending}</strong>
            </span>
          </div>
          <div
            style={{
              position: "absolute",
              top: "100%",
              left: "50%",
              transform: "translateX(-50%)",
              borderWidth: "5px",
              borderStyle: "solid",
              borderColor: "#1F2937 transparent transparent transparent",
            }}
          />
        </div>
      )}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function VerificationTable({
  batches = [],
  loading,
  page,
  pageSize,
  totalCount,
  onPageChange,
  onView,
  onDelete,
  canAdmin,
  canManage,
  onAdd,
  locations = [],
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const totalPages = Math.ceil(totalCount / pageSize) || 1;
  const hasActiveFilters =
    search || statusFilter || locationFilter || dateFrom || dateTo;

  const clearAll = () => {
    setSearch("");
    setStatusFilter("");
    setLocationFilter("");
    setDateFrom("");
    setDateTo("");
  };

  const filtered = batches.filter((b) => {
    const matchSearch =
      !search ||
      b.batch_code?.toLowerCase().includes(search.toLowerCase()) ||
      b.title?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || b.status === statusFilter;
    const matchLocation =
      !locationFilter || String(b.location_id) === String(locationFilter);
    const rowDate = b.opened_at ? new Date(b.opened_at) : null;
    const matchFrom = !dateFrom || (rowDate && rowDate >= new Date(dateFrom));
    const matchTo =
      !dateTo || (rowDate && rowDate <= new Date(dateTo + "T23:59:59"));
    return matchSearch && matchStatus && matchLocation && matchFrom && matchTo;
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
            <h1 style={S.pageTitle}>Verification</h1>
            <p style={S.pageSubtitle}>Physical asset verification batches</p>
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
            New Batch <Plus size={16} strokeWidth={2.5} />
          </button>
        )}
      </div>

      <div style={S.card}>
        {/* ── Controls row ── */}
        <div style={S.controlsRow}>
          <div style={S.searchWrapper}>
            <input
              type="text"
              placeholder="Search by code or title..."
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

          {locations.length > 0 && (
            <div style={S.filterWrapper}>
              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                style={{ ...S.filterSelect, paddingRight: "36px" }}
              >
                <option value="">All Locations</option>
                {locations.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.location_name}
                  </option>
                ))}
              </select>
              <span style={S.filterChevron}>
                <ChevronDown size={15} />
              </span>
            </div>
          )}

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

        {/* ── Table ── */}
        <div style={S.tableWrapper}>
          <table style={S.table}>
            <thead style={S.thead}>
              <tr>
                <th style={S.th}>Batch Code</th>
                <th style={S.th}>Title</th>
                <th style={{ ...S.th, ...S.thCenter }}>Status</th>
                <th style={S.th}>Progress</th>
                <th style={S.th}>Location</th>
                <th style={S.th}>Department</th>
                <th style={S.th}>Opened</th>
                <th style={{ ...S.th, ...S.thCenter }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={S.emptyRow}>
                    Loading...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} style={S.emptyRow}>
                    No verification batches found.
                  </td>
                </tr>
              ) : (
                filtered.map((b, idx) => (
                  <tr
                    key={b.id ?? idx}
                    style={{
                      ...S.tr,
                      backgroundColor: idx % 2 === 1 ? C.rowZebra : C.white,
                    }}
                    onClick={() => onView?.(b)}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = C.rowHover)
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor =
                        idx % 2 === 1 ? C.rowZebra : C.white)
                    }
                  >
                    <td style={S.td}>
                      <span style={S.codeBadge}>{b.batch_code}</span>
                    </td>
                    <td style={S.td}>
                      <div style={S.nameText}>{b.title || "N/A"}</div>
                    </td>
                    <td style={{ ...S.td, textAlign: "center" }}>
                      <BatchStatusBadge status={b.status} />
                    </td>
                    <td style={S.td}>
                      <SegmentedProgressBar
                        verified={b.verified_items || 0}
                        notFound={b.not_found_items || 0}
                        total={b.total_items || 0}
                      />
                    </td>
                    <td style={S.td}>
                      <span style={{ fontSize: "13px", color: C.text }}>
                        {b.location_name || "All Locations"}
                      </span>
                    </td>
                    <td style={S.td}>
                      <span style={{ fontSize: "13px", color: C.text }}>
                        {b.dept_name || "All Departments"}
                      </span>
                    </td>
                    <td style={S.td}>
                      <span style={{ fontSize: "12px", color: C.textLight }}>
                        {formatDate(b.opened_at)}
                      </span>
                    </td>
                    <td
                      style={{ ...S.td, padding: "13px 8px" }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div style={S.actionsCell}>
                        <button
                          style={S.actionBtn("#555")}
                          onClick={() => onView?.(b)}
                          title="Open Batch"
                          onMouseEnter={hover("rgba(0,0,0,0.06)").enter}
                          onMouseLeave={hover().leave}
                        >
                          <Eye size={16} />
                        </button>
                        {canAdmin && (
                          <button
                            style={S.actionBtn("#DC2626")}
                            onClick={() => onDelete?.(b)}
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

        {/* ── Pagination ── */}
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
