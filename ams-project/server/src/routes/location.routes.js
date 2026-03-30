// server/src/routes/location.routes.js
import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { checkPermission } from "../middleware/rbac.middleware.js";
import {
  getLocations,
  getActiveLocations,
  getLocationById,
  createLocation,
  updateLocation,
  updateLocationStatus,
  deleteLocation,
} from "../controllers/location.controller.js";

const router = express.Router();

router.get(
  "/active",
  protect,
  checkPermission("locations", "can_view"),
  getActiveLocations,
);
router.get(
  "/",
  protect,
  checkPermission("locations", "can_view"),
  getLocations,
);
router.get(
  "/:id",
  protect,
  checkPermission("locations", "can_view"),
  getLocationById,
);
router.post(
  "/",
  protect,
  checkPermission("locations", "can_add"),
  createLocation,
);
router.put(
  "/:id",
  protect,
  checkPermission("locations", "can_edit"),
  updateLocation,
);
router.put(
  "/:id/status",
  protect,
  checkPermission("locations", "can_edit"),
  updateLocationStatus,
);
router.delete(
  "/:id",
  protect,
  checkPermission("locations", "can_delete"),
  deleteLocation,
);

export default router;
