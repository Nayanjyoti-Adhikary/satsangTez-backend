import jwt from "jsonwebtoken";

export const authenticate = (req, res, next) => {

  console.log("========== AUTH START ==========");
  console.log("URL:", req.originalUrl);
  console.log("Authorization:", req.headers.authorization);

  const authHeader = req.headers.authorization;

  if (!authHeader) {

    console.log("❌ Authorization header missing");

    return res.status(401).json({
      message: "Access denied"
    });
  }

  const token = authHeader.split(" ")[1];

  console.log("Token received:", !!token);

  try {

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    console.log("✅ Token verified");
    console.log("Decoded:", decoded);

    req.user = decoded;

    next();

  } catch (err) {

    console.error("❌ JWT ERROR:", err.message);

    return res.status(401).json({
      message: "Invalid token"
    });
  }
};