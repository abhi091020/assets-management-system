// constants/navConfig.js
import { Icons } from "../components/Icons";

export const ACCENT = "#C21807";
export const ACCENT_DARK = "#5C0B03";

// ── moduleKey maps each nav item to its RolePermissions module_key ─────────────
// Sidebar uses this to call canView(moduleKey) and hide items with no access.
// SuperAdmin always sees everything — canView returns true unconditionally.

export const navConfig = [
  {
    key: "dashboard",
    label: "Dashboard",
    icon: Icons.Dashboard,
    path: "/dashboard",
    moduleKey: "dashboard",
  },
  {
    section: "MASTER DATA",
    items: [
      {
        key: "location",
        label: "Location",
        icon: Icons.Location,
        path: "/master-data/locations",
        moduleKey: "locations",
      },
      {
        key: "department",
        label: "Department",
        icon: Icons.Department,
        path: "/master-data/departments",
        moduleKey: "departments",
      },
      {
        key: "categories",
        label: "Categories",
        icon: Icons.Categories,
        path: "/master-data/categories",
        moduleKey: "categories",
      },
      {
        key: "employees",
        label: "Employees",
        icon: Icons.Employees,
        path: "/master-data/employees",
        moduleKey: "employees",
      },
    ],
  },
  {
    section: "ASSETS",
    items: [
      {
        key: "asset-register",
        label: "Asset Register",
        icon: Icons.AssetRegister,
        path: "/assets",
        moduleKey: "assets",
      },
      {
        key: "qr-scanner",
        label: "QR Scanner",
        icon: Icons.QRScanner,
        path: "/assets/qr",
        moduleKey: "qr_scanner",
      },
    ],
  },
  {
    section: "OPERATIONS",
    items: [
      {
        key: "verification",
        label: "Verification",
        icon: Icons.Verification,
        path: "/operations/verification",
        moduleKey: "verification",
      },
      {
        key: "transfer",
        label: "Transfer",
        icon: Icons.Transfer,
        path: "/operations/transfer",
        moduleKey: "transfers",
      },
      {
        key: "disposals",
        label: "Disposals",
        icon: Icons.Disposal,
        path: "/operations/disposal",
        moduleKey: "disposals",
      },
    ],
  },
  {
    section: "FINANCE",
    items: [
      {
        key: "depreciation",
        label: "Depreciation",
        icon: Icons.Depreciation,
        path: "/finance/depreciation",
        moduleKey: "depreciation",
      },
      {
        key: "amc-insurance",
        label: "AMC & Insurance",
        icon: Icons.AMC,
        path: "/finance/amc-tracker", // ← fixed: was /finance/amc
        moduleKey: "amc_tracker",
      },
    ],
  },
  {
    section: "REPORTS",
    items: [
      {
        key: "reports",
        label: "Reports",
        icon: Icons.Reports,
        path: "/reports",
        moduleKey: "reports",
      },
    ],
  },
  {
    section: "ADMINISTRATION",
    items: [
      {
        key: "users",
        label: "Users",
        icon: Icons.Users,
        path: "/admin/users",
        moduleKey: "users",
      },
      {
        key: "audit-logs",
        label: "Audit Logs",
        icon: Icons.AuditLogs,
        path: "/admin/audit",
        moduleKey: "audit_logs",
      },
      {
        key: "settings",
        label: "Settings",
        icon: Icons.Settings,
        path: "/admin/settings",
        moduleKey: "settings",
      },
      {
        key: "permissions",
        label: "Permissions",
        icon: Icons.Settings,
        path: "/admin/permissions",
        moduleKey: "__superadmin__",
      },
    ],
  },
];

export const pageTitles = {
  "/dashboard": "Dashboard",
  "/master-data/locations": "Location",
  "/master-data/departments": "Department",
  "/master-data/categories": "Categories",
  "/master-data/employees": "Employees",
  "/assets": "Asset Register",
  "/assets/qr": "QR Scanner",
  "/operations/verification": "Verification",
  "/operations/transfer": "Transfer",
  "/operations/disposal": "Disposals",
  "/finance/depreciation": "Depreciation",
  "/finance/amc-tracker": "AMC & Insurance", // ← fixed: was /finance/amc
  "/reports": "Reports",
  "/admin/users": "Users",
  "/admin/audit": "Audit Logs",
  "/admin/settings": "Settings",
  "/admin/permissions": "Role Permissions",
};
