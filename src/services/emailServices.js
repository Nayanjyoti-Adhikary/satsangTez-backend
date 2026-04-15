import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "142.250.152.108", // ✅ Gmail SMTP IPv4 (hardcoded)
  port: 465,
  secure: true,
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

