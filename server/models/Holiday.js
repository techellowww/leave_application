import mongoose from "mongoose";

const holidaySchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["holiday", "non-working"],
      default: "holiday",
    },
  },
  {
    timestamps: true,
  },
);

const Holiday = mongoose.model("Holiday", holidaySchema);

export default Holiday;
