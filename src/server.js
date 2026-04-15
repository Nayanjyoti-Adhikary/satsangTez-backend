import "./config/db.js";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import bhogRoutes from "./routes/bhogRoutes.js";
import pronamiRoutes from "./routes/pronamiRoutes.js";

dotenv.config();

const app = express();

app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://satsang-tez.vercel.app"
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Thakur Bhog Backend Running");
});

app.use("/auth", authRoutes);
app.use("/bhog", bhogRoutes);
app.use("/pronami", pronamiRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
});