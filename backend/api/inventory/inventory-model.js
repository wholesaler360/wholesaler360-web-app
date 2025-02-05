import mongoose, { Schema } from "mongoose";
import { Batch } from "../batch/batch-model.js";
const inventorySchema = new Schema(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    batches: [
      {
        batchNo: {
          type: Number,
          required: true,
          unique: true,
        },
        batch: {
          type: Schema.Types.ObjectId,
          ref: "Batch",
          required: true,
        },
      },
    ],
    totalQuantity: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);


export const Inventory = mongoose.model("Inventory", inventorySchema);
