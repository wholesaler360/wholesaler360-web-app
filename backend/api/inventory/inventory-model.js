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
          // Remove unique constraint from here
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

// Add unique constraint for batchNo within the same product
inventorySchema.index({ productId: 1, "batches.batchNo": 1 }, { unique: true });

export const Inventory = mongoose.model("Inventory", inventorySchema);
