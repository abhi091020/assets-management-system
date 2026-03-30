// client/src/components/categories/CategoryTable.jsx
import { useState } from "react";
import {
  Eye,
  Pencil,
  Ban,
  CheckCircle,
  Trash2,
  Search,
  ChevronDown,
  Plus,
  ChevronRight,
} from "lucide-react";

const C = {
  primary: "#8B1A1A",
  headerBg: "#8B1A1A",
  white: "#FFFFFF",
  text: "#333333",
  textLight: "#888888",
  border: "#EBEBEB",
  activeDot: "#22C55E",
  activeBadgeBg: "#DCFCE7",
  activeBadgeText: "#15803D",
  inactiveDot: "#EF4444",
  inactiveBadgeBg: "#FEE2E2",
  inactiveBadgeText: "#B91C1C",
  rowHover: "#FDF8F8",
  rowZebra: "#FAFAFA",
  subRowBg: "#FEFEFE",
  subRowHover: "#FFF5F5",
  subIndentBar: "#FECACA",
};

const pulseStyle = `
  @keyframes pulse-dot {
    0%   { box-shadow: 0 0 0 0 rgba(34,197,94,0.5); }
    70%  { box-shadow: 0 0 0 5px rgba(34,197,94,0); }
    100% { box-shadow: 0 0 0 0 rgba(34,197,94,0); }
  }
  .pulse-active { animation: pulse-dot 1.8s infinite; }
`;

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
  searchWrapper: { flex: 1, minWidth: "160px", position: "relative" },
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
  tableWrapper: {
    overflowX: "auto",
    overflowY: "auto",
    maxHeight: "calc(100vh - 320px)",
    borderRadius: "12px",
    border: `1px solid ${C.border}`,
    boxShadow: "inset 0 1px 3px rgba(0,0,0,0.03)",
  },
  table: { width: "100%", borderCollapse: "collapse", minWidth: "560px" },
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
  tr: { borderBottom: `1px solid ${C.border}`, transition: "background 0.15s" },
  td: {
    padding: "13px 16px",
    fontSize: "14px",
    color: C.text,
    verticalAlign: "middle",
  },
  badge: (active) => ({
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "5px 13px",
    borderRadius: "50px",
    fontSize: "12px",
    fontWeight: "600",
    backgroundColor: active ? C.activeBadgeBg : C.inactiveBadgeBg,
    color: active ? C.activeBadgeText : C.inactiveBadgeText,
    boxShadow: active
      ? "0 1px 4px rgba(34,197,94,0.2)"
      : "0 1px 4px rgba(239,68,68,0.15)",
  }),
  dot: (active) => ({
    width: "7px",
    height: "7px",
    borderRadius: "50%",
    backgroundColor: active ? C.activeDot : C.inactiveDot,
    flexShrink: 0,
  }),
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

// ── Asset type badge — subcategory rows only ──────────────────────────────────
function AssetTypeBadge({ type }) {
  if (!type)
    return <span style={{ color: "#D1D5DB", fontSize: "12px" }}>—</span>;
  const isMovable = type === "Movable";
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "5px",
        padding: "4px 10px",
        borderRadius: "50px",
        fontSize: "11px",
        fontWeight: "600",
        backgroundColor: isMovable ? "#DCFCE7" : "#F1F5F9",
        color: isMovable ? "#15803D" : "#475569",
        border: isMovable ? "1px solid #BBF7D0" : "1px solid #CBD5E1",
      }}
    >
      {isMovable ? (
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
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      ) : (
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
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0110 0v4" />
        </svg>
      )}
      {isMovable ? "Movable" : "Static"}
    </span>
  );
}

// ── Dash for main category type cell — always, regardless of DB value ─────────
function MainTypeDash() {
  return <span style={{ color: "#D1D5DB", fontSize: "12px" }}>—</span>;
}

function ActionBtn({ color, hoverBg, title, onClick, children }) {
  return (
    <button
      style={S.actionBtn(color)}
      onClick={onClick}
      title={title}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = hoverBg;
        e.currentTarget.style.transform = "scale(1.1)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "none";
        e.currentTarget.style.transform = "scale(1)";
      }}
    >
      {children}
    </button>
  );
}

