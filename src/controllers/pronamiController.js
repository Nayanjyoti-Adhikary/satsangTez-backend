import db from "../config/db.js";
import { sendConfirmationEmail } from "../services/emailServices.js";


export const createPronami = (req, res) => {
  const { depositor, amount,familyCode:depositor_fc, email, collectionType, date } = req.body;
  const username = req.user.username;

  const month = new Date(date).getMonth() + 1;
  const year = new Date(date).getFullYear();

  const query = `
    INSERT INTO box_pronami
    (depositor, amount,depositor_fc, depositor_email, collection_type, date_of_entry, month, year, username)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    query,
    [depositor, amount, depositor_fc, email, collectionType, date, month, year, username],
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
      "Pronami"
    );
  }

} catch (emailError) {
  console.error(
    "Email sending failed:",
    emailError
  );
}

res.json({
  message: "Pronami entry created successfully"
});
    }
  );
  ;

};
export const getMonthlySummary=async (req,res) =>{
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
}
export const getAll=async (req,res)=>{
    db.query("SELECT * FROM box_pronami", (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Database error" });
    }

    res.json(results);
  });
}