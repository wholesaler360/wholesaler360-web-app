import mongoose, { Schema } from "mongoose";

const inventorySchema = new Schema(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    batchIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "Batch",
        required: true,
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
    this.totalQuantity = this.batchIds.reduce((acc, batch) => {
      return acc + batch.currentQuantity;
    }, 0); 
    next();
  } catch (error) {
    next(error);
  }
});

export const Inventory = mongoose.model("Inventory", inventorySchema);
