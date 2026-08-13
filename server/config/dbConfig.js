import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.CONNECTION_URL);
    console.log("✅ Database connected successfully");
  } catch (error) {
    console.log("❌ Database connection failed", error);
    process.exit(1);
  }
};

export default connectDB;
