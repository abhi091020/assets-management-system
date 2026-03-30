// server/src/routes/report.routes.js
import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { checkPermission } from "../middleware/rbac.middleware.js";
import * as ctrl from "../controllers/report.controller.js";

const router = express.Router();

router.use(protect);

// All report view routes require can_view on reports
// All export routes require can_export on reports

router.get(
  "/asset-register",
  checkPermission("reports", "can_view"),
  ctrl.assetRegister,
);
router.get(
  "/asset-register/export",
  checkPermission("reports", "can_export"),
  ctrl.assetRegisterExport,
);

router.get(
  "/by-category",
  checkPermission("reports", "can_view"),
  ctrl.assetsByCategory,
);
router.get(
  "/by-category/export",
  checkPermission("reports", "can_export"),
  ctrl.assetsByCategoryExport,
);

router.get(
  "/by-location",
  checkPermission("reports", "can_view"),
  ctrl.assetsByLocation,
);
router.get(
  "/by-location/export",
  checkPermission("reports", "can_export"),
  ctrl.assetsByLocationExport,
);

router.get(
  "/by-department",
  checkPermission("reports", "can_view"),
  ctrl.assetsByDepartment,
);
router.get(
  "/by-department/export",
  checkPermission("reports", "can_export"),
  ctrl.assetsByDepartmentExport,
);

router.get(
  "/by-status",
  checkPermission("reports", "can_view"),
  ctrl.assetsByStatus,
);
router.get(
  "/by-status/export",
  checkPermission("reports", "can_export"),
  ctrl.assetsByStatusExport,
);

router.get(
  "/assigned-employees",
  checkPermission("reports", "can_view"),
  ctrl.assetsAssignedEmployees,
);
router.get(
  "/assigned-employees/export",
  checkPermission("reports", "can_export"),
  ctrl.assetsAssignedEmployeesExport,
);

router.get("/asset-age", checkPermission("reports", "can_view"), ctrl.assetAge);
router.get(
  "/asset-age/export",
  checkPermission("reports", "can_export"),
  ctrl.assetAgeExport,
);

router.get(
  "/transfers",
  checkPermission("reports", "can_view"),
  ctrl.transferHistory,
);
router.get(
  "/transfers/export",
  checkPermission("reports", "can_export"),
  ctrl.transferHistoryExport,
);

router.get(
  "/disposals",
  checkPermission("reports", "can_view"),
  ctrl.disposalReport,
);
router.get(
  "/disposals/export",
  checkPermission("reports", "can_export"),
  ctrl.disposalReportExport,
);

router.get(
  "/verification",
  checkPermission("reports", "can_view"),
  ctrl.verificationSummary,
);
router.get(
  "/verification/export",
  checkPermission("reports", "can_export"),
  ctrl.verificationSummaryExport,
);

export default router;
