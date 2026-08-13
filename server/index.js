import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import user from "./routes/user.js";
import leave from "./routes/leave.js";
import dashboard from "./routes/dashboard.js";
import holiday from "./routes/holiday.js";

dotenv.config();

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or same-origin)
      if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== "production") {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

// Health Check Endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Leave Application API is running",
  });
});

app.use("/api/user", user);
app.use("/api/leave", leave);
app.use("/api/dashboard", dashboard);
app.use("/api/holiday", holiday);

app.get("/", (req, res) => {
  res.send("Hello dev");
});

export default app;

