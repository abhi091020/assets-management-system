// components/Icons.jsx
import DashboardSVG from "../assets/images/icons/Dashboard.svg?react";
import LocationSVG from "../assets/images/icons/Location.svg?react";
import DepartmentSVG from "../assets/images/icons/Department.svg?react";
import CategoriesSVG from "../assets/images/icons/Categories.svg?react";
import EmployeesSVG from "../assets/images/icons/Employees.svg?react";
import AssetRegisterSVG from "../assets/images/icons/AssetRegister.svg?react";
import QRScannerSVG from "../assets/images/icons/QRScanner.svg?react";
import VerificationSVG from "../assets/images/icons/Verification.svg?react";
import TransferSVG from "../assets/images/icons/Transfer.svg?react";
import DisposalSVG from "../assets/images/icons/Disposal.svg?react";
import DepreciationSVG from "../assets/images/icons/Deprication.svg?react";
import AMCSVG from "../assets/images/icons/AMCInsurance.svg?react";
import ReportsSVG from "../assets/images/icons/Reports.svg?react";
import UsersSVG from "../assets/images/icons/Users.svg?react";
import AuditLogsSVG from "../assets/images/icons/AuditLogs.svg?react";
import SettingsSVG from "../assets/images/icons/Settings.svg?react";

function wrap(SVGComponent) {
  return function Icon({ size = 20, style, className }) {
    return (
      <SVGComponent
        width={size}
        height={size}
        fill="currentColor"
        stroke="currentColor"
        style={{
          display: "block",
          color: "inherit",
          fill: "currentColor",
          stroke: "currentColor",
          ...style,
        }}
        className={className}
      />
    );
  };
}

export const Icons = {
  // ── Sub-item icons (SVG files) ────────────────────────────────────────────
  Dashboard: wrap(DashboardSVG),
  Location: wrap(LocationSVG),
  Department: wrap(DepartmentSVG),
  Categories: wrap(CategoriesSVG),
  Employees: wrap(EmployeesSVG),
  AssetRegister: wrap(AssetRegisterSVG),
  QRScanner: wrap(QRScannerSVG),
  Verification: wrap(VerificationSVG),
  Transfer: wrap(TransferSVG),
  Disposal: wrap(DisposalSVG),
  Depreciation: wrap(DepreciationSVG),
  AMC: wrap(AMCSVG),
  Reports: wrap(ReportsSVG),
  Users: wrap(UsersSVG),
  AuditLogs: wrap(AuditLogsSVG),
  Settings: wrap(SettingsSVG),

  // ── SECTION header icons — 100% unique, not used anywhere else ────────────

  // Master Data → Database cylinder
  SectionMasterData: ({ size = 20 }) => (
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

  // Assets → 3D Cube / package
  SectionAssets: ({ size = 20 }) => (
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

  // Operations → Workflow / share nodes
  SectionOperations: ({ size = 20 }) => (
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

  // Finance → Credit card / wallet
  SectionFinance: ({ size = 20 }) => (
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

  // Reports → Bar chart / analytics
  SectionReports: ({ size = 20 }) => (
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

  // Administration → Shield with checkmark
  SectionAdministration: ({ size = 20 }) => (
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

  // ── Utility ───────────────────────────────────────────────────────────────
  ChevronDown: ({ size = 14 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d="M6 9l6 6 6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  Menu: ({ size = 20 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d="M3 12h18M3 6h18M3 18h18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  ),
  Close: ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d="M18 6L6 18M6 6l12 12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  ),
  Bell: ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13.73 21a2 2 0 01-3.46 0"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  TrendUp: ({ size = 12 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d="M18 6L12 12 9 9 4 14"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  TrendDown: ({ size = 12 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d="M18 14L12 8 9 11 4 6"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
};
