import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/dbConfig.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import user from "./routes/user.js";
import leave from "./routes/leave.js";
import dashboard from "./routes/dashboard.js";
import holiday from "./routes/holiday.js";

import User from "./models/Users.js";

dotenv.config();

connectDB().then(async () => {
  try {
    // Seed or update Admin account (admin@gmail.com / 123)
    let adminUser = await User.findOne({ email: "admin@gmail.com" });
    if (!adminUser) {
      await User.create({
        name: "System Admin",
        email: "admin@gmail.com",
        password: "123",
        mobileNumber: "9876543210",
        role: "admin",
        employeeId: "EMP001",
        joiningDate: new Date("2024-01-01"),
        allotedLeaves: 24,
        status: "active",
      });
      console.log("✅ Seeded admin@gmail.com with hashed password '123'");
    } else {
      adminUser.password = "123";
      await adminUser.save();
    }

    // Seed or update Employee account (user@gmail.com / 123)
    let normalUser = await User.findOne({ email: "user@gmail.com" });
    if (!normalUser) {
      await User.create({
        name: "John Employee",
        email: "user@gmail.com",
        password: "123",
        mobileNumber: "9876543211",
        role: "user",
        employeeId: "EMP002",
        joiningDate: new Date("2024-03-15"),
        allotedLeaves: 20,
        status: "active",
      });
      console.log("✅ Seeded user@gmail.com with hashed password '123'");
    } else {
      normalUser.password = "123";
      await normalUser.save();
    }
  } catch (err) {
    console.error("Error seeding accounts:", err);
  }
});

const app = express();
const PORT = process.env.PORT || 5001;

app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
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
