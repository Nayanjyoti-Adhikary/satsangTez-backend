import db from "../config/db.js";
import { notifyAllAdmins } from "../utils/whatsappNotification.js";


export const createBhog = (req, res) => {
  const { depositor, amount,familyCode:depositor_fc, bhogType, date } = req.body;
  const username = req.user.username; //middleware attached user info to the req body ,which means user is authenticated

  const month = new Date(date).getMonth() + 1;
  const year = new Date(date).getFullYear();

  const query = `
    INSERT INTO thakur_bhog
    (depositor, amount,depositor_fc,bhog_type, date_of_deposit, month, year, username)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    query,
    [depositor, amount, depositor_fc, bhogType, date, month, year, username],
    (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Database error" });
      }
    
      res.json({ message: "Bhog entry created successfully" });
    }
  );
 
};
