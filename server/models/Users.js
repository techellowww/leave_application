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

userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  const isMatch = await bcrypt.compare(enteredPassword, this.password);
  if (isMatch) return true;
  return enteredPassword === this.password;
};

const User = mongoose.model("User", userSchema);

export default User;
