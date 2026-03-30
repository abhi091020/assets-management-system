// layouts/DashboardLayout.jsx
import { useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { pageTitles } from "../constants/navConfig";
import useAuthStore from "../store/authStore";

export default function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const { fetchMyPermissions, permissionsLoaded, canView, user } =
    useAuthStore();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try {
      return localStorage.getItem("ams_sidebar_collapsed") === "true";
    } catch (_) {
      return false;
    }
  });

  const handleSetCollapsed = (val) => {
    setSidebarCollapsed(val);
    try {
      localStorage.setItem("ams_sidebar_collapsed", String(val));
    } catch (_) {}
  };

  const [mobileOpen, setMobileOpen] = useState(false);

  // ── Fetch permissions on mount (handles hard refresh) ──────────────────────
  useEffect(() => {
    fetchMyPermissions();
  }, [fetchMyPermissions]);

  // ── Guard: redirect if user tries to access a page they can't view ──────────
  // Only runs after permissions have loaded to avoid flash-redirect
  useEffect(() => {
    if (!permissionsLoaded || !user) return;
    if (user.role === "SuperAdmin") return; // SuperAdmin always allowed

    // Map current path → moduleKey and check can_view
    // We import pageTitles for path→label, but need path→moduleKey
    // This is a lightweight inline map — matches navConfig moduleKey values
    const PATH_TO_MODULE = {
      "/master-data/locations": "locations",
      "/master-data/departments": "departments",
      "/master-data/categories": "categories",
      "/master-data/employees": "employees",
      "/assets": "assets",
      "/assets/qr": "qr_scanner",
      "/operations/verification": "verification",
      "/operations/transfer": "transfers",
      "/operations/disposal": "disposals",
      "/finance/depreciation": "depreciation",
      "/finance/amc": "amc_tracker",
      "/reports": "reports",
      "/admin/users": "users",
      "/admin/audit": "audit_logs",
      "/admin/settings": "settings",
      "/admin/permissions": "__superadmin__",
    };

    const moduleKey = PATH_TO_MODULE[location.pathname];
    if (!moduleKey) return; // dashboard or unknown — allow

    // __superadmin__ paths are SuperAdmin-only (already returned above)
    if (moduleKey === "__superadmin__") {
      navigate("/unauthorized", { replace: true });
      return;
    }

    if (!canView(moduleKey)) {
      navigate("/unauthorized", { replace: true });
    }
  }, [permissionsLoaded, location.pathname, canView, user, navigate]);

  // ── Loading state — show blank while permissions load on hard refresh ───────
  if (!permissionsLoaded) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          backgroundColor: "#FAFAFA",
          fontFamily: "'Segoe UI', sans-serif",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              border: "3px solid #F5E0E0",
              borderTopColor: "#8B1A1A",
              animation: "spin 0.7s linear infinite",
              margin: "0 auto 12px",
            }}
          />
          <p style={{ fontSize: 13, color: "#888" }}>Loading...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body, #root { height: 100%; overflow: hidden; }

        nav .nav-icon svg path, nav .nav-icon svg rect, nav .nav-icon svg circle {
          fill: currentColor; stroke: currentColor;
        }

        nav::-webkit-scrollbar       { width: 4px; }
        nav::-webkit-scrollbar-track { background: transparent; }
        nav::-webkit-scrollbar-thumb { background: transparent; border-radius: 4px; }
        nav::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.5); }

        .ams-main::-webkit-scrollbar       { width: 6px; }
        .ams-main::-webkit-scrollbar-track { background: transparent; }
        .ams-main::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 6px; }

        @media (min-width: 769px) {
          .ams-mobile-sidebar  { display: none !important; }
          .ams-mobile-menu-btn { display: none !important; }
        }
        @media (max-width: 768px) {
          .ams-desktop-sidebar { display: none !important; }
          .ams-mobile-sidebar  { display: flex !important; }
          .ams-mobile-menu-btn { display: flex !important; }
        }
      `}</style>

      <div
        style={{
          display: "flex",
          height: "100vh",
          overflow: "hidden",
          backgroundColor: "#FFFFFF",
          fontFamily:
            "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",
        }}
      >
        <Sidebar
          collapsed={sidebarCollapsed}
          setCollapsed={handleSetCollapsed}
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
        />

        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            minWidth: 0,
            backgroundColor: "#FFFFFF",
            padding: "20px 20px 20px 0",
          }}
        >
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              backgroundColor: "#FAFAFA",
              borderRadius: "16px",
              position: "relative",
            }}
          >
            <Navbar setMobileOpen={setMobileOpen} />
            <main
              className="ams-main"
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "12px 32px",
                backgroundColor: "#FAFAFA",
              }}
            >
              <Outlet />
            </main>
          </div>
        </div>
      </div>
    </>
  );
}
