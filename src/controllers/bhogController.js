import db from "../config/db.js";
import { notifyAllAdmins } from "../utils/whatsappNotification.js";


export const createBhog = (req, res) => {
  const { depositor, amount, bhogType, date } = req.body;
  const username = req.user.username;

  const month = new Date(date).getMonth() + 1;
  const year = new Date(date).getFullYear();

  const query = `
    INSERT INTO thakur_bhog
    (depositor, amount, bhog_type, date_of_deposit, month, year, username)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    query,
    [depositor, amount, bhogType, date, month, year, username],
    (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Database error" });
      }
       const message = `
Jaiguru Admin, we have New Thakur Bhog Entry

Depositor: ${depositor}
Amount: ₹${amount}
Date: ${date}
Added by: ${username}
`;

notifyAllAdmins(message);
      res.json({ message: "Bhog entry created successfully" });
    }
  );
 
};
