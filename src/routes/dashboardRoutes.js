import express from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import { getDashboardStats, getRecentBhog, getRecentPronami } from "../controllers/dashboardController.js";

import { requireAdmin } from "../middleware/adminMiddleware.js";
const router = express.Router();

router.get("/stats", authenticate, getDashboardStats);

router.get("/recent-bhog",authenticate,requireAdmin,getRecentBhog);
router.get("/recent-pronami",authenticate,requireAdmin,getRecentPronami);
export default router;