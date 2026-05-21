// client/src/pages/scan/PublicAssetViewPage.jsx

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getAssetByToken } from "../../api/scanApi";

// ── Badge configs ─────────────────────────────────────────────────────────────
const STATUS_STYLES = {
  Active:    { bg: "#DCFCE7", color: "#15803D" },
  InRepair:  { bg: "#FEF9C3", color: "#A16207" },
  InTransit: { bg: "#DBEAFE", color: "#1D4ED8" },
  Disposed:  { bg: "#FEE2E2", color: "#DC2626" },
  Missing:   { bg: "#FFEDD5", color: "#EA580C" },
};

const CONDITION_STYLES = {
  New:     { bg: "#D1FAE5", color: "#065F46" },
  Good:    { bg: "#DCFCE7", color: "#15803D" },
  Fair:    { bg: "#FEF9C3", color: "#A16207" },
  Poor:    { bg: "#FFEDD5", color: "#EA580C" },
  Damaged: { bg: "#FEE2E2", color: "#DC2626" },
  Scrap:   { bg: "#F1F5F9", color: "#64748B" },
};

const ACCENT = "#C8102E";

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmt = (dateStr) => {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  });
};

const fmtCurrency = (val) => {
  if (val == null) return null;
  return new Intl.NumberFormat("en-IN", {
    style: "currency", currency: "INR", maximumFractionDigits: 0,
  }).format(val);
};

// Expiry warning — returns null / "warning" / "danger"
const expiryStatus = (dateStr) => {
  if (!dateStr) return null;
  const days = Math.ceil((new Date(dateStr) - new Date()) / 86400000);
  if (days < 0)  return "danger";
  if (days <= 30) return "warning";
  return null;
};

const expiryColor = (status) => {
  if (status === "danger")  return "#DC2626";
  if (status === "warning") return "#D97706";
  return "#1E293B";
};

// ── Sub-components ────────────────────────────────────────────────────────────
const Badge = ({ label, cfg }) => {
  const s = cfg || { bg: "#F1F5F9", color: "#64748B" };
  return (
    <span style={{
      background: s.bg, color: s.color, fontSize: 12, fontWeight: 700,
      padding: "4px 12px", borderRadius: 20, whiteSpace: "nowrap",
    }}>
      {label}
    </span>
  );
};

const SectionTitle = ({ title }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
    <div style={{ width: 3, height: 16, borderRadius: 2, background: ACCENT }} />
    <span style={{
      fontSize: 11, fontWeight: 800, color: ACCENT,
      letterSpacing: "0.8px", textTransform: "uppercase",
    }}>
      {title}
    </span>
  </div>
);

const Row = ({ label, value, valueColor }) => {
  if (value == null || value === "") return null;
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "flex-start",
      padding: "10px 0", borderBottom: "1px solid #F8F8F8",
    }}>
      <span style={{
        fontSize: 11, color: "#94A3B8", fontWeight: 600,
        textTransform: "uppercase", letterSpacing: "0.5px",
        width: 130, flexShrink: 0,
      }}>
        {label}
      </span>
      <span style={{
        fontSize: 13, fontWeight: 600, textAlign: "right", flex: 1,
        color: valueColor || "#1E293B",
      }}>
        {value}
      </span>
    </div>
  );
};

const Card = ({ children, style }) => (
  <div style={{
    background: "#fff", borderRadius: 16,
    boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
    padding: "18px 20px", marginBottom: 12,
    ...style,
  }}>
    {children}
  </div>
);

