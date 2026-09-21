import express from "express";
import { createBhog } from "../controllers/bhogController.js";
import { authenticate } from "../middleware/authMiddleware.js";

import db from "../config/db.js";
import { requireAdmin } from "../middleware/adminMiddleware.js";
import { getAll, getMonthlySummary } from "../controllers/bhogController.js";
import { search_bhog } from "../controllers/dashboardController.js";


const router = express.Router();

router.post("/create", authenticate, createBhog);
router.get("/all", authenticate, requireAdmin, getAll);
router.get("/monthly-summary/:year", authenticate, requireAdmin, getMonthlySummary);
router.get("/search", authenticate, requireAdmin,search_bhog)
// DELETE BHOG ENTRY
router.delete(
  "/delete/:id",
  authenticate,
  requireAdmin,
  (req, res) => {

    const { id } = req.params;

    const query = `
      DELETE FROM thakur_bhog
      WHERE id = ?
    `;

    db.query(query, [id], (err) => {

      if (err) {
        return res.status(500).json({
          message: "Delete failed",
        });
      }

      res.json({
        message: "Bhog entry deleted",
      });

    });

  }
);


export default router;
