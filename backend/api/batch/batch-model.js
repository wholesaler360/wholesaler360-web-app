import mongoose, { Schema } from "mongoose";

const batchSchema = new Schema(
  {
    purchaseId: {
      type: Schema.Types.ObjectId,
      ref: "Purchase",
      required: true,
    },
    currentQuantity: {
      type: Number,
      required: true,
    },
    purchasePrice: {
      type: Number,
      required: true,
    },
    salePriceWithoutTax: {
      type: Number,
    },
    isSalePriceEntered: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const Batch = mongoose.model("Batch", batchSchema);
