import mongoose from "mongoose";

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    return;
  }

  const mongoUri = process.env.MONGODB_URI || process.env.CONNECTION_URL;
  if (!mongoUri) {
    console.error("❌ MONGODB_URI or CONNECTION_URL environment variable is missing.");
    return;
  }

  try {
    await mongoose.connect(mongoUri);
    console.log("✅ Database connected successfully");
  } catch (error) {
    console.error("❌ Database connection failed:", error);
  }
};

export default connectDB;

