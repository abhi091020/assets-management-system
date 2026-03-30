// src/components/auth/FloatingAssetCards.jsx
// Purely decorative — zero props needed, no logic, just animation

import { useEffect, useState } from "react";

// ── Keyframes injected once ───────────────────────────────────────────────────
const STYLES = `
  @keyframes _ams_slide_in {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0);    }
  }
  @keyframes _ams_float_a {
    0%,100% { transform: translateY(0px);  }
    50%      { transform: translateY(-7px); }
  }
  @keyframes _ams_float_b {
    0%,100% { transform: translateY(0px);  }
    50%      { transform: translateY(-5px); }
  }
  @keyframes _ams_float_c {
    0%,100% { transform: translateY(0px);  }
    50%      { transform: translateY(-9px); }
  }
  @keyframes _ams_scan {
    0%        { top: 0%;   opacity: 0; }
    5%        { opacity: 1; }
    95%       { opacity: 1; }
    100%      { top: 100%; opacity: 0; }
  }
  @keyframes _ams_ticker {
    from { transform: translateX(0); }
    to   { transform: translateX(-50%); }
  }
  @keyframes _ams_pulse {
    0%,100% { opacity: 1;   transform: scale(1);   }
    50%      { opacity: 0.4; transform: scale(0.7); }
  }
`;

// ── Asset data ────────────────────────────────────────────────────────────────
const CARDS = [
  {
    emoji: "💻",
    iconBg: "rgba(29,78,216,0.18)",
    name: "Dell Latitude 5540",
    code: "AST-2024-00142",
    badge: "Active",
    badgeBg: "rgba(22,163,74,0.15)",
    badgeColor: "#16A34A",
    loc: "Mumbai HQ",
    val: "₹82,000",
    float: "_ams_float_a",
    floatDur: "4s",
    delay: "0.5s",
    scanLine: false,
  },
  {
    emoji: "🖨️",
    iconBg: "rgba(202,0,0,0.15)",
    name: "HP LaserJet Pro M404",
    code: "AST-2024-00089",
    badge: "AMC Expiring",
    badgeBg: "rgba(202,0,0,0.12)",
    badgeColor: "#CA0000",
    loc: "Pune Office",
    val: "₹24,500",
    float: "_ams_float_b",
    floatDur: "3.6s",
    delay: "0.75s",
    scanLine: true, // QR scan laser on this card
  },
  {
    emoji: "🚗",
    iconBg: "rgba(217,119,6,0.15)",
    name: "Toyota Innova — MH04 AB 1234",
    code: "AST-2023-00011",
    badge: "In Repair",
    badgeBg: "rgba(217,119,6,0.15)",
    badgeColor: "#D97706",
    loc: "Delhi Branch",
    val: "₹14.2L",
    float: "_ams_float_c",
    floatDur: "4.4s",
    delay: "1s",
    scanLine: false,
  },
];

const TICKER_ITEMS = [
  { dot: "#4ade80", text: "Verification batch closed — 312 assets confirmed" },
  { dot: "#fbbf24", text: "AMC expiring in 7 days — HP LaserJet Pro M404" },
  { dot: "#60a5fa", text: "Transfer approved — Dell Latitude → Delhi Branch" },
  {
    dot: "rgba(255,255,255,0.35)",
    text: "Depreciation run complete — FY 2024-25",
  },
  { dot: "#4ade80", text: "New asset added — AST-2025-00247 by Ravi Kumar" },
  { dot: "#fbbf24", text: "Insurance renewal due — Toyota Innova (12 days)" },
];

// ── Mini QR grid ──────────────────────────────────────────────────────────────
const QR_PATTERN = [
  1, 0, 1, 1, 0, 0, 1, 0, 1, 1, 1, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1, 0, 0, 1, 1,
];

const QRGrid = () => (
  <div
    style={{
      display: "grid",
      gridTemplateColumns: "repeat(5,1fr)",
      gap: 2,
      padding: 8,
      background: "rgba(255,255,255,0.04)",
      borderRadius: 6,
      marginTop: 8,
    }}
  >
    {QR_PATTERN.map((on, i) => (
      <div
        key={i}
        style={{
          aspectRatio: "1",
          borderRadius: 1,
          background: on ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.1)",
        }}
      />
    ))}
  </div>
);

