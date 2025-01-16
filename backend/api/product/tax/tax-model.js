import mongoose, { Schema } from "mongoose";

const taxSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
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

export const User = mongoose.model("Tax", taxSchema);
