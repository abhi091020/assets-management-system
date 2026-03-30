// client/src/components/assets/detail/AssetInfoCard.jsx

import { C, S } from "./detailStyles";

// ── Reusable dark-red header card ─────────────────────────────────────────────
export const AssetInfoCard = ({ title, icon, children }) => (
  <div style={S.card}>
    <div style={S.cardHeader}>
      {icon && (
        <span style={{ color: "rgba(255,255,255,0.8)", display: "flex" }}>
          {icon}
        </span>
      )}
      <h3 style={S.cardTitle}>{title}</h3>
    </div>
    <div>{children}</div>
  </div>
);

// ── Zebra detail row ──────────────────────────────────────────────────────────
export const DetailRow = ({ label, value, idx }) => (
  <div
    style={S.detailRow(idx)}
    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = C.rowHover)}
    onMouseLeave={(e) =>
      (e.currentTarget.style.backgroundColor =
        idx % 2 === 1 ? C.rowZebra : C.white)
    }
  >
    <span style={S.detailLabel}>{label}</span>
    <span style={S.detailValue}>{value || "—"}</span>
  </div>
);

// ── Tiny inline SVG icon helper ───────────────────────────────────────────────
export const IconSvg = ({ d, d2 }) => (
  <svg
    width="15"
    height="15"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={d} />
    {d2 && (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d={d2}
      />
    )}
  </svg>
);
