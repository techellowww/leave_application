import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  mobileNumber: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["admin", "user"],
    required: true,
  },
  employeeId: {
    type: String,
    required: true,
    unique: true,
  },
  joiningDate: {
    type: Date,
    required: true,
  },
  allotedLeaves: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ["active", "inactive"],
    required: true,
  },
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password || !enteredPassword) return false;
  if (this.password === enteredPassword) return true;
  try {
    const isMatch = await bcrypt.compare(enteredPassword, this.password);
    if (isMatch) return true;
  } catch (err) {}
  return false;
};

const User = mongoose.model("User", userSchema);

export default User;
