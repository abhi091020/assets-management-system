// src/components/reports/ReportEmptyState.jsx

const C = {
  primary: "#8B1A1A",
  textLight: "#888888",
  border: "#EBEBEB",
};

const styles = {
  wrap: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "64px 24px",
    textAlign: "center",
    fontFamily: "'Segoe UI', sans-serif",
  },
  iconWrap: (bg) => ({
    width: "64px",
    height: "64px",
    borderRadius: "16px",
    background: bg,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "28px",
    marginBottom: "16px",
  }),
  title: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#333",
    marginBottom: "6px",
  },
  sub: {
    fontSize: "13px",
    color: C.textLight,
    maxWidth: "280px",
    lineHeight: 1.6,
  },
  accent: { color: C.primary, fontWeight: "600" },
};

export default function ReportEmptyState({ hasRun, reportLabel }) {
  if (!hasRun) {
    return (
      <div style={styles.wrap}>
        <div style={styles.iconWrap("#FFF5F5")}>📊</div>
        <p style={styles.title}>Ready to run</p>
        <p style={styles.sub}>
          Set your filters and click{" "}
          <span style={styles.accent}>Run Report</span> to see results
        </p>
      </div>
    );
  }

  return (
    <div style={styles.wrap}>
      <div style={styles.iconWrap("#F9FAFB")}>🔍</div>
      <p style={styles.title}>No records found</p>
      <p style={styles.sub}>
        No data matches your selected filters for{" "}
        <span style={styles.accent}>{reportLabel}</span>
      </p>
    </div>
  );
}

// ─── Welcome state (no report selected) ──────────────────────────────────────
export function ReportWelcomeState() {
  return (
    <div style={{ ...styles.wrap, flex: 1 }}>
      <div style={styles.iconWrap("#FFF5F5")}>📋</div>
      <p style={styles.title}>Reports Centre</p>
      <p style={styles.sub}>
        Select a report from the left panel to get started. All reports support{" "}
        <span style={styles.accent}>Excel</span> and{" "}
        <span style={styles.accent}>PDF</span> export.
      </p>
    </div>
  );
}
