// client/src/components/assets/detail/detailStyles.js

export const C = {
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

export const S = {
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

  backBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "8px 16px",
    border: `1.5px solid ${C.border}`,
    borderRadius: "50px",
    background: C.white,
    fontSize: "13px",
    color: C.textLight,
    cursor: "pointer",
    fontWeight: "500",
    transition: "all 0.2s",
    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
  },
  editBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "9px 20px",
    border: `1.5px solid ${C.border}`,
    borderRadius: "50px",
    background: C.white,
    fontSize: "13px",
    color: C.text,
    cursor: "pointer",
    fontWeight: "600",
    transition: "all 0.2s",
    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
  },
  deleteBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "9px 20px",
    border: "1.5px solid #FCA5A5",
    borderRadius: "50px",
    background: "#FFF5F5",
    fontSize: "13px",
    color: "#DC2626",
    cursor: "pointer",
    fontWeight: "600",
    transition: "all 0.2s",
  },

  card: {
    backgroundColor: C.white,
    borderRadius: "16px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
    border: "1px solid rgba(0,0,0,0.04)",
    overflow: "hidden",
    marginBottom: "16px",
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "14px 20px",
    backgroundColor: C.headerBg,
  },
  cardTitle: {
    fontSize: "13px",
    fontWeight: "600",
    color: C.white,
    margin: 0,
    letterSpacing: "0.04em",
  },

  detailRow: (idx) => ({
    display: "flex",
    alignItems: "flex-start",
    gap: "16px",
    padding: "11px 20px",
    borderBottom: `1px solid ${C.border}`,
    backgroundColor: idx % 2 === 1 ? C.rowZebra : C.white,
    transition: "background 0.15s",
  }),
  detailLabel: {
    fontSize: "12.5px",
    color: C.textLight,
    width: "170px",
    flexShrink: 0,
    paddingTop: "1px",
  },
  detailValue: {
    fontSize: "13.5px",
    color: C.text,
    fontWeight: "500",
    wordBreak: "break-word",
  },

  codeBadge: {
    display: "inline-block",
    fontFamily: "monospace",
    fontSize: "12px",
    fontWeight: "700",
    color: C.primary,
    background: "#FFF5F5",
    border: "1px solid #FECACA",
    padding: "3px 10px",
    borderRadius: "6px",
    letterSpacing: "0.06em",
  },

  scanBtn: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    padding: "10px",
    border: "1.5px solid #BFDBFE",
    borderRadius: "10px",
    background: "#EFF6FF",
    color: "#1D4ED8",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s",
    marginTop: "14px",
  },
};

// ── Shared helpers ─────────────────────────────────────────────────────────────
export const formatDate = (val) => {
  if (!val) return "—";
  const d = new Date(val.includes("T") ? val : val + "T00:00:00");
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export const formatCurrency = (val) => {
  if (val == null || val === "") return "—";
  return `₹${Number(val).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};
