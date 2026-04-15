import db from "../config/db.js";
import generateOtp from "../utils/generateOtp.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import axios from "axios";
import { formatMobileForWhatsApp } from "./formatMobileForWhatsApp.js";
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


export  const sendOtp =  (req, res) => {
  const { mobile } = req.body;

  if (!mobile) {
    return res.status(400).json({ message: "Mobile number required" });
  }

  const userQuery = "SELECT username,email FROM users WHERE mobile_no = ?";

  db.query(userQuery, [mobile], (err, result) => {
    if (err) {
      return res.status(500).json({ message: "Database error" });
    }

    if (result.length === 0) {
      return res.status(400).json({ message: "User not found" });
    }

    const user=result[0];
    const username=user.username;
    const email=user.email;
    const otp = generateOtp();

    const insertQuery =
      "INSERT INTO otp_log (username, otp_code) VALUES (?, ?)";

    db.query(insertQuery, [username, otp],async (insertErr) =>  {
      if (insertErr) {
        return res.status(500).json({ message: "OTP generation failed" });
      }
      try {
        await sendEmailOTP(email,otp);

        res.json({
          message:"OTP sent to your email"
        });
      } catch (error) {
        res.status(500).json(
          {
            message:"failed to send OTP",
          }
        );
      }


    });
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
      ORDER BY created_at DESC 
      LIMIT 1
    `;

    db.query(otpQuery, [username], (err, results) => {
      if (err) return res.status(500).json({ message: "Database error" });

      if (results.length === 0) {
        return res.status(400).json({ message: "No OTP found" });
      }

      const latestOtp = results[0];

      // Expiry check
      const otpAge = Date.now() - new Date(latestOtp.created_at).getTime();
      const fiveMinutes = 5 * 60 * 1000;

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
