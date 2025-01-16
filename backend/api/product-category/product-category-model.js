import mongoose, { Schema } from "mongoose";

const categorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    isCategoryDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const Category = mongoose.model("Category", categorySchema);
