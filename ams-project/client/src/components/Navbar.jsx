// components/Navbar.jsx
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import useAuthStore from "../store/authStore";
import { Icons } from "./Icons";
import { ACCENT, ACCENT_DARK } from "../constants/navConfig";
import { resolvePhotoUrl } from "../utils/userHelpers";
import { useNotifications, timeAgo } from "../hooks/useNotifications";
import ConfirmModal from "./common/ConfirmModal";

// ── Inline SVG icons for dropdown ─────────────────────────────────────────────
const ProfileIcon = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const SettingsIcon = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
  </svg>
);

const LogoutIcon = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

// ── UserAvatar ────────────────────────────────────────────────────────────────
function UserAvatar({ photoUrl, initials, size = 38, fontSize = "13px" }) {
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [photoUrl]);

  const base = {
    width: `${size}px`,
    height: `${size}px`,
    borderRadius: "50%",
    flexShrink: 0,
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  if (photoUrl && !imgError) {
    return (
      <div style={base}>
        <img
          src={photoUrl}
          alt="Profile"
          onError={() => setImgError(true)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            borderRadius: "50%",
          }}
        />
      </div>
    );
  }

  return (
    <div
      style={{
        ...base,
        background: `linear-gradient(135deg, ${ACCENT} 0%, ${ACCENT_DARK} 100%)`,
        color: "white",
        fontSize,
        fontWeight: "700",
      }}
    >
      {initials}
    </div>
  );
}

