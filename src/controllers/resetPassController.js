import bcrypt from "bcrypt";
import db from "../config/db.js";
export const changePass = async (req, res) => {
  try {
    const { mobile, newPassword } = req.body;

    if (!mobile || !newPassword) {
      return res.status(400).json({ message: "Required field missing" });
    }

    db.query(
      "SELECT * FROM users WHERE mobile_no = ?",
      [mobile],
      async (err, rows) => {
        if (err) {
          return res.status(500).json({ message: "Database error" });
        }

        if (rows.length === 0) {
          return res.status(404).json({ message: "User not found" });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        db.query(
          "UPDATE users SET password_hash = ? WHERE mobile_no = ?",
          [hashedPassword, mobile],
          (updateErr) => {
            if (updateErr) {
              return res.status(500).json({ message: "Update failed" });
            }

            return res.status(200).json({
              message: "Password updated successfully",
            });
          }
        );
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}; 

export const verifyforPass = async (req, res) => {
  const { mobile, otp } = req.body;

  if (!mobile || !otp) {
    return res.status(400).json({ message: "Mobile No and OTP required" });
  }

  const userQuery = "SELECT * FROM users WHERE mobile_no = ?";

  db.query(userQuery, [mobile], (userErr, userResult) => {
    if (userErr || userResult.length === 0) {
      return res.status(400).json({ message: "User not found" });
    }

    const user = userResult[0];
    const username = user.username;

    const otpQuery = `
      SELECT * FROM otp_log 
      WHERE username = ?
      ORDER BY created_at DESC 
      LIMIT 1
    `;

    db.query(otpQuery, [username], (err, results) => {
      if (err) return res.status(500).json({ message: "Database error" });

      if (results.length === 0) {
        return res.status(400).json({ message: "No OTP found" });
      }

      const latestOtp = results[0];

      // ✅ FIXED TIMEZONE ISSUE HERE
      const createdTime = new Date(latestOtp.created_at + " UTC").getTime();
      const currentTime = Date.now();

      const otpAge = currentTime - createdTime;
      const fiveMinutes = 5 * 60 * 1000;

      // 🔍 Debug (you can remove later)
      console.log({
        dbTime: latestOtp.created_at,
        parsedTime: new Date(latestOtp.created_at + " UTC"),
        currentTime: new Date(),
        otpAge
      });

      if (otpAge > fiveMinutes) {
        return res.status(400).json({ message: "OTP expired" });
      }

      if (latestOtp.is_verified === 1) {
        return res.status(400).json({ message: "OTP already used" });
      }

      if (String(latestOtp.otp_code) !== String(otp)) {
        return res.status(400).json({ message: "Invalid OTP" });
      }

      // Mark verified
      const updateQuery =
        "UPDATE otp_log SET is_verified = 1 WHERE id = ?";

      db.query(updateQuery, [latestOtp.id], (updateErr) => {
        if (updateErr) {
          return res.status(500).json({ message: "Verification failed" });
        }

        res.json({
          message: "OTP verified successfully",
        });
      });
    });
  });
};