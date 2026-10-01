import { initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

// The service account JSON is stored as one base64 string in
// FIREBASE_SERVICE_ACCOUNT_BASE64. This avoids the newline/quote mangling
// that happens when a multi-line private key is pasted into a plain env
// var field (the cause of "Failed to parse private key" errors).
const serviceAccount = JSON.parse(
  Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, "base64").toString(
    "utf8"
  )
);

const app = initializeApp({
  credential: cert(serviceAccount),
});

export const adminAuth = getAuth(app);