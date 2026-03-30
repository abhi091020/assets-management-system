// src/components/reports/ReportSelector.jsx
import { REPORT_LIST } from "../../hooks/useReports";

const C = {
  primary: "#8B1A1A",
  primaryLight: "#FFF5F5",
  white: "#FFFFFF",
  text: "#333333",
  textLight: "#888888",
  border: "#EBEBEB",
  headerBg: "#8B1A1A",
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

const styles = {
  aside: {
    width: "240px",
    flexShrink: 0,
    background: C.white,
    borderRight: `1px solid ${C.border}`,
    display: "flex",
    flexDirection: "column",
    fontFamily: "'Segoe UI', sans-serif",
  },
  header: {
    background: C.headerBg,
    padding: "16px 16px 14px",
    borderBottom: `1px solid rgba(255,255,255,0.1)`,
  },
  headerLabel: {
    fontSize: "10px",
    fontWeight: "700",
    color: "rgba(255,255,255,0.55)",
    textTransform: "uppercase",
    letterSpacing: "0.1em",
    marginBottom: "4px",
  },
  headerTitle: {
    fontSize: "14px",
    fontWeight: "700",
    color: C.white,
    margin: 0,
  },
  nav: {
    flex: 1,
    overflowY: "auto",
    padding: "6px 0",
  },
  item: (isActive) => ({
    width: "100%",
    textAlign: "left",
    background: isActive ? "#FFF5F5" : "none",
    border: "none",
    borderRight: isActive ? `3px solid ${C.primary}` : "3px solid transparent",
    padding: "10px 14px",
    display: "flex",
    alignItems: "flex-start",
    gap: "10px",
    cursor: "pointer",
    transition: "background 0.15s",
  }),
  icon: { fontSize: "16px", marginTop: "1px", flexShrink: 0 },
  label: (isActive) => ({
    fontSize: "13px",
    fontWeight: isActive ? "700" : "500",
    color: isActive ? C.primary : C.text,
    lineHeight: 1.3,
  }),
  desc: {
    fontSize: "11px",
    color: C.textLight,
    marginTop: "2px",
    lineHeight: 1.4,
  },
  footer: {
    padding: "10px 14px",
    borderTop: `1px solid ${C.border}`,
    background: "#FAFAFA",
    fontSize: "11px",
    color: C.textLight,
    textAlign: "center",
  },
};

export default function ReportSelector({ activeKey, onSelect }) {
  return (
    <aside style={styles.aside}>
      <div style={styles.header}>
        <p style={styles.headerLabel}>Reports</p>
        <h2 style={styles.headerTitle}>Select a Report</h2>
      </div>

      <nav style={styles.nav}>
        {REPORT_LIST.map((report) => {
          const isActive = activeKey === report.key;
          return (
            <button
              key={report.key}
              style={styles.item(isActive)}
              onClick={() => onSelect(report.key)}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.background = "#FAFAFA";
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.background = "none";
              }}
            >
              <span style={styles.icon}>{ICONS[report.icon]}</span>
              <div>
                <div style={styles.label(isActive)}>{report.label}</div>
                <div style={styles.desc}>{report.description}</div>
              </div>
            </button>
          );
        })}
      </nav>

      <div style={styles.footer}>{REPORT_LIST.length} reports available</div>
    </aside>
  );
}
