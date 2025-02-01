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
        batchId: {
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

inventorySchema.pre("save", async function (next) {
  try {
    const batchIds = this.batches.map(batch => batch.batchId);
    const batches = await Batch.find({ _id: { $in: batchIds } }).select("currentQuantity");
    this.totalQuantity = batches.reduce((acc, batch) => acc + batch.currentQuantity, 0);
    next();
  } catch (error) {
    next(error);
  }
});

export const Inventory = mongoose.model("Inventory", inventorySchema);
