import axios from "axios";
import db from "../config/db.js";

// Format mobile
const formatMobile = (mobile) => {
  mobile = mobile.replace(/\D/g, "");

  if (mobile.length === 10) return "91" + mobile;
  if (mobile.length === 12 && mobile.startsWith("91")) return mobile;

  return mobile;
};

// Send single WhatsApp message
const sendMessage = async (mobile, message) => {
  try {
    await axios.post(
      `https://graph.facebook.com/v22.0/${process.env.WHATSAPP_PHONE_ID}/messages`,
      {
        messaging_product: "whatsapp",
        to: mobile,
        type: "text",
        text: { body: message },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error(
      "WhatsApp Admin Notification Error:",
      error.response?.data || error.message
    );
  }
};

// Broadcast to all admins
export const notifyAllAdmins = (message) => {
  db.query(
    "SELECT mobile_no FROM users WHERE is_admin = 1",
    async (err, results) => {
      if (err) {
        console.error("Admin fetch error:", err);
        return;
      }

      for (const admin of results) {
        const formattedMobile = formatMobile(admin.mobile_no);
        await sendMessage(formattedMobile, message);
      }
    }
  );
};
