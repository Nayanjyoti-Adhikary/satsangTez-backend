import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmailOTP = async (email, otp) => {
  try {
    await resend.emails.send({
      from: "onboarding@resend.dev", // default test sender
      to: email,
      subject: "OTP for Thakur Bhog Login",
      text: `Your OTP is: ${otp}`,
    });

    console.log("Email sent via Resend");
  } catch (error) {
    console.error("Email Error:", error);
    throw error;
  }
};