// ── Single asset card ─────────────────────────────────────────────────────────
const AssetCard = ({ card, visible }) => (
  <div
    style={{
      background: "rgba(255,255,255,0.06)",
      border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: 12,
      padding: "13px 15px",
      backdropFilter: "blur(6px)",
      width: 210,
      flexShrink: 0,
      opacity: visible ? 1 : 0,
      animation: visible
        ? `_ams_slide_in 0.5s cubic-bezier(0.22,1,0.36,1) ${card.delay} both,
         ${card.float} ${card.floatDur} ease-in-out ${card.delay} infinite`
        : "none",
    }}
  >
    {/* Header */}
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 8,
      }}
    >
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: 7,
          background: card.iconBg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 14,
        }}
      >
        {card.emoji}
      </div>
      <span
        style={{
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: "0.4px",
          padding: "2px 7px",
          borderRadius: 999,
          background: card.badgeBg,
          color: card.badgeColor,
          textTransform: "uppercase",
        }}
      >
        {card.badge}
      </span>
    </div>

    {/* Name + code */}
    <div
      style={{
        fontSize: 11.5,
        fontWeight: 600,
        color: "rgba(255,255,255,0.85)",
        marginBottom: 2,
        lineHeight: 1.3,
      }}
    >
      {card.name}
    </div>
    <div
      style={{
        fontSize: 9.5,
        fontFamily: "monospace",
        color: "rgba(255,255,255,0.3)",
        marginBottom: 6,
      }}
    >
      {card.code}
    </div>

    {/* QR scan or footer */}
    {card.scanLine ? (
      <div
        style={{ position: "relative", overflow: "hidden", borderRadius: 6 }}
      >
        <QRGrid />
        {/* Laser scan line */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            height: 2,
            background:
              "linear-gradient(90deg, transparent, #CA0000, transparent)",
            animation: "_ams_scan 2s linear infinite",
            top: 0,
          }}
        />
      </div>
    ) : (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingTop: 8,
          borderTop: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        <span
          style={{
            fontSize: 10,
            color: "rgba(255,255,255,0.3)",
            display: "flex",
            alignItems: "center",
            gap: 3,
          }}
        >
          <svg
            width="9"
            height="9"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          {card.loc}
        </span>
        <span
          style={{
            fontSize: 10.5,
            fontWeight: 600,
            color: "rgba(255,255,255,0.55)",
          }}
        >
          {card.val}
        </span>
      </div>
    )}
  </div>
);

// ── Activity ticker ───────────────────────────────────────────────────────────
const Ticker = ({ visible }) => {
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS]; // duplicate for seamless loop
  return (
    <div
      style={{
        overflow: "hidden",
        maskImage:
          "linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)",
        WebkitMaskImage:
          "linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)",
        opacity: visible ? 1 : 0,
        transition: "opacity 0.5s ease 1.4s",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: 12,
          width: "max-content",
          animation: "_ams_ticker 24s linear infinite",
        }}
      >
        {items.map((item, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 999,
              padding: "5px 13px",
              whiteSpace: "nowrap",
              fontSize: 10.5,
              color: "rgba(255,255,255,0.38)",
            }}
          >
            <div
              style={{
                width: 5,
                height: 5,
                borderRadius: "50%",
                background: item.dot,
                flexShrink: 0,
                animation: "_ams_pulse 1.8s ease-in-out infinite",
              }}
            />
            {item.text}
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Main export ───────────────────────────────────────────────────────────────
/**
 * Drop this anywhere inside a `position: relative` container.
 * variant = "stacked"  → cards stacked vertically (tablet left panel)
 * variant = "floating" → cards scattered absolutely (desktop bg)
 */
const FloatingAssetCards = ({ variant = "stacked" }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  if (variant === "floating") {
    // Desktop: 3 cards pinned to specific spots so they never overlap the login card
    const positions = [
      { top: "12%", left: "4%" },
      { top: "42%", left: "2%" },
      { top: "68%", left: "6%" },
    ];
    return (
      <>
        <style>{STYLES}</style>
        {CARDS.map((card, i) => (
          <div
            key={card.code}
            style={{
              position: "absolute",
              ...positions[i],
              zIndex: 1,
              pointerEvents: "none",
            }}
          >
            <AssetCard card={card} visible={visible} />
          </div>
        ))}
      </>
    );
  }

  // Stacked (tablet): sits below illustration, full width
  return (
    <>
      <style>{STYLES}</style>
      <div
        style={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          gap: 10,
          position: "relative",
          zIndex: 2,
          pointerEvents: "none",
        }}
      >
        {CARDS.map((card) => (
          <AssetCard key={card.code} card={card} visible={visible} />
        ))}
        <div style={{ marginTop: 4 }}>
          <Ticker visible={visible} />
        </div>
      </div>
    </>
  );
};

export default FloatingAssetCards;
