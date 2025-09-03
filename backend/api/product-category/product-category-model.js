import mongoose, { Schema } from "mongoose";

const categorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    quantityType:{
      type: String,
      enum: ["PCS", "KG"],
      required: true,
      trim: true,
      uppercase: true,
      default: "PCS"
    },
    isCategoryDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const Category = mongoose.model("Category", categorySchema);
