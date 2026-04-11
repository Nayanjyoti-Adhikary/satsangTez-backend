import "./config/db.js";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import bhogRoutes from "./routes/bhogRoutes.js";
import pronamiRoutes from "./routes/pronamiRoutes.js";


dotenv.config();//Load values from .env file into process.env

const app=express();

app.use(cors({
  origin: "https://satsang-tez.vercel.app/"
}));
app.use(express.json());

app.get("/",(req,res)=>{
    res.send("Thakur Bhog Backend Running");

});
app.use("/auth", authRoutes);
app.use("/bhog", bhogRoutes);
app.use("/pronami", pronamiRoutes);


const PORT=process.env.PORT || 5000;

app.listen(PORT,"10.55.16.59",()=>{
    console.log(`server is running on port ${PORT}`)
});