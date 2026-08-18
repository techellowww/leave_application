import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import sequelize, { connectDB } from "./config/dbConfig.js";
import user from "./routes/user.js";
import leave from "./routes/leave.js";
import dashboard from "./routes/dashboard.js";
import holiday from "./routes/holiday.js";

// Import models to ensure associations are registered
import "./models/index.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

// CORS Configuration:
// In production (when CLIENT_URL is set), restrict origins to allowed list.
// In local development (when CLIENT_URL is not set), allow all origins (dev fallback).
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: process.env.CLIENT_URL ? allowedOrigins : true,
    credentials: true,
  }),
);

app.use("/api/user", user);
app.use("/api/leave", leave);
app.use("/api/dashboard", dashboard);
app.use("/api/holiday", holiday);

app.get("/", (req, res) => {
  res.send("🚀 Leave Application API running (MySQL / Sequelize)");
});

const startServer = async () => {
  try {
    // 1. Connect to MySQL Database
    await connectDB();

    // 2. Synchronize Sequelize Models
    await sequelize.sync();
    console.log("✅ Sequelize models synchronized successfully");


    // 4. Start Express Listener
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT} [Database: MySQL]`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
