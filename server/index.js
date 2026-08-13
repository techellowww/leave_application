import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/dbConfig.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import user from "./routes/user.js";
import leave from "./routes/leave.js";
import dashboard from "./routes/dashboard.js";
import holiday from "./routes/holiday.js";

dotenv.config();
connectDB();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(express.json());
app.use(cookieParser());

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins.length > 2 ? allowedOrigins : true,
    credentials: true,
  }),
);

app.use("/api/user", user);
app.use("/api/leave", leave);
app.use("/api/dashboard", dashboard);
app.use("/api/holiday", holiday);

app.get("/", (req, res) => {
  res.send("Hello dev");
});
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
