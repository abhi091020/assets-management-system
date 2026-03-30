import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, Pencil, Trash2, Search, ChevronDown, Plus } from "lucide-react";
import AssetStatusBadge from "./AssetStatusBadge";
import AssetConditionBadge from "./AssetConditionBadge";
import DatePicker from "../common/DatePicker";

const C = {
  primary: "#8B1A1A",
  primaryLight: "#FFF5F5",
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

const styles = {
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
  searchWrapper: { flex: 1, minWidth: "180px", position: "relative" },
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
  nameText: {
    fontWeight: "700",
    fontSize: "13.5px",
    color: C.primary,
    letterSpacing: "0.01em",
  },
  subText: { fontSize: "12px", color: C.textLight, marginTop: "2px" },
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
    color: color || C.primary,
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
    transition: "all 0.15s",
  }),
};

const STATUS_OPTIONS = [
  "",
  "Active",
  "InRepair",
  "UnderMaintenance",
  "Disposed",
  "Missing",
];

export default function AssetTable({
  assets = [],
  loading = false,
  totalCount = 0,
  page = 1,
  pageSize = 20,
  totalPages = 1,
  onPageChange,
  hasFilters = false,
  onClearFilters,
  onEdit,
  onDelete,
  canManage = false,
  canAdmin = false,
  onAdd,
  filters = {},
  onSearchChange,
  onFilterChange,
  locations = [],
  categories = [],
  filterDepartments = [],
}) {
  const navigate = useNavigate();

  const [localSearch, setLocalSearch] = useState("");
  const [localStatus, setLocalStatus] = useState("");
  const [localDateFrom, setLocalDateFrom] = useState("");
  const [localDateTo, setLocalDateTo] = useState("");

  const isExternal = typeof onSearchChange === "function";

  const search = isExternal ? (filters.search ?? "") : localSearch;
  const statusVal = isExternal ? (filters.status ?? "") : localStatus;
  const dateFrom = isExternal ? (filters.dateFrom ?? "") : localDateFrom;
  const dateTo = isExternal ? (filters.dateTo ?? "") : localDateTo;

  const handleSearch = (val) => {
    if (isExternal) onSearchChange(val);
    else setLocalSearch(val);
  };
  const handleStatus = (val) => {
    if (isExternal) onFilterChange("status", val);
    else setLocalStatus(val);
  };
  const handleDateFrom = (val) => {
    if (isExternal) onFilterChange("dateFrom", val);
    else setLocalDateFrom(val);
  };
  const handleDateTo = (val) => {
    if (isExternal) onFilterChange("dateTo", val);
    else setLocalDateTo(val);
  };

  const displayed = isExternal
    ? assets
    : assets.filter((a) => {
        const matchSearch =
          !search ||
          a.asset_name?.toLowerCase().includes(search.toLowerCase()) ||
          a.asset_code?.toLowerCase().includes(search.toLowerCase()) ||
          a.category_name?.toLowerCase().includes(search.toLowerCase()) ||
          a.location_name?.toLowerCase().includes(search.toLowerCase());
        const matchStatus = !statusVal || a.status === statusVal;
        const rowDate = a.purchase_date ? new Date(a.purchase_date) : null;
        const matchFrom =
          !dateFrom || (rowDate && rowDate >= new Date(dateFrom));
        const matchTo =
          !dateTo || (rowDate && rowDate <= new Date(dateTo + "T23:59:59"));
        return matchSearch && matchStatus && matchFrom && matchTo;
      });

  const computedTotalPages = isExternal
    ? totalPages
    : Math.ceil(displayed.length / pageSize) || 1;

  const hasActiveFilters =
    hasFilters || search || statusVal || dateFrom || dateTo;

  const handleClear = () => {
    if (isExternal) {
      onClearFilters?.();
    } else {
      setLocalSearch("");
      setLocalStatus("");
      setLocalDateFrom("");
      setLocalDateTo("");
    }
  };

  return (
    <div style={styles.page}>
      {/* ── Page Header ── */}
      <div style={styles.pageHeaderRow}>
        <div style={styles.titleAccent}>
          <div style={styles.accentBar} />
          <div>
            <h1 style={styles.pageTitle}>Assets</h1>
            <p style={styles.pageSubtitle}>
              Manage and track all organisation assets
            </p>
          </div>
        </div>
        {canManage && (
          <button
            style={styles.addBtn}
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
            Add Asset <Plus size={16} strokeWidth={2.5} />
          </button>
        )}
      </div>

      {/* ── Card ── */}
      <div style={styles.card}>
        {/* ── Controls row ── */}
        <div style={styles.controlsRow}>
          {/* Search */}
          <div style={styles.searchWrapper}>
            <input
              type="text"
              placeholder="Search assets..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              style={styles.searchInput}
              onFocus={(e) => {
                e.target.style.borderColor = C.primary;
                e.target.style.boxShadow = "0 0 0 3px rgba(139,26,26,0.08)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = C.border;
                e.target.style.boxShadow = "0 1px 4px rgba(0,0,0,0.04)";
              }}
            />
            <span style={styles.searchIcon}>
              <Search size={17} />
            </span>
          </div>

          {/* Status filter */}
          <div style={styles.filterWrapper}>
            <select
              value={statusVal}
              onChange={(e) => handleStatus(e.target.value)}
              style={{ ...styles.filterSelect, paddingRight: "36px" }}
            >
              <option value="">All Status</option>
              {STATUS_OPTIONS.filter(Boolean).map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <span style={styles.filterChevron}>
              <ChevronDown size={15} />
            </span>
          </div>

          {/* Location filter (external only) */}
          {isExternal && locations.length > 0 && (
            <div style={styles.filterWrapper}>
              <select
                value={filters.locationId ?? ""}
                onChange={(e) => onFilterChange("locationId", e.target.value)}
                style={{ ...styles.filterSelect, paddingRight: "36px" }}
              >
                <option value="">All Locations</option>
                {locations.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.location_name}
                  </option>
                ))}
              </select>
              <span style={styles.filterChevron}>
                <ChevronDown size={15} />
              </span>
            </div>
          )}

          {/* Category filter (external only) */}
          {isExternal && categories.length > 0 && (
            <div style={styles.filterWrapper}>
              <select
                value={filters.categoryId ?? ""}
                onChange={(e) => onFilterChange("categoryId", e.target.value)}
                style={{ ...styles.filterSelect, paddingRight: "36px" }}
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.category_name}
                  </option>
                ))}
              </select>
              <span style={styles.filterChevron}>
                <ChevronDown size={15} />
              </span>
            </div>
          )}

          {/* Date From */}
          <DatePicker
            value={dateFrom}
            onChange={handleDateFrom}
            placeholder="Date From"
            triggerStyle={PILL_TRIGGER}
            containerStyle={PILL_CONTAINER}
          />

          {/* Date To */}
          <DatePicker
            value={dateTo}
            onChange={handleDateTo}
            placeholder="Date To"
            triggerStyle={PILL_TRIGGER}
            containerStyle={PILL_CONTAINER}
            alignRight
          />

          {/* Clear filters */}
          {hasActiveFilters && (
            <button onClick={handleClear} style={styles.clearBtn}>
              Clear
            </button>
          )}
        </div>

        {/* ── Table ── */}
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead style={styles.thead}>
              <tr>
                <th style={styles.th}>Code</th>
                <th style={styles.th}>Asset Name</th>
                <th style={styles.th}>Category</th>
                <th style={styles.th}>Location</th>
                <th style={styles.th}>Department</th>
                <th style={styles.th}>Cost (₹)</th>
                <th style={{ ...styles.th, ...styles.thCenter }}>Condition</th>
                <th style={{ ...styles.th, ...styles.thCenter }}>Status</th>
                <th style={{ ...styles.th, ...styles.thCenter }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} style={styles.emptyRow}>
                    Loading...
                  </td>
                </tr>
              ) : displayed.length === 0 ? (
                <tr>
                  <td colSpan={9} style={styles.emptyRow}>
                    {hasActiveFilters
                      ? "No assets match your filters."
                      : "No assets found."}
                  </td>
                </tr>
              ) : (
                displayed.map((asset, idx) => (
                  <tr
                    key={asset.id ?? idx}
                    style={{
                      ...styles.tr,
                      backgroundColor: idx % 2 === 1 ? C.rowZebra : C.white,
                    }}
                    onClick={() => navigate(`/assets/${asset.id}`)}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = C.rowHover)
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor =
                        idx % 2 === 1 ? C.rowZebra : C.white)
                    }
                  >
                    <td style={styles.td}>
                      <span style={styles.codeBadge}>{asset.asset_code}</span>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.nameText}>{asset.asset_name}</div>
                      {asset.brand && (
                        <div style={styles.subText}>{asset.brand}</div>
                      )}
                    </td>
                    <td style={styles.td}>
                      <span style={{ fontSize: "13px", color: C.text }}>
                        {asset.category_name || "—"}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <span style={{ fontSize: "13px", color: C.text }}>
                        {asset.location_name || "—"}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <span style={{ fontSize: "13px", color: C.text }}>
                        {asset.dept_name || "—"}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <span style={{ fontSize: "13px", color: C.text }}>
                        {asset.purchase_cost != null
                          ? Number(asset.purchase_cost).toLocaleString("en-IN")
                          : "—"}
                      </span>
                    </td>
                    <td style={{ ...styles.td, textAlign: "center" }}>
                      <AssetConditionBadge condition={asset.condition} />
                    </td>
                    <td style={{ ...styles.td, textAlign: "center" }}>
                      <AssetStatusBadge status={asset.status} />
                    </td>
                    <td
                      style={{ ...styles.td, padding: "13px 8px" }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div style={styles.actionsCell}>
                        <button
                          style={styles.actionBtn("#555")}
                          onClick={() => navigate(`/assets/${asset.id}`)}
                          title="View"
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background =
                              "rgba(0,0,0,0.06)";
                            e.currentTarget.style.transform = "scale(1.1)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "none";
                            e.currentTarget.style.transform = "scale(1)";
                          }}
                        >
                          <Eye size={16} />
                        </button>
                        {canManage && (
                          <button
                            style={styles.actionBtn("#2563EB")}
                            onClick={() => onEdit?.(asset)}
                            title="Edit"
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
                            <Pencil size={15} />
                          </button>
                        )}
                        {canAdmin && (
                          <button
                            style={styles.actionBtn("#DC2626")}
                            onClick={() => onDelete?.(asset)}
                            title="Delete"
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background =
                                "rgba(220,38,38,0.08)";
                              e.currentTarget.style.transform = "scale(1.1)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = "none";
                              e.currentTarget.style.transform = "scale(1)";
                            }}
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
        {!loading && computedTotalPages > 1 && (
          <div style={styles.paginationRow}>
            <span>
              Showing {Math.min((page - 1) * pageSize + 1, totalCount)}–
              {Math.min(page * pageSize, totalCount)} of {totalCount} assets
            </span>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                style={styles.pageBtn(page === 1)}
                disabled={page === 1}
                onClick={() => onPageChange?.(page - 1)}
              >
                Previous
              </button>
              <button
                style={styles.pageBtn(page === computedTotalPages)}
                disabled={page === computedTotalPages}
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
