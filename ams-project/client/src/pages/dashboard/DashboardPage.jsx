// src/pages/dashboard/DashboardPage.jsx
// AMS · Dashboard · v4 — Custom SVG animated charts, premium RED theme
import { useEffect, useState, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip as RTooltip,
} from "recharts";

// ── Tokens ────────────────────────────────────────────────────────────────────
const T = {
  red: "#C8102E",
  red2: "#E8192C",
  redDark: "#8B0015",
  redSoft: "#FFF0F2",
  redMid: "#FFD6DA",
  navy: "#0F172A",
  navyMid: "#1E293B",
  slate: "#64748B",
  muted: "#94A3B8",
  border: "#F1F5F9",
  bg: "#F8FAFC",
  white: "#FFFFFF",
  green: "#10B981",
  amber: "#F59E0B",
};
const PIE_COLORS = [
  "#C8102E",
  "#E8192C",
  "#FF4D6D",
  "#FF7A8A",
  "#FFB3BE",
  "#FFD6DA",
];

// ── Data ─────────────────────────────────────────────────────────────────────
const KPI = [
  {
    id: "total",
    label: "Total Assets",
    value: 1250,
    icon: "▣",
    trend: 3,
    up: false,
    sub: null,
  },
  {
    id: "active",
    label: "Active Assets",
    value: 980,
    icon: "◉",
    trend: 5,
    up: true,
    sub: null,
  },
  {
    id: "maint",
    label: "Under Maintenance",
    value: 45,
    icon: "⚙",
    trend: 2,
    up: false,
    sub: null,
  },
  {
    id: "warranty",
    label: "Warranty Expiring",
    value: 30,
    icon: "⚠",
    trend: 8,
    up: false,
    sub: "₹2,50,000",
  },
  {
    id: "scrap",
    label: "Scrap / Damaged",
    value: 15,
    icon: "✕",
    trend: 1,
    up: false,
    sub: "₹26,000",
  },
  {
    id: "depts",
    label: "Total Departments",
    value: 7,
    icon: "⊞",
    trend: null,
    up: false,
    sub: null,
  },
];
const FIN = [
  {
    label: "Total Asset Value",
    value: "₹2,45,00,000",
    delta: "+12%",
    up: true,
    accent: "#C8102E",
  },
  {
    label: "Monthly Maintenance Cost",
    value: "₹1,85,000",
    delta: "+3%",
    up: true,
    accent: "#FF4D6D",
  },
  {
    label: "Depreciation This Year",
    value: "₹32,50,000",
    delta: "-5%",
    up: false,
    accent: "#FF7A8A",
  },
  {
    label: "Warranty Claim Value",
    value: "₹4,20,000",
    delta: "+8%",
    up: true,
    accent: "#FFB3BE",
  },
  {
    label: "Scrap Asset Loss",
    value: "₹2,10,000",
    delta: "+1%",
    up: true,
    accent: "#FECDD3",
  },
];
const PIE_DATA = [
  { name: "Laptops", pct: 35, val: "₹96.5L" },
  { name: "Desktops", pct: 20, val: "₹51.8L" },
  { name: "Printers", pct: 15, val: "₹22.4L" },
  { name: "AC Units", pct: 10, val: "₹30.6L" },
  { name: "Furniture", pct: 12, val: "₹29.4L" },
  { name: "Network Devices", pct: 8, val: "₹13.8k" },
];
const BAR_DATA = [
  { dept: "IT", v: 17000, label: "₹85L" },
  { dept: "HR", v: 13500, label: "₹35L" },
  { dept: "Accounts", v: 10800, label: "₹42L" },
  { dept: "Admin", v: 9200, label: "₹30L" },
  { dept: "Finance", v: 7800, label: "₹25L" },
  { dept: "Sales", v: 7200, label: "₹25L" },
];
const LINE_DATA = [
  { m: "Jan", v: 186000, dot: true },
  { m: "Feb", v: 14000, dot: true },
  { m: "Mar", v: 140000, dot: true },
  { m: "Apr", v: 180000, dot: true },
  { m: "May", v: 110000, dot: true },
  { m: "Jun", v: 155000, dot: true },
];
const SERVICES = [
  {
    id: "AS-1203",
    name: "Dell Laptop",
    by: "Rahul Mehta",
    last: "15 Dec 2021",
    cost: "₹11,800",
    status: "Scheduled",
  },
  {
    id: "PR-2104",
    name: "HP Printer",
    by: "Neha Gupta",
    last: "28 Jan 2022",
    cost: "₹2,200",
    status: "Due",
  },
  {
    id: "AC-3056",
    name: "LG Air Conditioner",
    by: "Amit Sen",
    last: "20 Dec 2021",
    cost: "₹3,000",
    status: "Scheduled",
  },
];
const ALLOC = [
  {
    sr: 1,
    id: "AS-1101",
    name: "Lenovo ThinkPad",
    emp: "Sarah Miller",
    dept: "IT",
    purchase: "₹75,000",
    current: "₹50,000",
    lastSvc: "10 Oct 2021",
    maint: "₹2,350",
    st: "Active",
  },
  {
    sr: 2,
    id: "DS-3045",
    name: "HP Desktop",
    emp: "Michael Brown",
    dept: "HR",
    purchase: "₹35,000",
    current: "₹20,000",
    lastSvc: "05 Dec 2021",
    maint: "₹1,800",
    st: "Scrap",
  },
  {
    sr: 3,
    id: "PR-1986",
    name: "Canon Printer",
    emp: "Lisa Roy",
    dept: "Admin",
    purchase: "₹20,000",
    current: "₹12,000",
    lastSvc: "17 Nov 2021",
    maint: "₹2,200",
    st: "In Repair",
  },
];
const BADGE_CFG = {
  Active: { bg: "#DCFCE7", color: "#15803D" },
  Scheduled: { bg: "#FFF0F2", color: "#C8102E" },
  Due: { bg: "#FEF9C3", color: "#A16207" },
  Scrap: { bg: "#F1F5F9", color: "#64748B" },
  "In Repair": { bg: "#EDE9FE", color: "#6D28D9" },
};

