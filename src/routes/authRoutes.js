import express from "express";
import { sendOtp ,verifyOtp } from "../controllers/authController.js";
import { registerUser } from "../controllers/authController.js";
import { loginWithPassword } from "../controllers/authController.js";
import { changePass, verifyforPass } from "../controllers/resetPassController.js";

const router = express.Router();
router.post("/register", registerUser);
router.post("/login-password", loginWithPassword);

router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/change-password",changePass);
router.post("/verifyforPass",verifyforPass);

export default router;
