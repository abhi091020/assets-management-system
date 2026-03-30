// server/src/routes/scan.routes.js

import express from "express";
import { getAssetByQRToken } from "../controllers/scan.controller.js";

const router = express.Router();

/**
 * Public Routes — NO auth middleware applied here.
 * These routes are intentionally open so anyone who scans
 * a physical QR code can view basic asset info without logging in.
 *
 * Rate limiting should be applied at the nginx/proxy level in production.
 */

// GET /api/scan/:token
// ─── Returns public asset snapshot by QR token ───────────────────────────────
router.get("/:token", getAssetByQRToken);

export default router;
