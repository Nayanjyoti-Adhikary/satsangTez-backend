import db from "../config/db.js";
import { sendConfirmationEmail } from "../services/emailServices.js";

export const createBhog = (req, res) => {
  const { depositor, amount,familyCode:depositor_fc, email, bhogType, date } = req.body;
  const username = req.user.username; //middleware attached user info to the req body ,which means user is authenticated

  const month = new Date(date).getMonth() + 1;
  const year = new Date(date).getFullYear();

  const query = `
    INSERT INTO thakur_bhog
    (depositor, amount, depositor_fc, depositor_email, bhog_type, date_of_deposit, month, year, username)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    query,
    [depositor, amount, depositor_fc, email, bhogType, date, month, year, username], //email added
    async (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Database error" });
      }
    
      try {

  if (email) {
    await sendConfirmationEmail(
      email,
      depositor,
      depositor_fc,
      amount,
      "Bhog"
    );
  }

} catch (emailError) {
  console.error(
    "Email sending failed:",
    emailError
  );
}

res.json({
  message: "Bhog entry created successfully"
});
    }
  );
 
};
export const getAll=async (req,res)=>{
    db.query("SELECT * FROM thakur_bhog", (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Database error" });
    }

    res.json(results);
  });
}
export const getMonthlySummary=async (req,res) =>{
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
}