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
  pageTitle: { fontSize: "26px", fontWeight: "700", color: C.primary, margin: 0, lineHeight: 1.2 },
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
  td: { padding: "13px 16px", fontSize: "14px", color: C.text, verticalAlign: "middle" },
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

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

// ✅ Handles both boolean (true/false) and SQL Server integer (1/0)
function isActive(cat) {
  return cat.is_active === true || cat.is_active === 1;
}

// Build full subtree recursively from allCategories
function buildSubtree(allItems, parentId) {
  return allItems
    .filter((c) => (c.parent_category_id ?? null) === parentId)
    .map((c) => ({ ...c, children: buildSubtree(allItems, c.id) }));
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

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
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      ) : (
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0110 0v4" />
        </svg>
      )}
      {isMovable ? "Movable" : "Static"}
    </span>
  );
}

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

function ActionButtons({ cat, canAdmin, onView, onEdit, onToggleStatus, onDelete, size = 16 }) {
  const active = isActive(cat);
  return (
    <div style={S.actionsCell}>
      <ActionBtn color="#555" hoverBg="rgba(0,0,0,0.06)" title="View" onClick={() => onView?.(cat)}>
        <Eye size={size} />
      </ActionBtn>
      {canAdmin && (
        <ActionBtn color="#2563EB" hoverBg="rgba(37,99,235,0.08)" title="Edit" onClick={() => onEdit?.(cat)}>
          <Pencil size={size - 1} />
        </ActionBtn>
      )}
      {canAdmin && (
        <ActionBtn
          color={active ? "#D97706" : "#16A34A"}
          hoverBg={active ? "rgba(217,119,6,0.08)" : "rgba(22,163,74,0.08)"}
          title={active ? "Deactivate" : "Activate"}
          onClick={() => onToggleStatus?.(cat)}
        >
          {active ? <Ban size={size - 1} /> : <CheckCircle size={size - 1} />}
        </ActionBtn>
      )}
      {canAdmin && (
        <ActionBtn color="#DC2626" hoverBg="rgba(220,38,38,0.08)" title="Delete" onClick={() => onDelete?.(cat)}>
          <Trash2 size={size - 1} />
        </ActionBtn>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CategoryRow — unified row for ALL depths (0 = root, 1 = sub, 2 = sub-sub…)
// ─────────────────────────────────────────────────────────────────────────────
function CategoryRow({
  cat,
  depth,
  hasChildren,
  isExpanded,
  onToggle,
  canAdmin,
  onView,
  onEdit,
  onToggleStatus,
  onDelete,
}) {
  const active = isActive(cat);
  const indentPx = depth * 24;

  // Indent bar colour varies by depth
  const barColor = depth === 1 ? "#FECACA" : "#FED7AA";

  // Row background
  const rowBg =
    depth === 0 ? C.white : depth === 1 ? "#FEFEFE" : "#FDF8F8";
  const rowHoverBg = depth === 0 ? C.rowHover : "#FFF5F5";

  // SUB badge label: "SUB" for depth 1, "L2", "L3"... for deeper
  const subLabel = depth === 1 ? "SUB" : `L${depth}`;

  return (
    <tr
      style={{
        ...S.tr,
        backgroundColor: rowBg,
        cursor: hasChildren ? "pointer" : "default",
      }}
      onClick={hasChildren ? onToggle : undefined}
      onMouseEnter={(e) =>
        (e.currentTarget.style.backgroundColor = rowHoverBg)
      }
      onMouseLeave={(e) =>
        (e.currentTarget.style.backgroundColor = rowBg)
      }
    >
      {/* ── Name cell ── */}
      <td style={S.td}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            paddingLeft: `${indentPx}px`,
          }}
        >
          {/* L-shaped indent line for non-root */}
          {depth > 0 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  width: "2px",
                  height: "20px",
                  backgroundColor: barColor,
                  borderRadius: "1px",
                }}
              />
              <div
                style={{
                  width: "12px",
                  height: "2px",
                  backgroundColor: barColor,
                  borderRadius: "1px",
                }}
              />
            </div>
          )}

          {/* SUB / L2 / L3 badge */}
          {depth > 0 && (
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
              {subLabel}
            </span>
          )}

          {/* Expand chevron — always present, dimmed if no children */}
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "20px",
              height: "20px",
              borderRadius: "6px",
              flexShrink: 0,
              color: hasChildren ? C.primary : "#D1D5DB",
              transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
              transition: "transform 0.2s ease",
            }}
          >
            <ChevronRight size={15} strokeWidth={2.5} />
          </span>

          {/* Category name */}
          <span
            style={{
              fontWeight: depth === 0 ? "700" : "500",
              fontSize: depth === 0 ? "13.5px" : "13px",
              color: depth === 0 ? C.primary : C.text,
              textTransform: depth === 0 ? "uppercase" : "none",
              letterSpacing: depth === 0 ? "0.01em" : "normal",
            }}
          >
            {cat.category_name}
          </span>

          {/* Children count badge */}
          {hasChildren && (
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
              {cat.children.length}{" "}
              {cat.children.length === 1 ? "sub" : "subs"}
            </span>
          )}
        </div>
      </td>

      {/* ── Type cell: root → dash, all others → badge ── */}
      <td style={S.td} onClick={(e) => e.stopPropagation()}>
        {depth === 0 ? (
          <MainTypeDash />
        ) : (
          <AssetTypeBadge type={cat.asset_type} />
        )}
      </td>

      {/* ── Status cell ── */}
      <td
        style={{ ...S.td, textAlign: "center" }}
        onClick={(e) => e.stopPropagation()}
      >
        <span style={S.badge(active)}>
          <span
            className={active ? "pulse-active" : ""}
            style={S.dot(active)}
          />
          {active ? "Active" : "Inactive"}
        </span>
      </td>

      {/* ── Actions cell ── */}
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

