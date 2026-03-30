// server/src/routes/notification.routes.js
import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import {
  getNotifications,
  markNotificationsRead,
  clearNotifications,
} from "../controllers/notification.controller.js";

const router = express.Router();

router.use(protect);

router.get("/", getNotifications);
router.put("/mark-read", markNotificationsRead);
router.put("/clear", clearNotifications); // ← new

export default router;
