import db from "../config/db.js";
import generateOtp from "../utils/generateOtp.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import axios from "axios";
//import { formatMobileForWhatsApp } from "./formatMobileForWhatsApp.js";
import { sendEmailOTP } from "../services/emailServices.js";

/* const sendWhatsappOtp = async (mobile, otp) => {
  try {
    await axios.post(
      `https://graph.facebook.com/v22.0/${process.env.WHATSAPP_PHONE_ID}/messages`,
      {
        messaging_product: "whatsapp",
        to: mobile,
        type: "text",
        text: {
          body: `Your OTP for Thakur Bhog login is: ${otp}`
        }
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("WhatsApp OTP sent successfully");

  } catch (error) {
    console.error(
      "WhatsApp Error:",
      error.response?.data || error.message
    );
  }
};
*/


export const sendOtp = (req, res) => {
  const { mobile } = req.body;

  console.log("SEND OTP REQUEST:", mobile);

  if (!mobile) {
    return res.status(400).json({ message: "Mobile number required" });
  }

  const userQuery = "SELECT username, email FROM users WHERE mobile_no = ?";

  db.query(userQuery, [mobile], (err, result) => {

    if (err) {
      console.error("USER QUERY ERROR:", err);
      return res.status(500).json({ message: "Database error" });
    }

    console.log("USER QUERY RESULT:", result);

    if (result.length === 0) {
      return res.status(400).json({ message: "User not found" });
    }

    const user = result[0];
    const username = user.username;
    const email = user.email;

    const otp = generateOtp();

    console.log("USERNAME:", username);
    console.log("EMAIL:", email);
    console.log("GENERATED OTP:", otp);

    const insertQuery =
      "INSERT INTO otp_log (username, otp_code) VALUES (?, ?)";

    db.query(
      insertQuery,
      [username, otp],
      async (insertErr, insertResult) => {

        if (insertErr) {
          console.error("OTP INSERT ERROR:", insertErr);
          return res.status(500).json({
            message: "OTP generation failed"
          });
        }

        console.log("OTP INSERT SUCCESS:", insertResult);

        try {

          console.log("SENDING EMAIL OTP...");

          await sendEmailOTP(email, otp);

          console.log("EMAIL OTP SENT SUCCESSFULLY");

          return res.json({
            message: "OTP sent to your email"
          });

        } catch (error) {

          console.error("EMAIL OTP ERROR:", error);

          return res.status(500).json({
            message: "Failed to send OTP"
          });
        }
      }
    );
  });
};

export const verifyOtp = (req, res) => {
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
    AND is_verified = 0
    AND created_at >= DATE_SUB(NOW(), INTERVAL 5 MINUTE)
  ORDER BY created_at DESC
  LIMIT 1
`; //the database is doing the otp expiry check

    db.query(otpQuery, [username], (err, results) => {
      if (err) return res.status(500).json({ message: "Database error" });

      if (results.length === 0) {
        return res.status(400).json({ message: "No OTP found" });
      }

      const latestOtp = results[0];

      // Expiry check
  

      if (latestOtp.is_verified === 1) {
        return res.status(400).json({ message: "OTP already used" });
      }

      if (String(latestOtp.otp_code) !== String(otp)) {
        return res.status(400).json({ message: "Invalid OTP" });
      }
      console.log("OTP received:", otp);
console.log("Latest OTP:", latestOtp);
console.log("User:", user);

      // Mark verified
      const updateQuery =
        "UPDATE otp_log SET is_verified = 1 WHERE id = ?";

      db.query(updateQuery, [latestOtp.id], (updateErr) => {
        if (updateErr) {
          return res.status(500).json({ message: "Verification failed" });
        }

        const token = jwt.sign(
          { username: user.username, is_admin: user.is_admin },
          process.env.JWT_SECRET,
          { expiresIn: "1h" }
        );

        res.json({
          message: "Login successful",
          token,
        });
      });
    });
  });
};


export const registerUser = async (req, res) => {
  const { name, username, mobile,email, password, family_code, mandir_code } = req.body;

  if (!name || !username || !mobile || !email || !password || !family_code) {
    return res.status(400).json({ message: "Required fields missing" });
  }

  try {
    const checkQuery = "SELECT * FROM users WHERE username = ? or email= ?";
    db.query(checkQuery, [username,email], async (err, result) => {
      if (err) {
        return res.status(500).json({ message: "Database error" });
      }

      if (result.length > 0) {
        return res.status(400).json({ message: "Username or email already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const insertQuery = `
        INSERT INTO users 
        (name, username, mobile_no,email, password_hash, family_code, mandir_code)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;

      db.query(
        insertQuery,
        [
          name,
          username,
          mobile,
          email,
          hashedPassword,
          family_code,
          mandir_code || null, // optional
        ],
        (insertErr) => {
          if (insertErr) {
            return res.status(500).json({ message: "Registration failed" });
          }

          res.json({ message: "Registration successful" });
        }
      );
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
export const loginWithPassword = (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "All fields required" });
  }

  const query = "SELECT * FROM users WHERE username = ?";

  db.query(query, [username], async (err, result) => {
    if (err) {
      return res.status(500).json({ message: "Database error" });
    }

    if (result.length === 0) {
      return res.status(400).json({ message: "User not found" });
    }

    const user = result[0];

    const passwordMatch = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!passwordMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { username: user.username, is_admin: user.is_admin },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      message: "Login successful",
      token: token,
    });
  });
};
