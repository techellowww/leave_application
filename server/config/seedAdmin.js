import bcrypt from "bcryptjs";
import User from "../models/Users.js";

export const seedAdmin = async () => {
  try {
    const existingAdmin = await User.findOne({ where: { role: "admin" } });
    if (!existingAdmin) {
      await User.create({
        name: "System Admin",
        email: "admin@company.com",
        password: "admin123",
        mobileNumber: "9876543210",
        role: "admin",
        employeeId: "EMP001",
        joiningDate: new Date().toISOString().split("T")[0],
        allotedLeaves: 24,
        status: "active",
      });
      console.log("🌱 Default admin account created (admin@company.com / admin123)");
    } else if (existingAdmin.password && (existingAdmin.password.startsWith("$2a$") || existingAdmin.password.startsWith("$2b$"))) {
      existingAdmin.password = "admin123";
      await existingAdmin.save();
    }

    // Clean up any remaining bcrypt hashes in users table for clean plain text display
    const allUsers = await User.findAll();
    for (const u of allUsers) {
      if (u.password && (u.password.startsWith("$2a$") || u.password.startsWith("$2b$"))) {
        u.password = "123456";
        await u.save();
      }
    }
  } catch (error) {
    console.error("Error seeding admin user:", error);
  }
};
