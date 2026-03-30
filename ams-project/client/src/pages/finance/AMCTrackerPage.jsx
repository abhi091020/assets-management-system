// client/src/pages/finance/AMCTrackerPage.jsx

import { useAMC } from "../../hooks/useAMC";
import AMCTable from "../../components/finance/amc/AMCTable";

const ACCENT = "#8B1A1A";

const styles = {
  page: { fontFamily: "'Segoe UI', sans-serif" },
  pageHeaderRow: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: "24px",
    flexWrap: "wrap",
    gap: "12px",
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
    color: ACCENT,
    margin: 0,
    lineHeight: 1.2,
  },
  pageSubtitle: { fontSize: "13px", color: "#888888", marginTop: "4px" },
  tabBar: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    marginBottom: "20px",
    borderBottom: "2px solid #F3F4F6",
  },
  tab: (active) => ({
    padding: "10px 20px",
    fontSize: "14px",
    fontWeight: "600",
    border: "none",
    background: "none",
    cursor: "pointer",
    borderBottom: active ? `2px solid ${ACCENT}` : "2px solid transparent",
    color: active ? ACCENT : "#6B7280",
    marginBottom: "-2px",
    transition: "color 0.15s",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  }),
  tabBadge: (active) => ({
    padding: "1px 7px",
    borderRadius: "50px",
    fontSize: "11px",
    fontWeight: "700",
    backgroundColor: active ? "#FEE2E2" : "#F3F4F6",
    color: active ? ACCENT : "#9CA3AF",
  }),
};

const TABS = [
  { key: "amc", label: "AMC Contracts" },
  { key: "insurance", label: "Insurance Policies" },
];

export default function AMCTrackerPage() {
  const {
    activeTab,
    handleTabChange,
    amcAssets,
    amcTotal,
    amcLoading,
    amcPage,
    setAmcPage,
    amcDays,
    handleAmcDaysChange,
    insuranceAssets,
    insuranceTotal,
    insuranceLoading,
    insurancePage,
    setInsurancePage,
    insuranceDays,
    handleInsuranceDaysChange,
    pageSize,
  } = useAMC();

  const isAMC = activeTab === "amc";

  return (
    <div style={styles.page}>
      {/* ── Page Header ── */}
      <div style={styles.pageHeaderRow}>
        <div style={styles.titleAccent}>
          <div style={styles.accentBar} />
          <div>
            <h1 style={styles.pageTitle}>AMC &amp; Insurance Tracker</h1>
            <p style={styles.pageSubtitle}>
              Monitor expiring AMC contracts and insurance policies
            </p>
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div style={styles.tabBar}>
        {TABS.map((tab) => {
          const count = tab.key === "amc" ? amcTotal : insuranceTotal;
          const active = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              style={styles.tab(active)}
            >
              {tab.label}
              {count > 0 && (
                <span style={styles.tabBadge(active)}>{count}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Table (card only, no header inside) ── */}
      {isAMC ? (
        <AMCTable
          data={amcAssets}
          loading={amcLoading}
          type="amc"
          page={amcPage}
          pageSize={pageSize}
          totalCount={amcTotal}
          onPageChange={setAmcPage}
          days={amcDays}
          onDaysChange={handleAmcDaysChange}
        />
      ) : (
        <AMCTable
          data={insuranceAssets}
          loading={insuranceLoading}
          type="insurance"
          page={insurancePage}
          pageSize={pageSize}
          totalCount={insuranceTotal}
          onPageChange={setInsurancePage}
          days={insuranceDays}
          onDaysChange={handleInsuranceDaysChange}
        />
      )}
    </div>
  );
}
