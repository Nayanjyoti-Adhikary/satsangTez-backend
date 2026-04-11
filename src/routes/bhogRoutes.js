import express from "express";
import { createBhog } from "../controllers/bhogController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { requireAdmin } from "../middleware/adminMiddleware.js";
import db from "../config/db.js";


const router = express.Router();

router.post("/create", authenticate, createBhog);
router.get("/all", authenticate, requireAdmin, (req, res) => {
  db.query("SELECT * FROM thakur_bhog", (err, results) => {
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
    FROM thakur_bhog
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