// ── Main component ────────────────────────────────────────────────────────────
const PublicAssetViewPage = () => {
  const { token } = useParams();
  const [asset,    setAsset]    = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [photoIdx, setPhotoIdx] = useState(0);

  useEffect(() => {
    if (!token) { setNotFound(true); setLoading(false); return; }
    (async () => {
      const res = await getAssetByToken(token);
      if (res.success) setAsset(res.data);
      else             setNotFound(true);
      setLoading(false);
    })();
  }, [token]);

  // ── Loading ─────────────────────────────────────────────────────────────
  if (loading) return (
    <div style={{
      minHeight: "100vh", background: "#F8FAFC",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
        <div style={{
          width: 40, height: 40, border: `4px solid ${ACCENT}`,
          borderTopColor: "transparent", borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }} />
        <p style={{ fontSize: 13, color: "#94A3B8" }}>Loading asset details...</p>
      </div>
      <style>{`@keyframes spin { to { transform:rotate(360deg); } }`}</style>
    </div>
  );

  // ── Not found ───────────────────────────────────────────────────────────
  if (notFound) return (
    <div style={{
      minHeight: "100vh", background: "#F8FAFC",
      display: "flex", alignItems: "center", justifyContent: "center", padding: "0 16px",
    }}>
      <div style={{ textAlign: "center", maxWidth: 320 }}>
        <div style={{
          width: 64, height: 64, background: "#FEE2E2", borderRadius: "50%",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 16px",
        }}>
          <svg width={32} height={32} fill="none" stroke="#DC2626" strokeWidth={2} viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 8v4m0 4h.01" strokeLinecap="round" />
          </svg>
        </div>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: "#1E293B", marginBottom: 8 }}>
          Asset Not Found
        </h2>
        <p style={{ fontSize: 13, color: "#94A3B8" }}>
          This QR code is invalid or the asset has been removed from the system.
        </p>
      </div>
    </div>
  );

  const statusCfg    = STATUS_STYLES[asset.status]       || null;
  const conditionCfg = CONDITION_STYLES[asset.condition] || null;
  const photos       = asset.photos || [];

  return (
    <div style={{ minHeight: "100vh", background: "#F1F5F9", fontFamily: "'Segoe UI',system-ui,sans-serif" }}>

      {/* ── Top bar ── */}
      <div style={{
        background: `linear-gradient(135deg,${ACCENT},#8B0015)`,
        padding: "14px 20px", display: "flex", alignItems: "center", gap: 12,
      }}>
        <div style={{
          width: 36, height: 36, background: "rgba(255,255,255,0.15)",
          borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <svg width={20} height={20} fill="none" stroke="#fff" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <div>
          <p style={{ fontSize: 14, fontWeight: 700, color: "#fff", margin: 0 }}>
            Asset Management System
          </p>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.65)", margin: 0 }}>
            Asset Information Card
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 480, margin: "0 auto", padding: "16px 14px 32px" }}>

        {/* ── Identity card ── */}
        <Card style={{ padding: 0, overflow: "hidden" }}>

          {/* Photos strip — shown if photos exist, else QR code */}
          {photos.length > 0 ? (
            <div style={{ position: "relative", background: "#F8FAFC" }}>
              <img
                src={`/${photos[photoIdx].filePath}`}
                alt={photos[photoIdx].caption || "Asset photo"}
                style={{ width: "100%", height: 200, objectFit: "cover", display: "block" }}
              />
              {/* Dot navigation */}
              {photos.length > 1 && (
                <div style={{
                  position: "absolute", bottom: 10, left: 0, right: 0,
                  display: "flex", justifyContent: "center", gap: 6,
                }}>
                  {photos.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setPhotoIdx(i)}
                      style={{
                        width: i === photoIdx ? 18 : 8, height: 8,
                        borderRadius: 4, border: "none", padding: 0, cursor: "pointer",
                        background: i === photoIdx ? ACCENT : "rgba(255,255,255,0.7)",
                        transition: "all 0.2s",
                      }}
                    />
                  ))}
                </div>
              )}
              {/* Chevrons */}
              {photos.length > 1 && (
                <>
                  <button
                    onClick={() => setPhotoIdx((p) => (p - 1 + photos.length) % photos.length)}
                    style={{
                      position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)",
                      background: "rgba(0,0,0,0.35)", border: "none", borderRadius: "50%",
                      width: 30, height: 30, cursor: "pointer", color: "#fff",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                  >
                    ‹
                  </button>
                  <button
                    onClick={() => setPhotoIdx((p) => (p + 1) % photos.length)}
                    style={{
                      position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)",
                      background: "rgba(0,0,0,0.35)", border: "none", borderRadius: "50%",
                      width: 30, height: 30, cursor: "pointer", color: "#fff",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                  >
                    ›
                  </button>
                </>
              )}
            </div>
          ) : asset.qrCodeImagePath ? (
            <div style={{ background: "#FFF0F2", padding: "20px 0 12px", display: "flex", justifyContent: "center" }}>
              <div style={{
                background: "#fff", borderRadius: 12, padding: 8,
                boxShadow: "0 2px 8px rgba(200,16,46,0.15)",
              }}>
                <img
                  src={`/${asset.qrCodeImagePath}`}
                  alt="QR"
                  style={{ width: 110, height: 110, objectFit: "contain", display: "block" }}
                />
              </div>
            </div>
          ) : null}

          <div style={{ padding: "16px 20px 20px" }}>
            <p style={{
              textAlign: "center", fontSize: 11, fontFamily: "monospace",
              color: "#94A3B8", letterSpacing: "2px", marginBottom: 6,
            }}>
              {asset.assetCode}
            </p>
            <h2 style={{
              textAlign: "center", fontSize: 20, fontWeight: 800,
              color: "#0F172A", margin: "0 0 12px", lineHeight: 1.2,
            }}>
              {asset.assetName}
            </h2>
            <div style={{ display: "flex", justifyContent: "center", gap: 8, flexWrap: "wrap",
              marginBottom: asset.description ? 12 : 0 }}>
              <Badge label={asset.status}    cfg={statusCfg} />
              <Badge label={asset.condition} cfg={conditionCfg} />
            </div>
            {asset.description && (
              <p style={{ textAlign: "center", fontSize: 13, color: "#64748B", marginTop: 10, lineHeight: 1.5 }}>
                {asset.description}
              </p>
            )}
          </div>
        </Card>

        {/* ── Assignment Status ── */}
        <Card>
          <SectionTitle title="Assignment Status" />
          {asset.assignedTo ? (
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 4 }}>
              <div style={{
                width: 48, height: 48, borderRadius: "50%",
                background: "#FFF0F2", border: "2px solid #FFD6DA",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                <span style={{ fontSize: 18, fontWeight: 800, color: ACCENT }}>
                  {asset.assignedTo.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 15, fontWeight: 700, color: "#0F172A", margin: "0 0 2px" }}>
                  {asset.assignedTo.name}
                </p>
                {asset.assignedTo.code && (
                  <p style={{ fontSize: 11, color: ACCENT, fontWeight: 700, fontFamily: "monospace", margin: "0 0 2px" }}>
                    {asset.assignedTo.code}
                  </p>
                )}
                {asset.assignedTo.designation && (
                  <p style={{ fontSize: 12, color: "#64748B", margin: "0 0 2px" }}>
                    {asset.assignedTo.designation}
                  </p>
                )}
                {asset.assignedTo.email && (
                  <p style={{ fontSize: 12, color: "#94A3B8", margin: 0 }}>
                    {asset.assignedTo.email}
                  </p>
                )}
                {asset.assignedAt && (
                  <p style={{ fontSize: 11, color: "#94A3B8", margin: "4px 0 0" }}>
                    Since {fmt(asset.assignedAt)}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div style={{
              display: "flex", alignItems: "center", gap: 12,
              background: "#F8FAFC", borderRadius: 10, padding: "12px 14px",
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: "50%",
                background: "#F1F5F9", border: "2px solid #E2E8F0",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                <svg width={18} height={18} fill="none" stroke="#94A3B8" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: "#475569", margin: 0 }}>
                  Unassigned
                </p>
                <p style={{ fontSize: 11, color: "#94A3B8", margin: "2px 0 0" }}>
                  This asset is currently in company stock
                </p>
              </div>
            </div>
          )}
        </Card>

        {/* ── Physical Details ── */}
        {(asset.brand || asset.modelNumber || asset.serialNumber || asset.color) && (
          <Card>
            <SectionTitle title="Physical Details" />
            <Row label="Brand"      value={asset.brand} />
            <Row label="Model"      value={asset.modelNumber} />
            <Row label="Serial No." value={asset.serialNumber} />
            <Row label="Color"      value={asset.color} />
          </Card>
        )}

        {/* ── Classification ── */}
        <Card>
          <SectionTitle title="Classification" />
          <Row label="Category"   value={asset.category} />
          <Row label="Department" value={asset.department} />
          <Row
            label="Location"
            value={[asset.location?.name, asset.location?.city, asset.location?.state]
              .filter(Boolean).join(", ")}
          />
        </Card>

        {/* ── Purchase & Warranty ── */}
        {(asset.purchaseDate || asset.purchaseCost || asset.vendor || asset.warrantyExpiry) && (
          <Card>
            <SectionTitle title="Purchase & Warranty" />
            <Row label="Purchase Date" value={fmt(asset.purchaseDate)} />
            <Row label="Purchase Cost" value={fmtCurrency(asset.purchaseCost)} />
            <Row label="Vendor"        value={asset.vendor} />
            <Row label="Invoice No."   value={asset.invoiceNumber} />
            {asset.warrantyExpiry && (() => {
              const ws = expiryStatus(asset.warrantyExpiry);
              return (
                <Row
                  label="Warranty Expiry"
                  value={`${fmt(asset.warrantyExpiry)}${ws === "danger" ? " · Expired" : ws === "warning" ? " · Expiring soon" : ""}`}
                  valueColor={expiryColor(ws)}
                />
              );
            })()}
          </Card>
        )}

        {/* ── AMC ── */}
        {(asset.amcVendor || asset.amcExpiryDate) && (
          <Card>
            <SectionTitle title="AMC / Maintenance" />
            <Row label="AMC Vendor" value={asset.amcVendor} />
            {asset.amcExpiryDate && (() => {
              const as = expiryStatus(asset.amcExpiryDate);
              return (
                <Row
                  label="AMC Expiry"
                  value={`${fmt(asset.amcExpiryDate)}${as === "danger" ? " · Expired" : as === "warning" ? " · Expiring soon" : ""}`}
                  valueColor={expiryColor(as)}
                />
              );
            })()}
          </Card>
        )}

        {/* ── Insurance ── */}
        {(asset.insuranceCompany || asset.insuranceExpiryDate) && (
          <Card>
            <SectionTitle title="Insurance" />
            <Row label="Company"    value={asset.insuranceCompany} />
            <Row label="Policy No." value={asset.insurancePolicyNo} />
            {asset.insuranceExpiryDate && (() => {
              const is = expiryStatus(asset.insuranceExpiryDate);
              return (
                <Row
                  label="Expiry Date"
                  value={`${fmt(asset.insuranceExpiryDate)}${is === "danger" ? " · Expired" : is === "warning" ? " · Expiring soon" : ""}`}
                  valueColor={expiryColor(is)}
                />
              );
            })()}
          </Card>
        )}

        {/* Footer */}
        <p style={{ textAlign: "center", fontSize: 11, color: "#CBD5E1", paddingTop: 8 }}>
          Powered by Asset Management System
        </p>
      </div>
    </div>
  );
};

export default PublicAssetViewPage;