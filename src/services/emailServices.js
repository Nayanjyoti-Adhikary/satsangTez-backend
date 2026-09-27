import nodemailer from "nodemailer";
import { OAuth2Client } from "google-auth-library";

/**
 * Sends email through the Gmail API over HTTPS (port 443), so it works on
 * hosts that block SMTP ports (e.g. Render free web services).
 *
 * Required environment variables:
 *   EMAIL_USER            the Gmail address you authorised, e.g. you@gmail.com
 *   GOOGLE_CLIENT_ID
 *   GOOGLE_CLIENT_SECRET
 *   GOOGLE_REFRESH_TOKEN  obtained once via the OAuth Playground (scope: gmail.send)
 */

const GMAIL_SEND_URL =
  "https://gmail.googleapis.com/gmail/v1/users/me/messages/send";

// Created lazily so it works even if dotenv loads after this module is imported.
let oauthClient;
function getOAuthClient() {
  if (!oauthClient) {
    const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN } =
      process.env;

    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REFRESH_TOKEN) {
      throw new Error(
        "Missing GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET / GOOGLE_REFRESH_TOKEN"
      );
    }

    oauthClient = new OAuth2Client(
      GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET,
      "https://developers.google.com/oauthplayground"
    );
    oauthClient.setCredentials({ refresh_token: GOOGLE_REFRESH_TOKEN });
  }
  return oauthClient;
}

// Nodemailer is used only to build the MIME message (handles UTF-8 text such
// as Assamese/Bengali, HTML + plain-text parts, header encoding). It does not
// open any SMTP connection.
const composer = nodemailer.createTransport({
  streamTransport: true,
  buffer: true,
  newline: "windows",
});

const escapeHtml = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]
  );

async function sendMail({ to, subject, html, text }) {
  const { message } = await composer.sendMail({
    from: `"Satsang Vihar Tezpur" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
    text,
  });

  try {
    await getOAuthClient().request({
      url: GMAIL_SEND_URL,
      method: "POST",
      data: { raw: message.toString("base64url") },
      timeout: 15000,
    });
  } catch (err) {
    const data = err.response?.data;
    const detail =
      data?.error_description ||
      data?.error?.message ||
      (typeof data?.error === "string" ? data.error : null) ||
      err.message;

    if (data?.error === "invalid_grant") {
      console.error(
        "GMAIL AUTH ERROR: refresh token expired or revoked. " +
          "Generate a new one in the OAuth Playground and make sure the " +
          "consent screen is set to 'In production'."
      );
    }
    throw new Error(`Gmail API send failed: ${detail}`);
  }
}

export const sendConfirmationEmail = async (
  email,
  depositor,
  familyCode,
  amount,
  type
) => {
  await sendMail({
    to: email,
    subject: `${type} Contribution Confirmation`,
    text:
      `Dear ${depositor},\n\nYour Bhog has been recorded successfully.\n\n` +
      `Type: ${type}\nFamily Code: ${familyCode}\nAmount: ₹${amount}\n\n` +
      `Thank you for your contribution.\n\nRegards,\nSATSANG VIHAR TEZPUR`,
    html: `
      <h2>Tezpur Kendra Mandir Bhog Management System</h2>

      <p>Dear ${escapeHtml(depositor)},</p>

      <p>জয়গুৰু</p>

      <p>Your Bhog has been recorded successfully.</p>

      <table border="1" cellpadding="8">
        <tr>
          <td><b>Type</b></td>
          <td>${escapeHtml(type)}</td>
        </tr>

        <tr>
          <td><b>Family Code</b></td>
          <td>${escapeHtml(familyCode)}</td>
        </tr>

        <tr>
          <td><b>Amount</b></td>
          <td>₹${escapeHtml(amount)}</td>
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
  await sendMail({
    to: email,
    subject: "OTP Verification",
    text:
      `Your OTP for verification is: ${otp}\n\n` +
      `This OTP is valid for 5 minutes.\n` +
      `If you did not request this OTP, please ignore this email.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">

        <h2>Tezpur Kendra Mandir Bhog Management System</h2>

        <p>Your OTP for verification is:</p>

        <h1 style="letter-spacing: 5px;">
          ${escapeHtml(otp)}
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