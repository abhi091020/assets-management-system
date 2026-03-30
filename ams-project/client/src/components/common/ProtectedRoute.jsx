// src/components/common/ProtectedRoute.jsx
import { Navigate, Outlet, useLocation } from "react-router-dom";
import useAuthStore from "../../store/authStore";

/**
 * ProtectedRoute
 *
 * Usage patterns:
 *
 * 1. Wrap all authenticated routes:
 *    <Route element={<ProtectedRoute />}>
 *      <Route path="/" element={<DashboardPage />} />
 *    </Route>
 *
 * 2. Role-restricted route (Admin and above only):
 *    <Route element={<ProtectedRoute minRole="Admin" />}>
 *      <Route path="/users" element={<UsersPage />} />
 *    </Route>
 *
 * 3. Specific roles only:
 *    <Route element={<ProtectedRoute roles={["SuperAdmin"]} />}>
 *      <Route path="/settings" element={<SettingsPage />} />
 *    </Route>
 */
const ProtectedRoute = ({ roles = [], minRole = null }) => {
  const { isAuthenticated, hasRole, hasMinRole } = useAuthStore();
  const location = useLocation();

  // ── Not logged in → redirect to /login, preserve intended destination ──
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // ── Role check (specific roles list) ──────────────────────────────────
  if (roles.length > 0 && !hasRole(...roles)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // ── Role check (minimum role level) ───────────────────────────────────
  if (minRole && !hasMinRole(minRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
