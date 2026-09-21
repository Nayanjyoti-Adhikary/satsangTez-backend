import db from "../config/db.js";

export const getDashboardStats = async (req, res) => {
  try {

    const today = new Date().toISOString().split("T")[0];

    const bhogQuery = `
      SELECT SUM(amount) AS total
      FROM thakur_bhog
      WHERE date_of_deposit = ?
    `;

    const pronamiQuery = `
      SELECT SUM(amount) AS total
      FROM pronami
      WHERE date_of_entry = ?
    `;

    const entryQuery = `
      SELECT
      (
        (SELECT COUNT(*) FROM thakur_bhog)
        +
        (SELECT COUNT(*) FROM pronami)
      ) AS totalEntries
    `;

    db.query(bhogQuery, [today], (err1, bhogResult) => {

      if (err1) {
        return res.status(500).json({ message: "Bhog query failed" });
      }

      db.query(pronamiQuery, [today], (err2, pronamiResult) => {

        if (err2) {
          return res.status(500).json({ message: "Pronami query failed" });
        }

        db.query(entryQuery, (err3, entryResult) => {

          if (err3) {
            return res.status(500).json({ message: "Entry query failed" });
          }

          res.json({
            bhogTotal: bhogResult[0].total || 0,
            pronamiTotal: pronamiResult[0].total || 0,
            totalEntries: entryResult[0].totalEntries || 0,
          });

        });

      });

    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};


export const getRecentBhog=async (req,res) =>{
    const query=`select id,depositor,amount,bhog_type,date_of_deposit 
    from thakur_bhog order by id DESC LIMIT 5` ;
    db.query(query,(err,results)=>{
        if(err){
            return res.status(500).json({
                message:"data fetching failed for Recent bhog"
            });
        }
        return res.json(results);
    });
}

export const getRecentPronami=async (req,res)=>{
    const query=`select id,depositor,amount,collection_type,date_of_entry
    FROM box_pronami order by id DESC
    LIMIT 5`;
    db.query(query,(err,results)=>{
        if(err){
            return res.status(500).json({
                message:"failed to fetch Recent Pronami"
            });

        }
        return res.json(results);
    });
}
export const search_pronami=async (req,res)=>{
const {
    search = "",
    family_code = "",
    from_date = "",
    to_date = "",
  } = req.query;

  let query = `
    SELECT *
    FROM pronami
    WHERE 1=1
  `;

  const values = [];

  // Search by depositor or username
  if (search) {

    query += `
      AND (
        depositor LIKE ?
        OR username LIKE ?
      )
    `;

    values.push(`%${search}%`);
    values.push(`%${search}%`);
  }

  // Family Code
  if (family_code) {

    query += `
      AND depositor_fc LIKE ?
    `;

    values.push(`%${family_code}%`);
  }

  // From Date
  if (from_date) {

    query += `
      AND date_of_entry >= ?
    `;

    values.push(from_date);
  }

  // To Date
  if (to_date) {

    query += `
      AND date_of_entry <= ?
    `;

    values.push(to_date);
  }

  query += `
    ORDER BY id DESC
  `;

  db.query(query, values, (err, results) => {

    if (err) {
      console.error(err);

      return res.status(500).json({
        message: "Pronami search failed",
      });
    }

    res.json(results);

  });
}
// ==========================================
// SEARCH BHOG ENTRIES
// ==========================================

export const search_bhog=async (req, res) => {

  const {
    search = "",
    family_code = "",
    from_date = "",
    to_date = "",
  } = req.query;

  let query = `
    SELECT *
    FROM thakur_bhog
    WHERE 1=1
  `;

  const values = [];

  // Search by depositor or username
  if (search) {

    query += `
      AND (
        depositor LIKE ?
        OR username LIKE ?
      )
    `;

    values.push(`%${search}%`);
    values.push(`%${search}%`);
  }

  // Family Code
  if (family_code) {

    query += `
      AND depositor_fc LIKE ?
    `;

    values.push(`%${family_code}%`);
  }

  // From Date
  if (from_date) {

    query += `
      AND date_of_deposit >= ?
    `;

    values.push(from_date);
  }

  // To Date
  if (to_date) {

    query += `
      AND date_of_deposit <= ?
    `;

    values.push(to_date);
  }

  query += `
    ORDER BY id DESC
  `;

  db.query(query, values, (err, results) => {

    if (err) {
      console.error(err);

      return res.status(500).json({
        message: "Bhog search failed",
      });
    }

    res.json(results);

  });

}