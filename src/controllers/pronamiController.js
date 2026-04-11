import db from "../config/db.js";
import { notifyAllAdmins } from "../utils/whatsappNotification.js";


export const createPronami = (req, res) => {
  const { depositor, amount, collectionType, date } = req.body;
  const username = req.user.username;

  const month = new Date(date).getMonth() + 1;
  const year = new Date(date).getFullYear();

  const query = `
    INSERT INTO box_pronami
    (depositor, amount, collection_type, date_of_entry, month, year, username)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    query,
    [depositor, amount, collectionType, date, month, year, username],
    (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Database error" });
      }
      const message = `
Jaiguru Admin , we have New Box Pronami Entry

Depositor: ${depositor}
Amount: ₹${amount}
Collection Type: ${collectionType}
Date: ${date}
Added by: ${username}
`;

notifyAllAdmins(message)
      res.json({ message: "Pronami entry created successfully" });
    }
  );
  ;

};
