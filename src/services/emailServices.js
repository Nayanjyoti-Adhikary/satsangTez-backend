import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
   host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls:{
    rejectUnauthorized:false,
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
    console.error("Email Error:", error.message);
    throw error;
  }
};