function ActionButtons({
  cat,
  canAdmin,
  onView,
  onEdit,
  onToggleStatus,
  onDelete,
  size = 16,
}) {
  return (
    <div style={S.actionsCell}>
      <ActionBtn
        color="#555"
        hoverBg="rgba(0,0,0,0.06)"
        title="View"
        onClick={() => onView?.(cat)}
      >
        <Eye size={size} />
      </ActionBtn>
      {canAdmin && (
        <ActionBtn
          color="#2563EB"
          hoverBg="rgba(37,99,235,0.08)"
          title="Edit"
          onClick={() => onEdit?.(cat)}
        >
          <Pencil size={size - 1} />
        </ActionBtn>
      )}
      {canAdmin && (
        <ActionBtn
          color={cat.is_active ? "#D97706" : "#16A34A"}
          hoverBg={
            cat.is_active ? "rgba(217,119,6,0.08)" : "rgba(22,163,74,0.08)"
          }
          title={cat.is_active ? "Deactivate" : "Activate"}
          onClick={() => onToggleStatus?.(cat)}
        >
          {cat.is_active ? (
            <Ban size={size - 1} />
          ) : (
            <CheckCircle size={size - 1} />
          )}
        </ActionBtn>
      )}
      {canAdmin && (
        <ActionBtn
          color="#DC2626"
          hoverBg="rgba(220,38,38,0.08)"
          title="Delete"
          onClick={() => onDelete?.(cat)}
        >
          <Trash2 size={size - 1} />
        </ActionBtn>
      )}
    </div>
  );
}

function SubRow({ cat, canAdmin, onView, onEdit, onToggleStatus, onDelete }) {
  return (
    <tr
      style={{ ...S.tr, backgroundColor: C.subRowBg }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.backgroundColor = C.subRowHover)
      }
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = C.subRowBg)}
    >
      <td style={S.td}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            paddingLeft: "12px",
            gap: "8px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
            <div
              style={{
                width: "2px",
                height: "20px",
                backgroundColor: C.subIndentBar,
                borderRadius: "1px",
              }}
            />
            <div
              style={{
                width: "12px",
                height: "2px",
                backgroundColor: C.subIndentBar,
                borderRadius: "1px",
              }}
            />
          </div>
          <span
            style={{
              fontSize: "10px",
              fontWeight: "700",
              color: "#9CA3AF",
              backgroundColor: "#F3F4F6",
              border: "1px solid #E5E7EB",
              padding: "1px 6px",
              borderRadius: "4px",
              letterSpacing: "0.04em",
              flexShrink: 0,
            }}
          >
            SUB
          </span>
          <span style={{ fontWeight: "500", fontSize: "13px", color: C.text }}>
            {cat.category_name}
          </span>
        </div>
      </td>
      {/* Subcategory rows DO show the type badge */}
      <td style={S.td}>
        <AssetTypeBadge type={cat.asset_type} />
      </td>
      <td style={{ ...S.td, textAlign: "center" }}>
        <span style={S.badge(cat.is_active)}>
          <span
            className={cat.is_active ? "pulse-active" : ""}
            style={S.dot(cat.is_active)}
          />
          {cat.is_active ? "Active" : "Inactive"}
        </span>
      </td>
      <td
        style={{ ...S.td, padding: "13px 8px" }}
        onClick={(e) => e.stopPropagation()}
      >
        <ActionButtons
          cat={cat}
          canAdmin={canAdmin}
          onView={onView}
          onEdit={onEdit}
          onToggleStatus={onToggleStatus}
          onDelete={onDelete}
          size={15}
        />
      </td>
    </tr>
  );
}

