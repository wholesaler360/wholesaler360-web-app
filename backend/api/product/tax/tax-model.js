import mongoose, { Schema } from "mongoose";

const taxSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
      lowercase: true,
    },
    percent: {
      type: Number,
      required: true,
      default: 0,
    },
    isTaxDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const Tax = mongoose.model("Tax", taxSchema);
