import mongoose, { Schema } from "mongoose";

const inventorySchema = new Schema(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref : "Product",
      required: true,
    },
    stock: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  { timestamps: true }
);

export const Inventory = mongoose.model("Inventory", inventorySchema);