// ── Hooks ─────────────────────────────────────────────────────────────────────
function useCountUp(target, ms = 1400) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let raf,
      t0 = null;
    const tick = (ts) => {
      if (!t0) t0 = ts;
      const p = Math.min((ts - t0) / ms, 1);
      setV(Math.round((1 - Math.pow(1 - p, 4)) * target));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target]);
  return v;
}
function useInView(threshold = 0.2) {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVis(true);
          obs.disconnect();
        }
      },
      { threshold },
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, vis];
}
function useAnimValue(active, duration = 900, delay = 0) {
  const [p, setP] = useState(0);
  useEffect(() => {
    if (!active) return;
    let raf,
      t0 = null;
    const tick = (ts) => {
      if (!t0) t0 = ts;
      const elapsed = ts - t0 - delay;
      if (elapsed < 0) {
        raf = requestAnimationFrame(tick);
        return;
      }
      const prog = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - prog, 3);
      setP(eased);
      if (prog < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, duration, delay]);
  return p;
}

// ── Small atoms ───────────────────────────────────────────────────────────────
const Badge = ({ status }) => {
  const c = BADGE_CFG[status] || { bg: "#F1F5F9", color: "#64748B" };
  return (
    <span
      style={{
        background: c.bg,
        color: c.color,
        fontSize: 11,
        fontWeight: 700,
        padding: "3px 10px",
        borderRadius: 20,
        whiteSpace: "nowrap",
      }}
    >
      {status}
    </span>
  );
};
const SH = ({ title, sub, action }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 18,
    }}
  >
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
        <div
          style={{
            width: 3,
            height: 18,
            borderRadius: 2,
            background: `linear-gradient(180deg,${T.red},${T.red2})`,
          }}
        />
        <span
          style={{
            fontSize: 14,
            fontWeight: 800,
            color: T.navy,
            letterSpacing: -0.2,
          }}
        >
          {title}
        </span>
      </div>
      {sub && (
        <p
          style={{
            margin: "3px 0 0 12px",
            fontSize: 11,
            color: T.muted,
            fontWeight: 500,
          }}
        >
          {sub}
        </p>
      )}
    </div>
    {action && (
      <span
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: T.red,
          cursor: "pointer",
        }}
      >
        {action} →
      </span>
    )}
  </div>
);
const Card = ({ children, style = {}, delay = 0, noPad = false }) => (
  <div
    style={{
      background: T.white,
      borderRadius: 16,
      border: `1px solid ${T.border}`,
      boxShadow:
        "0 1px 3px rgba(15,23,42,0.04), 0 6px 24px rgba(15,23,42,0.05)",
      padding: noPad ? 0 : "22px 24px",
      animation: "ams-fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) both",
      animationDelay: `${delay}ms`,
      overflow: "hidden",
      ...style,
    }}
  >
    {children}
  </div>
);

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({ k, delay, selected, onSelect }) {
  const count = useCountUp(k.value);
  const [hov, setHov] = useState(false);
  const dark = selected;
  const bg = selected ? `linear-gradient(145deg,#C8102E,#8B0015)` : T.white;

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onClick={onSelect}
      style={{
        position: "relative",
        background: bg,
        borderRadius: 16,
        padding: "20px 20px 18px",
        border: dark ? "none" : `1px solid ${T.border}`,
        boxShadow: hov
          ? dark
            ? "0 16px 48px rgba(200,16,46,0.45)"
            : "0 10px 36px rgba(15,23,42,0.12)"
          : dark
            ? "0 6px 24px rgba(200,16,46,0.28)"
            : "0 1px 3px rgba(15,23,42,0.04), 0 4px 16px rgba(15,23,42,0.04)",
        transform: hov
          ? "translateY(-5px) scale(1.015)"
          : "translateY(0) scale(1)",
        transition:
          "transform 0.28s cubic-bezier(0.16,1,0.3,1), box-shadow 0.28s ease, background 0.3s ease",
        animation: `ams-fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) both`,
        animationDelay: `${delay}ms`,
        overflow: "hidden",
        cursor: "pointer",
      }}
    >
      {dark && (
        <>
          <div
            style={{
              position: "absolute",
              right: -22,
              top: -22,
              width: 88,
              height: 88,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.08)",
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "absolute",
              right: 18,
              bottom: -28,
              width: 64,
              height: 64,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.05)",
              pointerEvents: "none",
            }}
          />
        </>
      )}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: 14,
        }}
      >
        <span
          style={{
            fontSize: 10,
            fontWeight: 800,
            letterSpacing: 0.7,
            textTransform: "uppercase",
            color: dark ? "rgba(255,255,255,0.6)" : T.muted,
            lineHeight: 1.4,
            maxWidth: "70%",
            transition: "color 0.3s",
          }}
        >
          {k.label}
        </span>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 10,
            flexShrink: 0,
            background: dark ? "rgba(255,255,255,0.15)" : T.redSoft,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 15,
            color: dark ? "#fff" : T.red,
            transition: "background 0.3s, color 0.3s",
          }}
        >
          {k.icon}
        </div>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          gap: 10,
          marginBottom: 4,
        }}
      >
        <span
          style={{
            fontSize: 36,
            fontWeight: 900,
            lineHeight: 1,
            color: dark ? "#fff" : T.navy,
            fontVariantNumeric: "tabular-nums",
            letterSpacing: -1,
            transition: "color 0.3s",
          }}
        >
          {count.toLocaleString()}
        </span>
        {k.trend != null && (
          <span
            style={{
              fontSize: 11,
              fontWeight: 800,
              marginBottom: 5,
              color: k.up ? T.green : dark ? "#FFB3BE" : T.red,
            }}
          >
            {k.up ? "▲" : "▼"} {k.trend}%
          </span>
        )}
      </div>
      {k.sub && (
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: dark ? "rgba(255,255,255,0.5)" : T.muted,
            transition: "color 0.3s",
          }}
        >
          {k.sub}
        </span>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// CUSTOM ANIMATED BAR CHART
