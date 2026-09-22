import dns from "dns";
import nodemailer from "nodemailer";

dns.setDefaultResultOrder("ipv4first");
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },

  requireTLS: true,
});

transporter.verify((error, success) => {
  if (error) {
    console.error("EMAIL TRANSPORT ERROR:", error);
  } else {
    console.log("EMAIL SERVER READY");
  }
});

export const sendConfirmationEmail = async (
  email,
  depositor,
  familyCode,
  amount,
  type
) => {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: `${type} Contribution Confirmation`,

    html: `
      <h2>Tezpur Kendra Mandir Bhog Management System</h2>

      <p>Dear ${depositor},</p>

      <p>জয়গুৰু</p>

      <p>Your Bhog has been recorded successfully.</p>

      <table border="1" cellpadding="8">
        <tr>
          <td><b>Type</b></td>
          <td>${type}</td>
        </tr>

        <tr>
          <td><b>Family Code</b></td>
          <td>${familyCode}</td>
        </tr>

        <tr>
          <td><b>Amount</b></td>
          <td>₹${amount}</td>
        </tr>
      </table>

      <br>

      <p>Thank you for your contribution.</p>

      <p>
        Regards,<br>
        SATSANG VIHAR TEZPUR
      </p>
    `,
  });
};

export const sendEmailOTP = async (email, otp) => {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "OTP Verification",

    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">

        <h2>Tezpur Kendra Mandir Bhog Management System</h2>

        <p>Your OTP for verification is:</p>

        <h1 style="letter-spacing: 5px;">
          ${otp}
        </h1>

        <p>
          This OTP is valid for 5 minutes.
        </p>

        <p>
          If you did not request this OTP, please ignore this email.
        </p>

      </div>
    `,
  });
};