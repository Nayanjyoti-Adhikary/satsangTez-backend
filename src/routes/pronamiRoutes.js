import express from "express";
import { createPronami } from "../controllers/pronamiController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { requireAdmin } from "../middleware/adminMiddleware.js";
import db from "../config/db.js";

const router = express.Router();

router.post("/create", authenticate, createPronami);
router.get("/all", authenticate, requireAdmin, (req, res) => {
  db.query("SELECT * FROM box_pronami", (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Database error" });
    }
    res.json(results);
  });
});
router.get("/monthly-summary/:year", authenticate, requireAdmin, (req, res) => {
  const year = req.params.year;

  const query = `
    SELECT month, SUM(amount) as total_amount
    FROM box_pronami
    WHERE year = ?
    GROUP BY month
    ORDER BY month ASC
  `;

  db.query(query, [year], (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Database error" });
    }

    res.json(results);
  });
});


export default router;