export default function CategoryTable({
  categories = [],
  loading,
  total,
  page,
  totalPages,
  onPageChange,
  canAdmin,
  allCategories = [],
  onAdd,
  onView,
  onEdit,
  onToggleStatus,
  onDelete,
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [expandedIds, setExpandedIds] = useState(new Set());

  // Build hierarchy using allCategories for subcategory map (unpaginated)
  const topLevel = categories.filter((c) => !c.parent_category_id);
  const subMap = {};
  allCategories.forEach((c) => {
    if (c.parent_category_id) {
      if (!subMap[c.parent_category_id]) subMap[c.parent_category_id] = [];
      subMap[c.parent_category_id].push(c);
    }
  });

  const matchesFilter = (cat) => {
    const matchSearch =
      !search ||
      cat.category_name?.toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && cat.is_active) ||
      (statusFilter === "inactive" && !cat.is_active);
    const matchType = typeFilter === "all" || cat.asset_type === typeFilter;
    return matchSearch && matchStatus && matchType;
  };

  const isFiltering =
    !!search || statusFilter !== "all" || typeFilter !== "all";
  const flatFiltered = isFiltering ? categories.filter(matchesFilter) : [];
  const filteredTop = !isFiltering ? topLevel : [];
  const isEmpty = isFiltering
    ? flatFiltered.length === 0
    : filteredTop.length === 0;

  function toggleExpand(id) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  return (
    <div style={S.page}>
      <style>{pulseStyle}</style>

      <div style={S.pageHeaderRow}>
        <div style={S.titleAccent}>
          <div style={S.accentBar} />
          <div>
            <h1 style={S.pageTitle}>Categories</h1>
            <p style={S.pageSubtitle}>
              Manage asset categories and subcategories
            </p>
          </div>
        </div>
        {canAdmin && (
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
            Add Category <Plus size={16} strokeWidth={2.5} />
          </button>
        )}
      </div>

      <div style={S.card}>
        <div style={S.controlsRow}>
          <div style={S.searchWrapper}>
            <input
              type="text"
              placeholder="Search categories..."
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
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              style={{ ...S.filterSelect, paddingRight: "36px" }}
            >
              <option value="all">All Types</option>
              <option value="Movable">Movable</option>
              <option value="Static">Static</option>
            </select>
            <span style={S.filterChevron}>
              <ChevronDown size={15} />
            </span>
          </div>
          <div style={S.filterWrapper}>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ ...S.filterSelect, paddingRight: "36px" }}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <span style={S.filterChevron}>
              <ChevronDown size={15} />
            </span>
          </div>
          {!isFiltering &&
            topLevel.some((c) => (subMap[c.id] || []).length > 0) && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                  marginLeft: "auto",
                }}
              >
                <ChevronRight size={13} color={C.textLight} />
                <span
                  style={{
                    fontSize: "11px",
                    color: C.textLight,
                    whiteSpace: "nowrap",
                  }}
                >
                  Click row to expand
                </span>
              </div>
            )}
        </div>

        <div style={S.tableWrapper}>
          <table style={S.table}>
            <thead style={S.thead}>
              <tr>
                <th style={S.th}>Category</th>
                <th style={S.th}>Type</th>
                <th style={{ ...S.th, ...S.thCenter }}>Status</th>
                <th style={{ ...S.th, ...S.thCenter }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} style={S.emptyRow}>
                    Loading...
                  </td>
                </tr>
              ) : isEmpty ? (
                <tr>
                  <td colSpan={4} style={S.emptyRow}>
                    {isFiltering
                      ? "No categories match your filters."
                      : "No categories found."}
                  </td>
                </tr>
              ) : isFiltering ? (
                flatFiltered.map((cat, idx) => (
                  <tr
                    key={cat.id ?? idx}
                    style={{
                      ...S.tr,
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
                    <td style={S.td}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        {cat.parent_category_id && (
                          <span
                            style={{
                              fontSize: "10px",
                              fontWeight: "700",
                              color: "#9CA3AF",
                              backgroundColor: "#F3F4F6",
                              border: "1px solid #E5E7EB",
                              padding: "1px 6px",
                              borderRadius: "4px",
                              letterSpacing: "0.04em",
                              flexShrink: 0,
                            }}
                          >
                            SUB
                          </span>
                        )}
                        <span
                          style={{
                            fontWeight: cat.parent_category_id ? "500" : "700",
                            fontSize: "13.5px",
                            color: cat.parent_category_id ? C.text : C.primary,
                            textTransform: cat.parent_category_id
                              ? "none"
                              : "uppercase",
                          }}
                        >
                          {cat.category_name}
                        </span>
                        {!cat.parent_category_id &&
                          (subMap[cat.id] || []).length > 0 && (
                            <span
                              style={{
                                fontSize: "11px",
                                fontWeight: "600",
                                color: C.primary,
                                backgroundColor: "#FFF0F0",
                                border: "1px solid #FECACA",
                                padding: "1px 8px",
                                borderRadius: "50px",
                              }}
                            >
                              {(subMap[cat.id] || []).length}{" "}
                              {(subMap[cat.id] || []).length === 1
                                ? "sub"
                                : "subs"}
                            </span>
                          )}
                      </div>
                    </td>
                    {/* In flat filtered view: main cats show dash, subcats show badge */}
                    <td style={S.td}>
                      {cat.parent_category_id ? (
                        <AssetTypeBadge type={cat.asset_type} />
                      ) : (
                        <MainTypeDash />
                      )}
                    </td>
                    <td style={{ ...S.td, textAlign: "center" }}>
                      <span style={S.badge(cat.is_active)}>
                        <span
                          className={cat.is_active ? "pulse-active" : ""}
                          style={S.dot(cat.is_active)}
                        />
                        {cat.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td style={{ ...S.td, padding: "13px 8px" }}>
                      <ActionButtons
                        cat={cat}
                        canAdmin={canAdmin}
                        onView={onView}
                        onEdit={onEdit}
                        onToggleStatus={onToggleStatus}
                        onDelete={onDelete}
                      />
                    </td>
                  </tr>
                ))
              ) : (
                filteredTop.map((parent, idx) => {
                  const subs = subMap[parent.id] || [];
                  const isExpanded = expandedIds.has(parent.id);
                  const subCount = subs.length;
                  return [
                    <tr
                      key={`parent-${parent.id}`}
                      style={{
                        ...S.tr,
                        backgroundColor: idx % 2 === 1 ? C.rowZebra : C.white,
                        cursor: subCount > 0 ? "pointer" : "default",
                      }}
                      onClick={() => subCount > 0 && toggleExpand(parent.id)}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor = C.rowHover)
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor =
                          idx % 2 === 1 ? C.rowZebra : C.white)
                      }
                    >
                      <td style={S.td}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              width: "20px",
                              height: "20px",
                              borderRadius: "6px",
                              flexShrink: 0,
                              color: subCount > 0 ? C.primary : "#D1D5DB",
                              transition: "transform 0.2s ease",
                              transform: isExpanded
                                ? "rotate(90deg)"
                                : "rotate(0deg)",
                            }}
                          >
                            <ChevronRight size={15} strokeWidth={2.5} />
                          </span>
                          <span
                            style={{
                              fontWeight: "700",
                              fontSize: "13.5px",
                              color: C.primary,
                              textTransform: "uppercase",
                              letterSpacing: "0.01em",
                            }}
                          >
                            {parent.category_name}
                          </span>
                          {subCount > 0 && (
                            <span
                              style={{
                                fontSize: "11px",
                                fontWeight: "600",
                                color: C.primary,
                                backgroundColor: "#FFF0F0",
                                border: "1px solid #FECACA",
                                padding: "1px 8px",
                                borderRadius: "50px",
                                flexShrink: 0,
                              }}
                            >
                              {subCount} {subCount === 1 ? "sub" : "subs"}
                            </span>
                          )}
                        </div>
                      </td>
                      {/* ── Main category Type cell — ALWAYS shows dash, never a badge ── */}
                      <td style={S.td} onClick={(e) => e.stopPropagation()}>
                        <MainTypeDash />
                      </td>
                      <td
                        style={{ ...S.td, textAlign: "center" }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span style={S.badge(parent.is_active)}>
                          <span
                            className={parent.is_active ? "pulse-active" : ""}
                            style={S.dot(parent.is_active)}
                          />
                          {parent.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td
                        style={{ ...S.td, padding: "13px 8px" }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ActionButtons
                          cat={parent}
                          canAdmin={canAdmin}
                          onView={onView}
                          onEdit={onEdit}
                          onToggleStatus={onToggleStatus}
                          onDelete={onDelete}
                        />
                      </td>
                    </tr>,
                    ...(isExpanded
                      ? subs.map((sub) => (
                          <SubRow
                            key={`sub-${sub.id}`}
                            cat={sub}
                            canAdmin={canAdmin}
                            onView={onView}
                            onEdit={onEdit}
                            onToggleStatus={onToggleStatus}
                            onDelete={onDelete}
                          />
                        ))
                      : []),
                  ];
                })
              )}
            </tbody>
          </table>
        </div>

        {!loading && totalPages > 1 && (
          <div style={S.paginationRow}>
            <span>
              Page {page} of {totalPages}
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
                style={S.pageBtn(page === totalPages)}
                disabled={page === totalPages}
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
