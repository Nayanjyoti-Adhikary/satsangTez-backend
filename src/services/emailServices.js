import nodemailer from "nodemailer";
import dns from "dns";

// ✅ Force IPv4
dns.setDefaultResultOrder("ipv4first");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  family: 4, // ✅ force IPv4
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendEmailOTP = async (email, otp) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "OTP for Thakur Bhog Login",
      text: `Your OTP is: ${otp}`,
    });

    console.log("Email OTP sent successfully");
  } catch (error) {
    console.error("Email Error FULL:", error);
    throw error;
  }
};