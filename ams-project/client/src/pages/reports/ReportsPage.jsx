// src/pages/reports/ReportsPage.jsx
import { useRef } from "react";
import { useReports, REPORT_LIST } from "../../hooks/useReports";
import ReportFilters from "../../components/reports/ReportFilters";
import ReportSummaryCards from "../../components/reports/ReportSummaryCards";
import ReportExportBar from "../../components/reports/ReportExportBar";
import ReportTable from "../../components/reports/ReportTable";
import ReportEmptyState, {
  ReportWelcomeState,
} from "../../components/reports/ReportEmptyState";

const C = {
  primary: "#8B1A1A",
  primaryLight: "#FFF5F5",
  white: "#FFFFFF",
  text: "#333333",
  textLight: "#888888",
  border: "#EBEBEB",
};

const ICONS = {
  register: "📋",
  category: "🏷️",
  location: "📍",
  department: "🏢",
  status: "📊",
  employee: "👤",
  age: "📅",
  transfer: "🔄",
  disposal: "🗑️",
  verification: "✅",
};

const scrollHideStyle = `
  .ams-pill-scroll::-webkit-scrollbar { display: none; }
  .ams-pill-scroll { -ms-overflow-style: none; scrollbar-width: none; }
`;

const styles = {
  pageHeaderRow: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: "16px",
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

  // Selector bar
  selectorBar: {
    backgroundColor: C.white,
    borderRadius: "14px",
    boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
    border: "1px solid rgba(0,0,0,0.05)",
    padding: "10px 14px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "14px",
  },
  selectorLabel: {
    fontSize: "10px",
    fontWeight: "700",
    color: C.textLight,
    textTransform: "uppercase",
    letterSpacing: "0.1em",
    whiteSpace: "nowrap",
    flexShrink: 0,
  },
  divider: {
    width: "1px",
    height: "20px",
    background: C.border,
    flexShrink: 0,
  },

  // Arrow scroll button
  arrowBtn: (disabled) => ({
    flexShrink: 0,
    width: "28px",
    height: "28px",
    borderRadius: "50%",
    border: `1.5px solid ${disabled ? C.border : C.border}`,
    background: disabled ? "#F9FAFB" : C.white,
    color: disabled ? "#CCC" : C.text,
    cursor: disabled ? "not-allowed" : "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "13px",
    fontWeight: "700",
    transition: "all 0.15s",
    boxShadow: disabled ? "none" : "0 1px 4px rgba(0,0,0,0.08)",
  }),

  // Pills scroll area
  pillsScroll: {
    display: "flex",
    gap: "6px",
    overflowX: "auto",
    flex: 1,
    alignItems: "center",
  },
  pill: (isActive) => ({
    display: "inline-flex",
    alignItems: "center",
    gap: "5px",
    padding: "6px 13px",
    borderRadius: "50px",
    fontSize: "12.5px",
    fontWeight: isActive ? "700" : "500",
    cursor: "pointer",
    border: `1.5px solid ${isActive ? C.primary : C.border}`,
    background: isActive
      ? "linear-gradient(135deg, #8B1A1A 0%, #6E1515 100%)"
      : C.white,
    color: isActive ? C.white : C.text,
    transition: "all 0.15s",
    whiteSpace: "nowrap",
    flexShrink: 0,
    boxShadow: isActive ? "0 2px 8px rgba(139,26,26,0.28)" : "none",
  }),
  pillIcon: { fontSize: "12px", lineHeight: 1 },

  stack: { display: "flex", flexDirection: "column", gap: "14px" },
  errorBox: {
    background: "#FEF2F2",
    border: "1px solid #FCA5A5",
    color: "#B91C1C",
    borderRadius: "10px",
    padding: "12px 16px",
    fontSize: "13px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontFamily: "'Segoe UI', sans-serif",
  },
};

export default function ReportsPage() {
  const scrollRef = useRef(null);

  const {
    activeReport,
    selectReport,
    filters,
    updateFilter,
    data,
    total,
    page,
    loading,
    exporting,
    error,
    hasRun,
    runReport,
    changePage,
    exportReport,
  } = useReports();

  const scroll = (dir) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir * 220, behavior: "smooth" });
    }
  };

  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif" }}>
      <style>{scrollHideStyle}</style>

      {/* ── Page header ── */}
      <div style={styles.pageHeaderRow}>
        <div style={styles.titleAccent}>
          <div style={styles.accentBar} />
          <div>
            <h1 style={styles.pageTitle}>Reports Centre</h1>
            <p style={styles.pageSubtitle}>
              Generate, filter and export enterprise reports
            </p>
          </div>
        </div>
      </div>

      {/* ── Selector bar with arrow buttons ── */}
      <div style={styles.selectorBar}>
        <span style={styles.selectorLabel}>Reports</span>
        <div style={styles.divider} />

        {/* Left arrow */}
        <button
          style={styles.arrowBtn(false)}
          onClick={() => scroll(-1)}
          title="Scroll left"
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = C.primary;
            e.currentTarget.style.color = C.primary;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = C.border;
            e.currentTarget.style.color = C.text;
          }}
        >
          ‹
        </button>

        {/* Pills */}
        <div
          ref={scrollRef}
          className="ams-pill-scroll"
          style={styles.pillsScroll}
        >
          {REPORT_LIST.map((report) => {
            const isActive = activeReport?.key === report.key;
            return (
              <button
                key={report.key}
                style={styles.pill(isActive)}
                onClick={() => selectReport(report.key)}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.borderColor = C.primary;
                    e.currentTarget.style.color = C.primary;
                    e.currentTarget.style.background = C.primaryLight;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.borderColor = C.border;
                    e.currentTarget.style.color = C.text;
                    e.currentTarget.style.background = C.white;
                  }
                }}
              >
                <span style={styles.pillIcon}>{ICONS[report.icon]}</span>
                {report.label}
              </button>
            );
          })}
        </div>

        {/* Right arrow */}
        <button
          style={styles.arrowBtn(false)}
          onClick={() => scroll(1)}
          title="Scroll right"
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = C.primary;
            e.currentTarget.style.color = C.primary;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = C.border;
            e.currentTarget.style.color = C.text;
          }}
        >
          ›
        </button>
      </div>

      {/* ── Content ── */}
      <div style={styles.stack}>
        {!activeReport && <ReportWelcomeState />}

        {activeReport && (
          <>
            <ReportFilters
              activeReport={activeReport}
              filters={filters}
              onFilterChange={updateFilter}
              onRun={runReport}
              loading={loading}
            />

            {error && <div style={styles.errorBox}>⚠ {error}</div>}

            {hasRun && data.length > 0 && (
              <ReportSummaryCards reportKey={activeReport.key} data={data} />
            )}

            {hasRun && data.length > 0 && (
              <ReportExportBar
                total={total}
                onExport={exportReport}
                exporting={exporting}
              />
            )}

            {hasRun && data.length > 0 ? (
              <ReportTable
                reportKey={activeReport.key}
                data={data}
                total={total}
                page={page}
                limit={filters.limit}
                onChangePage={changePage}
                loading={loading}
              />
            ) : (
              <ReportEmptyState
                hasRun={hasRun}
                reportLabel={activeReport.label}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
