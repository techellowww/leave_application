import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  role: String,
  employeeId: String,
  status: String,
});

const User = mongoose.model("User", userSchema);

async function checkUsers() {
  try {
    await mongoose.connect(process.env.CONNECTION_URL);
    console.log("Connected to MongoDB.");
    const users = await User.find({}, "name email role employeeId status");
    console.log("Users found in database:", JSON.stringify(users, null, 2));
    await mongoose.disconnect();
  } catch (err) {
    console.error("Error connecting or querying:", err);
  }
}

checkUsers();
