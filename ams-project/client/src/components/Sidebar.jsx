// components/Sidebar.jsx
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Icons } from "./Icons";
import { navConfig, ACCENT, ACCENT_DARK } from "../constants/navConfig";
import useAuthStore from "../store/authStore";
import boschLogoFull from "../assets/images/boschlogo.png";
import boschLogoIcon from "../assets/images/boschlogo1.png";

const HEADER_HEIGHT = 84;

// ── Section icons ─────────────────────────────────────────────────────────────
const SECTION_ICONS = {
  "MASTER DATA": ({ size = 20 }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M3 5v4c0 1.66 4.03 3 9 3s9-1.34 9-3V5" />
      <path d="M3 9v4c0 1.66 4.03 3 9 3s9-1.34 9-3V9" />
      <path d="M3 13v4c0 1.66 4.03 3 9 3s9-1.34 9-3v-4" />
    </svg>
  ),
  ASSETS: ({ size = 20 }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  ),
  OPERATIONS: ({ size = 20 }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  ),
  FINANCE: ({ size = 20 }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <line x1="2" y1="10" x2="22" y2="10" />
      <circle cx="16" cy="15" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  ),
  REPORTS: ({ size = 20 }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
      <line x1="2" y1="20" x2="22" y2="20" />
    </svg>
  ),
  ADMINISTRATION: ({ size = 20 }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <polyline points="9 12 11 14 15 10" />
    </svg>
  ),
};

// ── Permission filter helper ──────────────────────────────────────────────────
function useFilteredNav() {
  const canView = useAuthStore((s) => s.canView);
  const isSuperAdmin = useAuthStore((s) => s.isSuperAdmin);
  const superAdmin = isSuperAdmin();

  return navConfig
    .map((entry) => {
      if (!entry.section) return entry;
      const visibleItems = entry.items.filter((item) => {
        const mk = item.moduleKey;
        if (!mk) return true;
        if (mk === "__superadmin__") return superAdmin;
        return canView(mk);
      });
      return visibleItems.length > 0 ? { ...entry, items: visibleItems } : null;
    })
    .filter(Boolean);
}

// ── Expanded nav item ─────────────────────────────────────────────────────────
function ExpandedItem({ item, isActive, onNavigate }) {
  const active = isActive(item.path);
  const Icon = item.icon;
  return (
    <button
      onClick={() => onNavigate(item.path)}
      style={{
        width: "calc(100% - 20px)",
        margin: "3px 10px",
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "13px 16px",
        minHeight: 50,
        background: active
          ? `linear-gradient(135deg,${ACCENT},${ACCENT_DARK})`
          : "transparent",
        border: "none",
        borderRadius: 11,
        cursor: "pointer",
        boxShadow: active ? "0 4px 12px rgba(139,26,26,0.3)" : "none",
        transition: "background 0.15s",
      }}
      onMouseEnter={(e) => {
        if (!active) e.currentTarget.style.background = "rgba(194,24,7,0.07)";
      }}
      onMouseLeave={(e) => {
        if (!active) e.currentTarget.style.background = "transparent";
      }}
    >
      <span
        className="nav-icon"
        style={{
          color: active ? "#fff" : "#C0303F",
          display: "flex",
          alignItems: "center",
          flexShrink: 0,
          width: 24,
          height: 24,
        }}
      >
        {Icon && <Icon size={22} />}
      </span>
      <span
        style={{
          fontSize: 15,
          fontWeight: active ? 600 : 500,
          color: active ? "#fff" : "#2D1210",
          whiteSpace: "nowrap",
        }}
      >
        {item.label}
      </span>
    </button>
  );
}

// ── Collapsed sub-icon ────────────────────────────────────────────────────────
function SubIcon({ item, isActive, onNavigate }) {
  const active = isActive(item.path);
  const Icon = item.icon;
  return (
    <button
      onClick={() => onNavigate(item.path)}
      title={item.label}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "10px 0",
        minHeight: 42,
        border: "none",
        cursor: "pointer",
        background: active
          ? `linear-gradient(135deg,${ACCENT},${ACCENT_DARK})`
          : "transparent",
        boxShadow: active ? "0 2px 8px rgba(139,26,26,0.25)" : "none",
        transition: "background 0.15s",
      }}
      onMouseEnter={(e) => {
        if (!active) e.currentTarget.style.background = "rgba(194,24,7,0.1)";
      }}
      onMouseLeave={(e) => {
        if (!active) e.currentTarget.style.background = "transparent";
      }}
    >
      <span
        className="nav-icon"
        style={{
          color: active ? "#fff" : "#C0303F",
          display: "flex",
          width: 20,
          height: 20,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {Icon && <Icon size={18} />}
      </span>
    </button>
  );
}

