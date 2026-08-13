import mongoose from "mongoose";

const leaveSchema = new mongoose.Schema({
  fromDate: {
    type: Date,
    required: true,
  },
  toDate: {
    type: Date,
    required: true,
  },
  reason: {
    type: String,
    required: true,
  },
  totalDays: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    required: true,
  },
  employeeId: {
    type: String,
  },
  assignedTo: {
    type: String,
    required: true,
  },
  leaveType: {
    type: String,
    enum:["Casual","Sick"],
    required: true,
  },
  rejectedReason: {
    type: String,
  },
});

const Leave = mongoose.model("Leave", leaveSchema);

export default Leave;