export default function Navbar({ setMobileOpen }) {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const bellBtnRef = useRef(null);
  const avatarBtnRef = useRef(null);
  const userDropdownRef = useRef(null);
  const notifDropdownRef = useRef(null);

  const {
    notifications,
    unreadCount,
    loading: notifLoading,
    markRead,
    clearAll,
  } = useNotifications(30);

  useEffect(() => {
    const handleMouseDown = (e) => {
      if (
        showUserMenu &&
        avatarBtnRef.current &&
        !avatarBtnRef.current.contains(e.target) &&
        userDropdownRef.current &&
        !userDropdownRef.current.contains(e.target)
      )
        setShowUserMenu(false);
      if (
        showNotifications &&
        bellBtnRef.current &&
        !bellBtnRef.current.contains(e.target) &&
        notifDropdownRef.current &&
        !notifDropdownRef.current.contains(e.target)
      )
        setShowNotifications(false);
    };
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [showUserMenu, showNotifications]);

  useEffect(() => {
    if (showNotifications && unreadCount > 0) markRead();
  }, [showNotifications]);

  const handleLogout = () => {
    setShowLogoutConfirm(false);
    setShowUserMenu(false);
    logout();
    window.location.replace("/login");
  };

  const displayName =
    user?.full_name || user?.fullName || user?.username || "User";
  const photoUrl = resolvePhotoUrl(user?.profile_photo_url);
  const initials = displayName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const getDropdownPos = (btnRef) => {
    if (!btnRef.current) return { top: 74, right: 28 };
    const rect = btnRef.current.getBoundingClientRect();
    return { top: rect.bottom + 10, right: window.innerWidth - rect.right };
  };

  return (
    <>
      <header
        style={{
          height: "64px",
          backgroundColor: "#FAFAFA",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 28px",
          flexShrink: 0,
          borderBottom: "1px solid #EBEBEB",
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        }}
      >
        {/* Left: hamburger (mobile only) */}
        <div style={{ display: "flex", alignItems: "center" }}>
          <button
            onClick={() => setMobileOpen(true)}
            className="ams-mobile-menu-btn"
            style={{
              display: "none",
              width: "36px",
              height: "36px",
              borderRadius: "8px",
              background: "#fff",
              border: "1px solid #E8E8E8",
              cursor: "pointer",
              alignItems: "center",
              justifyContent: "center",
              color: "#444",
            }}
          >
            <Icons.Menu />
          </button>
        </div>

        {/* Right */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginLeft: "auto",
          }}
        >
          {/* Welcome text */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
            }}
          >
            <span
              style={{
                fontSize: "11px",
                color: "#999",
                fontWeight: "500",
                letterSpacing: "0.4px",
                textTransform: "uppercase",
              }}
            >
              Welcome Back
            </span>
            <span
              style={{
                fontSize: "14px",
                fontWeight: "700",
                color: ACCENT,
                lineHeight: 1.2,
              }}
            >
              {displayName}
            </span>
          </div>

          {/* Divider */}
          <div
            style={{
              width: "1px",
              height: "28px",
              backgroundColor: "rgba(0,0,0,0.1)",
            }}
          />

          {/* ── Notification Bell ── */}
          <button
            ref={bellBtnRef}
            onClick={() => {
              setShowNotifications((p) => !p);
              setShowUserMenu(false);
            }}
            style={{
              width: "38px",
              height: "38px",
              borderRadius: "50%",
              backgroundColor: "#FFFFFF",
              border: "1.5px solid #EBEBEB",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
              color: ACCENT,
              transition: "box-shadow 0.2s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.boxShadow =
                "0 4px 12px rgba(194,24,7,0.15)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.boxShadow = "0 2px 6px rgba(0,0,0,0.06)")
            }
          >
            <Icons.Bell />
            {unreadCount > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: "-3px",
                  right: "-3px",
                  minWidth: "18px",
                  height: "18px",
                  borderRadius: "50%",
                  background: `linear-gradient(135deg, ${ACCENT} 0%, ${ACCENT_DARK} 100%)`,
                  color: "white",
                  fontSize: "9px",
                  fontWeight: "700",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "2px solid #FAFAFA",
                  padding: "0 3px",
                }}
              >
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

          {/* ── Notification Dropdown ── */}
          {showNotifications &&
            createPortal(
              <div
                ref={notifDropdownRef}
                style={{
                  position: "fixed",
                  top: `${getDropdownPos(bellBtnRef).top}px`,
                  right: `${getDropdownPos(bellBtnRef).right}px`,
                  width: "340px",
                  backgroundColor: "white",
                  borderRadius: "16px",
                  boxShadow: "0 12px 40px rgba(0,0,0,0.18)",
                  border: "1px solid #EBEBEB",
                  overflow: "hidden",
                  zIndex: 99999,
                  maxHeight: "480px",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div
                  style={{
                    padding: "14px 18px 10px",
                    borderBottom: "1px solid #F5F5F5",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexShrink: 0,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <span
                      style={{
                        fontWeight: "700",
                        fontSize: "13px",
                        color: "#1A1A1A",
                      }}
                    >
                      Notifications
                    </span>
                    {unreadCount > 0 && (
                      <span
                        style={{
                          padding: "1px 7px",
                          borderRadius: "20px",
                          fontSize: "10px",
                          fontWeight: "700",
                          backgroundColor: "rgba(194,24,7,0.1)",
                          color: ACCENT,
                        }}
                      >
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <span
                      onClick={markRead}
                      style={{
                        fontSize: "11px",
                        color: unreadCount > 0 ? ACCENT : "#CCC",
                        fontWeight: "600",
                        cursor: unreadCount > 0 ? "pointer" : "default",
                        padding: "3px 10px",
                        borderRadius: "20px",
                        backgroundColor:
                          unreadCount > 0
                            ? "rgba(194,24,7,0.06)"
                            : "transparent",
                      }}
                    >
                      Mark all read
                    </span>
                    <span
                      onClick={clearAll}
                      title="Clear all notifications"
                      style={{
                        fontSize: "11px",
                        color: notifications.length > 0 ? "#EF4444" : "#CCC",
                        fontWeight: "600",
                        cursor:
                          notifications.length > 0 ? "pointer" : "default",
                        padding: "3px 10px",
                        borderRadius: "20px",
                        backgroundColor:
                          notifications.length > 0
                            ? "rgba(239,68,68,0.07)"
                            : "transparent",
                      }}
                    >
                      🗑 Clear
                    </span>
                  </div>
                </div>

                <div style={{ overflowY: "auto", flex: 1 }}>
                  {notifLoading ? (
                    <div
                      style={{
                        padding: "32px",
                        textAlign: "center",
                        color: "#AAA",
                        fontSize: "13px",
                      }}
                    >
                      Loading…
                    </div>
                  ) : notifications.length === 0 ? (
                    <div style={{ padding: "40px 20px", textAlign: "center" }}>
                      <div style={{ fontSize: "28px", marginBottom: "8px" }}>
                        🔔
                      </div>
                      <div
                        style={{
                          fontSize: "13px",
                          color: "#AAA",
                          fontWeight: "500",
                        }}
                      >
                        No notifications yet
                      </div>
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        style={{
                          padding: "11px 18px",
                          borderBottom: "1px solid #F9F9F9",
                          backgroundColor: n.unread
                            ? "rgba(194,24,7,0.03)"
                            : "white",
                          display: "flex",
                          gap: "10px",
                          alignItems: "flex-start",
                          transition: "background-color 0.15s",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.backgroundColor =
                            "rgba(0,0,0,0.025)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.backgroundColor = n.unread
                            ? "rgba(194,24,7,0.03)"
                            : "white")
                        }
                      >
                        <div style={{ paddingTop: "4px", flexShrink: 0 }}>
                          <div
                            style={{
                              width: "7px",
                              height: "7px",
                              borderRadius: "50%",
                              backgroundColor: n.unread
                                ? n.accent || ACCENT
                                : "transparent",
                              transition: "background-color 0.2s",
                            }}
                          />
                        </div>
                        <div
                          style={{
                            fontSize: "15px",
                            flexShrink: 0,
                            lineHeight: "1.5",
                          }}
                        >
                          {n.icon}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              fontSize: "12.5px",
                              color: "#1A1A1A",
                              lineHeight: "1.45",
                              fontWeight: n.unread ? "600" : "400",
                              wordBreak: "break-word",
                            }}
                          >
                            {n.text}
                          </div>
                          <div
                            style={{
                              fontSize: "11px",
                              color: "#BBB",
                              marginTop: "3px",
                              fontWeight: "500",
                            }}
                          >
                            {timeAgo(n.time)}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {notifications.length > 0 && (
                  <div
                    style={{
                      padding: "10px 18px",
                      borderTop: "1px solid #F5F5F5",
                      flexShrink: 0,
                    }}
                  />
                )}
              </div>,
              document.body,
            )}

          {/* ── Avatar button ── */}
          <button
            ref={avatarBtnRef}
            onClick={() => {
              setShowUserMenu((p) => !p);
              setShowNotifications(false);
            }}
            style={{
              width: "38px",
              height: "38px",
              borderRadius: "50%",
              padding: 0,
              border: "2px solid rgba(255,255,255,0.8)",
              cursor: "pointer",
              overflow: "hidden",
              boxShadow: "0 3px 10px rgba(194,24,7,0.35)",
              transition: "transform 0.15s, box-shadow 0.15s",
              background: "transparent",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.07)";
              e.currentTarget.style.boxShadow =
                "0 5px 16px rgba(194,24,7,0.45)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow =
                "0 3px 10px rgba(194,24,7,0.35)";
            }}
          >
            <UserAvatar
              photoUrl={photoUrl}
              initials={initials}
              size={34}
              fontSize="13px"
            />
          </button>

          {/* ── User dropdown ── */}
          {showUserMenu &&
            createPortal(
              <div
                ref={userDropdownRef}
                style={{
                  position: "fixed",
                  top: `${getDropdownPos(avatarBtnRef).top}px`,
                  right: `${getDropdownPos(avatarBtnRef).right}px`,
                  minWidth: "240px",
                  backgroundColor: "white",
                  borderRadius: "16px",
                  boxShadow: "0 12px 40px rgba(0,0,0,0.14)",
                  border: "1px solid #EBEBEB",
                  overflow: "hidden",
                  zIndex: 99999,
                }}
              >
                {/* Gradient header */}
                <div
                  style={{
                    padding: "18px",
                    background: `linear-gradient(135deg, ${ACCENT} 0%, ${ACCENT_DARK} 100%)`,
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                  }}
                >
                  <div
                    style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "50%",
                      border: "2px solid rgba(255,255,255,0.4)",
                      overflow: "hidden",
                      flexShrink: 0,
                    }}
                  >
                    <UserAvatar
                      photoUrl={photoUrl}
                      initials={initials}
                      size={44}
                      fontSize="14px"
                    />
                  </div>
                  <div>
                    <div
                      style={{
                        fontWeight: "700",
                        fontSize: "14px",
                        color: "#fff",
                        lineHeight: 1.3,
                      }}
                    >
                      {displayName}
                    </div>
                    <div
                      style={{
                        fontSize: "11px",
                        color: "rgba(255,255,255,0.65)",
                        marginTop: "2px",
                        textTransform: "capitalize",
                      }}
                    >
                      {user?.role || "Viewer"}
                    </div>
                  </div>
                </div>

                {/* Menu items */}
                <div style={{ padding: "6px 0" }}>
                  <button
                    onClick={() => {
                      navigate("/admin/settings");
                      setShowUserMenu(false);
                    }}
                    style={{
                      width: "100%",
                      padding: "11px 18px",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "13px",
                      color: "#1A1A1A",
                      textAlign: "left",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "#FDF5F5")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    <span style={{ color: ACCENT, display: "flex" }}>
                      <ProfileIcon />
                    </span>
                    My Profile
                  </button>

                  <button
                    onClick={() => {
                      navigate("/admin/settings");
                      setShowUserMenu(false);
                    }}
                    style={{
                      width: "100%",
                      padding: "11px 18px",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "13px",
                      color: "#1A1A1A",
                      textAlign: "left",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "#FDF5F5")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    <span style={{ color: ACCENT, display: "flex" }}>
                      <SettingsIcon />
                    </span>
                    Settings
                  </button>
                </div>

                {/* Logout */}
                <div
                  style={{ borderTop: "1px solid #F5F5F5", padding: "6px 0" }}
                >
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      setShowLogoutConfirm(true);
                    }}
                    style={{
                      width: "100%",
                      padding: "11px 18px",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "13px",
                      color: ACCENT,
                      fontWeight: "600",
                      textAlign: "left",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "rgba(194,24,7,0.05)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    <span style={{ color: ACCENT, display: "flex" }}>
                      <LogoutIcon />
                    </span>
                    Logout
                  </button>
                </div>
              </div>,
              document.body,
            )}
        </div>
      </header>

      {/* ── Logout Confirm Modal ── */}
      <ConfirmModal
        open={showLogoutConfirm}
        title="Confirm Logout"
        message="Are you sure you want to logout from the system?"
        confirmLabel="Yes, Logout"
        confirmColor="red"
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </>
  );
}