// ── Main Sidebar ──────────────────────────────────────────────────────────────
export default function Sidebar({
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const filteredNav = useFilteredNav();

  const allSectionKeys = filteredNav.slice(1).map((s) => s.section);
  const [openSections, setOpenSections] = useState(() =>
    Object.fromEntries(allSectionKeys.map((k) => [k, false])),
  );
  const toggleSection = (s) =>
    setOpenSections((prev) => ({ ...prev, [s]: !prev[s] }));

  const [flyout, setFlyout] = useState(null);
  const [activeSection, setActiveSection] = useState(() => {
    const owner = filteredNav
      .slice(1)
      .find((s) => s.items?.some((i) => i.path === window.location.pathname));
    return owner ? owner.section : null;
  });

  const toggleFlyout = (s) => {
    setFlyout((prev) => (prev === s ? null : s));
    setActiveSection(s);
  };

  const isActive = (path) => {
    if (location.pathname === path) return true;
    if (path === "/assets" && /^\/assets\/\d+$/.test(location.pathname))
      return true;
    return false;
  };

  const handleNavigate = (path) => {
    navigate(path);
    setMobileOpen(false);
    const owner = filteredNav
      .slice(1)
      .find((s) => s.items?.some((i) => i.path === path));
    if (owner) setActiveSection(owner.section);
    else setActiveSection(null);
  };

  const renderContent = (forceExpanded = false) => {
    const isCollapsed = forceExpanded ? false : collapsed;
    const dashItem = filteredNav[0];
    const DashIcon = dashItem?.icon;

    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* ── Header ── */}
        <div
          style={{
            height: HEADER_HEIGHT,
            minHeight: HEADER_HEIGHT,
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: isCollapsed ? "0 8px" : "0 14px",
            borderBottom: "1px solid #F5F0F0",
            boxSizing: "border-box",
          }}
        >
          {isCollapsed ? (
            <div
              onClick={() => {
                setCollapsed(false);
                setFlyout(null);
              }}
              title="Expand"
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 14,
                  background: "#FFF0F2",
                  border: "1.5px solid #FFD6DA",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#FFE0E4";
                  e.currentTarget.style.boxShadow =
                    "0 4px 14px rgba(200,16,46,0.18)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#FFF0F2";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <img
                  src={boschLogoIcon}
                  alt="Bosch"
                  style={{
                    width: 30,
                    height: 30,
                    objectFit: "contain",
                    filter:
                      "invert(11%) sepia(90%) saturate(5000%) hue-rotate(345deg) brightness(85%) contrast(110%)",
                  }}
                />
              </div>
            </div>
          ) : (
            <>
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <img
                  src={boschLogoFull}
                  alt="Bosch"
                  style={{
                    height: 44,
                    width: "auto",
                    maxWidth: 170,
                    objectFit: "contain",
                  }}
                />
              </div>
              {!forceExpanded && (
                <button
                  onClick={() => setCollapsed(true)}
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 8,
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: ACCENT,
                    flexShrink: 0,
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "rgba(194,24,7,0.08)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <Icons.Menu size={20} />
                </button>
              )}
              {forceExpanded && (
                <button
                  onClick={() => setMobileOpen(false)}
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 8,
                    background: "rgba(194,24,7,0.07)",
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: ACCENT,
                    flexShrink: 0,
                  }}
                >
                  <Icons.Close size={18} />
                </button>
              )}
            </>
          )}
        </div>

        {/* ── Nav ── */}
        <nav
          style={{
            flex: 1,
            overflowY: "auto",
            overflowX: "hidden",
            paddingTop: 12,
            paddingBottom: 24,
          }}
        >
          {isCollapsed ? (
            <>
              {dashItem && (
                <button
                  onClick={() => {
                    handleNavigate(dashItem.path);
                    setFlyout(null);
                    setActiveSection(null);
                  }}
                  title="Dashboard"
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "13px 0",
                    minHeight: 46,
                    border: "none",
                    cursor: "pointer",
                    background:
                      isActive(dashItem.path) && !activeSection
                        ? `linear-gradient(135deg,${ACCENT},${ACCENT_DARK})`
                        : "transparent",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    if (!(isActive(dashItem.path) && !activeSection))
                      e.currentTarget.style.background = "rgba(194,24,7,0.07)";
                  }}
                  onMouseLeave={(e) => {
                    if (!(isActive(dashItem.path) && !activeSection))
                      e.currentTarget.style.background = "transparent";
                  }}
                >
                  <span
                    style={{
                      color:
                        isActive(dashItem.path) && !activeSection
                          ? "#fff"
                          : "#C0303F",
                      display: "flex",
                      width: 22,
                      height: 22,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {DashIcon && <DashIcon size={20} />}
                  </span>
                </button>
              )}

              {filteredNav.slice(1).map((section) => {
                const SIcon = SECTION_ICONS[section.section] || (() => null);
                const isOpen = flyout === section.section;
                const isSelected = activeSection === section.section;

                return (
                  <div key={section.section}>
                    <div
                      style={{
                        margin: "3px 18px",
                        borderTop: "1px solid #F0EAEA",
                      }}
                    />
                    <button
                      onClick={() => toggleFlyout(section.section)}
                      title={section.section}
                      style={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "13px 0",
                        minHeight: 46,
                        border: "none",
                        cursor: "pointer",
                        background: isSelected
                          ? `linear-gradient(135deg,${ACCENT},${ACCENT_DARK})`
                          : "transparent",
                        transition: "background 0.15s, border-left 0.15s",
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected)
                          e.currentTarget.style.background =
                            "rgba(194,24,7,0.07)";
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected)
                          e.currentTarget.style.background = "transparent";
                      }}
                    >
                      <span
                        style={{
                          color: isSelected ? "#fff" : "#C0303F",
                          display: "flex",
                          width: 22,
                          height: 22,
                          alignItems: "center",
                          justifyContent: "center",
                          transition: "color 0.15s",
                        }}
                      >
                        <SIcon size={20} />
                      </span>
                    </button>

                    <div
                      style={{
                        overflow: "hidden",
                        maxHeight: isOpen
                          ? `${section.items.length * 44}px`
                          : "0px",
                        transition:
                          "max-height 0.3s cubic-bezier(0.16,1,0.3,1)",
                        background: isOpen
                          ? "linear-gradient(180deg,rgba(255,240,242,0.8),rgba(255,240,242,0.3))"
                          : "transparent",
                        borderLeft: isOpen
                          ? "2px solid rgba(200,16,46,0.15)"
                          : "none",
                        paddingTop: isOpen ? "6px" : "0px",
                        paddingBottom: isOpen ? "6px" : "0px",
                      }}
                    >
                      {section.items.map((item) => (
                        <SubIcon
                          key={item.key}
                          item={item}
                          isActive={isActive}
                          onNavigate={handleNavigate}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </>
          ) : (
            <>
              {dashItem && (
                <ExpandedItem
                  item={filteredNav[0]}
                  isActive={isActive}
                  onNavigate={handleNavigate}
                />
              )}

              {filteredNav.slice(1).map((section) => (
                <div key={section.section} style={{ marginTop: 8 }}>
                  <button
                    onClick={() => toggleSection(section.section)}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "12px 24px 6px",
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "11.5px",
                        fontWeight: 700,
                        color: ACCENT,
                        letterSpacing: "1.2px",
                        textTransform: "uppercase",
                        userSelect: "none",
                      }}
                    >
                      {section.section}
                    </span>
                    <span
                      style={{
                        color: "#C8B8B8",
                        display: "flex",
                        transition: "transform 0.22s",
                        transform: openSections[section.section]
                          ? "rotate(0deg)"
                          : "rotate(-90deg)",
                      }}
                    >
                      <Icons.ChevronDown size={14} />
                    </span>
                  </button>

                  <div
                    style={{
                      overflow: "hidden",
                      maxHeight: openSections[section.section]
                        ? "800px"
                        : "0px",
                      transition: "max-height 0.28s ease",
                    }}
                  >
                    {section.items.map((item) => (
                      <ExpandedItem
                        key={item.key}
                        item={item}
                        isActive={isActive}
                        onNavigate={handleNavigate}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </>
          )}
        </nav>
      </div>
    );
  };

  return (
    <>
      <aside
        className="ams-desktop-sidebar"
        style={{
          width: collapsed ? "72px" : "260px",
          height: "100vh",
          backgroundColor: "#FFFFFF",
          borderRight: "none",
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
          boxShadow: "2px 0 8px rgba(0,0,0,0.04)",
          transition: "width 0.25s ease",
          overflow: "hidden",
          zIndex: 10,
        }}
      >
        {renderContent(false)}
      </aside>

      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.45)",
            zIndex: 99,
          }}
        />
      )}

      <aside
        className="ams-mobile-sidebar"
        style={{
          position: "fixed",
          top: 0,
          left: mobileOpen ? 0 : "-300px",
          width: "260px",
          height: "100vh",
          backgroundColor: "#FFFFFF",
          boxShadow: "4px 0 24px rgba(0,0,0,0.14)",
          transition: "left 0.25s ease",
          zIndex: 100,
          display: "none",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {renderContent(true)}
      </aside>
    </>
  );
}
