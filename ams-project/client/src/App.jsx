// client/src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import ProtectedRoute from "./components/common/ProtectedRoute";
import DashboardLayout from "./layouts/DashboardLayout";
import LoginPage from "./pages/auth/LoginPage";
import DashboardPage from "./pages/dashboard/DashboardPage";
import UsersPage from "./pages/users/UsersPage";
import LocationsPage from "./pages/locations/LocationsPage";
import DepartmentsPage from "./pages/departments/DepartmentsPage";
import CategoriesPage from "./pages/categories/CategoriesPage";
import EmployeesPage from "./pages/employees/EmployeesPage";
import AssetsPage from "./pages/assets/AssetsPage";
import AssetDetailPage from "./pages/assets/AssetDetailPage";
import QRScannerPage from "./pages/assets/QRScannerPage";
import PublicAssetViewPage from "./pages/scan/PublicAssetViewPage";
import VerificationPage from "./pages/operations/VerificationPage";
import TransferPage from "./pages/operations/TransferPage";
import DisposalPage from "./pages/operations/DisposalPage";
import AuditLogsPage from "./pages/admin/AuditLogsPage";
import SettingsPage from "./pages/settings/SettingsPage";
import ReportsPage from "./pages/reports/ReportsPage";
import PermissionsPage from "./pages/permissions/PermissionsPage";
import { DepreciationPage, AMCTrackerPage } from "./pages/finance"; // ← NEW

// ── 404 ───────────────────────────────────────────────────────────────────────
const NotFoundPage = () => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
    <p className="text-6xl font-black text-gray-200">404</p>
    <p className="mt-2 text-lg font-semibold text-gray-500">Page not found</p>
    <a
      href="/dashboard"
      className="mt-6 px-5 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition"
    >
      Go to Dashboard
    </a>
  </div>
);

// ── 403 ───────────────────────────────────────────────────────────────────────
const UnauthorizedPage = () => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
    <p className="text-6xl font-black text-gray-200">403</p>
    <p className="mt-2 text-lg font-semibold text-gray-500">
      Access denied — insufficient permissions
    </p>
    <a
      href="/dashboard"
      className="mt-6 px-5 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition"
    >
      Go to Dashboard
    </a>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <ToastContainer
        position="top-right"
        autoClose={3500}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        toastStyle={{ fontSize: "14px" }}
      />

      <Routes>
        {/* ── Public ── */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route path="/scan/:token" element={<PublicAssetViewPage />} />

        {/* ── Root redirect ── */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/index" element={<Navigate to="/dashboard" replace />} />

        {/* ── Protected ── */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />

            {/* Master Data */}
            <Route path="/master-data/locations" element={<LocationsPage />} />
            <Route
              path="/master-data/departments"
              element={<DepartmentsPage />}
            />
            <Route
              path="/master-data/categories"
              element={<CategoriesPage />}
            />
            <Route path="/master-data/employees" element={<EmployeesPage />} />

            {/* Assets */}
            <Route path="/assets" element={<AssetsPage />} />
            <Route path="/assets/:id" element={<AssetDetailPage />} />
            <Route path="/assets/qr" element={<QRScannerPage />} />

            {/* Operations */}
            <Route
              path="/operations/verification"
              element={<VerificationPage />}
            />
            <Route path="/operations/transfer" element={<TransferPage />} />
            <Route path="/operations/disposal" element={<DisposalPage />} />

            {/* Finance ← NEW */}
            <Route
              path="/finance/depreciation"
              element={<DepreciationPage />}
            />
            <Route path="/finance/amc-tracker" element={<AMCTrackerPage />} />

            {/* Reports */}
            <Route path="/reports" element={<ReportsPage />} />

            {/* Admin */}
            <Route path="/admin/users" element={<UsersPage />} />
            <Route path="/admin/audit" element={<AuditLogsPage />} />
            <Route path="/admin/settings" element={<SettingsPage />} />
            <Route path="/admin/permissions" element={<PermissionsPage />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
