// src/components/reports/ReportExportBar.jsx

const styles = {
  bar: {
    background: "#FFFFFF",
    border: "1px solid #EBEBEB",
    borderRadius: "12px",
    padding: "12px 18px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    fontFamily: "'Segoe UI', sans-serif",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  },
  count: {
    fontSize: "13px",
    color: "#888",
  },
  countBold: {
    fontWeight: "700",
    color: "#333",
  },
  btnGroup: { display: "flex", alignItems: "center", gap: "8px" },
  label: { fontSize: "12px", color: "#888", marginRight: "4px" },
  excelBtn: (disabled) => ({
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "8px 16px",
    border: "1.5px solid #86EFAC",
    borderRadius: "50px",
    background: disabled ? "#F0FDF4" : "#F0FDF4",
    color: "#15803D",
    fontSize: "13px",
    fontWeight: "600",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.5 : 1,
    transition: "all 0.2s",
  }),
  pdfBtn: (disabled) => ({
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "8px 16px",
    border: "1.5px solid #FCA5A5",
    borderRadius: "50px",
    background: "#FEF2F2",
    color: "#B91C1C",
    fontSize: "13px",
    fontWeight: "600",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.5 : 1,
    transition: "all 0.2s",
  }),
};

export default function ReportExportBar({ total, onExport, exporting }) {
  const disabled = exporting || total === 0;
  return (
    <div style={styles.bar}>
      <span style={styles.count}>
        <span style={styles.countBold}>{total?.toLocaleString()}</span> records
        found
      </span>
      <div style={styles.btnGroup}>
        <span style={styles.label}>Export:</span>

        <button
          style={styles.excelBtn(disabled)}
          onClick={() => onExport("excel")}
          disabled={disabled}
          onMouseEnter={(e) => {
            if (!disabled) e.currentTarget.style.background = "#DCFCE7";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#F0FDF4";
          }}
        >
          📊 {exporting ? "Exporting..." : "Excel"}
        </button>

        <button
          style={styles.pdfBtn(disabled)}
          onClick={() => onExport("pdf")}
          disabled={disabled}
          onMouseEnter={(e) => {
            if (!disabled) e.currentTarget.style.background = "#FEE2E2";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#FEF2F2";
          }}
        >
          📄 {exporting ? "Exporting..." : "PDF"}
        </button>
      </div>
    </div>
  );
}
