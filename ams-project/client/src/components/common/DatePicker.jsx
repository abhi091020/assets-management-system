// src/components/common/DatePicker.jsx
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

const ACCENT = "#8B1A1A";
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}
function parseDate(str) {
  if (!str) return null;
  const [y, m, d] = str.split("-").map(Number);
  return { year: y, month: m - 1, day: d };
}
function formatDate(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}
function formatDisplay(str) {
  if (!str) return "";
  const p = parseDate(str);
  if (!p) return "";
  return `${String(p.day).padStart(2, "0")} ${MONTHS[p.month].slice(0, 3)} ${p.year}`;
}

const navBtn = {
  width: 28,
  height: 28,
  borderRadius: "50%",
  border: "1px solid #EBEBEB",
  background: "#fff",
  cursor: "pointer",
  fontSize: 16,
  fontWeight: 700,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#555",
  transition: "all 0.15s",
};

export default function DatePicker({
  label,
  value,
  onChange,
  placeholder = "Select date",
  triggerStyle = {},
  labelStyle = {},
  containerStyle = {},
  alignRight = false,
  popupFixed = false, // ← renders popup via portal with fixed positioning
}) {
  const today = new Date();
  const parsed = parseDate(value);

  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(parsed?.year || today.getFullYear());
  const [viewMonth, setViewMonth] = useState(parsed?.month ?? today.getMonth());
  const [showYearGrid, setShowYearGrid] = useState(false);
  const [popupCoords, setPopupCoords] = useState({
    top: 0,
    left: 0,
    right: "auto",
    width: 260,
  });

  const triggerRef = useRef(null);
  const containerRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target) &&
        !e.target.closest("[data-datepicker-popup]")
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Sync view when value changes externally
  useEffect(() => {
    if (parsed) {
      setViewYear(parsed.year);
      setViewMonth(parsed.month);
    }
  }, [value]);

  // Compute popup position when opening in fixed mode
  useEffect(() => {
    if (open && popupFixed && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const popupWidth = 260;
      const spaceBelow = window.innerHeight - rect.bottom;
      const top = spaceBelow > 300 ? rect.bottom + 4 : rect.top - 304;

      if (alignRight) {
        setPopupCoords({
          top,
          left: "auto",
          right: window.innerWidth - rect.right,
          width: popupWidth,
        });
      } else {
        setPopupCoords({
          top,
          left: rect.left,
          right: "auto",
          width: popupWidth,
        });
      }
    }
  }, [open, popupFixed, alignRight]);

  const prevMonth = (e) => {
    e.stopPropagation();
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else setViewMonth((m) => m - 1);
  };
  const nextMonth = (e) => {
    e.stopPropagation();
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else setViewMonth((m) => m + 1);
  };

  const selectDay = (day) => {
    onChange(formatDate(viewYear, viewMonth, day));
    setOpen(false);
    setShowYearGrid(false);
  };

  const clearDate = (e) => {
    e.stopPropagation();
    onChange("");
  };

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const isSelected = (d) =>
    parsed &&
    parsed.year === viewYear &&
    parsed.month === viewMonth &&
    parsed.day === d;
  const isToday = (d) =>
    today.getFullYear() === viewYear &&
    today.getMonth() === viewMonth &&
    today.getDate() === d;

  const yearStart = Math.floor(viewYear / 10) * 10;
  const years = Array.from({ length: 12 }, (_, i) => yearStart - 1 + i);

  const defaultTrigger = {
    padding: "9px 14px",
    border: `1.5px solid ${open ? ACCENT : "#EBEBEB"}`,
    borderRadius: 8,
    fontSize: 13,
    color: value ? "#333" : "#aaa",
    background: "#FAFAFA",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    userSelect: "none",
    boxShadow: open ? `0 0 0 3px rgba(139,26,26,0.08)` : "none",
    transition: "border-color 0.15s, box-shadow 0.15s",
  };

  const mergedTrigger = {
    ...defaultTrigger,
    ...triggerStyle,
    border: `1.5px solid ${open ? ACCENT : triggerStyle.borderColor || "#EBEBEB"}`,
    boxShadow: open
      ? `0 0 0 3px rgba(139,26,26,0.08)`
      : triggerStyle.boxShadow || "none",
    color: value ? triggerStyle.color || "#333" : "#aaa",
  };

  // ── Popup content ──────────────────────────────────────────────────────────
  const popupContent = (
    <div
      data-datepicker-popup
      onMouseDown={(e) => e.stopPropagation()}
      style={{
        position: popupFixed ? "fixed" : "absolute",
        top: popupFixed ? popupCoords.top : "100%",
        left: popupFixed ? popupCoords.left : alignRight ? "auto" : 0,
        right: popupFixed ? popupCoords.right : alignRight ? 0 : "auto",
        marginTop: popupFixed ? 0 : 4,
        width: 260,
        background: "#fff",
        borderRadius: 12,
        zIndex: 9999,
        boxShadow: "0 8px 30px rgba(0,0,0,0.14)",
        border: "1px solid #F0EEEE",
        overflow: "hidden",
      }}
    >
      {!showYearGrid ? (
        <>
          {/* Month nav header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "12px 14px 8px",
              borderBottom: "1px solid #F5F5F5",
            }}
          >
            <button
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                prevMonth(e);
              }}
              style={navBtn}
            >
              ‹
            </button>
            <button
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowYearGrid(true);
              }}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 700,
                color: "#222",
                padding: "2px 8px",
                borderRadius: 6,
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#FFF0F2")
              }
              onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
            >
              {MONTHS[viewMonth]} {viewYear}
            </button>
            <button
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                nextMonth(e);
              }}
              style={navBtn}
            >
              ›
            </button>
          </div>

          {/* Day headers */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7,1fr)",
              padding: "8px 10px 4px",
            }}
          >
            {DAYS.map((d) => (
              <div
                key={d}
                style={{
                  textAlign: "center",
                  fontSize: 10,
                  fontWeight: 700,
                  color: "#aaa",
                  padding: "2px 0",
                }}
              >
                {d}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7,1fr)",
              padding: "0 10px 12px",
              gap: 2,
            }}
          >
            {cells.map((day, i) => {
              if (!day) return <div key={i} />;
              const sel = isSelected(day);
              const todayMark = isToday(day);
              return (
                <button
                  key={i}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    selectDay(day);
                  }}
                  style={{
                    width: "100%",
                    aspectRatio: "1",
                    border: "none",
                    borderRadius: "50%",
                    fontSize: 12,
                    fontWeight: sel ? 700 : todayMark ? 600 : 400,
                    cursor: "pointer",
                    transition: "all 0.1s",
                    background: sel ? ACCENT : "transparent",
                    color: sel ? "#fff" : todayMark ? ACCENT : "#333",
                    outline:
                      todayMark && !sel ? `1.5px solid ${ACCENT}` : "none",
                  }}
                  onMouseEnter={(e) => {
                    if (!sel) e.currentTarget.style.background = "#FFF0F2";
                  }}
                  onMouseLeave={(e) => {
                    if (!sel) e.currentTarget.style.background = "transparent";
                  }}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </>
      ) : (
        <>
          {/* Year grid header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "12px 14px 8px",
              borderBottom: "1px solid #F5F5F5",
            }}
          >
            <button
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setViewYear((y) => y - 10);
              }}
              style={navBtn}
            >
              ‹
            </button>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#222" }}>
              {yearStart} – {yearStart + 11}
            </span>
            <button
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setViewYear((y) => y + 10);
              }}
              style={navBtn}
            >
              ›
            </button>
          </div>

          {/* Year grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3,1fr)",
              gap: 6,
              padding: "12px 14px",
            }}
          >
            {years.map((yr) => (
              <button
                key={yr}
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setViewYear(yr);
                  setShowYearGrid(false);
                }}
                style={{
                  padding: "8px 4px",
                  border: "none",
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: yr === viewYear ? 700 : 400,
                  cursor: "pointer",
                  background: yr === viewYear ? ACCENT : "#F9F9F9",
                  color: yr === viewYear ? "#fff" : "#333",
                  transition: "all 0.1s",
                }}
                onMouseEnter={(e) => {
                  if (yr !== viewYear)
                    e.currentTarget.style.background = "#FFF0F2";
                }}
                onMouseLeave={(e) => {
                  if (yr !== viewYear)
                    e.currentTarget.style.background = "#F9F9F9";
                }}
              >
                {yr}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );

  return (
    <div
      ref={containerRef}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 4,
        minWidth: 160,
        flex: "1 1 160px",
        position: "relative",
        ...containerStyle,
      }}
    >
      {label && (
        <label
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: "#888",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            ...labelStyle,
          }}
        >
          {label}
        </label>
      )}

      {/* Trigger button */}
      <div
        ref={triggerRef}
        onClick={() => {
          setOpen((o) => !o);
          setShowYearGrid(false);
        }}
        style={mergedTrigger}
      >
        <span>{value ? formatDisplay(value) : placeholder}</span>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          {value && (
            <span
              onClick={clearDate}
              style={{
                fontSize: 14,
                color: "#aaa",
                lineHeight: 1,
                padding: "0 2px",
                cursor: "pointer",
              }}
              title="Clear"
            >
              ×
            </span>
          )}
          <svg
            width="14"
            height="14"
            fill="none"
            stroke="#888"
            viewBox="0 0 24 24"
            style={{
              transform: open ? "rotate(180deg)" : "none",
              transition: "transform 0.2s",
              flexShrink: 0,
            }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>

      {/* Render popup — via portal when popupFixed, inline otherwise */}
      {open &&
        (popupFixed ? createPortal(popupContent, document.body) : popupContent)}
    </div>
  );
}
