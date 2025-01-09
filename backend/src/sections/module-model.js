import mongoose, { Schema } from "mongoose";

const moduleSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      unique: true, // Ensures no duplicate module names
  },
},
  { timestamps: true }

);

export const Module = mongoose.model("Module", moduleSchema);