import express from "express";
import { createPronami, getAll, getMonthlySummary } from "../controllers/pronamiController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { requireAdmin } from "../middleware/adminMiddleware.js";
import db from "../config/db.js";
import { search_pronami } from "../controllers/dashboardController.js";

const router = express.Router();

router.post("/create", authenticate, createPronami);
router.get("/all", authenticate, requireAdmin, getAll);
router.get("/monthly-summary/:year", authenticate, requireAdmin, getMonthlySummary);
router.get("/search",authenticate,requireAdmin,search_pronami)
// DELETE PRONAMI ENTRY
router.delete(
  "/delete/:id",
  authenticate,
  requireAdmin,
  (req, res) => {

    const { id } = req.params;

    const query = `
      DELETE FROM pronami
      WHERE id = ?
    `;

    db.query(query, [id], (err) => {

      if (err) {
        return res.status(500).json({
          message: "Delete failed",
        });
      }

      res.json({
        message: "Pronami entry deleted",
      });

    });

  }
);
export default router;