// ─────────────────────────────────────────────────────────────────────────────
// CategoryTable
//
// Props:
//   search / setSearch         — server-side search  (from useCategories hook)
//   statusFilter / setStatusFilter — server-side filter (from useCategories hook)
//   typeFilter stays LOCAL     — client-side asset_type filter
// ─────────────────────────────────────────────────────────────────────────────
export default function CategoryTable({
  categories = [],
  loading,
  total,
  page,
  totalPages,
  onPageChange,
  canAdmin,
  allCategories = [],
  // ✅ server-side search + filter (from hook via page)
  search = "",
  setSearch,
  statusFilter = "",
  setStatusFilter,
  onAdd,
  onView,
  onEdit,
  onToggleStatus,
  onDelete,
}) {
  // typeFilter stays local — it filters on asset_type (subcat level)
  const [typeFilter, setTypeFilter] = useState("all");
  const [expandedIds, setExpandedIds] = useState(new Set());

  function toggleExpand(id) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  // Any filter active → flat list view; none → hierarchical tree view
  const isFiltering = !!search || !!statusFilter || typeFilter !== "all";

  // Build tree from current page's top-level items + full subtrees from allCategories
  const topLevel = categories.filter((c) => !c.parent_category_id);
  const treeData = topLevel.map((node) => ({
    ...node,
    children: buildSubtree(allCategories, node.id),
  }));

  // Flat list for filter mode
  let flatFiltered = [];
  if (isFiltering) {
    if (search || statusFilter) {
      // Server already filtered by search/status — apply typeFilter locally if set
      flatFiltered =
        typeFilter !== "all"
          ? categories.filter((c) => c.asset_type === typeFilter)
          : categories;
    } else {
      // Only local typeFilter set — use allCategories for full coverage across all pages
      flatFiltered = allCategories.filter((c) => c.asset_type === typeFilter);
    }
  }

  // ── Recursive tree row renderer ──────────────────────────────────────────
  function renderTreeRows(nodes, depth = 0) {
    return nodes.flatMap((node) => {
      const hasChildren = node.children.length > 0;
      const isExpanded = expandedIds.has(node.id);
      return [
        <CategoryRow
          key={`row-${node.id}-d${depth}`}
          cat={node}
          depth={depth}
          hasChildren={hasChildren}
          isExpanded={isExpanded}
          onToggle={() => toggleExpand(node.id)}
          canAdmin={canAdmin}
          onView={onView}
          onEdit={onEdit}
          onToggleStatus={onToggleStatus}
          onDelete={onDelete}
        />,
        ...(isExpanded ? renderTreeRows(node.children, depth + 1) : []),
      ];
    });
  }

  // ── Flat row renderer (filter mode) ─────────────────────────────────────
  function renderFlatRow(cat, idx) {
    const active = isActive(cat);
    const isSub = !!cat.parent_category_id;
    const bg = idx % 2 === 1 ? C.rowZebra : C.white;
    return (
      <tr
        key={cat.id ?? idx}
        style={{ ...S.tr, backgroundColor: bg }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.backgroundColor = C.rowHover)
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.backgroundColor = bg)
        }
      >
        <td style={S.td}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {isSub && (
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
                fontWeight: isSub ? "500" : "700",
                fontSize: "13.5px",
                color: isSub ? C.text : C.primary,
                textTransform: isSub ? "none" : "uppercase",
              }}
            >
              {cat.category_name}
            </span>
          </div>
        </td>
        <td style={S.td}>
          {isSub ? (
            <AssetTypeBadge type={cat.asset_type} />
          ) : (
            <MainTypeDash />
          )}
        </td>
        <td style={{ ...S.td, textAlign: "center" }}>
          <span style={S.badge(active)}>
            <span
              className={active ? "pulse-active" : ""}
              style={S.dot(active)}
            />
            {active ? "Active" : "Inactive"}
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
    );
  }

  const isEmpty = isFiltering
    ? flatFiltered.length === 0
    : treeData.length === 0;

  const hasExpandable =
    !isFiltering && treeData.some((n) => n.children.length > 0);

  return (
    <div style={S.page}>
      <style>{pulseStyle}</style>

      {/* ── Page header ── */}
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
        {/* ── Controls row ── */}
        <div style={S.controlsRow}>
          {/* Search — server-side via hook */}
          <div style={S.searchWrapper}>
            <input
              type="text"
              placeholder="Search categories..."
              value={search}
              onChange={(e) => setSearch?.(e.target.value)}
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

          {/* Type filter — local */}
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

          {/* Status filter — server-side via hook */}
          <div style={S.filterWrapper}>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter?.(e.target.value)}
              style={{ ...S.filterSelect, paddingRight: "36px" }}
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <span style={S.filterChevron}>
              <ChevronDown size={15} />
            </span>
          </div>

          {/* Hint when tree view has expandable rows */}
          {hasExpandable && (
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

        {/* ── Table ── */}
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
                flatFiltered.map((cat, idx) => renderFlatRow(cat, idx))
              ) : (
                renderTreeRows(treeData)
              )}
            </tbody>
          </table>
        </div>

        {/* ── Pagination ── */}
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