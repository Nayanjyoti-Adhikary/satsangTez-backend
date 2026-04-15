import db from "../config/db.js";
import { notifyAllAdmins } from "../utils/whatsappNotification.js";


export const createPronami = (req, res) => {
  const { depositor, amount,familyCode:depositor_fc, collectionType, date } = req.body;
  const username = req.user.username;

  const month = new Date(date).getMonth() + 1;
  const year = new Date(date).getFullYear();

  const query = `
    INSERT INTO box_pronami
    (depositor, amount,depositor_fc, collection_type, date_of_entry, month, year, username)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    query,
    [depositor, amount, depositor_fc, collectionType, date, month, year, username],
    (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Database error" });
      }
      

      res.json({ message: "Pronami entry created successfully" });
    }
  );
  ;

};
