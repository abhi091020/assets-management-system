// src/components/reports/ReportSummaryCards.jsx

const styles = {
  grid: {
    display: "flex",
    flexWrap: "wrap",
    gap: "14px",
    fontFamily: "'Segoe UI', sans-serif",
  },
  card: (color) => {
    const map = {
      blue: { bg: "#EFF6FF", text: "#1D4ED8", border: "#BFDBFE" },
      green: { bg: "#F0FDF4", text: "#15803D", border: "#BBF7D0" },
      yellow: { bg: "#FFFBEB", text: "#B45309", border: "#FDE68A" },
      red: { bg: "#FEF2F2", text: "#B91C1C", border: "#FECACA" },
      gray: { bg: "#F9FAFB", text: "#374151", border: "#E5E7EB" },
    };
    const t = map[color] || map.blue;
    return {
      background: t.bg,
      border: `1px solid ${t.border}`,
      borderRadius: "12px",
      padding: "14px 18px",
      minWidth: "130px",
      flex: "1 1 130px",
    };
  },
  label: (color) => {
    const map = {
      blue: "#1D4ED8",
      green: "#15803D",
      yellow: "#B45309",
      red: "#B91C1C",
      gray: "#374151",
    };
    return {
      fontSize: "11px",
      fontWeight: "600",
      color: map[color] || map.blue,
      textTransform: "uppercase",
      letterSpacing: "0.06em",
      opacity: 0.7,
    };
  },
  value: (color) => {
    const map = {
      blue: "#1D4ED8",
      green: "#15803D",
      yellow: "#B45309",
      red: "#B91C1C",
      gray: "#374151",
    };
    return {
      fontSize: "24px",
      fontWeight: "800",
      color: map[color] || map.blue,
      marginTop: "4px",
      lineHeight: 1,
    };
  },
};

function Card({ label, value, color = "blue" }) {
  return (
    <div style={styles.card(color)}>
      <div style={styles.label(color)}>{label}</div>
      <div style={styles.value(color)}>{value ?? "—"}</div>
    </div>
  );
}

function getSummaryCards(reportKey, data) {
  if (!data?.length) return [];
  switch (reportKey) {
    case "asset-register": {
      const active = data.filter((r) => r.status === "Active").length;
      const inRepair = data.filter((r) => r.status === "In Repair").length;
      const totalCost = data.reduce(
        (s, r) => s + (parseFloat(r.purchase_cost) || 0),
        0,
      );
      return [
        { label: "Showing", value: data.length, color: "blue" },
        { label: "Active", value: active, color: "green" },
        { label: "In Repair", value: inRepair, color: "yellow" },
        {
          label: "Total Cost",
          value: `₹${totalCost.toLocaleString("en-IN")}`,
          color: "gray",
        },
      ];
    }
    case "by-category":
    case "by-location":
    case "by-department": {
      const totalAssets = data.reduce(
        (s, r) => s + (parseInt(r.total) || 0),
        0,
      );
      const totalCost = data.reduce(
        (s, r) => s + (parseFloat(r.total_cost) || 0),
        0,
      );
      const totalActive = data.reduce(
        (s, r) => s + (parseInt(r.active) || 0),
        0,
      );
      return [
        { label: "Groups", value: data.length, color: "blue" },
        { label: "Total Assets", value: totalAssets, color: "green" },
        { label: "Active", value: totalActive, color: "green" },
        {
          label: "Total Cost",
          value: `₹${totalCost.toLocaleString("en-IN")}`,
          color: "gray",
        },
      ];
    }
    case "by-status": {
      const total = data.reduce((s, r) => s + (parseInt(r.total) || 0), 0);
      return [
        { label: "Total Assets", value: total, color: "blue" },
        ...data.map((r) => ({
          label: r.status,
          value: r.total,
          color:
            r.status === "Active"
              ? "green"
              : r.status === "Disposed"
                ? "red"
                : "yellow",
        })),
      ];
    }
    case "transfers": {
      const pending = data.filter((r) => r.status === "Pending").length;
      const approved = data.filter((r) => r.status === "Approved").length;
      return [
        { label: "Total", value: data.length, color: "blue" },
        { label: "Pending", value: pending, color: "yellow" },
        { label: "Approved", value: approved, color: "green" },
      ];
    }
    case "disposals": {
      const pending = data.filter((r) => r.status === "Pending").length;
      const approved = data.filter((r) => r.status === "Approved").length;
      const totalSale = data.reduce(
        (s, r) => s + (parseFloat(r.sale_amount) || 0),
        0,
      );
      return [
        { label: "Total", value: data.length, color: "blue" },
        { label: "Pending", value: pending, color: "yellow" },
        { label: "Approved", value: approved, color: "green" },
        {
          label: "Total Sale",
          value: `₹${totalSale.toLocaleString("en-IN")}`,
          color: "gray",
        },
      ];
    }
    case "verification": {
      const open = data.filter((r) => r.status === "Open").length;
      const closed = data.filter((r) => r.status === "Closed").length;
      const verified = data.reduce(
        (s, r) => s + (parseInt(r.verified) || 0),
        0,
      );
      return [
        { label: "Total Batches", value: data.length, color: "blue" },
        { label: "Open", value: open, color: "yellow" },
        { label: "Closed", value: closed, color: "green" },
        { label: "Verified Items", value: verified, color: "gray" },
      ];
    }
    default:
      return [{ label: "Total Records", value: data.length, color: "blue" }];
  }
}

export default function ReportSummaryCards({ reportKey, data }) {
  const cards = getSummaryCards(reportKey, data);
  if (!cards.length) return null;
  return (
    <div style={styles.grid}>
      {cards.map((card, i) => (
        <Card key={i} {...card} />
      ))}
    </div>
  );
}