// Each bar grows from the bottom with a stagger, shimmer sweep, glow, label pop
// ══════════════════════════════════════════════════════════════════════════════
function AnimatedBarChart({ data, visible }) {
  const W = 100,
    PAD_L = 48,
    PAD_B = 32,
    PAD_T = 40,
    PAD_R = 16;
  const BAR_GAP = 4;
  const maxV = Math.max(...data.map((d) => d.v));
  const n = data.length;

  // One animValue per bar — staggered
  const anim0 = useAnimValue(visible, 800, 0);
  const anim1 = useAnimValue(visible, 800, 80);
  const anim2 = useAnimValue(visible, 800, 160);
  const anim3 = useAnimValue(visible, 800, 240);
  const anim4 = useAnimValue(visible, 800, 320);
  const anim5 = useAnimValue(visible, 800, 400);
  const anims = [anim0, anim1, anim2, anim3, anim4, anim5];

  // Label fade — appears after bar is ~80% grown
  const lbl0 = useAnimValue(visible, 400, 600);
  const lbl1 = useAnimValue(visible, 400, 680);
  const lbl2 = useAnimValue(visible, 400, 760);
  const lbl3 = useAnimValue(visible, 400, 840);
  const lbl4 = useAnimValue(visible, 400, 920);
  const lbl5 = useAnimValue(visible, 400, 1000);
  const lbls = [lbl0, lbl1, lbl2, lbl3, lbl4, lbl5];

  const [hov, setHov] = useState(null);

  // SVG is purely responsive via viewBox
  const vW = 520,
    vH = 240;
  const chartW = vW - PAD_L - PAD_R;
  const chartH = vH - PAD_B - PAD_T;
  const slotW = chartW / n;
  const barW = slotW - BAR_GAP * 2 - 8;

  // Y-axis grid lines
  const yTicks = [0, 5000, 10000, 15000];

  return (
    <svg
      viewBox={`0 0 ${vW} ${vH}`}
      style={{
        width: "100%",
        height: "100%",
        display: "block",
        overflow: "visible",
      }}
    >
      <defs>
        {/* Bar gradient */}
        <linearGradient id="bg1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#E8192C" stopOpacity="1" />
          <stop offset="100%" stopColor="#FF8096" stopOpacity="0.85" />
        </linearGradient>
        {/* Hover gradient — brighter */}
        <linearGradient id="bg2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#C8102E" stopOpacity="1" />
          <stop offset="100%" stopColor="#FF4D6D" stopOpacity="1" />
        </linearGradient>
        {/* Shimmer mask gradient */}
        <linearGradient id="shimmerGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="white" stopOpacity="0" />
          <stop offset="45%" stopColor="white" stopOpacity="0.35" />
          <stop offset="55%" stopColor="white" stopOpacity="0.35" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </linearGradient>
        {/* Glow filter */}
        <filter id="barGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <clipPath id="chartClip">
          <rect x={PAD_L} y={PAD_T} width={chartW} height={chartH} />
        </clipPath>
      </defs>

      {/* Grid lines */}
      {yTicks.map((t) => {
        const y = PAD_T + chartH - (t / maxV) * chartH;
        return (
          <g key={t}>
            <line
              x1={PAD_L}
              y1={y}
              x2={vW - PAD_R}
              y2={y}
              stroke={t === 0 ? "#E2E8F0" : "#F1F5F9"}
              strokeWidth={t === 0 ? 1.5 : 1}
            />
            <text
              x={PAD_L - 6}
              y={y + 4}
              textAnchor="end"
              fontSize={9}
              fill="#CBD5E1"
              fontFamily="DM Sans,sans-serif"
              fontWeight={600}
            >
              {t >= 1000 ? `${t / 1000}k` : t}
            </text>
          </g>
        );
      })}

      {/* Bars */}
      {data.map((d, i) => {
        const p = anims[i];
        const barH = (d.v / maxV) * chartH * p;
        const x = PAD_L + i * slotW + BAR_GAP + 4;
        const y = PAD_T + chartH - barH;
        const isHov = hov === i;
        const shimmerX = x + barW * (p * 1.8 - 0.9);

        return (
          <g
            key={d.dept}
            onMouseEnter={() => setHov(i)}
            onMouseLeave={() => setHov(null)}
            style={{ cursor: "pointer" }}
          >
            {/* Hover background glow zone */}
            {isHov && (
              <rect
                x={x - 4}
                y={PAD_T}
                width={barW + 8}
                height={chartH}
                fill={T.redSoft}
                rx={10}
                opacity={0.7}
              />
            )}

            {/* Bar body */}
            <rect
              x={x}
              y={y}
              width={barW}
              height={Math.max(barH, 0)}
              fill={isHov ? "url(#bg2)" : "url(#bg1)"}
              rx={isHov ? 10 : 8}
              filter={isHov ? "url(#barGlow)" : undefined}
              style={{ transition: "rx 0.15s, filter 0.15s" }}
            />

            {/* Shimmer sweep on bar surface — moves as bar grows */}
            {p > 0 && p < 0.98 && barH > 10 && (
              <rect
                x={shimmerX - 12}
                y={y}
                width={24}
                height={barH}
                fill="url(#shimmerGrad)"
                rx={8}
                clipPath="url(#chartClip)"
                opacity={0.7}
                style={{ pointerEvents: "none" }}
              />
            )}

            {/* Top cap highlight line */}
            {barH > 4 && (
              <rect
                x={x + 3}
                y={y}
                width={barW - 6}
                height={3}
                fill="rgba(255,255,255,0.5)"
                rx={2}
              />
            )}

            {/* Value label above bar */}
            <text
              x={x + barW / 2}
              y={y - 8}
              textAnchor="middle"
              fontSize={10}
              fontWeight={800}
              fill={isHov ? T.red : "#94A3B8"}
              fontFamily="DM Sans,sans-serif"
              opacity={lbls[i]}
              style={{ transition: "fill 0.15s" }}
            >
              {d.label}
            </text>

            {/* X-axis label */}
            <text
              x={x + barW / 2}
              y={PAD_T + chartH + 18}
              textAnchor="middle"
              fontSize={11}
              fontWeight={600}
              fill={isHov ? T.red : "#94A3B8"}
              fontFamily="DM Sans,sans-serif"
              style={{ transition: "fill 0.15s" }}
            >
              {d.dept}
            </text>

            {/* Hover tooltip bubble */}
            {isHov && (
              <g>
                <rect
                  x={x + barW / 2 - 32}
                  y={y - 44}
                  width={64}
                  height={26}
                  rx={8}
                  fill={T.navy}
                />
                <polygon
                  points={`${x + barW / 2 - 6},${y - 18} ${x + barW / 2 + 6},${y - 18} ${x + barW / 2},${y - 10}`}
                  fill={T.navy}
                />
                <text
                  x={x + barW / 2}
                  y={y - 26}
                  textAnchor="middle"
                  fontSize={11}
                  fontWeight={800}
                  fill="#FF8096"
                  fontFamily="DM Sans,sans-serif"
                >
                  {d.v.toLocaleString()}
                </text>
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// CUSTOM ANIMATED LINE / AREA CHART
// Path draws itself left-to-right, dots pop in sequence, gradient area fills up
// ══════════════════════════════════════════════════════════════════════════════
function AnimatedLineChart({ data, visible }) {
  const svgRef = useRef(null);
  const pathRef = useRef(null);
  const areaRef = useRef(null);
  const [pathLen, setPathLen] = useState(0);
  const [dotPhase, setDotPhase] = useState(0); // 0–data.length

  const vW = 520,
    vH = 200;
  const PAD_L = 50,
    PAD_R = 16,
    PAD_T = 20,
    PAD_B = 32;
  const chartW = vW - PAD_L - PAD_R;
  const chartH = vH - PAD_T - PAD_B;

  const maxV = Math.max(...data.map((d) => d.v));
  const minV = 0;

  const pts = data.map((d, i) => ({
    x: PAD_L + (i / (data.length - 1)) * chartW,
    y: PAD_T + chartH - ((d.v - minV) / (maxV - minV)) * chartH,
  }));

  // Smooth cubic bezier path
  const pathD = pts.reduce((acc, pt, i) => {
    if (i === 0) return `M ${pt.x} ${pt.y}`;
    const prev = pts[i - 1];
    const cpx = (prev.x + pt.x) / 2;
    return `${acc} C ${cpx} ${prev.y} ${cpx} ${pt.y} ${pt.x} ${pt.y}`;
  }, "");

  const areaD = `${pathD} L ${pts[pts.length - 1].x} ${PAD_T + chartH} L ${pts[0].x} ${PAD_T + chartH} Z`;

  // Measure path length after mount
  useEffect(() => {
    if (pathRef.current) {
      setPathLen(pathRef.current.getTotalLength());
    }
  }, []);

  // Animate path draw when visible
  const lineAnim = useAnimValue(visible, 1200, 0);
  const areaAnim = useAnimValue(visible, 1000, 300);

  // Stagger dots after line passes through them
  useEffect(() => {
    if (!visible) return;
    const timers = data.map((_, i) =>
      setTimeout(() => setDotPhase((p) => Math.max(p, i + 1)), 200 + i * 160),
    );
    return () => timers.forEach(clearTimeout);
  }, [visible]);

  const [hov, setHov] = useState(null);

  // Y-axis ticks
  const yTicks = [0, 50000, 100000, 150000, 200000];

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${vW} ${vH}`}
      style={{
        width: "100%",
        height: "100%",
        display: "block",
        overflow: "visible",
      }}
    >
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#C8102E" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#C8102E" stopOpacity="0.01" />
        </linearGradient>
        <filter id="lineGlow">
          <feGaussianBlur stdDeviation="2.5" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="dotGlow">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        {/* Clip so area only shows up to lineAnim progress */}
        <clipPath id="areaReveal">
          <rect x={PAD_L} y={0} width={chartW * areaAnim} height={vH} />
        </clipPath>
      </defs>

      {/* Grid */}
      {yTicks.map((t) => {
        const y = PAD_T + chartH - (t / maxV) * chartH;
        return (
          <g key={t}>
            <line
              x1={PAD_L}
              y1={y}
              x2={vW - PAD_R}
              y2={y}
              stroke={t === 0 ? "#E2E8F0" : "#F1F5F9"}
              strokeWidth={t === 0 ? 1.5 : 1}
              strokeDasharray={t === 0 ? "0" : "4 4"}
            />
            <text
              x={PAD_L - 6}
              y={y + 4}
              textAnchor="end"
              fontSize={9}
              fill="#CBD5E1"
              fontFamily="DM Sans,sans-serif"
              fontWeight={600}
            >
              {t === 0 ? "0" : `₹${t / 1000}k`}
            </text>
          </g>
        );
      })}

      {/* X-axis labels */}
      {data.map((d, i) => (
        <text
          key={d.m}
          x={pts[i].x}
          y={PAD_T + chartH + 18}
          textAnchor="middle"
          fontSize={11}
          fill={hov === i ? T.red : "#94A3B8"}
          fontFamily="DM Sans,sans-serif"
          fontWeight={600}
          style={{ transition: "fill 0.15s" }}
        >
          {d.m}
        </text>
      ))}

      {/* Area fill — fades in with clip */}
      <path d={areaD} fill="url(#areaGrad)" clipPath="url(#areaReveal)" />

      {/* Glow duplicate (blurred) */}
      <path
        ref={areaRef}
        d={pathD}
        fill="none"
        stroke="#FF4D6D"
        strokeWidth={4}
        strokeOpacity={0.25}
        filter="url(#lineGlow)"
        style={{ pointerEvents: "none" }}
        strokeDasharray={pathLen || 9999}
        strokeDashoffset={pathLen ? pathLen * (1 - lineAnim) : 9999}
      />

      {/* Main line — draws itself */}
      <path
        ref={pathRef}
        d={pathD}
        fill="none"
        stroke={T.red}
        strokeWidth={2.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={pathLen || 9999}
        strokeDashoffset={pathLen ? pathLen * (1 - lineAnim) : 9999}
        style={{
          transition: "stroke-dashoffset 0.05s",
          filter: "drop-shadow(0 2px 6px rgba(200,16,46,0.4))",
        }}
      />

      {/* Hover vertical line */}
      {hov !== null && (
        <line
          x1={pts[hov].x}
          y1={PAD_T}
          x2={pts[hov].x}
          y2={PAD_T + chartH}
          stroke="#FFD6DA"
          strokeWidth={1.5}
          strokeDasharray="4 3"
        />
      )}

      {/* Dots — pop in staggered */}
      {pts.map((pt, i) => {
        const shown = dotPhase > i;
        const isHov = hov === i;
        return (
          <g
            key={i}
            onMouseEnter={() => setHov(i)}
            onMouseLeave={() => setHov(null)}
            style={{ cursor: "pointer" }}
          >
            {/* Invisible hit area */}
            <circle cx={pt.x} cy={pt.y} r={18} fill="transparent" />

            {/* Outer glow ring */}
            {shown && (
              <circle
                cx={pt.x}
                cy={pt.y}
                r={isHov ? 14 : 10}
                fill={T.redSoft}
                opacity={isHov ? 0.9 : 0.6}
                style={{ transition: "r 0.2s, opacity 0.2s" }}
              />
            )}

            {/* Dot */}
            {shown && (
              <circle
                cx={pt.x}
                cy={pt.y}
                r={isHov ? 7 : 5}
                fill={isHov ? T.red : T.white}
                stroke={T.red}
                strokeWidth={2.5}
                filter={isHov ? "url(#dotGlow)" : undefined}
                style={{
                  transition: "r 0.2s, fill 0.2s",
                  animation: "ams-dotPop 0.35s cubic-bezier(0.16,1,0.3,1) both",
                }}
              />
            )}

            {/* Value label — shows on hover */}
            {isHov && shown && (
              <g>
                <rect
                  x={pt.x - 38}
                  y={pt.y - 46}
                  width={76}
                  height={26}
                  rx={8}
                  fill={T.navy}
                />
                <polygon
                  points={`${pt.x - 7},${pt.y - 20} ${pt.x + 7},${pt.y - 20} ${pt.x},${pt.y - 12}`}
                  fill={T.navy}
                />
                <text
                  x={pt.x}
                  y={pt.y - 28}
                  textAnchor="middle"
                  fontSize={11}
                  fontWeight={800}
                  fill="#FF8096"
                  fontFamily="DM Sans,sans-serif"
                >
                  ₹{(data[i].v / 1000).toFixed(0)}k
                </text>
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [barRef, barVis] = useInView(0.3);
  const [lineRef, lineVis] = useInView(0.3);
  const [selectedCard, setSelectedCard] = useState(null);
  const handleCardSelect = (id) =>
    setSelectedCard((prev) => (prev === id ? null : id));
  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800;9..40,900&display=swap');
        .ams-dash * { box-sizing:border-box; }
        .ams-dash   { font-family:'DM Sans','Segoe UI',system-ui,sans-serif; }
        @keyframes ams-fadeUp {
          from { opacity:0; transform:translateY(22px); }
          to   { opacity:1; transform:translateY(0);    }
        }
        @keyframes ams-dotPop {
          0%   { r:0;  opacity:0; }
          60%  { r:8;  opacity:1; }
          80%  { r:4;  }
          100% { r:5;  opacity:1; }
        }
        @keyframes ams-pulse {
          0%,100%{ opacity:1; } 50%{ opacity:0.35; }
        }
        .ams-fin:hover {
          transform:translateY(-4px) !important;
          box-shadow:0 8px 28px rgba(15,23,42,0.1) !important;
        }
        .ams-tr td { transition:background 0.12s; padding:11px 16px; font-size:12.5px; border-bottom:1px solid #FAFAFA; vertical-align:middle; }
        .ams-tr td:first-child { padding-left:24px; }
        .ams-tr td:last-child  { padding-right:24px; }
        .ams-tr:hover td { background:#FFF8F9 !important; }
        .ams-th { padding:10px 16px; text-align:left; font-size:10px; font-weight:800; text-transform:uppercase; letter-spacing:0.7px; color:#94A3B8; white-space:nowrap; background:#F8FAFC; border-bottom:1px solid #F1F5F9; }
        .ams-th:first-child { padding-left:24px; }
        .ams-th:last-child  { padding-right:24px; }
        .ams-btn-p {
          background:linear-gradient(135deg,#C8102E,#E8192C); color:#fff; border:none;
          border-radius:10px; padding:9px 20px; font-size:13px; font-weight:700;
          cursor:pointer; font-family:inherit; letter-spacing:0.2px;
          box-shadow:0 4px 16px rgba(200,16,46,0.35);
          transition:all 0.2s ease;
        }
        .ams-btn-p:hover { box-shadow:0 6px 24px rgba(200,16,46,0.5); transform:translateY(-2px); }
        .ams-btn-s {
          background:#fff; color:#64748B; border:1.5px solid #F1F5F9;
          border-radius:10px; padding:9px 18px; font-size:13px; font-weight:700;
          cursor:pointer; font-family:inherit; transition:all 0.2s ease;
        }
        .ams-btn-s:hover { border-color:#C8102E; color:#C8102E; box-shadow:0 4px 14px rgba(200,16,46,0.1); }
        .ams-id  { display:inline-block; background:#FFF0F2; color:#C8102E; font-size:11px; font-weight:800; padding:3px 10px; border-radius:8px; letter-spacing:0.2px; }
        .ams-dep { display:inline-block; background:#F8FAFC; color:#64748B; font-size:11px; font-weight:700; padding:3px 10px; border-radius:8px; }
        .ams-av  { width:28px; height:28px; border-radius:9px; flex-shrink:0; background:linear-gradient(135deg,#C8102E,#FF8096); display:flex; align-items:center; justify-content:center; color:#fff; font-size:11px; font-weight:900; }
      `}</style>

      <div
        className="ams-dash"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 16,
          paddingBottom: 32,
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            animation: "ams-fadeUp 0.4s cubic-bezier(0.16,1,0.3,1) both",
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 4,
              }}
            >
              <h1
                style={{
                  margin: 0,
                  fontSize: 24,
                  fontWeight: 900,
                  color: T.navy,
                  letterSpacing: -0.6,
                  lineHeight: 1,
                }}
              >
                Asset Dashboard
              </h1>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  background: T.redSoft,
                  borderRadius: 20,
                  padding: "4px 10px",
                }}
              >
                <div
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: T.red,
                    animation: "ams-pulse 1.8s ease-in-out infinite",
                  }}
                />
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 800,
                    color: T.red,
                    letterSpacing: 0.8,
                  }}
                >
                  LIVE
                </span>
              </div>
            </div>
            <p
              style={{
                margin: 0,
                fontSize: 12,
                color: T.muted,
                fontWeight: 500,
              }}
            >
              {today}
            </p>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <Link to="/reports" className="ams-btn-s">
              ⬇ Export Report
            </Link>
            <Link to="/assets" className="ams-btn-p">
              + Register Asset
            </Link>
          </div>
        </div>

        {/* KPI cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(6,1fr)",
            gap: 12,
          }}
        >
          {KPI.map((k, i) => (
            <StatCard
              key={k.id}
              k={k}
              delay={i * 60}
              selected={selectedCard === k.id}
              onSelect={() => handleCardSelect(k.id)}
            />
          ))}
        </div>

        {/* Finance strip */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(5,1fr)",
            gap: 12,
            animation: "ams-fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) both",
            animationDelay: "380ms",
          }}
        >
          {FIN.map((f) => (
            <div
              key={f.label}
              className="ams-fin"
              style={{
                background: T.white,
                borderRadius: 14,
                border: `1px solid ${T.border}`,
                borderTop: `3px solid ${f.accent}`,
                padding: "16px 18px",
                boxShadow: "0 1px 3px rgba(15,23,42,0.04)",
                transition:
                  "transform 0.22s cubic-bezier(0.16,1,0.3,1), box-shadow 0.22s ease",
              }}
            >
              <p
                style={{
                  margin: "0 0 8px",
                  fontSize: 10,
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: 0.7,
                  color: T.muted,
                }}
              >
                {f.label}
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: 18,
                  fontWeight: 900,
                  color: T.navy,
                  letterSpacing: -0.4,
                }}
              >
                {f.value}
              </p>
              <p
                style={{
                  margin: "4px 0 0",
                  fontSize: 11,
                  fontWeight: 700,
                  color: f.up ? T.green : T.red,
                }}
              >
                {f.up ? "▲" : "▼"} {f.delta} vs last year
              </p>
            </div>
          ))}
        </div>

        {/* Donut + Animated Bar */}
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}
        >
          {/* Donut */}
          <Card delay={460}>
            <SH
              title="Asset Distribution"
              sub="By category · current financial year"
              action="View Details"
            />
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 200, height: 200, flexShrink: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={PIE_DATA}
                      cx="50%"
                      cy="50%"
                      innerRadius={58}
                      outerRadius={92}
                      dataKey="pct"
                      paddingAngle={2}
                      strokeWidth={0}
                      animationBegin={500}
                      animationDuration={1000}
                      animationEasing="ease-out"
                    >
                      {PIE_DATA.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i]} />
                      ))}
                    </Pie>
                    <RTooltip
                      formatter={(v, n) => [`${v}%`, n]}
                      contentStyle={{
                        borderRadius: 10,
                        border: "none",
                        boxShadow: "0 8px 28px rgba(0,0,0,0.15)",
                        fontSize: 12,
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div style={{ flex: 1 }}>
                {PIE_DATA.map((d, i) => (
                  <div
                    key={d.name}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 9,
                      padding: "6px 0",
                      borderBottom:
                        i < PIE_DATA.length - 1
                          ? `1px solid ${T.border}`
                          : "none",
                    }}
                  >
                    <div
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: 3,
                        background: PIE_COLORS[i],
                        flexShrink: 0,
                      }}
                    />
                    <span
                      style={{
                        fontSize: 12,
                        color: T.navyMid,
                        fontWeight: 600,
                        flex: 1,
                      }}
                    >
                      {d.name}
                    </span>
                    <span
                      style={{
                        fontSize: 12,
                        color: PIE_COLORS[i],
                        fontWeight: 800,
                      }}
                    >
                      {d.pct}%
                    </span>
                    <span
                      style={{
                        fontSize: 10,
                        color: T.muted,
                        minWidth: 46,
                        textAlign: "right",
                      }}
                    >
                      {d.val}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* ★ Animated Bar Chart */}
          <Card delay={520}>
            <SH
              title="Assets by Department"
              sub="Grow-from-bottom · hover to explore"
              action="Full Report"
            />
            <div ref={barRef} style={{ width: "100%", height: 210 }}>
              <AnimatedBarChart data={BAR_DATA} visible={barVis} />
            </div>
          </Card>
        </div>

        {/* ★ Animated Line Chart + Services */}
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}
        >
          <Card delay={580}>
            <SH
              title="Maintenance Overview"
              sub="Line draws itself · dots pop in · hover"
              action="View All"
            />
            <div ref={lineRef} style={{ width: "100%", height: 290 }}>
              <AnimatedLineChart data={LINE_DATA} visible={lineVis} />
            </div>
          </Card>

          {/* Upcoming Services */}
          <Card delay={640} noPad>
            <div style={{ padding: "22px 24px 0" }}>
              <SH
                title="Upcoming Services"
                sub="Assets requiring attention soon"
                action="Schedule"
              />
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {[
                    "Asset ID",
                    "Asset Name",
                    "Assigned To",
                    "Last Service",
                    "Cost",
                    "Status",
                  ].map((h) => (
                    <th key={h} className="ams-th">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {SERVICES.map((s) => (
                  <tr key={s.id} className="ams-tr">
                    <td>
                      <span className="ams-id">{s.id}</span>
                    </td>
                    <td style={{ fontWeight: 700, color: T.navyMid }}>
                      {s.name}
                    </td>
                    <td style={{ color: T.slate }}>{s.by}</td>
                    <td style={{ color: T.muted }}>{s.last}</td>
                    <td style={{ fontWeight: 800, color: T.navy }}>{s.cost}</td>
                    <td>
                      <Badge status={s.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>

        {/* Asset Allocation */}
        <Card delay={700} noPad>
          <div style={{ padding: "22px 24px 0" }}>
            <SH
              title="Asset Allocation"
              sub="Employee-wise register with current valuations"
              action="View All Assets"
            />
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {[
                  "#",
                  "Asset ID",
                  "Asset Name",
                  "Employee",
                  "Department",
                  "Purchase Cost",
                  "Current Value",
                  "Last Service",
                  "Maint. Cost",
                  "Status",
                ].map((h) => (
                  <th key={h} className="ams-th">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ALLOC.map((a) => (
                <tr key={a.id} className="ams-tr">
                  <td style={{ color: "#CBD5E1", fontWeight: 700 }}>{a.sr}</td>
                  <td>
                    <span className="ams-id">{a.id}</span>
                  </td>
                  <td style={{ fontWeight: 700, color: T.navyMid }}>
                    {a.name}
                  </td>
                  <td>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
                      <div className="ams-av">{a.emp.charAt(0)}</div>
                      <span style={{ color: T.slate, fontWeight: 500 }}>
                        {a.emp}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span className="ams-dep">{a.dept}</span>
                  </td>
                  <td style={{ color: T.muted }}>{a.purchase}</td>
                  <td style={{ fontWeight: 800, color: T.navy }}>
                    {a.current}
                  </td>
                  <td style={{ color: T.muted }}>{a.lastSvc}</td>
                  <td style={{ color: T.slate }}>{a.maint}</td>
                  <td>
                    <Badge status={a.st} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ height: 8 }} />
        </Card>
      </div>
    </>
  );
}
