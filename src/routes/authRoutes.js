import express from "express";
import { sendOtp ,verifyOtp } from "../controllers/authController.js";
import { registerUser } from "../controllers/authController.js";
import { loginWithPassword } from "../controllers/authController.js";

const router = express.Router();
router.post("/register", registerUser);
router.post("/login-password", loginWithPassword);

router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);

export default router;
